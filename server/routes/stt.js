import { Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { paramMissingError, DoesNotExistError, duplicateError, queryError } from '../utils/constants';
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

// jobName getter&setter
let job = {
    name: "",
    get jobName() {
        return this.name;
    },
    set jobName(value) {
        this.name = value;
    }
}


// s3에 업로드하기 위한 옵션 설정
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "voisee",
        key: function (req, file, cb) {
            job.name = shortId.generate();
            let mediaName = job.name;
            let extension = path.extname(file.originalname);
            cb(null, mediaName + extension);
        },
        acl: 'public-read-write',
    }),
});


// 클라이언트에서 보낸 음성파일을 받아 s3에 업로드 후 stt 실행
router.post('/', upload.single('mediaFile'), wrapper(async (req, res, next) => {
    // 대화명, 카테고리, 언어 지정s
    const statementName = req.body.statement_name;
    const categoryId = req.body.categoryid;
    const language = req.body.language === "korean" ? "ko-KR" : "en-US";
    const jobName = job.name;

    // s3에 업로드한 파일의 경로
    const fileLocation = req.file.location;

    // db에 job정보 insert
    const sql = `INSERT INTO statements(categoryid, status, statement_name, job_name) VALUES(?, ?, ?, ?)`;
    connection.query(sql, [categoryId, 0, statementName, jobName], function (err, rows, fields) {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                const resPayload = {
                    message: duplicateError,
                }
                res
                    .status(BAD_REQUEST)
                    .json(resPayload)
                    .end();
            }
            else {
                res
                    .status(BAD_REQUEST)
                    .end();
            }
        }
    })

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

    // 옵션 지정
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
            // 에러가 발생하면 db에 저장했던 job 삭제
            const sql = `DELETE FROM statements WHERE job_name = ?`;

            connection.query(sql, [jobName], function (err, rows, fields) {
                if (err) {
                    console.log(err);
                }
            })
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
            const resPayload = {
                jobName: jobName,
            }
            res
                .status(CREATED)
                .json(resPayload)
                .end();
        }
    });
}));

// 대화명을 받아 완료된 작업 결과를 전송
router.get('/getResult/:name', wrapper(async (req, res, next) => {
    const jobName = req.params.name;

    const sql = `SELECT * FROM statements WHERE job_name = (?)`;

    connection.query(sql, [jobName], function (err, rows, fields) {
        if (err) {
            res
                .status(BAD_REQUEST)
                .end();
        } else {
            // 이미 완료한 작업일 때 db에서 작업 결과를 보냄
            if (rows[0].status == 1) {
                const sql = `SELECT * FROM contents WHERE job_name = (?) ORDER BY start_time`;
                connection.query(sql, [jobName], function (err, rows, fields) {
                    if (err) {
                        console.log(err);
                        res
                            .status(BAD_REQUEST)
                            .end();
                    }
                    else {
                        const statements = new Array();
                        for (let i = 0; i < rows.length; i++) {
                            const stObject = new Object();
                            stObject.spk_label = rows[i].spk_label;
                            stObject.start_time = rows[i].start_time;
                            stObject.end_time = rows[i].end_time;
                            stObject.content = rows[i].content;
                            statements.push(stObject);
                        }
                        res
                            .status(OK)
                            .json(statements)
                            .end()
                    }
                })
            }
            else if (rows[0].status == 0) {
                var params = {
                    TranscriptionJobName: jobName /* required */
                };
                transcribeservice.getTranscriptionJob(params, function (err, data) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else {
                        // 완료된 작업 데이터 보내기
                        if (data.TranscriptionJob.TranscriptionJobStatus == 'COMPLETED') {
                            // 작업이 완료되었다면 statements 테이블의 해당 작업 status 컬럼을 1(완료)로 업데이트
                            const sql = 'UPDATE statements SET status= ? WHERE job_name= ?';

                            connection.query(sql, [1, jobName], function (err, rows, fields) {
                                if (err) {
                                    console.log(err);
                                    const resPayload = {
                                        message: queryError,
                                    }
                                    res
                                        .status(BAD_REQUEST)
                                        .json(resPayload)
                                        .end();
                                } else if (!rows.affectedRows) {
                                        const resPayload = {
                                            message: DoesNotExistError,
                                        }
                                        res
                                            .status(BAD_REQUEST)
                                            .json(resPayload)
                                            .end();
                                } else{
                                    s3.getObject({ Bucket: "voisee", Key: `${jobName}.json` }, function (err, result) {
                                        if (err) {
                                            res
                                                .status(BAD_REQUEST)
                                                .end();
                                        } else {
                                            try {
                                                let resultData = JSON.parse(result.Body.toString('utf-8'));
        
                                                const segSize = resultData.results.speaker_labels.segments.length;
                                                const itemSize = resultData.results.items.length
                                                const spkNum = resultData.results.speaker_labels.speakers;
        
                                                // 결과를 db에 저장하는 쿼리
                                                const sql = `INSERT INTO contents(job_name, spk_label, start_time, end_time, content) values (?,?,?,?,?)`;
        
                                                const statements = new Array();
                                                const data = new Object();
                                                data.filePath = `https://voisee.s3.ap-northeast-2.amazonaws.com/${jobName}.m4a`;
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
        
                                                    connection.query(sql, [jobName, speaker, startTime, endTime, string], function (err, rows, fields) {
                                                        if (err) console.log(err);
                                                    })
        
                                                    statements.push(stObject);
                                                    data.segments = statements;
                                                }
                                                console.log(statements);
                                                console.log(data);
        
                                                res
                                                    .status(OK)
                                                    .json(data)
                                                    .end();
                                            } catch (err) {
                                                console.log(err);
                                            }
                                        }
                                    });
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
                            const resPayload = {
                                message: 'The job is in the queue.',
                            }
                            res
                                .status(BAD_REQUEST)
                                .json(resPayload)
                                .end();
                        }
                        // 작업이 실패함
                        else {
                            const resPayload = {
                                message: 'The job is failed.',
                            }
                            res
                                .status(BAD_REQUEST)
                                .json(resPayload)
                                .end();
                        }
                    }
                });
            }
        }
    })

}));

module.exports = router;