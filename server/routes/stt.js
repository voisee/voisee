import { Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { paramMissingError, DoesNotExistError, duplicateError } from '../utils/constants';
import { mysql_dbc } from '../migrations/db_con';

const router = Router();
const multer = require("multer");
const path = require("path");
const shortId = require("shortid");
const multerS3 = require("multer-s3");
const wrapper = require('../src/interface/wrapper.js').wrapper;

// db Connection
const connection = mysql_dbc.init();
// Load the SDK
const AWS = require("aws-sdk");
// Update region
AWS.config.update({ region: 'ap-northeast-2' });

// s3 객체 생성
const s3 = new AWS.S3();

// transcibeservice 객체 생성
const transcribeservice = new AWS.TranscribeService({ apiVersion: '2017-10-26' });

// s3에 업로드하기 위한 옵션 설정
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "voisee",
        key: function (req, file, cb) {
            let mediaName = shortId.generate();
            let extension = path.extname(file.originalname);
            cb(null, mediaName + extension);
        },
        acl: 'public-read-write',
    }),
});


// 클라이언트에서 보낸 음성파일을 받아 s3에 업로드 후 stt 실행
router.post('/', upload.single('mediaFile'), wrapper(async (req, res, next) => {
    // 대화명, 카테고리, 언어 지정s
    const statementName = req.body.statementName;
    const categoryId = req.body.categoryid;
    const language = req.body.language === "korean" ? "ko-KR" : "en-US";
    
    if (!statementName) {
        return res.status(BAD_REQUEST).json({
            error: paramMissingError
        })
    }

    // 대화명 중복 체크
    const checkSql = `SELECT statement_name FROM statements where statement_name = (?)`;

    connection.query(checkSql, [statementName], function (err, rows, fields) {
        if (err) {
            res
                .status(BAD_REQUEST)
                .end();
        } else if (rows[0]) {
            const resPayload = {
                message: duplicateError,
            }
            res
                .status(BAD_REQUEST)
                .json(resPayload)
                .end();
        }
    })

    // s3상에서 업로드한 파일의 위치
    const fileLocation = req.file.location;

    // job 이름 랜덤으로 생성
    const jobName = shortId.generate();
    //console.log("Job Name: " + jobName);

    /*
    // 현재 액세스하는 키와 리전 확인
    AWS.config.getCredentials(function(err){
        if (err) console.log(err.stack);
        // credentials not loaded
        else {
            console.log("Access key: ",  AWS.config.credentials.accessKeyId);
            console.log("Region: ", AWS.config.region);
        }
    });  
    */


    /************음성파일 변환 실행 **************/

    const params = {
        LanguageCode: language, // 작업에서 사용할 언어
        Media: {
            MediaFileUri: fileLocation // 변환할 음성파일의 uri
        },
        TranscriptionJobName: jobName, // job의 이름 설정
        MediaFormat: "mp4", // 음성 파일 형식 지정
        MediaSampleRateHertz: "44100", // 샘플링레이트 설정
        OutputBucketName: "voisee", // 변환 결과 파일이 저장될 버킷 이름
        OutputEncryptionKMSKeyId: "8b6d2d3e-5fb6-4183-9494-c694d1ad016b", // KMS
        Settings: {
            ChannelIdentification: false,
            MaxSpeakerLabels: "2", // 최대 발화자 수
            ShowAlternatives: false, // alternative 보여줄 것인가
            ShowSpeakerLabels: true, // speaker를 구분해서 라벨 보여줄 것인가
        }
    };
    
    // 변환 실행
    transcribeservice.startTranscriptionJob(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
            const resPayload = {
                message: err.message,
            }
            res
                .status(BAD_REQUEST)
                .json(resPayload)
                .end();
        }
        else {
            const sql = `INSERT INTO statements(categoryid, status, statement_name, job_name) VALUES(?, ?, ?, ?)`;
            connection.query(sql, [categoryId, 0, statementName, jobName], function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    res
                        .status(BAD_REQUEST)
                        .end();
                } else {
                    res
                        .status(CREATED)
                        .end();
                }
            })

        }
    });

}));

// 카테고리아이디를 받아 완료된 작업 결과를 전송
router.get('/getResult/:id', wrapper(async (req, res, next) => {
    const categoryId = req.params.id;

    const sql = `SELECT * FROM statements WHERE categoryid = (?)`;

    connection.query(sql, [categoryId], function (err, rows, fields) {
        if (err) {
            res
                .status(BAD_REQUEST)
                .end();
        } else {
            if (rows[0].status == 0) {
                console.log(rows[0].status);
                const jobName = rows[0].job_name;
                console.log(jobName);
                var params = {
                    TranscriptionJobName: jobName /* required */
                };
                transcribeservice.getTranscriptionJob(params, function (err, data) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else {
                        // 완료된 작업 데이터 보내기
                        if (data.TranscriptionJob.TranscriptionJobStatus == 'COMPLETED') {
                            s3.getObject({ Bucket: "voisee", Key: `${jobName}.json` }, function (err, data) {
                                if (err) {
                                    res
                                        .status(BAD_REQUEST)
                                        .end();
                                } else {
                                    try {
                                        let resultData = JSON.parse(data.Body.toString('utf-8'));

                                        const segSize = resultData.results.speaker_labels.segments.length;
                                        const itemSize = resultData.results.items.length
                                        const spkNum = resultData.results.speaker_labels.speakers;

                                        const statements = new Array();

                                        let segments = [];

                                        let j = 0;
                                        for (let i = 0; i < segSize; i++) {
                                            const stObject = new Object();
                                            const startTime = parseFloat(resultData.results.speaker_labels.segments[i].start_time);
                                            const endTime = parseFloat(resultData.results.speaker_labels.segments[i].end_time);
                                            let speaker = resultData.results.speaker_labels.segments[i].speaker_label;

                                            let string = "";

                                            for (j; j < itemSize - 1; j++) {
                                                const tempString = resultData.results.items[j].alternatives[0].content;
                                                const stringType = resultData.results.items[j + 1].type;
                                                if (resultData.results.items[j].type === "punctuation") {
                                                    string += tempString + ' ';
                                                    continue;
                                                }
                                                if (parseFloat(resultData.results.items[j].end_time) <= endTime) {
                                                    string += tempString;
                                                    if (stringType === "pronunciation") string += ' ';
                                                }
                                                else break;
                                            }

                                            if (j == itemSize - 1) string += resultData.results.items[j].alternatives[0].content;
                                            segments.push(string);

                                            stObject.spk_label = speaker;
                                            stObject.start_time = startTime;
                                            stObject.end_time = endTime;
                                            stObject.content = string;

                                            statements.push(stObject);
                                        }
                                        console.log(statements);
                                        res
                                            .json(statements)
                                            .status(OK)
                                            .end();
                                    } catch (err) {
                                        console.log(err);
                                    }
                                }
                            });
                        }
                        // 아직 완료되지 않음
                        else if (data.TranscriptionJob.TranscriptionJobStatus == 'IN_PROGRESS') {
                            const resPayload = {
                                message: 'The job is not yet completed.',
                            }
                            res
                                .status(BAD_REQUEST)
                                .json(resPayload)
                                .end();
                        }
                        // 작업이 대기열에 있음
                        else if (data.TranscriptionJob.TranscriptionJobStatus == 'QUEUED') {

                        }
                        // 작업이 실패함
                        else {

                        }
                    }
                });
            }
            else {

            }
        }
    })

}));


module.exports = router;