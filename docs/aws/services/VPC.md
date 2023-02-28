# VPC

## Service Details

Virtual Private Cloud. An (initially) private network created within AWS that allows you to deploy resources. All AWS accounts will be provided with a "default" VPC in each region. These should be reviewed or removed as required.

If the VPC creation wizard is used the following resources will be automatically created:

### VPC Peering

- Connect two VPCs via direct network route using private IP addresses.
- Resources behave as if on same private network.
- It's possible to peer VPCs across multiple AWS accounts.
- No transitive peering (i.e. A and B peered with C, A cannot communicate with B).

### Reserved IP ranges

In a subnet with a CIDR block of 10.0.0.0/24, the following five IP addresses are reserved:

- 10.0.0.0: Network address.
- 10.0.0.1: Reserved by AWS for the VPC router.
- 10.0.0.2: Reserved by AWS. The IP address of the DNS server is always the base of the VPC network range plus two; however, we also reserve the base of each subnet range plus two. For VPCs with multiple CIDR blocks, the IP address of the DNS server is located in the primary CIDR. For more information, see Amazon DNS Server.
- 10.0.0.3: Reserved by AWS for future use.
- 10.0.0.255: Network broadcast address. We do not support broadcast in a VPC, therefore we reserve this address.

AWS will always reserve five IP's within a subnet, the beginning of the IP address will change depending on the CIDR.

### Security Groups

- Rule sets for governing inbound and outbound connectivity.
- Stateful, if port 80 is open for inbound it will automatically be opened for outbound (no need to open ephemeral ports).
- Can be attached to specific resources, such as EC2 instances.

### Network Access Control Lists (NACLs)

- Max of 200 per VPC
- Stateless, if port 80 is open for inbound, nothing will be opened for outbound (rule needs to be created for ephemeral ports)
- Attached at the VPC/Subnet level rather than specific resources.
- Rules evaluated in order by number, 100, 200 and 300 etc.
- Explicit deny takes precedence over an allow.

#### Key differences between Security Groups and NACLs

NACLs vs Security groups:

- Security groups are stateful and NACLs stateless.
- NACLs require all outbound ephemeral ports to be open, where as security groups only require the original inbound port.
- Each VPC supports 200 NACLs / no limit on security groups.
- Default NACL allows all in and all out.

**Security groups should be the preferred choice where available due to better support for fine grain access control.**

### NAT / Internet Gateway Configuration in a VPC

A NAT gateway is a Network Address Translation (NAT) service. You can use a NAT gateway so that instances in a private subnet can connect to services outside your VPC but external services cannot initiate a connection with those instances.

Internet gateways provided internet connectivity to resources within a VPC.

#### NAT instances

Original product offered by AWS to provide NAT abilities within an account. The process involves turning a "normal" EC2 instance within an account into a NAT server. However, this introduces a large bottleneck as NAT traffic will be dependent on the instances bandwidth, in addition the instance may fail. It is no longer recommended to use this type of NAT setup. A NAT gateway should be used instead.

#### NAT Gateway

NAT Gateways function within the account as a managed service, There is no need to create specific instances. Once deployed AWS will scale the NAT as required by traffic volume. In addition they offer seamless fault mitigation in the event of failure.

#### Internet Gateway

Internet gateways provided internet access to resources within a VPC. This applies to both outbound and inbound connectivity.

#### Egress-only internet gateways

Egress-only internet gateways provided resources within a VPC access to the internet, but it is not possible for services on the internet to reach resources within your VPC.

#### Recommendations for NAT and Internet Gateways

Limit internet access to an account wherever possible, workloads that do require internet access should be done via a load balancer so that fine grain access can be established.

### DNS

AWS VPCs support DNS resolution by default. If you don't want this feature to be enabled you can set the following flags to false (on the VPC home page).

- EnableDNSHostnames=False
  - this indicates whether the instances launched in the VPC get public DNS names.
- EnableDNSSupport=False
  - disables the amazon provided DNS server within the VPC.

However, if part of your solution will use VPC endpoints `EnableDNSSupport` must be set to true.

Enabling or disabling hostnames will depend on the solution you plan to implement - resources in a private subnet should not require public DNS names.

### Load Balancers

Three types:

- Application load balancer
  - Operates at the app layer.
  - TLS termination.
  - Advanced app-level routing.
  - Two Subnets required for deployment.
- Network load balancer
  - Operates at the TCP/IP level.
- Classic load balancer
  - Deprecated - not recommended for use.

### VPC Flow Logs

- Enables capturing of IP traffic going to and from network interfaces within a VPC.
- Stored in Cloudwatch Logs.
- Interact with flow logs in Cloudwatch Logs.
- Can stream to Lambda, Elasticsearch Services.
- GuardDuty will analyze if enabled. Further information on what Guard Duty checks for can be found [here](https://docs.aws.amazon.com/guardduty/latest/ug/guardduty_data-sources.html).

Can create flow logs at 3 levels:

- VPC
- Subnet
- Interface

Exemptions:

- Cannot enable flow logs for peered VPCs unless in the same account.
- Cannot tag a log flow.
- After log flow is created, you can't change its configuration - change IAM role etc.
- Metadata only - NO ACTUAL PACKETS STORED.

Items/requests that are not logged:

- Traffic to Amazon DNS servers.
- Windows instances trying to activate.
- Traffic to/from 169.254.169.254 (metadata).
- DHCP traffic.
- Traffic to reserved IP address for default VPC router.

### VPC Endpoints (also knows as Private Link)

VPC endpoints provide a means to access other AWS services (such as S3) without sending data over the public internet. All traffic remains on the AWS backbone network.

Not all AWS service support VPC endpoints, a complete list of services that do support VPC endpoints can be found [here](https://docs.aws.amazon.com/vpc/latest/privatelink/aws-services-privatelink-support.html)

Two types of endpoints are available.

- Gateway endpoint.
  - Only supports S3 and DynamoDB.
  - No extra charge for using.
  - No ability to attach a security group.
- Interface endpoint
  - Supports all other services that work with endpoints.
  - Charged per hour.
  - Support security group attachment for fine grain access control.

#### Gateway Endpoint vs. Interface Endpoint

Normally, Interface endpoints would be the better choice because you can attach a security group which allows you to provide fine grain access control. However, they are considered expensive and will add significant cost to an AWS bill if using multiple. Make a best judgment call based on the workload, if its sensative data use an interface endpoint.

Both interface endpoints and gateways will create a policy like below by default:

```json
{
  "Version": "2008-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "*",
      "Resource": "*"
    }
  ]
}
```

This policy can actually introduce a data exfiltration path if left in the account. This was demonstrated at [fwd:cloudsec by Jonathan Adler!](https://youtu.be/mFK-GksgopI)

To prevent this it's recommended to limit the Principal to the account you are working with (at minimum). Consider specifying the specific buckets you expect communication to come from also.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "s3:*",
      "Effect": "Allow",
      "Resource": "arn:aws:s3:::${BucketName}/${KeyName}",
      "Principal": {
        "AWS": [
          "112233445566"
        ]
      }
    }
  ]
}
```

### Useful CLI Commands

Note that most of the commands are under the `ec2` section of the CLI. This is from legacy AWS architecture.

- List VPCs  \
```aws ec2 describe-vpcs```
- List VPC endpoints  \
```aws ec2 describe-vpc-endpoints```
- List NAT gateways \
```aws ec2 describe-nat-gateways```
- List Internet gateways \
```aws ec2 describe-internet-gateways```
