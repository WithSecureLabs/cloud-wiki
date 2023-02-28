# Virtual Machines

## Overview

Azure Virtual Machines (VMs) are Microsoft Azure’s Infrastructure-as-a-Service (IaaS) computing resource offerings built on Azure Hypervisor, which is a customised version of Microsoft Hyper-V. VMs are often a central and indispensable resource, used for hosting and deploying business critical resources both for external and internal use. It is important to configure them in a secure way to prevent unauthorised access movement and downtime across the cloud estate.

To conduct a successful security assessment, it is important to understand the scope of responsibility different parties have. As previously stated, VMs are IaaS and as such come with more responsibilities for the users when it comes to securing them. The users are responsible for managing the applications, runtime, OS, middleware, and data.

To properly assess the security posture of a standalone VM, the following controls should be reviewed:

- Access Controls
- Network Access Controls
- Disk Encryption
- Backup Policies
- Audit Logging

## Assessment Notes

### Getting started

Apart from the web console, there are couple of other ways of interacting with Azure environment such as: Azure CLI, PowerShell, REST API, etc.

If opting for Azure CLI or PowerShell, it’s good to keep in mind that the commands will be run against a default subscription. The following commands can be used to show the currently set subscription:

```CLI
az account show
```

```PowerShell
Get-AzContext
```

The following commands set the default subscription:

```CLI
az account set --subscription XXX
```

```PowerShell
Set-AzContext -Subscription "xxxx-xxxx-xxxx-xxxx" -Tenant "xxxx-xxxx-xxxx-xxxx"
```

More detailed explanation on subscription management can be found on following URIs:

- [Manage Azure Subscriptions CLI](https://docs.microsoft.com/en-us/cli/azure/manage-azure-subscriptions-azure-cli)
- [Manage Azure Subscriptions PowerShell](https://docs.microsoft.com/en-us/powershell/module/az.accounts/set-azcontext?view=azps-8.0.0)

### Reconnaissance

The most basic enumeration, which can provide some useful configuration information, can be done via running the following command:

```CLI
az vm show –-resource-group <resource group name> –-name <VM name>
```

The results provide the basic information on disk encryption, authentication methods, region, networking and other cloud configuration controls.

When having access to the VM itself, it is possible to access and query the Azure Instance Metadata Service (IMDS), which provides information about the VM that is running. Alongside some other information on subscriptions, guest OS admin profile settings, admin account name, network controls such as IP addresses and other bits. The command below represents an API call to access the metadata instance information.

For Windows VMs:

```PowerShell
Invoke-RestMethod -Headers @{"Metadata"="true"} -Method GET -NoProxy -Uri "http://169.254.169.254/metadata/instance?api-version=2021-02-01" | ConvertTo-Json -Depth 64
```

For Linux VMs:

```Bash
curl -s -H Metadata:true --noproxy "*" "http://169.254.169.254/metadata/instance?api-version=2021-02-01" | jq
```

In addition to querying a "/metadata/instance" endpoint, it's also possible to query different endpoints such as "metadata/identity". In the case that a managed identity is assigned against a VM, it would be possible to retrieve a managed identity token which is used for authenticating to other services. The following commands retrieve the token assigned to managed identity:

For Windows VMs:

```PowerShell
Invoke-RestMethod -Headers @{"Metadata"="true"} -Method GET -NoProxy -Uri "http://169.254.169.254/metadata/instance?api-version=2021-02-01" | ConvertTo-Json -Depth 64
```

For Linux VMs:

```Bash
curl -H Metadata:true --noproxy "*" "http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://vault.azure.net"
```

To see how this token can be used to retrieve secrets from Azure Key Vault, navigate to [here](https://medium.com/marcus-tee-anytime/steal-secrets-with-azure-instance-metadata-service-dont-oversight-role-based-access-control-a1dfc47cffac).

IMDS can't be disabled by default. Because of this, it could be used as a way to gain an initial foothold into an Azure environment and try to move across the cloud estate. It is therefore important to check the permission levels of managed identities assigned to the VM as well as general security configuration accessed from instance metadata endpoint. Additionally, host-based firewall can be configured to limit the access to IMDS to only certain process.

To find out more about Azure IMDS, check out the following links:

- [Azure IMDS](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/instance-metadata-service?tabs=linux)
- [Azure IMDS - John Savill](https://www.youtube.com/watch?v=M5BO91VOfXo)

### Access Controls

Managing the VM access can be done by using Azure Role Based Access Control (RBAC).
RBAC uses roles with predefined scope and permissions to limit the access to Azure resources.

Roles can be built-in or custom. Ideally, for any role which reaches the scope of the assessed VM, a role definition should be reviewed. A guide on role definitions can be found [here](https://docs.microsoft.com/en-us/azure/role-based-access-control/role-definitions).

The following commands can be used to list a role assignment:

```CLI
az role assignment list
```

```PowerShell
Get-AzRoleAssignment
```

Built-in roles to look out for are:

- Owner
- Contributor
- Reader
- User Access Administrator
- Classic Virtual Machine Contributor
- Disk Backup Reader
- Disk Pool Operator
- Disk Restore Operator
- Disk Snapshot Contributor
- Virtual Machine Administrator Login
- Virtual Machine User Login
- Virtual Machine Contributor.

More information about Azure roles and listing role definitions can be found on the following links:

[Azure built-in roles](https://docs.microsoft.com/en-us/azure/role-based-access-control/built-in-roles)
[List Azure Role definitions](https://docs.microsoft.com/en-us/azure/role-based-access-control/role-definitions-list)

The "Virtual Machine Administrator Login" role grants access to view the virtual machines in the portal and login as an Administrator. Roles relating to Disk and Backup management can represent a threat in the case of ransomware or data exfiltration attacks. Other roles containing "Owner" or "Contributor" attributes allow for full management of the VMs, including installation of software, VM extensions, password resets and disk management. In addition to this, Owner has the permission to assign roles in Azure RBAC.

A good way to check all the assigned roles to the assessed VM or any other resource is to use the “-scope” flag:

```CLI
az role assignment list -scope <scope>
```

```PowerShell
Get-AzRoleAssignment -scope <scope>
```

The easiest way to determine the scope is to run the role assignment command first and find the relevant scope. Otherwise, the scopes of a certain resource can be determined in the portal. A detailed guide on how to construct one and where to find the scopes can be found [here](https://docs.microsoft.com/en-us/azure/role-based-access-control/scope-overview).

Every role has a definition - typically a JSON formatted set of permitted/denied actions within a specified scope. A special attention should be paid to “actions” and “dataActions” permissions, especially if they appear to be over permissive with an open permissions match (\*). This is especially the case with custom roles. To retrieve role definitions for a specific scope, we can use the following commands:

```CLI
az role definition list -scope <scope> --custom-role-only true
```

```PowerShell
Get-AzRoleDefinition -scope <scope> IsCustom=True
```

Azure RBAC roles are often inherited from the resource groups or subscriptions and as such cannot be removed from the scope. A good thing to watch out is if overall access control is over permissive. If "Virtual Machine Administrator" role is assigned against the subscription and is over permissive, then resource groups and resources within these will inherit this role.

### Network Access Controls

When assessing the network access controls, it’s good to keep in mind two situations:

- If an attacker is trying to gain access.
- If an attacker already has access to a cloud estate.

The couple of things to look out for in both cases are: are improperly configured Network Security Groups (NSGs), absence of services such as Just-in-Time Access/Bastion and internal routing.

#### Network Security Groups

Network Security Groups (NSGs) are Azure resources containing rules on traffic towards/from a subnet or a VM. More on NSGs and their functionalities can be found [here](https://www.youtube.com/watch?v=K8ePZdLfU7M). Network Security Groups and rules attached to them can be accessed from the "Networking" tab under a selected VM or programmatically. The following commands can also be used to query the NSGs:

```CLI
az network nsg list --resource-group <resource group name>
```

```PowerShell
Get-AzNetworkSecurityGroup -ResourceGroupName <resource group name>
```

The following commands can be used to list and show the NSG rules:

```CLI
az network nsg rule show --resource-group <resource group name> --nsg-name <nsg name> --name <rule name>
```

```PowerShell
Get-AzNetworkSecurityGroup -Name nsg1 -ResourceGroupName <resource group name> | Get-AzNetworkSecurityRuleConfig -Name <nsg name> -DefaultRules
```

```CLI
az network nsg rule show --resource-group <resource group name> --nsg-name <nsg name> --name <rule name>
```

NSGs filter the traffic based on the following fields:

- Priority – lower priority numbers take precedence
- Source/Destination IP, service tag or application security group
- Protocol TCP, UDP, ICMP, ESP, AH or Any
- Direction Inbound/Outbound
- Port Range
- Action – Allow/Deny

It is common for an attacker to exploit an overly permissive NSGs. Things to look out for are:

- Should the VM have a public access?
- If so, is there any limitation to this access?
- Are only relevant ports opened?
- Are only relevant protocols used?
- Are source and destination filters using wide IP ranges?
- Are there any filters with “allow all” (\*) rules set?
- Are default rules overridden?
- Is the policy following a “deny all” approach, with relevant “allow” rules set for a more fine-grained access?
- Are management ports (RDP and SSH) opened?
- Is NSG applied to one VM/Subnet only or is it being reused?
- Check if there is an NSG applied to a subnet and how it affects the inbound/outbound traffic flow from the VM.

RDP and SSH ports ideally should not be opened. Instead, a service called Just-In-Time (JIT) Access should be enabled. JIT helps prevent brute force attacks against management ports, as it provides controlled public access to VM by creating the network security group rules. JIT can be set up from the portal, via PowerShell, Defender for Cloud, from VMs themselves or REST API. The command below lists JIT network access policies:

```PowerShell
Get-AzJitNetworkAccessPolicy
```

How JIT works can be found [here](https://docs.microsoft.com/en-us/azure/defender-for-cloud/just-in-time-access-overview?tabs=defender-for-container-arch-aks) and [here](https://docs.microsoft.com/en-us/azure/defender-for-cloud/just-in-time-access-usage?tabs=jit-config-api%2Cjit-request-asc).

An additional solution which could be used to protect the exposure of the management ports is Azure Bastion. Bastion creates a private connection over TLS to the specified VM. It is deployed on a VNet level, therefore all the VMs inside a VNet will be able to benefit from it. When it comes to configuration of Bastion, there are certain controls that can/can’t be enabled depending on a Bastion SKU selected. For example, users opting for Standard SKU can disable copy/paste and file upload/download options. Documentation of Bastion can be found [here](https://docs.microsoft.com/en-us/azure/bastion/).

#### Routing

It's important to check the routing configuration for the subnet VM lives in as it can provide an unnecessary route for incoming or outgoing traffic from/to the VM.

Azure by default creates the system routes which define the routing between the subnets inside a VNet. These can’t be removed or created; however, they can be overridden by creating the custom routes. Each subnet is assigned with default system routes which can be found [here](https://docs.microsoft.com/en-us/azure/virtual-network/virtual-networks-udr-overview).

The following routes are additional optional system default routes which can be enabled:

- Peering connections - Important to check "Peering" tab under VM configuration.
- Virtual Network Gateways - Important to check as it can provide an extension to/from on-premise infrastructure.
- VirtualNetworkServiceEndpoints

System defined routes can be overridden by associating one or more route tables with the relevant subnet. To list the routes inside a route table, the following command could be used:

```CLI
az network route-table route list --resource-group <resource group name> --route-table-name <route table name>
```

```PowerShell
Get-AzRouteConfig -RouteTable <PSRouteTable>
```

Additional commands can be found on the following links:

[az network route-table route](https://docs.microsoft.com/en-us/cli/azure/network/route-table/route?view=azure-cli-latest%23az-network-route-table-route-list)
[Get-AzRouteConfig](https://docs.microsoft.com/en-us/powershell/module/az.network/get-azrouteconfig?view=azps-8.0.0)

With the custom defined routes, it’s important to look out for any Network Virtual Appliances (NVAs) such as Firewalls. Their use is recommended to filter both private and public traffic and as such must be locked down strictly. Additionally, it’s good to check for any external and internal load balancers and what their end destination is.

Network Security Groups and Routing could be good measures applied at the network and transport layers of the OSI model. To secure a protection at higher levels, a deployment of Virtual Network Appliances (NVAs) is recommended. These can include but not limited to: Firewalls, IDS/IPS, Web filtering, Antivirus, etc. Therefore, it’s always good to check if these have been deployed.

### Disks

Virtual Machines can have three disk types attached:

- OS disk
- Data disk
- Temporary disk

It's important to assess the following:

- Disk Encryption
- Disk Backup

#### Disk Encryption

Data in Azure managed disks is encrypted using 256-bit AES encryption. There are three options to encrypt the VM’s disks in Azure:

- Server-Side Encryption (SSE) – encrypts data at rest when persisting on Storage Clusters
- Azure Disk Encryption (ADE) – encrypts the data on a VM level
- Encryption at host – ensures that the data stored on the server hosting the VM is encrypted both at rest and in transit to the storage clusters

Server-Side Encryption (SSE):
Managed disks, snapshots and images are encrypted by default using Storage Service Encryption (SSE), with the option to use a platform or customer managed keys. Which one to use, will depend on organisation’s policies.

Upon VM creation, all the disks are by default encrypted. This means that the data at rest is persistent on Storage Clusters. These disks are encrypted using platform-managed keys, however if the organisation’s policy requires for customer-managed keys, this can also be done. Customers can import their RSA keys to their key vault or generate the new ones using Azure Key Vault. The data is first encrypted with the Data Encryption Key (DEK), in turn these keys are then encrypted using either customer-managed keys or platform-managed ones. These keys are also known as Key Encryption Keys (KEK). To find out more about the encryption process, you can navigate to the following [link](https://docs.microsoft.com/en-us/azure/virtual-machines/disk-encryption).

If the customer opts in for customer-managed key option, it’s important to review the policies against the rotation and disabling the keys.

Azure Disk Encryption (ADE):
To encrypt the data on a VM level, additional Azure Disk Encryption (ADE) can be enabled. To enable this, navigate to the VM, then under Disks there should be an option to show “More Settings”. To check whether ADE has been enabled, the following command can be run:

```CLI
az vm encryption show --resource-group <resource group name> --name <vm name>
```

```PowerShell
Get-AzVmDiskEncryptionStatus --resource-group <resource group name> --name <vm name>
```

Additionally, these commands show the encryption secret URL, Key Encryption Key URL, resource IDs of the Key Vaults where the encryption key and key encryption key are present. When reviewing the disk configuration, it’s important to pay attention to the roles assigned in relation to disk management as explained in the Access Controls section above.

### Backup

Virtual machines and their workloads can backed up by using the backup extension. The backups are stored inside a recovery services vault. Configuring the backup and recovery services is of crucial importance in safeguarding the data.

To check whether Backup Service is active for the relevant VM, we can navigate to the Backup tab of the selected VM. Additionally, backup policies can be reviewed by navigating to the Recovery Services Vault. Data stored in recovery services vault is encrypted using 256-bit AES encryption using platform managed keys by default. However, an option to use customer managed keys is also available. More information can be found [here](https://docs.microsoft.com/en-us/azure/backup/backup-encryption).

All data travelling to recovery services vault is going through Microsoft Backbone networking using HTTPS. More about the encryption of backup using customer managed keys can be found [here](https://docs.microsoft.com/en-us/azure/backup/encryption-at-rest-with-cmk?tabs=portal).

### Audit

Recommended use of Microsoft Defender for Cloud for insights on security monitoring and policy management as well as security recommendations on updates, NSGs, disk encryption etc. It can provide a really good set of native detection logic for suspicious activity at the VM level.

Reviewing security recommendations could provide information on overall security posture of the VM. They can also be a helpful guide for an assessor on picking out misconfigurations.

Additionally, Azure offers a range of products for malware detection and handling. An example of it is Microsoft Antimalware extension which can be enabled via Azure Portal once the VM has been created. To check if it has been enabled, you can navigate to the Extensions tab of the assessed VM.

Use some set of antimalware/EDR products can greatly complement existing security posture management, and as such if used by the organisation it should be configured to run on critical infrastructure running on VMs.
