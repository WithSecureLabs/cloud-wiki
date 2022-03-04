# Redshift

## Service Details

A cloud "data warehouse" - large scale SQL-based data store designed for holding terabytes or petabytes of data.

## Assessment Notes

### Authentication

* IAM-backed authentication should be used for Redshift users, either by using the Redshift JDBC or ODBC drivers which handle it natively, or by making use of the  `GetClusterCredentials` API call to request database credentials associated with the current IAM user or role
* Ensure the IAM roles that have access to the cluster are supposed to, and that they're configured with sensible permissions according to the principle of least privilege
* IAM roles assigned to Redshift can be used to access [S3](./S3), [Athena](./Athena), [Glue](./Glue), and [Lambda](./Lambda). Ensure any roles assigned to the cluster only grant permissions to the specific buckets, functions etc that are required for the cluster to function.
* Master user should be renamed when cluster is created.
  * Default master user username is `awsuser`
  * `aws redshift create-cluster --master-username [USERNAME]` to specify a different master user on creation

### Authorization

This depends on use case, but the following should be considered:

* Implementing user groups within Redshift to restrict who can access what schema - [https://docs.aws.amazon.com/redshift/latest/dg/t_user_group_examples.html](https://docs.aws.amazon.com/redshift/latest/dg/t_user_group_examples.html)
* Implementing views to abstract or hide some data or structure from some users and applications
* Using Column-Level Access Control to restrict which columns users can access

### Networking

* Launch the cluster inside a VPC
* Ensure the Redshift cluster has a security group configured that restricts access to only those IP ranges or EC2 security groups that need access
  * Do _not_ expose these to the internet
    * `aws redshift describe-clusters --cluster-identifier [CLUSTERNAME]` , `PubliclyAccessible` should be false

* Ensure a VPC Endpoint for Redshift is deployed in any VPCs accessing the service
  * These VPC endpoints should have policies configured to block access to all Redshift clusters to which access is not required, to block data exfiltration to attacker-controlled clusters

### Data Security

* Enforce encryption at rest
  * Server-side encryption preferable in most use cases due to lower overhead, this uses KMS under the hood and encrypts/decrypts transparently. See [KMS](./KMS) for key handling details
  * [https://docs.aws.amazon.com/redshift/latest/mgmt/working-with-db-encryption.html](https://docs.aws.amazon.com/redshift/latest/mgmt/working-with-db-encryption.html) for details of how the cluster-level server side encryption works
  * `aws redshift describe-clusters --cluster-identifier [CLUSTERNAME]` , look for `Encrypted` parameter
* Enforce encryption in transit
  * TLS is enabled by default, but not enforced
  * The `require_SSL` parameter must be set to `true` in the parameter group that is associated with the cluster for SSL to be enforced - [https://docs.aws.amazon.com/redshift/latest/mgmt/connecting-ssl-support.html](https://docs.aws.amazon.com/redshift/latest/mgmt/connecting-ssl-support.html)
    * `aws redshift describe-clusters --cluster-identifier [CLUSTERNAME]` to get cluster parameter group
    * `aws redshift describe-cluster-parameters  --parameter-group-name [PARAMETERGROUP]` to get the parameter group contents
    * `"ParameterName": "require_SSL"` should be set to true
* Ensure automated snapshots are retained for a reasonable period
  * `aws redshift describe-clusters --cluster-identifier [CLUSTERNAME]` , look for `AutomatedSnapshotRetentionPeriod` parameter

### Logging

* Either log to S3 buckets, or pull logging data regularly from the system logging tables inside the cluster, per [https://docs.aws.amazon.com/redshift/latest/mgmt/db-auditing.html#db-auditing-enable-logging](https://docs.aws.amazon.com/redshift/latest/mgmt/db-auditing.html#db-auditing-enable-logging)
* If logging to S3 buckets:
  * Ensure cluster audit logging is enabled
    * `aws redshift describe-logging-status --cluster-identifier [CLUSTERNAME]`
    * Result should include `"LoggingEnabled": true`
  * Ensure user activity logging is enabled
    * `aws redshift describe-clusters --cluster-identifier [CLUSTERNAME]` to get cluster parameter group
    * `aws redshift describe-cluster-parameters  --parameter-group-name [PARAMETERGROUP]` to get the parameter group contents
    * `"ParameterName": "enable_user_activity_logging"` should be set to true
  * The S3 bucket that these logs are written to should have the standard S3 controls applied, as detailed in the [S3](./S3) guide

### Patching and Updates

* Ensure version upgrades are enabled
  * `aws redshift describe-clusters --cluster-identifier [CLUSTERNAME]` , look for `AllowVersionUpgrade` parameter. It should be set to `true`.


## Operational Notes

* Redshift has a service-linked role associated with it, but the role configuration cannot be altered by AWS users.
