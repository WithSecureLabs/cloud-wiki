# Elastic Compute Cloud (EC2)

Amazon Elastic Compute Cloud (EC2) is Amazon Web Service's virtual computer service offering used to host different applications, run compute workloads and provide the backbone for the RDS service, Amazon Fargate and Docker services. The instances are based on a KVM hypervisor, called "Nitro". EC2s are often central and indispensable resource, and as such it is important to configure them in a secure way to prevent downtime, unauthorised access and movement across the cloud estate.

EC2s are built on a shared responsibility model between AWS and a customer. In terms of security, this means that both parties share a responsibility to set up and safely configure the instances. For customers this means management of the guest operating system, applications as well as configuration of the instance itself and other services which may impact the EC2s. AWS is responsible for global hardware and software (specifically related to the instance, like the hypervisor for example). More information can be found in the diagram below.

![image](/img/responsibility_model.jpeg)

The following security controls can affect the security posture of an EC2 instance and as such should be reviewed:

1.) IAM

2.) Networking

3.) Storage

4.) Backup and recovery

5.) Monitoring

## IMDS

Instance Metadata Service is a collection of endpoints used for retrieval of data from within an EC2 instance. By sending an IMDS request, it's possible to retrieve information about the instance itself such as hostname, IP addresses, security groups and most importantly IAM role credentials. There are two versions of IMDS, version one and two. Version two is recommended to use as it enforces HTTP headers and token use, which is efficient prevention against attacks where an attacker can call the metadata address from the instance (169.254.169.254). The commands to issue a token and IMDS request is as follows:

IMDSv2

```bash
TOKEN=`curl -X PUT http://169.254.169.254/latest/api/token -H "X-aws-ec2-metadata-token-ttl-seconds: 21600"` \
&& curl -H "X-aws-ec2-metadata-token: $TOKEN" -v http://169.254.169.254/latest/meta-data/
```

IMDSv1

```bash
curl http://169.254.169.254/latest/meta-data/
```

To decrease the attack surface, it's best to disable IMDS altogether. In cases where this is not possible it's recommended to use IMDSv2, avoid assigning roles to the instance when not needed and locking down IMDS to only specific operating system users.

## IAM

Identity Access Management provides a way to control access to AWS resources and services. The main component of IAM are identities: users, groups and roles. Each identity has attached policies which define its access scope.

Roles can be attached to EC2 instances. Each role has a policy document specifying the scope of its allowed actions. The following command lists the role names assigned against the queried EC2 instance:

```bash
aws ec2 describe-iam-instance-profile-associations --filters Name=instance-id,Values=i-123456789
```

The following command lists the inline policies for a specified role name retrieved from the previous command:

```bash
aws iam list-role-policies --role-name my-instance-role-name
```

Run the following command to list the non-inline policies for a specified role name retrieved from the previous command:

```bash
aws iam list-attached-role-policies --role-name my-instance-role-name
```

Run the following command to get the each policy for review:

```bash
aws iam get-role-policy --role-name my-instance-role-name --policy-name attached-policy-name
```

Just like with any service, any policies and roles should be reviewed and only given the minimum amount of privileges as per the policy of least principal.

## Networking

Each EC2 instance is placed inside a Virtual Private Cloud (VPC). VPCs provide a way to isolate AWS resources such as EC2s inside a virtual network. The main components that make up a VPC are IP addresses, subnets, route tables, gateways, network interfaces, endpoints, etc.

There are two types of firewalls which restrict access from and to an EC2 instance: security groups and access control lists (ACL). Each security group has inbound and outbound rules which apply to an EC2.

To get more information on EC2's security groups, the following command can be used:

```bash
aws ec2 describe-security-groups
```

To get more information on rules applied to a specific security group, the following command can be used:

```bash
aws ec2 describe-security-group-rules --filter Name="group-id",Values="sg-testnumber"
```

When reviewing security groups, it's recommended to ensure the following:

-Wide IP and port ranges for incoming/outgoing traffic should be avoided where possible. It's always good to ensure that the 0.0.0.0/0 IP range has not been included in either inbound or outbound rules.

 -Security groups shouldn't be left unassigned due to increased risk of them being accidentally assigned to a resource.

-Security groups shouldn't be reused on different instances because future changes may impact instances which do not require the new change. Additionally, if this method is used, security groups will likely be over-permissive as not all instances require the same port/ip ranges to be allowed.

-Make sure that no management ports (RDP and SSH) are opened to the public internet. If access is required, consider using AWS System Manager as this requires no further rules in the security group.

Additionally, VPC/subnet route table rules, peering connections, PrivateLinks and endpoints should also be reviewed as they could provide an access to an EC2 instance. More can be found:

[AWS VPC](/aws/services/VPC)

[AWS PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/what-is-privatelink.html)

[VPC Peering](https://docs.aws.amazon.com/vpc/latest/peering/what-is-vpc-peering.html)

[VPC Routing](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Route_Tables.html)

## Storage

EC2s support two types of storage volumes:

-Elastic Block Storage (EBS) - long-term/persistent storage option

-Instance-store volumes - short-term/temporary storage option

Amazon EBS (Elastic Block Storage) provides disk storage for EC2 instances. EBS is a block level storage, which persists independently of a life span of an EC2 instance, as long as the "delete on termination" setting has been disabled. As such, it's used to store the operating system and data for the specific instance.

From a security perspective, EBS is not encrypted by default, however it can be enforced on the account level. The following command queries if the encryption is enforced on the account level:

```bash
aws ec2 get-ebs-encryption-by-default
```

The following command lists all the volumes attached against an EC2 instance and whether they are encrypted or not:

```bash
aws ec2 describe-volumes
```

When EBS encryption is enabled, the following is encrypted:

-Data persisting on the volume at rest

-Data moving from the volume to the instance

-Snapshots created from the volume

-Volumes created from the snapshots

Volumes are encrypted/decrypted using KMS keys, which work differently depending on whether the snapshot is encrypted originally or not. By default, the volumes are encrypted using AWS managed key assigned to each region. However, it's possible to use customer-managed KMS keys. The use-case will depend on the circumstances.

The snapshots created from an encrypted volume are encrypted with the same KMS keys. The IDs of these keys are listed in the output of the above commands. More information on EBS volumes can be found:

[AWS EBS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AmazonEBS.html)

[AWS EBS Encryption](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html)

## Backup

From a security perspective, it's important to have an EC2 backup configured in a secure way. If compromise was to happen, backups should be safeguarded.

Data and operating system files can be backed up using EBS Snapshots and Amazon Machine Images (AMI). Snapshots backup a specific EBS volume whilst AMI is a backup of an entire EC2 instance.

AMIs and snapshots of an EBS volumes are stored in Amazon S3 (In an AWS controlled S3 bucket so you can't see it from the console). If encrypted, sharing these is only possible if customer-managed keys are used for the encryption. Unencrypted volumes can be shared publicly.

```bash
aws ec2 describe-snapshots --snapshot-ids snap-example
```

```bash
aws ec2 describe-images --region us-east-1 --image-ids ami-1234567890EXAMPLE
```

It's good to check if there are any backup policies assigned against the snapshot. More on backup policies can be found [here](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_backup.html).
