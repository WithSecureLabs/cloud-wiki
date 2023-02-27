# Elastic Disaster Recovery Service

## Service Details

AWS Elastic Discovery Recovery Service (DRS) is a solution provided by AWS that allows you to "backup" whole hard disks and in the event of a disaster restore these to new servers. This applies to both on premise and any multi cloud servers as the service is driven by an agent installed on servers.  

The service operates on a per region level and is not global.

Once the agent is installed on a server it creates a backup contained within an EBS volume, which can then be restored to an EC2 instance.

## Assessment Notes

- The agent which is installed on the server supports long lived access keys, when reviewing this service ensure only short lived credentials are being used.
- Every "backup" of other servers that are taken are simply stored in EBS volumes with no additional protection. Anyone within the account that has the ability to attach EBS volumes to EC2's can read the contents of the those "backups". Great care should be taken to control access, especially if the backups originate from on premise.
- Replication servers (EC2) are created for this service that the backup EBS volumes are attached to.
- SSH is disabled on replication servers but it may be possible to reverse this. If this happens, access would be possible to all the backup EBS volumes.
- DRS will open a new security group for port 1500, this is used for the data transfer and can be configured on a private or public basis.
- Communication with the agent and backup server is encrypted but AWS docs do not confirm what method is in use.
- A significant amount of information about the host is copied to the console, such as IP address, MAC addresses and OS info. Ensure access to the DRS console is protected.
- Care should be taken when backing up servers that may fall outside of AWS Security Controls, for example adding an on premiss server into AWS that contains vulnerabilities.

## Operational Notes

### IAM

- When starting this service for the first time 6 new IAM roles will be created (all of which attach managed policies):

| Role Name                                         | Role Type             |
| --------------------------------------------------| -------------------   |
| AWSServiceRoleForElasticDisasterRecovery          | Service linked role   |
| AWSElasticDisasterRecoveryReplicationServerRole   | Service roles         |
| AWSElasticDisasterRecoveryConversionServerRole    | Service roles         |
| AWSElasticDisasterRecoveryRecoveryInstanceRole    | Service roles         |
| AWSElasticDisasterRecoveryAgentRole               | Service roles         |
| AWSElasticDisasterRecoveryFailbackRole            | Service roles         |

### Networking

- Agent needs to communicate with the replication server in your account.
- Default security group added on port 1500 (based on the below option when setting up DRS) This will create the replication server with either a public or private ip respectively:
![image](/img/drs_networking.png)
- Additional Security groups can be confirmed for attachment at creation of the replication servers.
- Bandwidth of uploads to AWS can be throttled.
- Specifying a specific subnet for the replication server to be installed in is required.

### Agent

- Python based
- root/admin access required for install
- Works on Linux and Windows
- Linux Download available from `wget -O ./aws-replication-installer-init.py https://aws-elastic-disaster-recovery-<REGION>.s3.<REGION>.amazonaws.com/latest/linux/aws-replication-installer-init.py`
- Windows Download available from `https://aws-elastic-disaster-recovery-<REGION>.s3.<REGION>.amazonaws.com/latest/windows/AwsReplicationWindowsInstaller.exe`

### EBS (backup) Storage

- DRS identifies disk(s) to be backed up from target server, then creates EBS volumes based on those disk(s) and attaches it to the replication server.
- Encryption is enabled by default on all EBS volumes (using AWS managed KMS keys). Other KMS key types are supported.
- EBS volumes are initially attached to the replication server but are available to the account in general.
![image](/img/drs_disk_replication.png)
- Volumes are not deleted from AWS even if the source server is removed from DRS.

### Replication Server

- Replication server attaches EBS volumes that have been backed up - no evidence to suggest they are detached at any point.
- As the server is just an EC2 instance users can interfere with the service by shutting down the EC2 (During testing this service it has created another replication server if the initial server is shutdown. However, this seems to break the backup process when a new server is added)
- AWS have made attempts to block any access to the server with the following user data script (However this may be reversible due to the nature of user metadata).

```bash
#!/bin/bash
rpm -e amazon-ssm-agent.x86_64
systemctl mask sshd.service
systemctl stop sshd.service

sed -i -e 's/.*open-vm-tools.*//' /etc/crontab
```

### Conversion Servers

- Spawned when a recovery job is started, automatically terminates at the end of recovery.
- The Machine Conversion Server converts the disks to boot and run on AWS.
- Specifically, the Machine Conversion Server makes bootloader changes, injects hypervisor drivers and installs cloud tools.
![image](/img/drs_conversion_server.png)

### Instance Recovery

- Recovery can be initiated at any time from the console or the CLI.
- DRS uses the latest copy of the EBS volume and spawns a new EC2 server based off it.
- EC2 spec will be configured based on the original setup of DRS (c5.large is used by default).
- It's not possible to delete the source server configuration in DRS if it has active recovery instances.

## External References

- An installation guide for the agent can be found [here](https://docs.aws.amazon.com/drs/latest/userguide/agent-installation.html)
- CLI commands for the service can be found [here](https://docs.aws.amazon.com/cli/latest/reference/drs/index.html)
