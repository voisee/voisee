var express = require('express');
var router = express.Router();
// Load the SDK
const AWS = require('aws-sdk')
// Update region
AWS.config.update({ region: 'ap-northeast-2' })

// s3 객체 생성
const s3 = new AWS.S3()

/* GET users listing. */
router.get('/:jobName', function(req, res, next) {
  const jobName = req.params.jobName
  /*
  s3.listBuckets(function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });*/
  AWS.config.getCredentials(function(err){
    if (err) console.log(err.stack)
    // credentials not loaded
    else {
        console.log('Access key: ',  AWS.config.credentials.accessKeyId)
        console.log('Region: ', AWS.config.region)
    }
}) 
  s3.getObject(
    { Bucket: 'voisee', Key: `${jobName}.json` },
    function (err, result) {
      if(err){
        res.send(err).end()
        console.log(err)
      }
      console.log(result)
      res.status(200).end()
    })
});

module.exports = router;
