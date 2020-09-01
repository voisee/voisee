import { Router, json } from 'express'
import {
  BAD_REQUEST,
  CREATED,
  OK,
  INTERNAL_SERVER_ERROR,
} from 'http-status-codes'
import {
  paramMissingError,
  DoesNotExistError,
  duplicateError,
  queryError,
  transcribeError,
  s3StoragePath,
} from '../utils/constants'
import { mysql_dbc } from '../migrations/db_con'

const router = Router()
const multer = require('multer')
const path = require('path')
const shortId = require('shortid')
const multerS3 = require('multer-s3')
const wrapper = require('../src/interface/wrapper.js').wrapper
router.use(json())

// db Connection
const connection = mysql_dbc.init()
// Load the SDK
const AWS = require('aws-sdk')
// Update region
AWS.config.update({ region: 'ap-northeast-2' })

// s3 객체 생성
const s3 = new AWS.S3()

// transcibeservice 객체 생성
const transcribeservice = new AWS.TranscribeService({
  apiVersion: '2017-10-26',
})

// jobName getter&setter
let job = {
  name: '',
  get jobName() {
    return this.name
  },
  set jobName(value) {
    this.name = value
  },
}

// s3에 업로드하기 위한 옵션 설정
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'voisee',
    key: function (req, file, cb) {
      job.name = shortId.generate()
      let mediaName = job.name
      let extension = path.extname(file.originalname)
      cb(null, mediaName + extension)
    },
    acl: 'public-read-write',
  }),
})

// get record list
router.get(
  '/',
  wrapper(async (req, res, next) => {
    const sql = `SELECT * FROM statements`
    const recordList = new Array()
    connection.query(sql, function (err, rows, fields) {
      if (err) {
        console.log(err)
        const resPayload = {
          message: queryError,
        }
        res.status(INTERNAL_SERVER_ERROR).json(resPayload).end()
      } else {
        for (let i = 0; i < rows.length; i++) {
          const record = new Object()
          record.id = rows[i].job_id
          record.name = rows[i].statement_name
          record.description = rows[i].description
          record.recordUrl = rows[i].record_uri
          record.jobName = rows[i].job_name
          record.categoryId = rows[i].categoryid
          recordList.push(record)
        }
        res.status(OK).json(recordList).end()
      }
    })
  }),
)

// 클라이언트에서 보낸 음성파일을 받아 s3에 업로드 후 stt 실행
router.post(
  '/',
  upload.single('mediaFile'),
  wrapper(async (req, res, next) => {
    // 대화명, 카테고리, 언어 지정s
    const statementName = req.body.statement_name
    const categoryId = req.body.categoryid
    const language = req.body.language
    const description = req.body.description
    const jobName = job.name

    // s3에 업로드한 파일의 경로
    const fileLocation = req.file.location

    // db에 job정보 insert
    const sql = `INSERT INTO statements(categoryid, status, statement_name, job_name, description, record_url) VALUES(?, ?, ?, ?, ?, ?)`
    connection.query(
      sql,
      [categoryId, 0, statementName, jobName, description, fileLocation],
      function (err, rows, fields) {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            const resPayload = {
              message: duplicateError,
            }
            res.status(BAD_REQUEST).json(resPayload).end()
          } else {
            console.log(err)
            const resPayload = {
              message: queryError,
            }
            res.status(INTERNAL_SERVER_ERROR).json(resPayload).end()
          }
        }
      },
    )

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
        MediaFileUri: fileLocation, // 변환할 음성파일의 uri
      },
      TranscriptionJobName: jobName, // job의 이름 설정
      //MediaFormat: "mp4", // 음성 파일 형식 지정
      //MediaSampleRateHertz: "11100", // 샘플링레이트 설정
      OutputBucketName: 'voisee', // 변환 결과 파일이 저장될 버킷 이름
      OutputEncryptionKMSKeyId: '8b6d2d3e-5fb6-4183-9494-c694d1ad016b', // KMS
      Settings: {
        ChannelIdentification: false,
        MaxSpeakerLabels: '2', // 최대 발화자 수
        ShowAlternatives: false, // alternative 보여줄 것인가
        ShowSpeakerLabels: true, // speaker를 구분해서 라벨 보여줄 것인가
      },
    }

    // 변환 실행
    transcribeservice.startTranscriptionJob(params, function (err, data) {
      if (err) {
        console.log(err, err.stack)
        try {
          // 에러가 발생하면 db에 저장했던 job 삭제
          const sql = `DELETE FROM statements WHERE job_name = ?`
          connection.query(sql, [jobName], function (err, rows, fields) {
            const resPayload = {
              message: transcribeError,
            }
            res.status(INTERNAL_SERVER_ERROR).json(resPayload).end()
          })
        } catch (err) {
          console.log(err)
          const resPayload = {
            message: [queryError, transcribeError],
          }
          res.status(INTERNAL_SERVER_ERROR).json(resPayload).end()
        }
      } else {
        // job 정보 보내기
        const sql = `SELECT * FROM statements WHERE job_name = ?`
        try {
          connection.query(sql, [jobName], function (err, rows, fields) {
            const resPayload = {
              id: rows[0].job_id,
              name: statementName,
              description: description,
              recordUrl: fileLocation,
              jobName: jobName,
              categoryId: categoryId,
            }
            res.status(CREATED).json(resPayload).end()
          })
        } catch (err) {
          console.log(err)
          const resPayload = {
            message: queryError,
          }
          res.status(INTERNAL_SERVER_ERROR).json(resPayload).end()
        }
      }
    })
  }),
)

// 대화명을 받아 완료된 작업 결과를 전송
router.get(
  '/:jobName',
  wrapper(async (req, res, next) => {
    const jobName = req.params.jobName

    const sql = `SELECT * FROM statements WHERE job_name = (?)`

    connection.query(sql, [jobName], function (err, rows, fields) {
      if (err) {
        console.log(err)
        const resPayload = {
          message: queryError,
        }
        res.status(INTERNAL_SERVER_ERROR).json(resPayload).end()
      }
      // 완료되지 않았을 때
      if (!rows[0].status) {
        var params = {
          TranscriptionJobName: jobName /* required */,
        }

        transcribeservice.getTranscriptionJob(params, function (err, data) {
          if (err) {
            console.log(err, err.stack)
            const resPayload = {
              message: queryError,
            }
            // TODO: 알맞은 status code 반환
            res.status(INTERNAL_SERVER_ERROR).json(resPayload).end()
          }

          // an error occurred
          //console.log(data);
          // 완료된 작업 데이터 보내기
          const transcriptionJobStatus =
            data.TranscriptionJob.TranscriptionJobStatus

          switch (transcriptionJobStatus) {
            case 'COMPLETED': {
              // 작업이 완료되었다면 statements 테이블의 해당 작업 status 컬럼을 1(완료)로 업데이트
              const sql = 'UPDATE statements SET status= ? WHERE job_name= ?'

              connection.query(sql, [1, jobName], function (err, rows, fields) {
                if (err) {
                  console.log(err)
                  if (!rows.affectedRows) {
                    const resPayload = {
                      message: DoesNotExistError,
                    }
                    res.status(BAD_REQUEST).json(resPayload).end()
                  } else {
                    const resPayload = {
                      message: queryError,
                    }
                    res.status(INTERNAL_SERVER_ERROR).json(resPayload).end()
                  }
                }
                s3.getObject(
                  { Bucket: 'voisee', Key: `${jobName}.json` },
                  function (err, result) {
                    if (err) {
                      res.status(BAD_REQUEST).end()
                    }
                    try {
                      let resultData = JSON.parse(result.Body.toString('utf-8'))

                      const { speaker_labels, items } = resultData.results
                      const itemSize = items.length
                      const segment = speaker_labels.segments
                     
                      // 결과를 db에 저장하는 쿼리
                      const sql = `INSERT INTO contents(job_name, spk_label, start_time, end_time, content) values (?,?,?,?,?)`

                      let j = 0

                      for (let index = 0; index < segment.length; index++) {
                        const startTime = parseFloat(segment[index].start_time)
                        const endTime = parseFloat(segment[index].end_time)
                        const speaker = segment[index].speaker_label
                        let string = ''

                        for (j; j < itemSize - 1; j++) {
                          const tempString = items[j].alternatives[0].content
                          const stringType = items[j + 1].type
                          if (items[j].type === 'punctuation') {
                            string += tempString + ' '
                            continue
                          }
                          if (parseFloat(items[j].end_time) <= endTime) {
                            string += tempString
                            if (stringType === 'pronunciation') string += ' '
                          } else break
                        }
                        if (j == itemSize - 1)
                          string += items[j].alternatives[0].content

                        // 결과를 db에 저장
                        connection.query(
                          sql,
                          [jobName, speaker, startTime, endTime, string],
                          function (err, rows, fields) {
                            if (err) {
                              console.log(err)
                              const resPayload = {
                                message: queryError,
                              }
                              res
                                .status(INTERNAL_SERVER_ERROR)
                                .json(resPayload)
                                .end()
                            }
                          },
                        )
                      }
                    } catch (err) {
                      console.log(err)
                      const resPayload = {
                        message: 'JSON parsing error',
                      }
                      res.status(INTERNAL_SERVER_ERROR).json(resPayload).end()
                    }
                  },
                )
              })
              break
            }
            case 'IN_PROGRESS': {
              const resPayload = {
                message: 'The job is not yet completed.',
              }
              res.status(INTERNAL_SERVER_ERROR).json(resPayload).end()
              break
            }
            case 'QUEUED': {
              const resPayload = {
                message: 'The job is in the queue.',
              }
              res.status(INTERNAL_SERVER_ERROR).json(resPayload).end()
              break
            }
            default: {
              const resPayload = {
                message: 'The job is failed.',
              }
              res.status(INTERNAL_SERVER_ERROR).json(resPayload).end()
            }
          }
        })
      }
      const sql = `SELECT * FROM contents WHERE job_name = (?) ORDER BY start_time`
      connection.query(sql, [jobName], function (err, result, fields) {
        if (err) {
          console.log(err)
          const resPayload = {
            message: queryError,
          }
          res.status(INTERNAL_SERVER_ERROR).json(resPayload).end()
        }
        console.log(result);
        const recordDetail = new Object()
        recordDetail.recordUrl = rows[0].record_url
        const statements = new Array()

        for (let i = 0; i < result.length; i++) {
          const stObject = new Object()
          stObject.spk_label = result[i].spk_label
          stObject.start_time = result[i].start_time
          stObject.end_time = result[i].end_time
          stObject.content = result[i].content
          stObject.segment_id = result[i].statement_id
          statements.push(stObject)
        }
        recordDetail.segments = statements
        res.status(OK).json(recordDetail).end()
      })
    })
  }),
)

// 대화 수정
router.put(
  '/:segmentId',
  wrapper(async (req, res, next) => {
    const segmentId = req.params.segmentId
    const newStatement = req.body.newStatement

    const sql = `UPDATE contents SET content=? WHERE statement_id = ?`

    connection.query(sql, [newStatement, segmentId], function (
      err,
      rows,
      fields,
    ) {
      if (err) {
        console.log(err)
        const resPayload = {
          message: queryError,
        }
        res.status(INTERNAL_SERVER_ERROR).json(resPayload).end()
      } else {
        const resPayload = {
          statement: newStatement,
        }
        res.status(OK).json(resPayload).end()
      }
    })
  }),
)

// 레코드 삭제
router.delete(
  '/:recordId',
  wrapper(async (req, res, next) => {
    const jobId = req.params.recordId
    const sql = `DELETE FROM statements WHERE job_id = ?`
    connection.query(sql, [jobId], function (err, rows, fields) {
      if (err) {
        console.log(err)
        const resPayload = {
          message: queryError,
        }
        res.status(INTERNAL_SERVER_ERROR).json(resPayload).end()
      } else {
        if (!rows.affectedRows) {
          const resPayload = {
            message: DoesNotExistError,
          }
          res.status(BAD_REQUEST).json(resPayload).end()
        } else {
          res.status(OK).end()
        }
      }
    })
  }),
)

module.exports = router
