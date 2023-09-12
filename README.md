# Transferring Files Across AWS S3 Buckets in Different AWS Accounts Using Scripting

**Solution:**

1- First we make two AWS accounts, one for the source S3 bucket where the files we need to transfer exist, and second for the destination S3 bucket where we would store the copied files.

2- Now, we have to create two S3 buckets, one in the source account and naming it “**sending-s3-bucket**” and the second S3 bucket in the destination account and naming it “**storing-s3-bucket**”.

Upload a **sample.txt** file in sending-s3-bucket which later we will copy to storing-s3-bucket for testing.

![Screenshot from 2023-09-10 14-35-41](https://github.com/chirag0002/Cross-Account-Data-Transfer-In-S3-Buckets/assets/87241050/81925686-a1ac-4fa4-8362-3c152ed0936a)

3- We have to make an IAM role with the name “**source\_IAM**” in AWS account-1(source account) to allow access to S3 buckets of both accounts with limited read & write access.

- In this role, we have to create and attach an inline policy.

{

"Version": "2012-10-17",

"Statement": [

{

"Effect": "Allow",

"Action": [

"s3:GetObject",

"s3:PutObject",

"s3:PutObjectAcl"

],

"Resource": [

"arn:aws:s3:::storing-s3-bucket/\*", //arn of source account bucket

"arn:aws:s3:::sending-s3-bucket/\*" //arn of destination account bucket ]

}

]

}

4- Now, we have to attach execute role policy in both s3 buckets

- In the **sending-s3-bucket,** under the **Permissions** tab**,** look for the bucket policy and click on Edit to edit the policy.
- 
![Screenshot from 2023-09-10 14-11-35](https://github.com/chirag0002/Cross-Account-Data-Transfer-In-S3-Buckets/assets/87241050/17e3573c-594c-4fd9-b009-d73021868db0)

![Screenshot from 2023-09-10 14-12-14](https://github.com/chirag0002/Cross-Account-Data-Transfer-In-S3-Buckets/assets/87241050/42b7fdc2-be80-48be-a4f1-1261112b9784)

{

"Version": "2012-10-17",

"Statement": [

{

"Effect": "Allow",

"Principal": {

"AWS": "arn:aws:iam::903539696692:role/source\_IAM" },

"Action": [

"s3:GetObject",

"s3:PutObject",

"s3:PutObjectAcl"

],

"Resource": "arn:aws:s3:::sending-s3-bucket/\*"

}

]

}

- Now, in the **storing-s3-bucket**, under the **Permissions** tab**,** look for the bucket policy and click on edit to Edit the policy.

![Screenshot from 2023-09-10 14-21-20](https://github.com/chirag0002/Cross-Account-Data-Transfer-In-S3-Buckets/assets/87241050/f77ee7d8-2332-4b25-89ff-9d34014bc560)

{

"Version": "2012-10-17",

"Statement": [

{

"Effect": "Allow",

"Principal": {

"AWS": "arn:aws:iam::903539696692:role/source\_IAM" },

"Action": [

"s3:GetObject",

"s3:PutObject",

"s3:PutObjectAcl"

],

"Resource": "arn:aws:s3:::storing-s3-bucket/\*"

}

]

}

In both the attached policies above, we have an arn of our created IAM role and an arn of buckets of each respectively.

5- Now, we have to make a lambda function in the source account named **source-lambda-func** selecting **node.js 14.x** for runtime and selecting the **source\_IAM** role that we created earlier.

![Screenshot from 2023-09-10 14-47-12](https://github.com/chirag0002/Cross-Account-Data-Transfer-In-S3-Buckets/assets/87241050/04158c6e-577e-497d-b5ba-23ef5c11889f)

6- In the lambda function, under the code tab, write the code for the function inside the index.js

const AWS = require('aws-sdk'); AWS.config.update({

region: 'ap-south-1'

})

const s3 = new AWS.S3();

exports.handler = async () => {

const sourceBucket = 'sending-s3-bucket'; // source bucket name

const sourceKey = 'sample.txt'; // source file path

const destinationBucket = 'storing-s3-bucket'; // destination bucket name const destinationKey = 'test/sample.txt'; // destination file path

try {

// Copy the object from the source bucket to the destination bucket await s3.copyObject({

CopySource: `${sourceBucket}/${sourceKey}`,

Bucket: destinationBucket,

Key: destinationKey,

ACL: 'bucket-owner-full-control'

}).promise();

console.log('Successfully copied file from S3');

} catch (error) {

console.error('Error: ', error); }

}

![Screenshot from 2023-09-10 15-41-22](https://github.com/chirag0002/Cross-Account-Data-Transfer-In-S3-Buckets/assets/87241050/a9171e3b-167a-4cc6-b16d-f931bf095e5e)

7- Now, under the Test tab, click on Test to verify your setup.

![Screenshot from 2023-09-10 15-44-15](https://github.com/chirag0002/Cross-Account-Data-Transfer-In-S3-Buckets/assets/87241050/ba4fc2fa-295f-4118-ac1a-fc442583b6c2)

The **test was successful**, and now we can see that our sample.txt file which exists in **sending-s3-bucket** is copied to **storing-s3-bucket** under the test folder.

![Screenshot from 2023-09-10 15-46-39](https://github.com/chirag0002/Cross-Account-Data-Transfer-In-S3-Buckets/assets/87241050/e9f300d4-2cc6-435a-a8ef-a61eabb98f57)

That’s it.

In this with the help of lambda function using AWS SDK, IAM role, and bucket execution role policy, we have copied the existing file present in the source S3 bucket to the destination S3 bucket from the one AWS account to the second AWS account.
