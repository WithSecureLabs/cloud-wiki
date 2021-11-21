# GuardDuty

#### General Security Notes

| *Service Type* | *Can Pentest* | *Security Focused* | *VPC Endpoint* | *KMS Support*  |
|:---------------|:--------------|:-------------------|:---------------|:---------------|
| PaaS           | No            | Yes                | No             | No             |

#### IAM Support

| *Resource-level permissions* | *Resource-based policies* | *Service-Linked Roles*  |
|:-----------------------------|:--------------------------|:------------------------|
| Yes                          | No                        | Yes                     |

## Service Details

From AWS:

Amazon GuardDuty is a threat detection service that continuously monitors for malicious or unauthorized behavior to help you protect your AWS accounts and workloads. It monitors for activity such as unusual API calls or potentially unauthorized deployments that indicate a possible account compromise. GuardDuty also detects potentially compromised instances or reconnaissance by attackers.

Enabled with a few clicks in the AWS Management Console, Amazon GuardDuty can immediately begin analyzing billions of events across your AWS accounts for signs of risk. GuardDuty identifies suspected attackers through integrated threat intelligence feeds and uses machine learning to detect anomalies in account and workload activity. When a potential threat is detected, the service delivers a detailed security alert to the GuardDuty console and AWS CloudWatch Events. This makes alerts actionable and easy to integrate into existing event management and workflow systems.

## Assessment Notes

Our standard advice now is that all clients should enable GuardDuty in all regions in all accounts. The costs have reduced over time, and it provides a base level of detection that will spot some low sophistication attacks. It also serves as an additional data source to feed into a SIEM to do better detection with. For more info on the rationale behind this, Scott Piper's blog lays it out pretty well - [https://summitroute.com/blog/2019/03/05/should_you_use_guardduty/](https://summitroute.com/blog/2019/03/05/should_you_use_guardduty/)

If GuardDuty is enabled:

- Check whether GuardDuty findings are being ingested anywhere, and whether that's being monitored
- Check whether they're monitoring for alterations to GuardDuty's state via [CloudTrail](./CloudTrail) or [Config](./Config)
- If they're using multiple AWS account, they should have GuardDuty for each account enrolled into a master account. The master account should have very heavily restricted access, ideally to only a few key security people.
    - For details on multi-account GuardDuty: https://docs.aws.amazon.com/guardduty/latest/ug/guardduty_accounts.html

## Operational Notes

None