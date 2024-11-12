# Azure Functions
## Overview
Azure Functions is Microsoft’s cloud on-demand, serverless computing offering used for completing complex tasks via a collection of code written in a variety of programming or scripting languages. Azure Functions run code (also known as “functions”) that has been provided by the users, whilst Azure deploys and maintains the infrastructure to perform the tasks provided by the code. Every function has a trigger which can be time-based or manually run from an API call. Once triggered Azure will execute the code provided within the function.

Microsoft are responsible for provisioning and maintaining the underlying infrastructure that Azure Functions utilises. This includes practices such as separating resources from other customers, ensuring regular updates of common software and runtimes that deployed functions run on and handling communication with other Azure services such as Azure Storage or Azure SQL that are done over Azure’s network. 

However, the code supplied by users of the service could still contain vulnerabilities that would make the function vulnerable to application-level attacks. Such vulnerabilities could allow an attacker to exfiltrate sensitive data, find out further information about the running stack and gain foothold to interact with further cloud services. The risk associated with the service could be further compounded by the usage of functions as an integration point between different services. Thus, being a useful tool to allow malicious users to communicate with a variety of resources within an estate.

The advice below does not consider any vulnerabilities that have been introduced into Azure Functions by user supplied code. Instead, it will focus on secure configuration practices when deploying Azure Functions. Any code provided to a function should be assessed before deployment.

There are three Azure Function hosting plans, depending on which different security features are available:
- Consumption Plan 
- Premium Plan
- Dedicated Plan
- App Service Environment (ASE)
- Kubernetes (Direct or Azure Arc)
ASE, Kubernetes, and certain Dedicated Plan options allow further security controls to enforce isolation in the context of compute or networking configuration. This means that users will be able to run function apps in isolated, dedicated, and secure environments.

## Assessment Notes
### Networking Options
The available network isolation options will depend on which of the three hosting options offered was used when creating a function. For example the Consumption, Premium and App Service plans run on a multi-tenant infrastructure. Consumption plan has the least number of options for network isolation, whilst App Service and Premium provide more robust controls to restrict network access. 

Hosting a function in an ASE, deploys the function on a single-tenant infrastructure and offers full network isolation such as deploying it in a personal VNet. The network isolation options available for the above mentioned plans are summarised in a table [here] (https://learn.microsoft.com/en-gb/azure/azure-functions/functions-networking-options?tabs=azure-cli).

#### Inbound Access Restrictions
This option, which is available for all hosting plans, allows users to define a list of IP addresses which are allowed or denied access to a function. When no entries have been defined, an implicit “deny all” is applied.

The following command will output a Function’s inbound access restrictions:
```CLI
az functionapp config access-restriction show -g ResourceGroup -n AppName
```
#### Outbound Traffic
##### VNet Integration
One of the ways to control outbound network access on a function is to set up a Virtual Network integration. This provides a function with the ability to communicate to resources within a dedicated VNet’s subnet. 

This configuration can be found under the `Networking` blade or by running the following command:
```CLI
az functionapp vnet-integration list --name --resource-group
```

Once the VNet integration has been configured, the function will not by default have access to Azure resources. This would require a specific configuration following the change to ensure communication is possible with other internal resources.

There are two VNet integration options available:
- Regional VNet integration - when the function is connecting to resources in the same region.
- Gateway-required VNet integration – when the function is connecting to VNets in different regions.

When reviewing Gateway-required VNet integrations, the following security features are important to keep in mind:
- If a VNet has got peering connections set up with other VNets or VPNs, the connection from the function App will be transitive, causing resources in additional networks to be reachable.
- Access to resources across Azure ExpressRoute or service endpoints is not enabled.

When reviewing a regional VNet integration, the Function App will be able to access:
- Resources within the same VNet
- Resources in VNets peered to the VNet the app is integrated with
- Service endpoint secured services
- Resources across Azure ExpressRoute connections
- Resources across peered connections which include ExpressRoute connections
- Private endpoints

Network Security Groups (NSGs) and Route Tables (UDRs) can be applied against dedicated subnets of integrated VNets. Standard security practices following the principle of least privilege should be followed in that situation. 

The assessment notes on best security practices for NSGs can be found [here](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview) and for UDRs [here]( https://learn.microsoft.com/en-us/azure/virtual-network/vnet-integration-for-azure-services). However, it is worth noting that inbound rules will not affect the inbound access to the function, which is controlled by the access restrictions at the service-level configuration that were previous described.

Finally, when VNet integration is set up, no outbound restrictions are set by default. This means that that the function can communicate to the internet. To limit this, a “Route All” feature can be enabled, forcing a traffic originating from the function to comply with the UDRs and then specified NSGs which should block all unnecessary internet access.

### Encryption in Transit
Azure Functions encrypts all the incoming data using TLS 1.2 by default. However, the service does allow for manual downgrading. When reviewing the configuration, users must be ensure that TLS 1.2 is enforced for all communication to the deployed function.

Furthermore, clients connecting to the function can opt to use either HTTP or HTTPS. Where possible, any HTTP traffic should be redirected to HTTPS. Reviewing whether the latest version of TLS and HTTPS only traffic has been enforced, can be done either in the `TLS/SSL` settings blade or via the following CLI command:
```CLI
az functionapp show --name MyFunctionApp --resource-group MyResourceGroup --query “httpsOnly”
az functionapp show --name MyFunctionApp --resource-group MyResourceGroup --query "minTlsVersion"
```
Azure Functions have an FTP endpoint that is enabled by default. If not used, this endpoint should be disabled to restrict the possible ways the function app can be interacted with. If required as part of business operation, deployments should be forced to use FTPS. To check the FTP configuration, the following command could be run:
```CLI
az functionapp show --name AzFunTestBl --resource-group AzFun --query siteConfig."ftpsState"
```

### Function Access Keys
Unless a HTTP-triggered function is set to “anonymous”, two authorisation levels configured on creation determine whether the function app is using a “function-level” or “admin-level” access key. 

Function-level access key can authorise against a specific function, whilst admin-level uses a “master-key” for authentication against all functions in the Function App. Each Function App has a master-key on creation which can’t be removed. Additionally, it also provides administrative access to the runtime’s APIs. Because of the authorisation scope that the master key provides, users should be careful with how it is handled and distributed as part of their secrets management process.

Additionally, a “system-key” is used for webhook authentication required by different extensions used within a Function App. This system-key will be created by extension which will also determine whether it’s a host-level or function-level key.

As with other resources, relying on shared keys to access a resource is not an ideal scenario in terms of secrets management across an estate. Under the Authentication blade, it is possible to set up an authentication provider such as Azure AD which makes use of the tenant's authentication capabilities to restrict access to function endpoints. Further information can be found [here](https://learn.microsoft.com/en-us/azure/app-service/overview-authentication-authorization).

### IAM
To manage Azure Functions either through portal or programmatically, a user must be assigned the relevant Azure role. Standard practices based on the zero trust model found [here](https://learn.microsoft.com/en-us/azure/active-directory/roles/best-practices) should be followed. To view which role assignments assigned to users that can interact with Azure Functions, the following command can be run:
```CLI
az role assignment list –scope /subscriptions/SUBSCRIPTION-ID/resourceGroups/myGroup/providers/ Microsoft.Web/sites /myFunction
```

### CORS Configuration
CORS Access determines which web applications running in another domain can make requests to a Function’s trigger endpoint. Allowed Origins should be limited to a strict set of domains which should be able to make cross-origin requests. Allow-all (“*”) statements should be avoided.

The following command can be run to show any allowed origins:
```CLI
az functionapp cors show --name MyFunctionApp --resource-group MyResourceGroup
```
### Logging and Monitoring
In the Overview blade, the Microsoft Defender for Cloud service will provide recommendations and security alerts in relation to a function that has been evaluated. This can be a quick source of common misconfigurations and provides alerts for certain possibly malicious activities that had occurred. However, a more in-depth approach to reviewing the security configuration should be taken especially when considering networking restrictions which often depend on the context of the broader platform which would require manual review.

Activity logs are a different source of telemetry for the resources that are enabled by default. All "/write" operations to Azure Functions resources will be logged, however this does not include "/read" operations.

The Azure Application Insights service can be integrated with Azure Functions. Insights can provide more useful information on application logs, performance, and error data which can be used to detect performance anomalies. Application Insights are enabled by default but can be disabled.

Finally, it is worth reviewing whether the following logging and monitoring practices are followed in the wider Azure environment:
- Centralised log management that forwards logs from critical resources into a SIEM
- Related Azure services such as NSGs, IAM, etc should have logging and threat detection enabled, logs stored and analysed securely with the right retention periods (This will depend on organisational compliance needs).