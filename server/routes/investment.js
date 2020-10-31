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
  insertSuccess,
} from '../utils/constants'
import { mysql_dbc } from '../migrations/db_con'
import { resolve } from 'path'

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

function getContents(jobName) {
  return new Promise(function (resolve, reject) {
    const contentSql = `SELECT * FROM econtents WHERE ejob_name = ?`

    connection.query(contentSql, [jobName], function (
      err,
      contentRows,
      fields,
    ) {
      if (err) {
        const resPayload = {
          message: queryError,
        }
        reject(resPayload)
      }
      resolve(
        contentRows.map((row) => ({
          spk_label: row.spk_label,
          start_time: row.start_time,
          end_time: row.end_time,
          content: row.content,
          segment_id: row.estatement_id,
        })),
      )
    })
  })
}
function getAnswers(targetId) {
  return new Promise(function (resolve, reject) {
    let answers = []
    const answerSql = `SELECT * FROM answers WHERE target_id = ?`
    const exanswerSql = `SELECT * FROM ex_answers WHERE answer_id = ?`

    connection.query(answerSql, [targetId], function (err, answerRows, fields) {
      if (err) {
        console.log(err)
        const resPayload = {
          message: queryError,
        }
        reject(resPayload)
      }
      function getExAnswer() {
        return new Promise(function (resolve, reject) {
          for (
            let answerIndex = 0;
            answerIndex < answerRows.length;
            answerIndex++
          ) {
            const eachAnswer = new Object()
            connection.query(
              exanswerSql,
              [answerRows[answerIndex].answer_id],
              function (err, exanswerRows, fields) {
                if (err) {
                  console.log(err)
                  const resPayload = {
                    message: queryError,
                  }
                  reject(resPayload)
                }
                eachAnswer.questionId = exanswerRows[0].question_id
                eachAnswer.content = exanswerRows[0].content
                answers.push(eachAnswer)

                resolve()
              },
            )
          }
        })
      }
      getExAnswer().then(() => {
        resolve(answers)
      })
    })
  })
}
function getRecord(jobName) {
  return new Promise(async function (resolve, reject) {
    const recordSql = `SELECT * FROM epidemic_statements WHERE job_name = ?`
    const contents = await getContents(jobName)
    connection.query(recordSql, [jobName], function (err, rows, fields) {
      if (err) {
        console.log(err)
        const resPayload = {
          message: queryError,
        }
        reject(resPayload)
      }
      resolve(
        rows.map((row) => ({
          jobName: row.job_name,
          recordUrl: row.record_url,
          status: row.status,
          contents: contents,
        })),
      )
    })
  })
}
function getJobName(targetId) {
  return new Promise(async function (resolve, reject) {
    const jobSql = `SELECT * FROM epidemic_statements WHERE target_id = ?`
    connection.query(jobSql, [targetId], function (err, rows, fields) {
      if (err) {
        console.log(err)
        const resPayload = {
          message: queryError,
        }
        reject(resPayload)
      }
      resolve(rows[0].job_name)
    })
  })
}

function getTarget(investmentId) {
  return new Promise(async function (resolve, reject) {
    let targets = new Array()
    const targetSql = `SELECT * FROM targets WHERE investment_id = ?`
    connection.query(targetSql, [investmentId], async function (
      err,
      targetRows,
      fields,
    ) {
      if (err) {
        console.log(err)
        const resPayload = {
          message: queryError,
        }
        reject(resPayload)
      }
      for (
        let targetIndex = 0;
        targetIndex < targetRows.length;
        targetIndex++
      ) {
        let eachTarget = new Object()

        eachTarget.id = targetRows[targetIndex].target_id
        eachTarget.name = targetRows[targetIndex].target_name
        eachTarget.phone = targetRows[targetIndex].target_phone
        eachTarget.group = targetRows[targetIndex].target_group
        eachTarget.status = targetRows[targetIndex].status
        eachTarget.aggressive = targetRows[targetIndex].aggressive
        const jobName = await getJobName(targetRows[targetIndex].target_id)
        const record = await getRecord(jobName)
        const answers = await getAnswers(targetRows[targetIndex].target_id)
        eachTarget.record = record
        eachTarget.answers = answers
        targets.push(eachTarget)
      }
      resolve(targets)
    })
  })
}

function getTemplate(investmentId) {
  return new Promise(async function (resolve, reject) {
    let template = new Object()
    const sql = `SELECT * FROM template WHERE investment_id = ?`
    connection.query(sql, [investmentId], function (err, rows, fields) {
      if (err) {
        console.log(err)
        const resPayload = {
          message: queryError,
        }
        reject(resPayload)
      }
      template.id = rows[0].template_id
      template.title = rows[0].template_title
      const questionSql = `SELECT * FROM questions WHERE template_id =?`
      connection.query(questionSql, [rows[0].template_id], async function (
        err,
        questionRows,
        fields,
      ) {
        if (err) {
          console.log(err)
          const resPayload = {
            message: queryError,
          }
          reject(resPayload)
        }
        let questions = new Array()
        for (let i = 0; i < questionRows.length; i++) {
          const eachQuestion = new Object()
          const answers = await getExanswer(questionRows[i].question_id)
          eachQuestion.id = questionRows[i].question_id
          eachQuestion.content = questionRows[i].content
          eachQuestion.answers = answers
          questions.push(eachQuestion)
        }
        let content = new Object()
        content.questions = questions
        template.content = content
        resolve(template)
      })
    })
  })
}
function getExanswer(questionId) {
  return new Promise(function (resolve, reject) {
    const sql = `SELECT * FROM ex_answers WHERE question_id = ?`
    connection.query(sql, [questionId], function (err, rows, fields) {
      if (err) {
        console.log(err)
        const resPayload = {
          message: queryError,
        }
        reject(resPayload)
      }
      resolve(
        rows.map((row) => ({
          id: row.answer_id,
          content: row.content,
        })),
      )
    })
  })
}

// investment 리스트 읽기
router.get(
  '/',
  wrapper(async (req, res, next) => {
    let investment = new Array()
    let eachInvest = new Object()
    const investSql = `SELECT * FROM investments`
    connection.query(investSql, async function (err, investRows, fields) {
      if (err) {
        console.log(err)
        const resPayload = {
          message: queryError,
        }
        res.status(INTERNAL_SERVER_ERROR).json(resPayload).end()
      }
      for (let i = 0; i < investRows.length; i++) {
        let targets = await getTarget(investRows[i].investment_id)
        eachInvest.id = investRows[i].investment_id
        eachInvest.group = investRows[i].investment_group
        eachInvest.totalTargets = investRows[i].total_targets
        eachInvest.completedTargets = investRows[i].completed_targets
        eachInvest.targets = targets
        eachInvest.template = await getTemplate(investRows[i].investment_id)
      }
      investment.push(eachInvest)
      const resPayload = {
        investment: investment,
      }
      res.status(OK).json(resPayload)
    })
  }),
)

// template 추가
router.post(
  '/template',
  wrapper(async (req, res, next) => {
    const temTitle = req.body.temTitle
    const investId = req.body.investId
    const sql = `INSERT INTO template(template_title, investment_id) values(?, ?)`

    connection.query(sql, [temTitle, investId], function (err, rows, fields) {
      if (err) {
        console.log(err)
        const resPayload = {
          message: queryError,
        }
        res.status(INTERNAL_SERVER_ERROR).json(resPayload).end()
      }
      const resPayload = {
        temTitle: temTitle,
        temId: rows.insertId,
        investId: investId,
      }
      res.status(CREATED).json(resPayload).end()
    })
  }),
)

// 템플릿에 질문 추가
router.post(
  '/question',
  wrapper(async (req, res, next) => {
    const content = req.body.content
    const templateId = req.body.templateId
    const answers = req.body.answers
    const sql = `INSERT INTO questions(template_id, content) values(?, ?)`

    const answerSql = `INSERT INTO ex_answers(question_id, answer) values(?, ?)`

    connection.query(sql, [templateId, content], function (err, rows, fields) {
      if (err) {
        console.log(err)
        const resPayload = {
          message: queryError,
        }
        res.status(INTERNAL_SERVER_ERROR).json(resPayload).end()
      }
      for (let i = 0; i < answers.length; i++) {
        connection.query(answerSql, [rows.insertId, answers[i]], function (
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
          }
          const resPayload = {
            message: insertSuccess,
          }
          res.status(CREATED).json(resPayload).end()
        })
      }
    })
  }),
)

// 조사 대상 추가 api
router.post(
  '/target',
  wrapper(async (req, res, next) => {
    const investId = req.body.investId
    const targetName = req.body.targetName
    const targetPhone = req.body.targetPhone
    const targetGroup = req.body.targetGroup

    const sql = `INSERT INTO targets(investment_id, target_name, target_phone, target_group, status) values(?,?,?,?,?)`

    connection.query(
      sql,
      [investId, targetName, targetPhone, targetGroup, 0],
      function (err, rows, fields) {
        if (err) {
          console.log(err)
          const resPayload = {
            message: queryError,
          }
          res.status(INTERNAL_SERVER_ERROR).json(resPayload).end()
        }
        const resPayload = {
          id: rows.insertId,
          name: targetName,
          phone: targetPhone,
          group: targetGroup,
          status: 0,
        }
        res.status(CREATED).json(resPayload).end()
      },
    )
  }),
)

//조사 대상 수정 api
router.put(
  '/target/:id',
  upload.single('mediaFile'),
  wrapper(async (req, res, next) => {
    const targetId = req.params.id
    // 파일이 들어오지 않았다면
    if (!req.file) {
      const content = req.body.content
      const answer_id = req.body.answerId
      const sql = `INSERT INTO answers(target_id, content, answer_id) values(?,?,?)`
      connection.query(sql, [targetId, content, answer_id], function (
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
        }
        const resPayload = {
          message: 'Successfully added',
        }
        res.status(CREATED).json(resPayload).end()
      })
    } else {
      // 미디어 파일이 들어왔다면
      const jobName = job.name

      // s3에 업로드한 파일의 경로
      const fileLocation = req.file.location

      // db에 job정보 insert
      const sql = `INSERT INTO epidemic_statements(job_name, target_id, status, record_url) VALUES(?, ?, ?, ?)`

      connection.query(sql, [jobName, targetId, 0, fileLocation], function (
        err,
        rows,
        fields,
      ) {
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
      })
      /************음성파일 변환 실행 **************/

      // 옵션 지정
      const params = {
        LanguageCode: 'ko-KR', // 작업에서 사용할 언어
        Media: {
          MediaFileUri: fileLocation, // 변환할 음성파일의 uri
        },
        TranscriptionJobName: jobName, // job의 이름 설정
        //MediaFormat: 'mp4', // 음성 파일 형식 지정
        //MediaSampleRateHertz: '11100', // 샘플링레이트 설정
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
            const sql = `DELETE FROM epidemic_statements WHERE job_name = ?`
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
        }
        const resPayload = {
          message: insertSuccess,
        }
        res.status(CREATED).json(resPayload).end()
      })
    }
  }),
)

// target 정보 갱신 api
router.get(
  '/target/:id',
  wrapper(async (req, res, next) => {
    const targetId = req.params.id

    const sql = `SELECT * FROM epidemic_statements WHERE target_id = (?)`

    connection.query(sql, [targetId], function (err, rows1, fields) {
      if (err) {
        console.log(err)
        const resPayload = {
          message: queryError,
        }
        res.status(INTERNAL_SERVER_ERROR).json(resPayload).end()
      }
      if (!rows1[0].status) {
        const sql = `SELECT * FROM econtents WHERE ejob_name = ?`
        connection.query(sql, [rows1[0].job_name], function (
          err,
          result,
          fields,
        ) {
          if (err) {
            console.log(err)
            const resPayload = {
              message: queryError,
            }
            res.status(INTERNAL_SERVER_ERROR).json(resPayload).end()
          }
          if (!result.length) {
            var params = {
              TranscriptionJobName: rows1[0].job_name /* required */,
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
              // 완료된 작업 데이터 보내기
              const transcriptionJobStatus =
                data.TranscriptionJob.TranscriptionJobStatus

              switch (transcriptionJobStatus) {
                case 'COMPLETED': {
                  // 작업이 완료되었다면 statements 테이블의 해당 작업 status 컬럼을 1(완료)로 업데이트
                  const sql =
                    'UPDATE epidemic_statements SET status= ? WHERE job_name= ?'

                  connection.query(sql, [1, rows1[0].job_name], function (
                    err,
                    rows,
                    fields,
                  ) {
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
                      { Bucket: 'voisee', Key: `${rows1[0].job_name}.json` },
                      function (err, result) {
                        if (err) {
                          return res.status(BAD_REQUEST).end()
                        }
                        try {
                          let resultData = JSON.parse(
                            result.Body.toString('utf-8'),
                          )

                          const { speaker_labels, items } = resultData.results
                          const itemSize = items.length
                          const segment = speaker_labels.segments

                          // 결과를 db에 저장하는 쿼리
                          const sql = `INSERT INTO econtents(ejob_name, spk_label, start_time, end_time, content) values (?,?,?,?,?)`

                          let j = 0

                          for (let index = 0; index < segment.length; index++) {
                            const startTime = parseFloat(
                              segment[index].start_time,
                            )
                            const endTime = parseFloat(segment[index].end_time)
                            const speaker = segment[index].speaker_label
                            let string = ''

                            for (j; j < itemSize - 1; j++) {
                              const tempString =
                                items[j].alternatives[0].content
                              const stringType = items[j + 1].type
                              if (items[j].type === 'punctuation') {
                                string += tempString + ' '
                                continue
                              }
                              if (parseFloat(items[j].end_time) <= endTime) {
                                string += tempString
                                if (stringType === 'pronunciation')
                                  string += ' '
                              } else break
                            }
                            if (j == itemSize - 1)
                              string += items[j].alternatives[0].content

                            // 결과를 db에 저장
                            connection.query(
                              sql,
                              [
                                rows1[0].job_name,
                                speaker,
                                startTime,
                                endTime,
                                string,
                              ],
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
                                const resPayload = {
                                  message: 'successfully updated',
                                }
                                res.status(OK).json(resPayload).end()
                              },
                            )
                          }
                        } catch (err) {
                          console.log(err)
                          const resPayload = {
                            message: 'JSON parsing error',
                          }
                          res
                            .status(INTERNAL_SERVER_ERROR)
                            .json(resPayload)
                            .end()
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
        })
      } else {
        const resPayload = {
          message: 'already updated',
        }
        res.status(OK).json(resPayload).end()
      }
    })
  }),
)

module.exports = router
