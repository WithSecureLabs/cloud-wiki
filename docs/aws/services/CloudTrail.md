# CloudTrail

## Service Details

Cloudtrail logs all API calls made to the control plane for supported services. The vast majority of AWS services are supported, but the official list can be found at[CloudTrail Supported Services and Integrations - AWS CloudTrail](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-aws-service-specific-topics.html). Cloudtrail serves as the key log source for all control-plane activity within an AWS account.

### What gets logged?

An example Cloudtrail log is included below.

```
{"Records": [{
    "eventVersion": "1.0",
    "userIdentity": {
        "type": "IAMUser",
        "principalId": "EX_PRINCIPAL_ID",
        "arn": "arn:aws:iam::123456789012:user/Alice",
        "accountId": "123456789012",
        "accessKeyId": "EXAMPLE_KEY_ID",
        "userName": "Alice"
    },
    "eventTime": "2014-03-24T21:11:59Z",
    "eventSource": "iam.amazonaws.com",
    "eventName": "CreateUser",
    "awsRegion": "us-east-2",
    "sourceIPAddress": "127.0.0.1",
    "userAgent": "aws-cli/1.3.2 Python/2.7.5 Windows/7",
    "requestParameters": {"userName": "Bob"},
    "responseElements": {"user": {
        "createDate": "Mar 24, 2014 9:11:59 PM",
        "userName": "Bob",
        "arn": "arn:aws:iam::123456789012:user/Bob",
        "path": "/",
        "userId": "EXAMPLEUSERID"
    }}
}]}
```

Key fields include:

- `userIdentity` - a block defining the IAM entity making the API call
- `eventTime` - event timestamp
- `eventSource` - the AWS service generating the event
- `eventName` - the API call that was made
- `sourceIPAddress` - the IP address from which the API call originated
- `requestParameters` - the API call parameters
- `responseElements` - the results of the API call

### Event Types

There are three key event types in CloudTrail: management, data and insights.

#### Management events

Event logs of API calls made against the core AWS API to create, modify or delete AWS resources. Examples include creating EC2 instances, modifying an S3 bucket policy, or deleting a Lambda function.

#### Data events

Event logs of operations _inside_ a resource, rather than against it. These are typically high volume, and are charged in addition to the standard CloudTrail At the time of last update, the following were recorded.

- Amazon S3 object-level API activity (for example, GetObject, DeleteObject, and PutObject API operations) on buckets and objects in buckets
- AWS Lambda function execution activity (the Invoke API)
- Amazon DynamoDB object-level API activity on tables (for example, PutItem, DeleteItem, and UpdateItem API operations)
- Amazon S3 on Outposts object-level API activity
- Amazon Managed Blockchain JSON-RPC calls on Ethereum nodes, such as eth_getBalance or eth_getBlockByNumber
- Amazon S3 Object Lambda access points API activity, such as calls to CompleteMultipartUpload and GetObject
- Amazon Elastic Block Store (EBS) direct APIs, such as PutSnapshotBlock, GetSnapshotBlock, and ListChangedBlocks on Amazon EBS snapshots
- Amazon S3 API activity on access points
- Amazon DynamoDB API activity on streams
- AWS Glue API activity on tables

#### Insights events

Unusual API call rates or error rates can be logged by CloudTrail Insights, if enabled on a trail. The events track associated API, error code, incident time, and statistics around what raised the Insights event. These events are only triggered when call or error rates differ significantly from your account's baseline activity. Elevated access denied error rates may be useful for identifying attacker enumeration or reconnaissance activity, and thus might well be worth enabling in situations where similar capability isn't present in the SIEM or other detection solutions in use within an organization.

### Key Caveats for CloudTrail

- Delivery of events to S3 buckets is not real time. Events are delivered every 5 minutes, up to 15 minutes delay, for a theoretical max delay of 20 minutes. In practice, longer times have been observed
- CloudTrail is enabled for most recent 7 days as the account's event history, but it's not logged to somewhere you can access it out of the UI and cloudtrail APIs. 

## Assessment Notes

The best option is to have all AWS accounts owned by an organization in an [AWS Organization](./Organizations), and use an Organization-wide trail. This allows all logs to be centrally gathered across all AWS accounts. Every Organization should have at least one cloudtrail created that:

- Is configured to log all regions (is a multi-region trail)
- Is configured to log global service events (which includes IAM, amongst other things)
- Has log validation enabled (and that they do actually validate the log files before ingestion)
- Is encrypted, preferably with a customer managed key (CMK) - marked as SSE-KMS in the UI.
- Has MFA delete enabled on the S3 bucket
- Is configured to retain for at least 3 months
- Has access to both the S3 bucket and the KMS CMK restricted to the bare minimum number of staff and roles, either by resource policies or by IAM roles
- The S3 bucket used should be hosted in a dedicated logging or management account, to minimise the risk of someone compromising the main account and altering logs. 

Additional trails may be desired in some accounts to log specific data events, or to provide logs directly to application developers.

## CloudTrail Log Security

It's worth paying attention to the security of your CloudTrail logs. Attackers may attempt to modify or delete logs to cover their tracks. In addition, there's often a lot of detailed metadata stored in them, and so an attacker could gather a lot of information about your AWS environment. Some key considerations include:

- Use IAM policies to restrict access to the S3 bucket containing the log files
- Encrypt logs with SSE-S3 or SSE-KMS
- Prevent malicious deletion by:
  - Restricting delete access with IAM
  - Enabling MFA delete on the S3 bucket
- Enable log file validation to ensure logs haven't been deleted or tampered with, and then validate the log signatures against the AWS public keys prior to ingestion into any monitoring platforms

## Log Lifecycle Management

Logs are kept indefinitely by default, but S3 object lifecycle management can be used to to purge or to move to glacier for long-term storage on a set schedule.





