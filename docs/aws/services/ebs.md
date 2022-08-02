# Amazon Elastic Block Store (Amazon EBS)

## Service Details

Amazon Elastic Block Store (Amazon EBS) provides block level storage volumes for use with EC2 instances.

## Assessment Notes
* Encryption at rest should be enabled
  * Default encryption should be enabled for each region at the account level. This can only be checked through the console - [https://aws.amazon.com/blogs/aws/new-opt-in-to-default-encryption-for-new-ebs-volumes/](https://aws.amazon.com/blogs/aws/new-opt-in-to-default-encryption-for-new-ebs-volumes/)
  * In an ideal world, EBS volumes should be encrypted with CMKs with proper access controls configured in the key policies. This is, however, exceptionally low priority - [https://www.chrisfarris.com/post/cloud-encryption/](https://www.chrisfarris.com/post/cloud-encryption/)
* Snapshots should not be public
* Ensure any snapshots that are shared with other accounts have the appropriate access controls applied to them to restrict who can read them

### Basic reconnaissance

* `aws ec2 get-ebs-encryption-by-default` - Retrives the default encryption status for EBS resources in current region.
* `aws ec2 describe-volumes --volume-id <Volume-ID> --region <Region> --query 'Volumes[].{Encrypted:Encrypted}'*` - Retrives the encryption status for the specified volume.
* `aws ec2 describe-snapshots --snapshot-id <Snapshot-ID> --region <Region> --query 'Snapshots[].{Encrypted:Encrypted}'` - Retrives the encryption status for the specified snapshot.
* `aws ec2 describe-snapshot-attribute --snapshot-id <Snapshot-ID> --attribute createVolumePermission --region <Region>` - Checks whether the specified snapshot is public.

## Operational Notes

None
