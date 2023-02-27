# Lighthouse

## Overview

Azure Lighthouse is a solution to a requirement to manage multiple Azure resources across multiple separate tenants. Usually this is used by service providers to (as you might suspect) provide their customers with their services within their own tenants. However, this can also be used by enterprises to centrally manage relevant components across their own tenants.

Azure Lighthouse provides several ways to streamline management operations:

* Azure delegated resource management: Core bit that Azure Lighthouse is used for. Allows you to manage someone else's Azure resources from within your own tenant, without needing to switch context or control planes.
  * Can delegate control both at a resource group or even at a subscription level.
* Azure Resource Manager Templates - used to onboard delegated customer resources or provide cross-tenant management tasks. Samples are found in Microsoft's repo here: [https://github.com/Azure/Azure-Lighthouse-samples/tree/master/templates]

## Azure delegated resource management

Delegated resource management as you can suspect is just a logical projection and access to resources from one tenant to another one. This would allow the people or groups authorized in the management tenant to perform necessary operations on the other tenants.

One situation where this might be incredibly useful (apart from if you are a service provider) is that you can centralise Azure Policies and Azure Security Center reporting between multiple tenants that you control. One caveat is that you cannot delegate access across a national cloud and the Azure public cloud or across two separate national clouds.

* If you are wondering what the national clouds are, they are the following physically separated instances of Azure:
  * Global Azure Cloud (portal.azure.com)
  * Azure Government (portal.azure.us)
  * Azure Germany (portal.microsoftazure.de)
  * Azure China 21Vianet (portal.azure.cn)

## Tenants and delegation

As you have likely gotten up until this point, an Azure AD tenant is the representation of a certain organization, which is unique, separate and is used to manage user and app identities. Azure Lighthouse connects access across Azure tenants so that users in the management tenant can perform operations on other tenants through the "My customers" page. Some useful scenarios where managing resources across tenants might be useful would be the following:

* AKS
  * Manage hosted Kubernetes environments and manage containers within a customer's tenant.
* Azure Monitor:[https://docs.microsoft.com/en-us/azure/lighthouse/how-to/monitor-at-scale]
  * View alerts for delegated subscriptions, with the ability to view alerts across all subs.
  * Log Analytics: Query data across remote workspaces in multiple tenants.
* Azure Policy: [https://docs.microsoft.com/en-us/azure/lighthouse/how-to/policy-at-scale]
  * Create and manage policy definitions within delegated subscriptions
* Azure Security Center:
  * Cross-tenant visibility! (pretty useful when you are a large organization)
  * Cross-tenant security posture management. Manage policies and take compliance actions
  * Cross-tenant threat detection and protection. Detect threats across all delegated subscriptions.
* Azure Sentinel [https://docs.microsoft.com/en-us/azure/lighthouse/how-to/manage-sentinel-workspaces]
  * Manage Azure Sentinel resources in customer tenants.
  * Track attacks and alerts across all tenants
  * View incidents across all tenants.

## Onboarding roles

When onboarding a subscription or resource group to delegate access, the managing tenants would need to define authorizations in the template used to delegate access. An authorization specifies a user account or group that would have access to the delegated resources, and a built-in role that sets the permissions that each user will have for the resource.

There are some limits to Azure Lighthouse in terms of access roles that can be assigned. To a considerable extent almost all built-in roles are supported barring the following:

* Owner roles
* Any role with DataAction permission [https://docs.microsoft.com/en-us/azure/role-based-access-control/role-definitions#dataactions]
* User Access Administrator - supported but only for the purpose of assigning roles to a managed identity in the customer tenant.

Access should almost always be associated to service principals or Azure AD user groups rather than single accounts, due to the overhead of managing all sorts of single account access and the fact that you would need to republish an updated plan to remove access in the customer tenants.

## Enterprise scenario

Although a lot of the assumptions behind the usage of Azure Lighthouse is that only service providers would use it, it can also be incredibly useful for enterprise organizations as well. Let us assume you have a big enough organization across various countries, you might have multiple separate tenants. Although preferably having a single tenant is usually easier, it is not always the case. Whether it is because of compliance reasons or in the event of an acquisition, a given organization might have two tenants that they would need to manage at one time.

At the same time, you would like to centrally manage security operations or create a Security Operations Center in your primary tenant that is able to gain visibility of activities across all tenants. As such, it would either require tools like Azure Sentinel to be setup in all tenants or instead have one single Azure Sentinel deployment and using Azure Lighthouse provide the central tenant access to resource groups housing Azure Log Analytics workspaces where all logs are collected. Thus, eventually feeding every piece of data to the central tenant.

Although this does solve one issue for central management, it creates a separate issue where if access to the central management tenants is gained, then potentially the other normally separated tenants might be compromised by proxy.

## Assessment tips

There is not much to particularly be misconfigured in Azure Lighthouse apart from access permissions to the customer tenants.

As such, any review of Azure Lighthouse would be better performed against the deployment Azure Resource Manager templates that were used to delegate access to the customer tenants' resources. That would provide the best overview of what level of access was assigned.

In combination with the client's business requirements, this should be a straightforward process to understand if certain users or groups are given more access then needed. Some general best practice suggestions from Microsoft's documentation is the following:

* MFA
  * Unsurprisingly if you have access to sensitive resources across multiple tenants, it is best to minimise the chance of your account getting compromised. Strong password requirements, mandatory MFA and Conditional access polices would be the best thing to do here.
* Principle of least privilege
  * minimise required permissions as much as possible.
* Alerts and Monitoring
  * assuming eventual breach, setting up proper monitoring to keep track of dodgy behaviour would be the best to minimise the outcome of a potential security incident.
