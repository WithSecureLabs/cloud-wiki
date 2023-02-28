# RDS

## Service Details

AWS managed database (DB) offering. Several different DB types:

| Database Engine        | IAM DB Authentication Support    |
| ---------------------- | -------------------              |
| Aurora                 | Yes                              |
| PostgreSQL             | Yes                              |
| MySQL                  | Yes                              |
| MariaDB                | No                               |
| Oracle                 | No                               |
| Microsoft SQL Server   | No                               |

The service is backed by EC2 instances.

### Single Tenant RDS Instances

If you define a VPC where the instance tenancy is set to `dedicated` then the RDS instances created within said VPC are on single-tenant hypervisors (details [here](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_VPC.WorkingWithRDSInstanceinaVPC.html#Overview.RDSVPC.Create).)

### Operational Notes

- Aurora supports querying the database directly in the console via the "Query Editor". However, this is only supported on Aurora Serverless databases and not provisioned aurora instances.
- Aurora supports provisioned capacity or serverless V1/V2,
- Provisioned or serverless V1 can be upgraded to V2 as outlined [here](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2.upgrade.html).
- Aurora is fault tolerant by default. In addition, you can create read replica instances which can be promoted to their own independent database at a later date.
- Other database types have the option to select the "multi-az" option which creates another instance in another AZ. This will only become active if the first instance fails - (it's constantly copying and data from the original database).
- If a database is "stopped" it will automatically restart after 7 seven days, there is no way to keep a database permanently stopped in RDS.
- Reserved instances are available for sensitive workloads.

### Assessment Notes

- Ensure that the database is being encrypted with KMS - This only applies to encryption at rest.
  - In addition, check that snapshots are being encrypted by the service when created.
- If encryption in transit is required database level controls will need to be enforced.
- Ensure the "public access" tick box is not ticked - security groups may prevent it from functioning but in the vast majority of cases it should be disabled.
- Security groups are used to control traffic in and out, restrict with the principal of least privilege.
- Ensure that access to "Query Editor" is appropriately restricted (Aurora only).

#### IAM Authentication

- RDS for MySQL, PostgreSQL and Aurora can authenticate via IAM roles, consider this when reviewing/creating IAM permissions.
- Master user account is added when the database is created. It should not be used for any application interaction with the database. More details can be found [here](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.MasterAccounts.html)
- Create database users for workloads and restrict with appropriate database level permission sets.

#### Networking

- Security groups in use for controlling network access.
- Deployment into subnets (very similar to EC2).
- 2 Subnets required for deployment in a VPC (each must be in a different AZ).

#### Data Security

- Each Database type comes with a "default parameter group" to control the database options, these should be reviewed and changed as required to follow the principal of least privilege before deployment. More details can be found [here](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithParamGroups.html)
- Option groups also supported to enable optional features of the specific database version.
![image](/img/rds_parameter_group.png)
- Automated database backups available for up to 35 days, with the option to create manual snapshots when needed.
- Aurora can support point in time recovery for the backups it holds, 11/01/2022 14:56:30 for example.
![image](/img/aurora_point_in_time_restore.png)
- Full KMS support for data encryption at rest.

#### Logging

- Fully integrates with CloudWatch for advanced and standard monitoring.
- CloudTrail support for service level monitoring.

#### Patching and Updates

- Options are available to specify a maintenance window (every Saturday between 01:00/04:00 for example).
- If "Enable auto minor version upgrade" is enabled the database will be automatically patched during the maintenance window.
- Major version upgrades must be performed manually as outlined [here](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.Upgrading.html)
- Using a multi-AZ setup is the best way to avoid disruption as updates are always applied on the standby first, then all connections are moved to the fully upgraded standby instance.

### Useful CLI commands

- List all databases in a specific region: \
`aws rds describe-db-instances --region eu-west-1`
- List all snapshots for a specific DB instance: \
`aws rds describe-db-snapshots --region eu-west-1 --db-instance-identifier database-1`
- List RDS security groups: \
`aws rds describe-db-security-groups`
