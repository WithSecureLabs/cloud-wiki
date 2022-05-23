# CloudFront

## Service Details

Content deliverty network (CDN), used to provide low latency and high transfer speeds across the globe by caching assets close to those accessing it.

## Assessment Notes

- `aws cloudfront list-distributions` will pull a list of cloudfront distributions in the account. Distributions are global, so no need to specify individual regions for this API call.

### Authentication

### Authorization

### Networking

- Launch the cluster inside a VPC
- Ensure the Redshift cluster has a security group configured that restricts access to only those IP ranges or EC2 security groups that need access
  - Do _not_ expose these to the internet
    - `aws redshift describe-clusters --cluster-identifier [CLUSTERNAME]` , `PubliclyAccessible` should be false
- Ensure a VPC Endpoint for Redshift is deployed in any VPCs accessing the service
  - These VPC endpoints should have policies configured to block access to all Redshift clusters to which access is not required, to block data exfiltration to attacker-controlled clusters

### Data Security

- Encryption at rest not relevant to CloudFront, as no data stored.
- Enforce encryption in transit
  - TLS is enabled by default, but not enforced
  - Ensure sensible protocols are configured
    - `aws cloudfront get-distribution --id [DISTRIBUTIONID]`
    - `Distribution.DistributionConfig.Origins` - look for `CustomOriginConfig`, each of which will contain a `OriginSslProtocols` field. This should not include `SSLv3` or `TLSv1`.
- [Field-Level Encryption (FLE)](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/field-level-encryption.html) is an option where extra security is required on data being uploaded by clients to the systems behind a CloudFront distribution. If this should be enabled, verify with:
  - `aws cloudfront list-distributions` to get distributions, `DefaultCacheBehavior.FieldLevelEncryptionId` wil give the FLE configuration ID
  - `aws cloudfront get-field-level-encryption --id [CONFIGURATIONNID]` to get the configuration

### Logging

- Verify standard logging is enabled
  - `aws cloudfront get-distribution --id [DISTRIBUTIONID]`
  - `Distribution.DistributionConfig.Logging.Enabled` should be set to `true`
- If logging to S3 buckets the S3 bucket that these logs are written to should have the standard S3 controls applied, as detailed in the [S3](./S3) guide
- [Real time logging](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/real-time-logs.html) is also an option, which is implemented as a Kinesis Data Stream producer.

## Operational Notes

Any content related to operational considerations (I.E useful to know but not directly to be checked as part of an assessment) goes here. Good examples include how the service interacts with other services within AWS, or common deployment architectures/considerations.

## Exam tips

Any comments specifically related to AWS exams, for instance AWS Certified Security Specialty

## External Links
