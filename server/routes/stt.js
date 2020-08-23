import { Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { paramMissingError, DoesNotExistError } from '../utils/constants';
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
AWS.config.update( { region: 'ap-northeast-2'});

// s3 객체 생성
const s3 = new AWS.S3();

// s3에 업로드하기 위한 옵션 설정
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "voisee",
        key: function(req, file, cb) {
            let mediaName = shortId.generate();
            let extension = path.extname(file.originalname);
            cb(null, mediaName + extension);
        },
        acl: 'public-read-write',
    }),
});


// 클라이언트에서 보낸 음성파일을 받아 s3에 업로드 후 stt 실행
router.post('/', upload.single('mediaFile'), wrapper(async(req, res, next) => {
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


    // transcibeservice 객체 생성
    const transcribeservice = new AWS.TranscribeService({apiVersion: '2017-10-26'});
    
    const params = {
        LanguageCode: "ko-KR", // 작업에서 사용할 언어
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
        if (err){
            console.log(err, err.stack);
            res
                .status(500)
                .end();
        }
        else{
            res.send(data);
        }
    });
    
}));

module.exports = router;