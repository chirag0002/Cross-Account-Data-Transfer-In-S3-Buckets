const AWS = require('aws-sdk');
AWS.config.update({
  region: 'ap-south-1'
})

const s3 = new AWS.S3();

exports.handler = async () => {
  const sourceBucket = 'sending-s3-bucket'; // source bucket name
  const sourceKey = 'sample.txt'; // source file path
  const destinationBucket = 'storing-s3-bucket'; // destination bucket name
  const destinationKey = 'test/sample.txt'; // destination file path

  try {
    // Copy the object from the source bucket to the destination bucket
    await s3.copyObject({
      CopySource: `${sourceBucket}/${sourceKey}`,
      Bucket: destinationBucket,
      Key: destinationKey,
      ACL: 'bucket-owner-full-control'
    }).promise();

    console.log('Successfully copied file from S3');

  } catch (error) {
    console.error('Error: ', error);
  }
}
