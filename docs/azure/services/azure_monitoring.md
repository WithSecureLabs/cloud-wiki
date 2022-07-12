# Azure Monitor

## Service Description

This is Azure's central monitoring and logging service. From a high-level perspective it can:

* Collect metrics from solutions in Azure to support diagnostics of applications and their dependencies
* Corelate and dive into logs with Log Analytics to perform more detailed analysis on what has occured with a given service
* Help automate alert processing based on criteria for logs and metrics
* Create visualisations of existing data

An easy graphical way to visualise the service and the components in involves is in the following diagram from Microsoft's documentation (https://docs.microsoft.com/en-us/azure/azure-monitor/overview):

![image](../images/azure-monitor-overview-optm.svg)

So, for some context, there are two main types of data that Azure Monitor processes and they are metrics and logs. Metrics are just numerical data that describe a given resource in Azure at a particular point in time. As such, they are not directly useful from a security perspective. They can provide some symptoms of compromise (high CPU percentages, more API calls then usual), but will not give necessary detail to figure out whether it is just a busy day or someone in your infrastructure.

On the other hand, we have logs, which are detailed sets of data organized into records. This is where all sorts of events and traces are stored in addition to some performance data. This data can then be analysed with queries to retrieve and consolidate various events across the Azure tenant.

## Operational Notes
### Data sources

Azure Monitor has the capability to collect data from all sorts of sources, whether they are in the cloud or even on-premises. You can find an updated list of all internal services that support different logging here (https://docs.microsoft.com/en-us/azure/azure-monitor/monitor-reference). As a high-level list, the following types of logs are collected:

* Application monitoring data - performance and functionality data of applications
* Guest OS monitoring data - data about the operating system on which your app is running
* Azure resource monitoring data - data about the operation of an Azure resource
* Azure subscription monitoring data - Data about the operation and management of an Azure subscription, as well as health and operation of Azure itself
* Azure tenant monitoring data - data about operation of tenant-level Azure services, such as AAD
* Custom sources - collect data from any REST client that uses the [Data Collector API](https://docs.microsoft.com/en-us/azure/azure-monitor/platform/data-collector-api).

Let us go a bit more into the Azure Platform logs, which are the detailed diagnostic and auditing info for Azure resources and the platform they depend on. Generally, the various types of logs provided at the platform level can be categories into different layers. These layers would be at the resource, subscription, or tenant level.

|Log|Layer|Description|
|:--|:----|:----------|
|Resource Logs|Azure Resources|Operations performed at the data plane within an Azure resource. These types of logs would vary based on the service and resource type. (E.g. getting key from a Key Vault)|
|Activity Logs|Azure Subscription|Operations performed on each Azure resource in the subscription at the management plane. Determine who did what and when regarding any operations takes against resources in your subscription. |
|Azure AD Logs|Azure Tenant|History of sign-in activity and audit trail of changes made in AAD|

### Log destinations

Logs can generally be sent to several destinations depending on what you would like to do with them. They are the following three:

* Log Analytics workspace - this is where you can retain a lot of your logs and run log queries and alerts based on some conditions. Although the alerts may not be as useful as Azure Security Center that can provide some better security related alerting, you can still technically do all relevant stuff from here. In regard to log queries, Log Analytics workspaces are used by Azure Sentinel as a backbone for the request processing bit.
* Event hub - Send platform log data outside of Azure, for e.g. to a third-party SIEM or custom telemetry platform.
* Azure Storage - archive your logs for auditing or backup.

### Azure Sentinel vs Azure Log Analytics

Now you might be wondering what the difference is between the two since Log Analytics can have alerts setup and you can query all sorts of data from various sources and use it as a SIEM. Well technically as far as I can gather, I am assuming Sentinel was built on top of Log Analytics at its core with a specific focus on ingesting and doing analysis of security threats and incidents. So even if in theory you might be able to get a lot of mileage from Log Analytics it is not geared up out of the box like Azure Sentinel is to work as a SIEM.

Sentinel has the following general features that Log Analytics does not really have:

* Wide scale data collection - has connectors for literally so many tools, SaaS products, Azure services,etc. More or less click a button and it will create a service principal and start gathering data.
* Detect previously undetected threats - minimising false positives using some MS's threat intelligence and probably some analytics.
* Investigate threats with AI - hunt for suspicious activities at scale, most likely utilising some machine learning and MS's datasets on intrusions.
* Respond to incidents rapidly - automation of common tasks, built-in orchestration.

## Assessment Guide

The CIS benchmark talks a lot about log profiles being configured in order to have log retention for longer than 91 days. However, log profiles are considered now a legacy collection method by Microsoft, as such their use isn't really being advocated. Instead the focus is on using diagnostic settings to configure log transport to wherever you want. Retention period for data sent to a storage account from a given service is configured within the diagnostic setting itself. You can find the diagnostic setting by going to:

```bash
az monitor diagnostic-settings subscription list --subscription
```

When sending data to a log analytics workspace, you can set a data retention setting between 30-730 days. So, check that the retention rate is sufficiently high for logs so at least about a year. This is done by going to a resource and checking its diagnostic settings in the portal or by running:

```bash
az monitor log-analytics workspace list --subscription <subscription_name> --query "[].[name,retentionInDays]"
```

Overall, as with other bits, being sensible is the key bit especially with log consumption. Ideally everyone using the cloud would ingest and process all logs, but that is unrealistic. General recommendations are process management plane logs at minimum and store them in a storage container as a backup for forensic analysis in the future. Check that the storage container used for that is private and that ideally it is configured to use storage service encryption using the client's own key.

Azure Key Vaults are important elements to be checked that are being logged as using those logs you can figure out who is getting access to the stored secrets. This is checked across multiple subscriptions by running the following:

```Powershell
$keyvaults = foreach ($sub in $subscriptions) {az keyvault list --subscription $sub --query [].id -o tsv}
foreach($kv in $keyvaults){az monitor diagnostic-settings list --resource $kv}
```

Check that the output above contains a diagnostic setting and that it is not just an empty list.

As mentioned slightly earlier, Azure Security Center does provide a lot more detailed security alerting across your subscription by default but if you want to configure custom alerts for various actions you do so by going to "Monitor" -> "Alerts" and then "Manage alert rules". In here you can establish whether any custom alerting rules have been configured. Some recommendations for custom alerts would be the following type of operations:

* microsoft.authorization/policyassignments/write
* microsoft.network/networksecuritygroups/write or microsoft.network/networksecuritygroups/delete
* microsoft.network/networksecuritygroups/securityrules/write
* microsoft.security/policies/write
* microsoft.sql/servers/firewallrules/

If you are doing a review of Azure Sentinel, make sure that the client has enabled connectors for all the services they want to ingest logs from. In addition, the other key bit about Sentinel would be verifying what custom analytics rules they have configured within the service. One thing to keep in mind about Azure Sentinel is the following difference in entities that you would process:

* Events - description of a single occurrence that is significant from a security perspective. E.g. a single entry in a log file could count as an event.
* Alert - collection of events that, when taken together, are significant from a security perspective. An alert could contain a single event or multiple ones.
* Incidents - Sentinel creates incidents from alerts or groups of alerts based on internal logic. Incidents queue is where you find all the analytics done by Sentinel.

When looking at configured alerts, take note of "Query scheduling" times and "Alert threshold". If you believe that a given rule is likely being misreported or is allowing too big of a window of allowed actions before raising a security alert, then discuss with the client about that.

## External Links
