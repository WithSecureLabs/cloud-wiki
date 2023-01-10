# Azure Functions
## Overview
Azure Functions is Microsoft’s cloud on-demand, serverless computing offering used for completing logic tasks on-demand. Azure Functions run code (also known as “functions”) that has been provided by the users, whilst Azure deploys and maintains the infrastructure to finish the tasks provided by the code Every Function has a trigger which can be time based or manually run from an API call. Once triggered Azure will execute the code provided within the function.
Microsoft are responsible for provisioning and maintaining the underlying infostructure that Azure Functions utilise. This includes practices such as separating resources from other customers, regular updates of software and runtimes Functions run on, communication between Functions and other Azure services such as Storage or Databases are done over Azure’s network, connections with remote management tools are encrypted, etc. However, the code blocks supplied by the users could still contain insecure code prone to application attacks. Such vulnerabilities could allow an attacker to exfiltrate the data, find out further information about the running stack and gain foothold to interact with further cloud services. Afterall, Functions are often used as an integration point between different services and need to be able to communicate to them. 
The advice below does not consider any vulnerabilities that have been introduced into Azure Functions by user supplied code. Instead, it will focus on secure configuration practices when deploying Azure Functions. Any code provided to a function should be assessed before deployment.
There are three Azure Function hosting plans, depending on which different security features are available:
* Consumption Plan 
* Premium Plan
* Dedicated Plan
* App Service Environment (ASE)
* Kubernetes (Direct or Azure Arc)
ASE, Kubernetes, and certain Dedicated Plan options allow for more isolation in terms of compute or network configuration. This means that Azure customers will be able to run function apps in isolated, dedicated, and secure environments.

## Assessment Notes
### Networking Options
The network isolation options available will depend on one of the three hosting options offered when creating a Function. For example, consumption, premium and App Service plans run on a multitenant infrastructure. Consumption plan has the minimum options of network isolation, whilst App Service and premium options have better network isolation options. Hosting a Function in an App Service Environment, deploys the Function on a single-tenant infrastructure and offers full network isolation such as deploying it in a personal VNet. The network isolation options available for the above mentioned plans are summarised in a table [here] (https://learn.microsoft.com/en-gb/azure/azure-functions/functions-networking-options?tabs=azure-cli).
#### Inbound Access Restrictions
This option, available for all hosting plans, allows users define a list of IP addresses which are allowed or denied access to the Function. When no entries have been defined an implicit “deny all” is applied.
The following command will output a Function’s inbound access restrictions:
```CLI
az functionapp config access-restriction show -g ResourceGroup -n AppName
```
#### Outbound Traffic
VNet Integration:
One of the ways to control outbound function app access is to set up a virtual network integration. This provides a Function with the ability to communicate to resources within a dedicated VNet’s subnet. This configuration can be found under the Networking blade or by running the following command:
```CLI
az functionapp vnet-integration list --name --resource-group
```
Azure resources reachable by the Function following the VNet integration set up, won’t have inbound access to the Function by default. 
There are two VNet integration options available:
* Regional VNet integration - when the Function is connecting to resources in the same region.
* Gateway-required VNet integration – when the Function is connecting to VNets in different regions.
When reviewing Gateway-required VNet integrations, the following security features are important to keep in mind:
* If a VNet has got peering connections set up with other Vnets or VPNs, the connection from the Function App will be transitive, causing resources in additional networks to be reachable.

* Access to resources across Azure ExpressRoute or service endpoints is not enabled.
When reviewing Regional VNet integration, the Function App will be able to access:
* Resources within the same VNet
* Resources in VNets peered to the VNet the app is integrated with
* Service endpoint secured services
* Resources across Azure ExpressRoute connections
* Resources across peered connections which include ExpressRoute connections
* Private endpoints

Network Security Groups and Route Tables (UDRs) can be applied against dedicated subnets of integrated VNets. Standard security practices following the principle of least privilege should be followed. The assessment notes on best security practices for NSGs can be found [here](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview) and for UDRs [here]( https://learn.microsoft.com/en-us/azure/virtual-network/vnet-integration-for-azure-services). It is worth noting that inbound rules will not affect the inbound access to the function, which is controlled by Access restrictions described above.
Finally, when VNet integration is set up, no outbound restrictions are set by default. This means that that the function can communicate to the internet. To limit this, a “Route All” feature should be enabled, forcing a traffic originating from the Function to comply with the UDRs and then specified NSGs which should block all unnecessary internet access. 
### Encryption in Transit
Azure Functions encrypts all the incoming data using TLS 1.2 by default. However, there is a possibility to downgrade this. When reviewing the config, it must be ensured that TLS 1.2 is enforced for all.
Furthermore, clients connecting to the Function can opt to use either HTTP or HTTPS. Where possible, any HTTP traffic should be redirected to HTTPS. Reviewing whether the latest version of TLS and HTTPS only traffic had been enforced, can be completed in TLS/SSL settings blade. Otherwise, the following command can be run:
```CLI
az functionapp show --name MyFunctionApp --resource-group MyResourceGroup --query “httpsOnly”
```CLI
az functionapp show --name AzFunTestBl --resource-group AzFun --query "minTlsVersion"
```
Azure Functions have an FTP endpoint enabled by default. If not used, this endpoint should be disabled. If used, FTPS should be enforced. 
To check the FTP configuration, the following command could be run:
```CLI
az functionapp show --name AzFunTestBl --resource-group AzFun --query siteConfig."ftpsState"
```
### Function Access Keys
Unless a HTTP triggered function is set to “anonymous”, two authorisation levels configured on creation determine whether the function app is using a “function-level” or “admin-level” access key. Function-level access key can authorise against a specific function, whilst admin-level uses a “master-key” for authentication against all functions in the function app. Each function app has a master-key on creation which can’t be removed. Additionally, it also provides administrative access to the runtime’s APIs. Because of authorisation scope master key has, careful handling and distribution of master key must be used. 
Additionally, a “System-key” is used for webhook authentication required by different extensions used within function app. This system key will be created by extension which will also determine whether it’s a host-level or function-level key.
As with other resources, relying on shared keys to access a resource is not an ideal scenario in terms of security or upkeep. Under the Authentication blade, it is possible to set up an authentication provider such as Azure AD which provides authentication capabilities to the Function endpoints. Further information can be found [here](https://learn.microsoft.com/en-us/azure/app-service/overview-authentication-authorization).

### IAM
To manage Azure Functions either through portal or programmatically, a user must be assigned athe relevant Azure role. Standard practices based on zero trust model found [here](https://learn.microsoft.com/en-us/azure/active-directory/roles/best-practices) should be followed. To view which role assignments are assigned against Azure Functions, the following command can be run: 
```CLI
az role assignment list –scope /subscriptions/SUBSCRIPTION-ID/resourceGroups/myGroup/providers/ Microsoft.Web/sites /myFunction
```
### CORS Configuration
CORS Access determines which web applications running in another domain can make requests to a Function’s trigger endpoint. Allowed Origins should be limited to a strict set of domains which should be able to make cross-origin requests. Allow all “*” statements should be avoided. 
The following command can be run to show allowed origins:
```CLI
az functionapp cors show --name MyFunctionApp --resource-group MyResourceGroup
```
### Logging and Monitoring
In the Overview blade, the Microsoft Defender for Cloud option will provide Recommendations and Security Alerts in relation to the Function in question. This can be a quick source to provide a security baseline for configuration errors and missed alerts. However, a more in-depth approach should be taken especially with networking configuration which often highly depends on the context.
Furthermore, Activity logs are enabled by default. All write operations to Azure Functions resources will be logged. This excludes read operations.
Application Insights are available for integration with Azure Functions. Insights provide information on log, performance, and error data which can be useful when detecting performance anomalies. Application Insights are enabled by default but can be disabled. 
Finally, it is worth finding out whether the following logging and monitoring practices are followed in the wider Azure environment:
* Centralised log management
* Related Azure services such as NSGs, IAM, etc should have logging and threat detection enabled, logs stored and analysed securely with the right retention periods (This will depend on organisational compliance needs). 
