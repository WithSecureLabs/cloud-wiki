# Amazon Elastic Block Store (Amazon EBS)

## Service Details

Amazon Elastic Block Store (Amazon EBS) provides block level storage volumes for use with EC2 instances. EBS volumes behave like raw, unformatted block devices. EBS volumes can be mounted as devices on EC2 instances. EBS volumes that are attached to an instance are exposed as storage volumes that persist independently from the life of the instance. A file system can be created on top of these volumes, or they can be used as any other block device.
EBS is recommended to be used for data that must be quickly accessible and requires long-term persistence. EBS volumes are particularly well-suited for use as the primary storage for file systems, databases, or for any applications that require fine granular updates and access to raw, unformatted, block-level storage.

## Assessment Notes
* Encryption at rest should be enabled
  * Default encryption should be enabled for each region at the account level. - [https://aws.amazon.com/blogs/aws/new-opt-in-to-default-encryption-for-new-ebs-volumes/](https://aws.amazon.com/blogs/aws/new-opt-in-to-default-encryption-for-new-ebs-volumes/)
  * In an ideal world, EBS volumes should be encrypted with CMKs with proper access controls configured in the key policies. This is, however, exceptionally low priority - [https://www.chrisfarris.com/post/cloud-encryption/](https://www.chrisfarris.com/post/cloud-encryption/)
* Snapshots should not be public.
  *  [https://techcrunch.com/2019/08/09/aws-ebs-cloud-backups-leak/](https://techcrunch.com/2019/08/09/aws-ebs-cloud-backups-leak/)
  *  [https://media.defcon.org/DEF%20CON%2027/DEF%20CON%2027%20presentations/DEFCON-27-Ben-Morris-More-Keys-Than-A-Piano-Finding-Secrets-In-Publicly-Exposed-Ebs-Volumes.pdf](https://media.defcon.org/DEF%20CON%2027/DEF%20CON%2027%20presentations/DEFCON-27-Ben-Morris-More-Keys-Than-A-Piano-Finding-Secrets-In-Publicly-Exposed-Ebs-Volumes.pdf)
* Ensure any snapshots that are shared with other accounts have the appropriate access controls applied to them to restrict who can read them

### Basic reconnaissance

* `aws ec2 get-ebs-encryption-by-default` - Retrives the default encryption status for EBS resources in current region.
* `aws ec2 describe-volumes --volume-id <Volume-ID> --region <Region> --query 'Volumes[].{Encrypted:Encrypted}'*` - Retrives the encryption status for the specified volume.
* `aws ec2 describe-snapshots --snapshot-id <Snapshot-ID> --region <Region> --query 'Snapshots[].{Encrypted:Encrypted}'` - Retrives the encryption status for the specified snapshot.
* `aws ec2 describe-snapshot-attribute --snapshot-id <Snapshot-ID> --attribute createVolumePermission --region <Region>` - Checks whether the specified snapshot is public.
