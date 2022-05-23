# GuardDuty

## Service Details

Cloud native threat detection, with rulesets maintained by AWS.

## Assessment Notes

The general recommendation is to enable GuardDuty in all regions in all accounts. The costs have reduced over time, and it provides a base level of detection that will spot some lower sophistication attacks. It also serves as an additional data source to feed into a SIEM to do better detection with. For more info on the rationale behind this, Scott Piper's blog lays it out pretty well - [https://summitroute.com/blog/2019/03/05/should_you_use_guardduty/](https://summitroute.com/blog/2019/03/05/should_you_use_guardduty/)

If GuardDuty is enabled:

- Check whether GuardDuty findings are being ingested anywhere, and whether that's being monitored
- Check whether they're monitoring for alterations to GuardDuty's state via [CloudTrail](./CloudTrail) or [Config](./Config)
- If they're using multiple AWS account, they should have GuardDuty for each account enrolled into a master account. The master account should have very heavily restricted access, ideally to only a few key security people.
  - For details on multi-account GuardDuty: <https://docs.aws.amazon.com/guardduty/latest/ug/guardduty_accounts.html>

## Operational Notes

None
