# DocumentDB

## Service Details

A MongoDB-compatible NoSQL database. Implemented to support customers wanting MongoDB on AWS, after [MongoDB altered their licensing terms to prevent cloud providers offering the open source product as a service](https://techcrunch.com/2019/01/09/aws-gives-open-source-the-middle-finger/).

## Assessment Notes

* Encryption at rest is **not enforced** by default. Enforce default keys in most situations, unless there's a reason to prefer customer managed KMS keys for a given environment.
  * `aws docdb describe-db-clusters --db-cluster-identifier [CLUSTER NAME]`
    * If `StorageEncrypted` is `false`, encryption is disabled. If `true`, the `KmsKeyId` will give a KMS key arn.
    * `aws aws kms describe-key --key-id [ARN]` - the `KeyMetadata.KeyManager` field will say `AWS` if default, `CUSTOMER` if customer managed.
* TLS is enforced by default, but can be disabled
  * `aws docdb describe-db-clusters --db-cluster-identifier [CLUSTER NAME]`
    * `DBClusterParameterGroup` will have a `tls` key - this should be set to `true`.
* Logging and auditing:
  * `aws docdb describe-db-clusters --db-cluster-identifier [CLUSTER NAME]`
    * `EnabledCloudwatchLogsExports` specifies the logs currently being exported.
    * Audit logging is likely to be most useful for security monitoring, of the available log types. The `ddl` audit log parameter ensures that all administrative actions are appropriately logged. Read and Write events may be useful in some circumstances but are likely to generate a large volume of logs, so weigh this up against the benefit of the log data in the context of each DocumentDB cluster
    * <https://docs.aws.amazon.com/documentdb/latest/developerguide/event-auditing.html> details the DocumentDB audit logging capability.
* Are automated backups set to an appropriate time frame?
  * `aws docdb describe-db-clusters --db-cluster-identifier [CLUSTER NAME]`
    * `BackupRetentionPeriod` specifies backup period in days. Maximum is 35 days, but storage costs increase with the number of days stored. This setting should be determined on a case by case basis depending on organization backup strategies and criticality of data for the DocumentDB cluster under review.
* Authentication/User Management
  * `master` and `serviceadmin` are created by default and cannot be removed
    * The master user is a privileged user that holds the MongoDB role of `root`, and can perform administrative tasks and create additional users with roles.
    * The `serviceadmin` user is created automatically on cluster creation. It provides AWS the ability to manage your cluster, and this user cannot be altered.
* Role-based access control (RBAC) is implemented in line with the standard MongoDB RBAC model.
  * As with any access control, enforce least privilege wherever possible
  * prefer user-defined roles with appropriately scoped permissions over built-in roles where possible
  * Available permissions are detailed in the [AWS documentation](https://docs.aws.amazon.com/documentdb/latest/developerguide/role_based_access_control.html#role_based_access_control-built_in_roles)

### Differences vs MongoDB

* User and role definitions are stored in the `admin` database, and users are also authenticated against the `admin` database. This matches how MongoDB Atlas operates, but not MongoDB Community Edition (the OSS version)

## External Links
