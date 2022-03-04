# Directory Service

## Service Details

AWS' Managed Active Directory Service (LDAP+Kerberos+etc). Built on the Microsoft implementation on windows servers, only the servers are managed by AWS themselves.

## Assessment Notes

### Basic reconnaissance

* `aws ds describe-directories` - Get list of created Directory Service servers. The `DirectoryDescriptions[*].Name` field is a Domain Name.
  * Possible `DirectoryDescriptions[*].Type` values are:
    * `SimpleAD` - based on Samba 4
      Simple AD is compatible with the following AWS applications: 
      * Amazon WorkSpaces
      * Amazon WorkDocs
      * Amazon QuickSight
      * Amazon WorkMail
    * `MicrosoftAD` - full-blown Microsoft Windows Server deployed.
      Compatible with:
      * Amazon FSx
      * Amazon QuickSight
      * Amazon WorkDocs
      * Amazon WorkMail
      * Amazon WorkSpaces
      * Amazon WorkSpaces Application Manager
      * RDS SQL Server

  * `DirectoryDescriptions[*].AccessUrl` - if not null, may point to Amazon WorkDocs service (kind of a SharePoint).
  * `DirectoryDescriptions[*].DnsIpAddrs` - if not null, points to every Domain Controller responsible for maintaining that AD/LDAP/GC.
  * `DirectoryDescriptions[*].VpcSettings` - if not null, binds these domain controllers to specified VPC. 
  * Investigate whether Domain Controllers are actually bound to any VPC cause this would prevent accessing them from WAN.
  * `DirectoryDescriptions[*].SsoEnabled` - states whether that AD instance is a subject for Single-Sign On feature*
  * `DirectoryDescriptions[*].VpcSettings.SecurityGroupId` - points to ID of a Security Group defining allowed access to these DCs. In order to further investigate those security groups, you can use the commands listed below:

```bash
$ SG=$(aws ds describe-directories --query "DirectoryDescriptions[*].VpcSettings.SecurityGroupId" --output text)
$ aws ec2 describe-security-groups --group-ids $SG
```

* `aws ds describe-shared-directories` - Described shared directories exposed by Directory Service. Among the worth checking fields are:
  * `SharedMethod` - which specifies how/when directory access should be granted: either exclusively to the owner's AWS Organization (`ORGANIZATIONS`), or to any
    AWS account by sending a shared directory request (`HANDSHAKE`).
  * `SharedAccountId`
  * `ShareStatus`
* `aws ds describe-snapshots --directory-id d-<id>` - We can also check whether the customer turned on automated snapshots for it's AD instance.
* `aws ds describe-trusts --directory-id d-<id>` - This API call returns all inter/intra forest trusts set up for rolled AD instance. We can check there
    what are the trust directions, types, domain names, etc.
* `aws ds list-schema-extensions --directory-id d-<id>` - Will list all of the additional AD Object properties that have been added by the customer.

### Password Policy

By default, the AWS configures following passwords policy on it's managed Directory services:

| *Policy*                                    | *Setting*                 |
|:--------------------------------------------|:--------------------------|
| Enforce password history                    | 24 passwords remembered   |
| Maximum password age                        | 42 days                   |
| Minimum password age	                      | 1 day                     |
| *Minimum password length*                   | *7 characters*            |
| Password must meet complexity requirements  | Enabled                   |
| Store passwords using reversible encryption | Disabled                  |

(source: https://docs.aws.amazon.com/directoryservice/latest/admin-guide/ms_ad_password_policies.html )

It is worth checking whether the customer altered these defaults in order to harden up his AD deployment.

## Operational Notes

It may be worth to connect to the tested Directory Service (via connecting with the VPC it was deployed within, through for instance AWS Direct Connect vpn profiles). After obtaining successful connection, regular LDAP/MS-RPC/Kerberos auditing tools will apply. 

One may go for:

* Checking Domain Functional level, whether it is recent enough or reflects most commonly deployed version of Windows Servers in assessed AD domain
* Dumping AD structure and it's contents using tools such as `ldapsearch`, `windapsearch.py` or SharpHound ingestor
* Reviewing critical/likely to occur attack paths using BloodHound/ADCM
* Finding kerberoastable Users in order to recommend the customer to avoid using SPNs on user accounts, or at least apply highly complex passwords on such
* Checking for hardcoded credentials in Domain/OU wide applied GPOs, provided that access to SYSVOL on DC is possible
* Checking if schema extension properties do not contain possibly sensitive informations about users/computers

Additional resources:

* [https://speakerdeck.com/ropnop/fun-with-ldap-and-kerberos-troopers-19](https://speakerdeck.com/ropnop/fun-with-ldap-and-kerberos-troopers-19)
