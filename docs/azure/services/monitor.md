# Monitor

## Service Description

This is Azure's central monitoring and logging service. From a high-level perspective it can:

- Collect metrics from solutions in Azure to support diagnostics of applications and their dependencies
- Corelate and dive into logs with Log Analytics to perform more detailed analysis on what has occured with a given service
- Help automate alert processing based on criteria for logs and metrics
- Create visualisations of existing data

An easy graphical way to visualise the service and the components in involves is in the following diagram from Microsoft's documentation (can be [found here](https://docs.microsoft.com/en-us/azure/azure-monitor/overview)):

![image](../images/azure-monitor-overview-optm.svg)

So, for some context, there are two main types of data that Azure Monitor processes and they are metrics and logs. Metrics are just numerical data that describe a given resource in Azure at a particular point in time. As such, they are not directly useful from a security perspective. They can provide some symptoms of compromise (high CPU percentages, more API calls then usual), but will not give necessary detail to figure out whether it is just a busy day or someone in your infrastructure.

On the other hand, we have logs, which are detailed sets of data organized into records. This is where all sorts of events and traces are stored in addition to some performance data. This data can then be analysed with queries to retrieve and consolidate various events across the Azure tenant.

## Operational Notes

### Data sources

Azure Monitor has the capability to collect data from all sorts of sources, whether they are in the cloud or even on-premises. As a high-level list, the following types of logs are collected:

- Application monitoring data - performance and functionality data of applications
- Guest OS monitoring data - data about the operating system on which your app is running. Can be any server and does not have to be in Azure
- Azure resource monitoring data - data about the operation of an Azure resource. You can find an updated list of all internal services that support different logging [here](https://docs.microsoft.com/en-us/azure/azure-monitor/monitor-reference)
- Azure subscription monitoring data - data about the operation and management of an Azure subscription
- Azure tenant monitoring data - data about operation of tenant-level Azure services, such as Azure AD
- Custom sources - collect data from any REST client that uses the [Data Collector API](https://docs.microsoft.com/en-us/azure/azure-monitor/platform/data-collector-api).

Focusing further on the Azure Platform logs, which are the detailed diagnostic and auditing info for Azure resources and the platform they depend on. Generally, the various types of logs provided at the platform level can be categorised into different layers. These layers can be broadly split at the resource, subscription, or tenant level.

|Log|Layer|Description|
|:--|:----|:----------|
|Resource Logs|Azure Resources|Operations performed at the data plane within an Azure resource. These types of logs would vary based on the service and resource type. (E.g. getting key from a Key Vault)|
|Azure Activity Logs|Azure Subscription|Operations performed on each Azure resource in the subscription at the management plane. Determine who did what and when regarding any operations takes against resources in your subscription. |
|Azure Active Directory Audit Logs|Azure Tenant|History of sign-in activity and audit trail of changes made in Azure AD|

A more complete list of the various data sources can be seen [here](https://docs.microsoft.com/en-us/azure/azure-monitor/agents/data-sources).

### Log destinations

Logs can generally be sent to several destinations depending on what you would like to do with them. They are the following three:

- Log Analytics workspace - this is where you can retain a lot of your logs and run log queries and alerts based on some conditions. Although the alerts may not be as useful as Microsoft Defender for Cloud that can provide some better security related alerting, you can still technically do all relevant stuff from here. In regard to log queries, Log Analytics workspaces are used by Azure Sentinel as a backbone for the request processing bit.
- Event hub - Send platform log data outside of Azure, for e.g. to a third-party SIEM or custom telemetry platform.
- Azure Storage - long-term storage/archive of your logs for auditing or backup.

### Microsoft Sentinel vs Azure Log Analytics

Now you might be wondering what the difference is between the two since Log Analytics can have alerts setup and you can query all sorts of data from various sources and use it as a SIEM. Well, in theory you might be able to get a lot of mileage from Log Analytics by itself to do active queries of the underlying logs. However, it is not geared up out of the box like Microsoft Sentinel is to work as a SIEM.

Sentinel has the following general features that Log Analytics does not really have:

- Wide scale data collection - has ready connectors for a lot of tools, SaaS products, Azure services, etc. More or less click a button and it will begin data ingestion.
- Machine learning powered detection engine - minimising false positives using some Microsoft's threat intelligence and some learning models.
- Investigate threats with AI - hunt for suspicious activities at scale.
- Respond to incidents rapidly - automation of common tasks, built-in orchestration.

## Assessment Guide

In the majority of cases logging can be enabled using diagnostic settings which can configure log transport to wherever you want. Retention period for data sent to one of the possible storage solutions depends on the solution itself. You can find the diagnostic setting by running either a REST API call to Microsoft Graph or using the available az CLI/PowerShell cmdlets to return the current diagnostic setting for a resource. As an example, getting the diagnostic setting for a subscription can be done via:

```bash
az monitor diagnostic-settings subscription list --subscription
```

When sending data to a log analytics workspace, you can set a data retention setting between 30-730 days. So, one thing to check is that the retention rate is sufficiently high for your requirements. A good retention period for security logs is at least about a year. This is done by going to a resource and checking its diagnostic settings in the portal or by running:

```bash
az monitor log-analytics workspace list --subscription <subscription_name> --query "[].[name,retentionInDays]"
```

Overall, as with other bits, being sensible is the key bit especially with log consumption. Ideally everyone using the cloud would ingest and process all logs, but that is unrealistic. General recommendations are process control plane logs at minimum and also store them in a storage container as a backup for forensic analysis in the future. Check that the storage container used for that is private and that ideally it is configured to use storage service encryption using the a customer managed key to fit any regulatory requirements.

Azure Key Vaults are some important services that need to be checked that they are being logged. The main advantage being that using those logs you can figure out who is getting access to the stored secrets. Make sure that generated logs are useful from a security perspective by trying to perform actions that grab secrets and see what types of telemetry is generated.

As mentioned earlier, Microsoft Defender for Cloud does provide a lot more detailed security alerting across your subscription by default but if you want to configure custom alerts for various actions you do so by going to "Monitor" -> "Alerts" and then "Manage alert rules". Here you can establish whether any custom alerting rules have been configured. Some baseline recommendations for custom alerts would be the following type of operations:

- microsoft.authorization/policyassignments/write
- microsoft.network/networksecuritygroups/write or microsoft.network/networksecuritygroups/delete
- microsoft.network/networksecuritygroups/securityrules/write
- microsoft.security/policies/write
- microsoft.sql/servers/firewallrules/

If you are doing a review of Microsoft Sentinel, check the types of connectors that are currently enabled and what tables they are passing to Sentinel. Following that, a discussion with the security team can establish whether all relevant services are connected or if there are some that aren't at the moment. This would help establish the difference between the current and an ideal state and allow the organisation to begin plans to improve telemetry generation.

In addition, the other important part to remember about Sentinel would be verifying what custom analytics rules they have configured within the service. One thing to keep in mind about Microsoft Sentinel is the following difference in entities that you would process:

- Events - description of a single occurrence that is significant from a security perspective. E.g. a single entry in a log file could count as an event.
- Alert - collection of events that, when taken together, are significant from a security perspective. An alert could contain a single event or multiple ones.
- Incidents - Sentinel creates incidents from alerts or groups of alerts based on internal logic. Incidents queue is where you find all the analytics done by Sentinel.

When looking at configured alerts, take note of "Query scheduling" times and "Alert threshold". If you believe that a given rule is likely being misreported or allows a large window of allowed actions before raising a security alert, then consider reviewing this and changing it if appropriate.

## External Links

- [Microsoft - Azure Monitor - Workspace design](https://docs.microsoft.com/en-us/azure/azure-monitor/logs/workspace-design)
- [SpecterOps - Detecting attacks within Azure](https://posts.specterops.io/detecting-attacks-within-azure-bdc40f8c0766)
- [Datadog - Monitoring Azure platform logs](https://www.datadoghq.com/blog/monitoring-azure-platform-logs/)
