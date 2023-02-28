# Amazon Elastic Block Store (Amazon EBS)

## Service Details

Amazon Elastic Block Store (Amazon EBS) provides block level storage volumes for use with EC2 instances. EBS volumes behave like raw, unformatted block devices. EBS volumes can be mounted as devices on EC2 instances.

EBS volumes can be used to store a verity of content. However, EBS provides different types of volumes depending on the main purpose of the storage media, the volume types available are:

SSD Based Volumes

| Volume Name      | Max Size        | Max IOPS Per Volume |
| ---------------- | --------------  | ------------------   |
| gp3 / gp2        | 1 GiB - 16 TiB  | 16,000               |
| io2 Block Express| 4 GiB - 64 TiB  | 256,000              |
| io2 / io1        | 4 GiB - 16 TiB  | 64,000               |

HDD Based Volumes

| Volume Name      | Max Size         | Max IOPS Per Volume |
| ---------------  | ---------------  | -----------------   |
| st1              | 125 GiB - 16 TiB | 500                 |
| sc1              | 125 GiB - 16 TiB | 250                 |

* Any of the gp (general purpose) drives will suit the vast majority of workloads, but AWS provides options as required. 
* More IOPS = more performance.
* The full specs of each EBS volumes can be found [here](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-volume-types.html#vol-type-ssd)

### Availability Zones

* EBS drives are deployed into specific availability zones (AZ).
* EC2 instances and EBS volumes *must* be in the same AZ when attaching.


### EC2 Specifics

* Depending on the configuration of an EC2 instance the EBS volume may be deleted on instance termination, if you don't want this to happen set the `delete on termination` flag to `false`

### Encryption

 * EBS volumes can be encrypted with AWS owned KMS keys or customer managed keys (CMKs)
 * Snapshots will be created with the same encryption method as the current EBS
 * It is not possible to change encryption settings after creation. If an EBS is accidentally created unencrypted, it must be snapshotted and then a new EBS created form the snapshot (with encryption applied on the new EBS volume).
 * It is possible to enforce encryption at the account level, see Assessment Notes.

### Access Control
* EBS drives do not support resource based policies, so all permissions will be granted via IAM.
* EBS drives can be tagged allowing for tag based access control.

### Fault Injection 

 * EBS provides the ability to fault test by either pausing I/O on a specified volume or using AWS Fault Injection Simulator (FIS). Disable this permission if you never intend to use it.

## Assessment Notes


* Encryption at rest should be enabled
  * Default encryption should be enabled for each region at the account level - [https://aws.amazon.com/blogs/aws/new-opt-in-to-default-encryption-for-new-ebs-volumes/](https://aws.amazon.com/blogs/aws/new-opt-in-to-default-encryption-for-new-ebs-volumes/)
  * In an ideal world, EBS volumes should be encrypted with CMKs with proper access controls configured in the key policies. This is, however, exceptionally low priority - [https://www.chrisfarris.com/post/cloud-encryption/](https://www.chrisfarris.com/post/cloud-encryption/)
* Snapshots should not be public.
  *  [https://techcrunch.com/2019/08/09/aws-ebs-cloud-backups-leak/](https://techcrunch.com/2019/08/09/aws-ebs-cloud-backups-leak/)
  *  [https://media.defcon.org/DEF%20CON%2027/DEF%20CON%2027%20presentations/DEFCON-27-Ben-Morris-More-Keys-Than-A-Piano-Finding-Secrets-In-Publicly-Exposed-Ebs-Volumes.pdf](https://media.defcon.org/DEF%20CON%2027/DEF%20CON%2027%20presentations/DEFCON-27-Ben-Morris-More-Keys-Than-A-Piano-Finding-Secrets-In-Publicly-Exposed-Ebs-Volumes.pdf)
* Ensure any snapshots that are shared with other accounts have the appropriate access controls applied to them to restrict who can read them

### Useful CLI Commands

* `aws ec2 get-ebs-encryption-by-default` - Retrieves the default encryption status for EBS resources in current region.
* `aws ec2 describe-volumes --volume-id <Volume-ID> --region <Region> --query 'Volumes[].{Encrypted:Encrypted}'*` - Retrieves the encryption status for the specified volume.
* `aws ec2 describe-snapshots --snapshot-id <Snapshot-ID> --region <Region> --query 'Snapshots[].{Encrypted:Encrypted}'` - Retrieves the encryption status for the specified snapshot.
* `aws ec2 describe-snapshot-attribute --snapshot-id <Snapshot-ID> --attribute createVolumePermission --region <Region>` - Checks whether the specified snapshot is public.
