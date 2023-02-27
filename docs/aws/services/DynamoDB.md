# DynamoDB

## Overview

DynamoDB is a fully managed, key-value, and document database that delivers single-digit-millisecond performance at any scale.

DynamoDB charges for reading, writing, and storing data in your DynamoDB tables, along with any optional features you choose to enable. DynamoDB has on-demand capacity mode and provisioned capacity mode, and these modes have pricing for processing reads and writes on your tables.

DynamoDB has full support for VPC endpoints (both interface and gateway)

## Assessment notes

### Exports To S3

DynamoDB allows anyone with the permission to the database the ability to duplicate the entire table to an S3 bucket. This can be useful if you wish to use other services to query the data such as Athena or Glue. However, ensure that the permissions of the S3 bucket do not allow over privileged access to the data.

The S3 bucket will require a bucket policy that allows communication from the DynamoDB table, an example policy has been included below:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowDynamoDBExportAction",
            "Effect": "Allow",
            "Action": "dynamodb:ExportTableToPointInTime",
            "Resource": "arn:aws:dynamodb:us-east-1:111122223333:table/my-table"
        },
        {
            "Sid": "AllowWriteToDestinationBucket",
            "Effect": "Allow",
            "Action": [
                "s3:AbortMultipartUpload",
                "s3:PutObject",
                "s3:PutObjectAcl"
            ],
            "Resource": "arn:aws:s3:::your-bucket/*"
        }
    ]
}
```

### Streams

DynamoDB supports two types of streams.

- Amazon Kinesis data stream
Amazon Kinesis Data Streams for DynamoDB captures item-level changes in your table, and replicates the changes to a Kinesis data stream. You then can consume and manage the change information from Kinesis

- DynamoDB stream
Captures item-level changes in your table, and pushes the changes to a DynamoDB stream. You then can access the change information through the DynamoDB Streams API.

### Backups

DynamoDB also integrates with the AWS Backup service which allows you to create backups from the console by going to:

`DynamoDB -> Backups -> Create Backup`

Or via the CLI with the following command:

`aws dynamodb create-backup --table-name <value> --backup-name <value>`

Ensure that backups are being encrypted at rest with a KMS key. However, this will be controlled by the AWS Backup Vault that is being used to store the backup.

### Reserved Capacity

Reserved capacity is a billing feature that allows you to obtain discounts on your provisioned throughput capacity in exchange for a one-time, up-front payment and commitment to a minimum monthly usage level. Reserved capacity applies within a single AWS Region and can be purchased with one-year or three-year terms.

### Access Controls

For the vast majority of cases DynamoDB will always be integrating with another AWS service that is storing data in DynamoDB. It's important to ensure that access controls are correctly applied to ensure data is limited to the specific services that require access. In addition, DynamoDB does not support resource based policies. This means it will always be the other resource specifically granting permission (a resource based policy applied to another resource or an IAM role.)

Always apply the principal of least privilege and treat DynamoDB permissions the same as other databases E.g. apply only the specific actions a user or resource requires.

A full list of DynamoDB actions can be found [here](https://docs.aws.amazon.com/service-authorization/latest/reference/list_amazondynamodb.html).

### Encryption Support

DynamoDB support two types of encryption:

- AWS DynamoDB owned encryption
DynamoDB encryption is a completely transparent encryption service that is fully managed by DynamoDB. You have no visibility over keys that are being used, this is enabled by default on all DynamoDB databases and comes an no additional cost

- KMS encryption
KMS functions the same way as other services, you have the choice of using AWS managed keys or your own customer managed keys. Both of these options will use incur KMS based charges.

![image](/img/dynamodb_encryption.png)

CMK's would always be the preferred choice from a security perspective as it guarantees full control over your data. However, in the vast majority of accounts and workloads this won't be a major cause for concern if an AWS managed key is being used.

### PartiQL editor

The PartiQL editor is a new feature that has been added to DynamoDB to allows users to query tables directly in the console. It's important to restrict access to this as required so data within the tables is not accidentally exposed.

![image](/img/dynamodb_query_editor.png)

### Global Tables

Global tables allow you to create replicas of your DynamoDB tables in other regions. As with any form of cross region replication, ensure there are not over permissive resources in that region that will have access to the replica.

Note, it is not possible to replicate DynamoDB tables into other AWS accounts. Exporting and re-importing the database in another account would be the only way to achieve this.

## Useful CLI Commands

- `aws dyanmodb list-tables --region <region> --output table --query 'TableNames'` \ List tables in region
- `aws dynamodb describe-table --region <region> --table-name <table-name> --query 'Table.SSEDescription'` \ Get SSE details about table

If nothing is returned (i.e. null) it could be that it uses the default (SSE enabled - Default CMK used)
