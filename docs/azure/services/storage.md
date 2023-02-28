# Storage

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Overview

When looking at storage of data in Azure, we have 3 main categories:

- Data used directly by VMs such as OS, installed programs, etc. (we would use Azure Disks to store this)
- Data to be stored in databases (SQL, CosmosDB, etc.)
- Literally everything else we might want to store on the cloud - will fall under Azure Storage. This is the category that we'll explore in this article

The first important concept to know is that of a **Storage Account**. Think of them as a way of logically grouping storage-related resources. You can create multiple Storage Accounts, and because each of them is considered a resource in Azure, it needs to be assigned to a resource group at creation time, just like pretty much anything else in Azure.

Regardless of that, Storage Accounts are to storage-related resources kind of like resource groups are to general resources. Once we've created a Storage Account, what kind of data can we store in them? Azure service names are interesting, so let's see what each term refers to.

| Data Service | Description                                                                                                                                                                                                                                                                                                                                                                                                              |
|:------------ |:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Blobs        | This is Azure's *unstructured* file storage option, allowing for up to 8TiB of data for Page blobs (for Azure IaaS disks) and 190TiB for Block blobs (for text/binary data). It is highly-scalable, supports massive simultaneous uploads and file sizes, and allows pretty much any file format. Think of any type of massive/constant upload, be it for backups, streaming, logs storage, big data and analytics, etc. |
| Files        | Fully-managed, hierarchically *structured*, cross-platform file shares in the cloud, that are accessible via Server Message Block (SMB) or Network File System (NFS) protocols. They can be mounted and accessed by both in-cloud as well as on-premise deployments                                                                                                                                                      |
| Tables       | A NoSQL store for schema-less data, very structured and optimized for database searches. Here we can store flexible datasets like user data for web apps, address books, device information, or other types of metadata a service might require                                                                                                                                                                           |
| Queues       | A messaging store for reliable, asynchronous messaging between application components. Queue messages can be up to 64 KB in size, and a queue can contain millions of messages                                                                                                                                                                                                                                           |

Before we move onto securing storage resources, let's clarify a few things around Blob storage as this is somewhere that Microsoft's naming can get quite confusing. Let's take a step back and look at the structure of a mock link to a file in Azure Blob storage, to make sense of things:

`https://contoso.blob.core.windows.net/images/pic1.jpg`

- Looking at this link we have a couple of elements to keep in consideration:
  - We have the Storage Account name - "contoso" in this case
  - The type of storage - indicated by "blob".
  - A Blob <u>Container</u>, i.e. a logical grouping of things (essentially an unorganized directory folder) - "/images/"
  - A "blob" itself, i.e. an actual file you're storing - "pic1.jpg"

Bear in mind, that custom domains can be utilised here, the above URI example has been used to clarify the various components at play when looking at Blob storage.

Essentially one element that can cause confusion when discussing Azure Storage is that Blobs, Blob Containers, and blobs are slightly different. Blobs the name for the main storage service type. In it, you are effectively storing blobs (files) inside Blob Containers (folders), by means of Azure Blobs (the storage service type), abstractly part of an Azure Storage Account. Simple, right?

With the basic concepts learned, let's get back to the Storage Accounts themselves. We said they are to be considered kind of like the "umbrella" under which we might have any number of Blobs, Files, Tables or Queues. Whatever we have under this umbrella, how do we control access to it?

## Assessment Notes

Well, the first thing to consider is - who can perform operations on it? RBAC role assignments allow for granular access control, just like any kind of Azure resource. You still need to explicitly grant someone (including Global Admins) access to a Storage Account in order for them to actually have access to it. By default, no one can perform any operations on a newly created Storage Account because it does not automatically get "assigned" to anyone.

So you'll likely want to review the number of <u>Owners</u> and <u>Contributors</u> on a given Storage Account to ensure that access is being appropriately assigned. Quite often, you might find subscription- or resource group-inherited permissions for pretty much all resources. Do *all* those users and service principals *really* need that access to it? Context is important here, it's necessary to understand the intended usage of security principals and Storage Accounts to be able to determine which assignments are appropriate and which may be excessive.

All of that was around who can make modifications to a Storage Account's settings, such as adding and deleting Blobs or Files storage, etc. - all the management stuff.

Now, moving on to actually accessing the Storage Account, as in connecting to it and working with the resources present in it. We want a defence in depth approach to be applied here, taking into account:

- Network Security – which IPs and networks are allowed to access the account;
- Access controls – authentication of users or applications to the Storage Account, and authorisation defining permitted actions;
- Encryption – both at rest and in transit;
- Monitoring and auditing – maintain records of resource-level changes to configurational permissions, visualise and alert on performance metrics;

### Network Security

By default, Storage Accounts are publicly accessible over the internet. The default URI structure for these resources is:
`<storage account>.<data service>.core.windows.net` e.g. `mystorage.blob.core.windows.net`

Because of this, even the traffic meant for Azure VMs or other internal Azure services, defaults to first go out to the internet, and then back into the Azure network.

We ideally want firewalls and Virtual Network (VNet) protections offered by Azure applied to the Storage Account. Usage of VNets allows us to:

- specify only the VNets we want to allow to connect to the Storage Account, with settings granularly applied at VNet level to control access based on subnets and IPs.
- define allow-lists containing any IP (ranges) for remote access;
- activate the Azure Storage *Service Endpoint* feature present in VNets, so that we can ensure all internal service connections are directly done **only** over Azure backbone, and never over the internet. More information on service endpoints can be found [here](https://docs.microsoft.com/en-us/azure/virtual-network/virtual-network-service-endpoints-overview).

Additionally, usage of Azure Firewalls allows for further network controls to be applied to protect resources, such as threat intelligence powered filtering, or the creation of rules based on application tags. Notably, Azure Firewalls allow all traffic by default and so should certainly not be left unconfigured.

Azure Storage *Private Endpoints* are also available, and are similar to *Service Endpoints* in the fact that they route traffic over the Azure backbone, however, they do apply to a specific instance of a service not all instances. Configuration is also more involved than that of Service Endpoints including DNS configuration requirements. More information on private endpoints can be found [here](https://docs.microsoft.com/en-us/azure/private-link/private-endpoint-overview)

For usage with web apps or similar services, CORS rules can be also defined for all Storage Account data services - this is another area that is often insecurely configured.

As always with cloud security, context is important here. It is necessary to understand the intended usage of these resources to be able to assess whether security controls are appropriately applied. Where does the storage *really* need to be accessed from?

### Access controls

Every request to Azure Storage must be authorised (except in the instance of anonymous access). And there are a number of ways to do that.

| Authorisation type                    | Data Services                            | Description                                                                                                                                                                                                                  |
|:------------------------------------- |:---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Azure AD integration                  | Blobs <br/> Tables <br/> Queues            | Provides Azure role-based access control (Azure RBAC) over a client's access to resources in a Storage Account.                                                                                                              |
| Identity-based authorisation over SMB | Files (SMB only)                         | Azure Files supports identity-based authorisation over Server Message Block (SMB) through Azure AD DS. You can use Azure RBAC for fine-grained control over a client's access to Azure Files resources in a Storage Account. |
| Authorisation with Shared Key         | Blobs <br/> Files <br/> Tables <br/> Queues | A client using a Shared Key passes a header with every request that is signed using the Storage Account access key.                                                                                                          |
| Shared Access Signatures (SAS)        | Blobs <br/> Files <br/> Tables <br/> Queues | Limited delegated access to resources in a Storage Account. Adding constraints on the time interval for which the signature is valid or on permissions it grants provides flexibility in managing access.                    |
| Anonymous access                      | Blobs                                    | Authorisation is not required to access the Blob container or any individual files within.                                                                                                                                   |

Let's delve into the various access control types.

#### Azure AD integration

This is the Microsoft-recommended method for authentication to Azure Blob storage, Tables, Queues. With Azure AD, you can use Azure role-based access control (RBAC) to grant permissions to a <u>security principal</u> (which may be a user, group, or application service principal). It's a two-step process: the security principal is first authenticated by Azure AD to return an OAuth 2.0 token. Then, the token can be used to authorise a request against Blob, Table or Queue storage, based on the permissions set for that content.

Permissions such as `Owner`,  `Contributor` and `Storage Account Contributor` permit a security principal to manage a Storage Account, but do not provide access to the data within that account via Azure AD. Whilst on the topic of role assignment, it's useful to note that if a role includes the `Microsoft.Storage/storageAccounts/listKeys/action` permission, then an assigned principal can access data in the Storage Account via Shared Key authorisation with the account access keys - an authorisation type that we will cover shortly.

For accessing data within a Blob, Table or Queue, the below roles can be assigned; considerations should be made to ensure that this assignment is being done in alignment with the principle of least privilege:

- Storage Blob Data Owner: Use to set and manage ownership of access controls
- Storage Blob Data Contributor: Use to grant read/write/delete permissions to Blob storage resources.
- Storage Blob Data Reader: Use to grant read-only permissions to Blob storage resources.
- Storage Blob Delegator: Get a user delegation key to use to create a shared access signature that is signed with Azure AD credentials for a container or blob.
- Storage Table Data Contributor: Use to grant read/write/delete permissions to Table storage resources.
- Storage Table Data Reader: Use to grant read-only permissions to Table storage resources.
- Storage Queue Data Contributor: Use to grant read/write/delete permissions to Azure queues.
- Storage Queue Data Reader: Use to grant read-only permissions to Azure queues.
- Storage Queue Data Message Processor: Use to grant peek, retrieve, and delete permissions to messages in Azure Storage queues.
- Storage Queue Data Message Sender: Use to grant add permissions to messages in Azure Storage queues.

More information about authorising access using Azure AD can be found at the following links:

- [Blobs](https://docs.microsoft.com/en-us/azure/storage/blobs/authorize-access-azure-active-directory)
- [Tables](https://docs.microsoft.com/en-us/azure/storage/tables/authorize-access-azure-active-directory)
- [Queues](https://docs.microsoft.com/en-us/azure/storage/queues/authorize-access-azure-active-directory)

#### Identity-based authorisation over SMB

Azure Files specifically support identity-based authentication over Server Message Block (SMB) through on-premises [Active Directory Domain Services (AD DS)](https://docs.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/virtual-dc/active-directory-domain-services-overview) and [Azure Active Directory Domain Services (AAD DS)](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/overview). A Kerberos token is issued when successfully authenticating to either of the two services. This token is then used by the user or app client in the request to access the Azure Files content desired, for authorisation. Therefore, only the token is received by Azure file shares, not the authentication credentials themselves.

Regarding authorisation, this can be configured for user access at both the share and the directory/file levels.

- *Share-level* permission assignment - Can be applied Azure AD users or groups managed through Azure RBAC. With RBAC, the credentials you use for file access should be available in Azure AD, whether that be synced from traditional AD, or as a cloud-only account
  - This assignment grants access to the share only and nothing else, not even the root directory. Directory or file-level permissions still need to be configured separately for the file share contents
  - Azure built-in roles like `Storage File Data SMB Share Reader` can be assigned to users or groups in Azure AD to provide granular access controls at the share level
- *Directory/file level* - Azure Files supports preserving, inheriting, and enforcing Windows DACLs just like any Windows file servers. The configuration of these permissions is supported over both SMB, and more recently, REST.

More information about authorising access with AAD DS can be found [here](https://docs.microsoft.com/en-us/azure/storage/files/storage-files-identity-auth-active-directory-domain-service-enable), or for AD DS [here](https://docs.microsoft.com/en-us/azure/storage/files/storage-files-identity-auth-active-directory-enable).

#### Shared Key Authorisation

Storage Accounts have access keys (base64 encoded 64-bytes) associated with them, which give **FULL** read/write access to the entire Storage Account. Access using this method relies on passing a header with every request that is signed using the Storage Account access key. A timestamp and the `Authorization` header are needed for this operation.

- The UTC timestamp for the request can be specified either in the `x-ms-date` header, or in the standard HTTP/HTTPS `Date` header. If both headers are specified on the request, the value of `x-ms-date` is used as the request's time of creation.
  - This measure is used to protect against certain security attacks, including replay attacks, as the storage services ensure that a request is no older than 15 minutes by the time it reaches the service. When this check fails, the server returns response code 403 (Forbidden);
- The request needs to be signed with the key for the account that is making the request and pass that signature as part of the request, in the `Authorization` header, which will have the following format:

```plaintext
Authorization="[SharedKey|SharedKeyLite] <AccountName>:<Signature>"
```

It's important to know that you actually have 2 access keys associated with each Storage Account. The reason for this is to facilitate key rotation, a process that should be completed periodically to mitigate the impact in the instance of key compromise. This process is typically done by migrating apps or services to use the secondary key, allowing for the primary key to be regenerated. The same process is then repeated when needing to change the secondary key. Due to this key rotation process, it is necessary to clearly track access key usage to allow for key rotation without impacting services or applications.

Rotation can be checked by looking at the activity logs, which log every action of interest. For instance, if there's not been a key rotation event in the last 90 days, then it's unlikely that the keys are being rotated:

<Tabs>
  <TabItem value="az" label="Azure CLI">

```bash
az monitor activity-log list --offset 90d --query "[?authorization.action=='Microsoft.Storage/storageAccounts/regenerateKey/action'].{Action:authorization.action, resourceId:resourceId, at:eventTimestamp, by:caller}"
```

  </TabItem>
</Tabs>

Storage Account Keys are typically enticing to attackers as they provide a means of accessing storage resources without multifactor authentication, and without key expiry (except in the instance of key rotation as outlined above). These keys are also often insecurely stored in source code, with common indicators and areas to check being:

- Usage of the StorageCredentials class
- URIs on the `.core.windows.net` domain (SAS tokens)
- Presence of `web.config` containing: `StorageAccountKey, StorageServiceKeys, StorageConnectionString`

Whilst this approach may be suitable for some use cases, the limited controls available around access management and authorization mean that Azure AD is typically recommended to be used instead, due to the much richer controls available in that configuration.

More information about shared key authorisation can be found [here](https://docs.microsoft.com/en-us/rest/api/storageservices/authorize-with-shared-key).

#### Shared Access Signatures (SAS)

For untrusted clients, it is recommended to use Shared Access Signatures - a string that is added to a resource URI specifying the constraints (i.e. who can access it, what permissions do they have on it, and what is the duration of access availability). The SAS can be 1 of 3 types:

- *User delegation* - secured with Azure AD credentials **and** also by the permissions specified by the SAS. This type applies to Blob storage only, and is the recommended SAS to be used when possible, thanks to the additional security benefits of being tied to an Azure AD identity;
- *Service* - allows access to specific resources, e.g. permit downloading a file, in one specific type of storage service, e.g. only Blob containers, but not File fileshares, etc.;
- *Account* - like the service SAS, but scoped to one or more storage service within the Storage Account.

Each of the above SAS types offer various granularity of resource scoping:

| SAS Type | Data Service | Available Scope                               |
| -------- | ------------ | --------------------------------------------- |
| User     | Blob         | Blob, Container, Directory, Version, Snapshot |
| Service  | Blob         | Blob, Container, Directory, Version, Snapshot |
| Service  | Files        | File, Share                                   |
| Service  | Tables       | Table                                         |
| Service  | Queues       | Queue                                         |

The account SAS works slightly different, whereby it is applied at the Storage Account level and scoped to specific data services, e.g. Blobs and Queues.

In terms of creating SASs, this can be done as:

- Ad-hoc SAS - i.e. time constraints and permissions are defined within the URI itself;
- Service SAS via <u>Stored Access Policies (SAP)</u> – simplified management of SAS using policies that are defined at a resource container level. When you associate a service SAS with a SAP, the SAS inherits the constraints — start time, expiry time, and permissions — defined in the SAP. This can help to group SASs together and help simplify management;

In terms of general management, there's no centralised repository containing all issued SASs. As such, duration should be set to the minimum necessary to meet usage requirements. This item is more relevant when considering that SAS tokens cannot be individually revoked. They are however, tied to the account access keys and therefore will be invalidated on Storage Account key(s) rotation. Therefore, key rotation processes needs to consider SAS usage, to ensure services are not disrupted following key rotation.

A few recommendations to keep in mind; and as always, context of the environment design and requirements is important:

- Azure AD integration is preferable over SAS usage, as you get all the benefits of centralized management;
- Ensure a revocation plan in place for a SAS, and that preparations are in place to respond should a SAS be compromised;
- Ensure Stored Access Policies are defined for service SAS. SAPs give the option to revoke permissions for a service SAS <u>without having to regenerate</u> the Storage Account keys;
- Use short-term expiration times on an SASs, so that even in case of SAS compromise, the access window is minimised;
- Be granular and specific when assigning access to resources - there's no point in using a feature meant to allow for granular access control, if it's then set to give access to everything;
- Always use HTTPS to create and distribute the SAS;

More information about SAS configuration and usage can be found [here](https://docs.microsoft.com/en-us/azure/storage/common/storage-sas-overview).

#### Anonymous Access

The terminology can be a little confusing here sometimes, so before looking at anonymous access, it's important to clarify some terms. When we refer to 'public access' here, we're not talking from a network perspective, but from an identity perspective. For example, if my Storage Account has *blob public access* enabled, then contained blob storage resources can be configured to be accessible without explicit authorisation, however any relevant network controls will still be enforced including any IP restrictions.

Anonymous access can be used for read-only anonymous access blob storage and can be defined at two levels:

- *Storage Account* - Specifies whether housed containers can be configured with anonymous access;
- Container* - Specifies whether a containers or included blobs can be accessed anonymously. Can be set to:
  - *Private* - No anonymous access;
  - *Container* - Anonymous read access for both containers and blobs-files, i.e. allows listing of containers *and* all files within a container;
  - *Blob* - Anonymous read access for blobs-files only (i.e. you can't do directory listing of all files within a container, but you *can* access an individual object if you have its URI);

These combinations of service-level permissions, and Storage Account-level ones, allow for great granularity when it comes to how a client might want to store their data:

- Completely protected access to data, only available to resources/apps within your Azure Tenant? Simply organize it however you want, as long as "public access" is disabled at <u>Storage Account-level</u>. You won't be able to modify individual containers' access controls;
- Want publicly accessible files in different directories? Put them in a Storage Account with "public access" enabled, and into a Blob container with access permissions set to "Container" - fully open;
- Want to only allow anonymous access to specific files, but not everything? Put them into a Storage Account with "public access" enabled, but the access control for the Container holding them set to "Blob"; any other containers should be set to be "Private";

To check the public access setting for all containers in a Storage Account:

<Tabs>
  <TabItem value="posh" label="PowerShell">

```powershell
$storageAccount = Get-AzStorageAccount -ResourceGroupName <resourcegroup-name> -Name <storageaccount-name>
$ctx = $storageAccount.Context

Get-AzStorageContainer -Context $ctx | Select Name, PublicAccess
```

  </TabItem>
</Tabs>

Due to the lack of authorisation requirements enforced in anonymous access, it is vital that anonymous access is only permitted for blobs and containers that do not contain sensitive information, and explicitly require anonymous access to satisfy intended usage requirements.

More information about blob anonymous access can be found [here](https://docs.microsoft.com/en-us/azure/storage/blobs/anonymous-read-access-configure).

### Encryption

Encryption <u>in transit</u> is done via TLS, using a Microsoft SSL cert. This is done by default. There might be a need to revert to simple HTTP in certain cases, like for instance a static website that has content in that Storage Account, but in general HTTPS should be used always. Storage access requirements should be reviewed to determine whether encryption in transit is being enforced where possible;

Encryption <u>at rest</u> is done by default with a MS-managed key

- Rotation and backup for this default option is done by MS;
- You can also have a customer-managed key, for e.g. regulatory compliance. This key has to be stored in the Key Vault, with the Storage Account given access to this KV;
  - This can be checked in the portal: `Storage account > Encryption > Use your own key > Select from Key Vault`;

Controls that are commonly insecurely configured include:

#### Is encryption at rest enforced?

<Tabs>
  <TabItem value="posh" label="PowerShell">

```powershell
(Get-AzResource -ResourceGroupName <resourcegroup-name> -ResourceType Microsoft.Storage/storageAccounts -Name <storageaccount-name>).Properties.encryption | ConvertTo-Json
```

  </TabItem>
</Tabs>

#### Are HTTPS-only connections enforced?

<Tabs>
  <TabItem value="posh" label="PowerShell">

```powershell
Get-AzStorageAccount -Name <storageaccount-name> -ResourceGroupName <resourcegroup-name> | Select-Object StorageAccountName, EnableHttpsTrafficOnly
```

  </TabItem>
  <TabItem value="az" label="Azure CLI">

```bash
az storage account list --query [*].[name,enableHttpsTrafficOnly] -o table --subscription <subscription>;
```

  </TabItem>
</Tabs>

#### Are insecure TLS versions permitted?

<Tabs>
  <TabItem value="posh" label="PowerShell">

```powershell
Get-AzStorageAccount -Name <storageaccount-name> -ResourceGroupName <resourcegroup-name> | Select-Object StorageAccountName, MinimumTlsVersion
```

  </TabItem>
  <TabItem value="az" label="Azure CLI">

```bash
az storage account list --query '[].{name: name, resourceGroup: resourceGroup, minimumTlsVersion: minimumTlsVersion}' --subscription <subscription> -o table;
```

  </TabItem>
</Tabs>

More information be found at the following locations:

- [Encryption at rest](https://docs.microsoft.com/en-us/azure/storage/common/storage-service-encryption)
- [TLS](https://docs.microsoft.com/en-us/azure/storage/common/transport-layer-security-configure-minimum-version)
- [Secure Transfer](https://docs.microsoft.com/en-us/azure/storage/common/storage-require-secure-transfer)

### Logging and Monitoring

Storage Accounts offer various levels of logging and monitoring for the Storage Account itself, as well as the housed data services. Logs can be streamed to various locations including a Log Analytics Workspace, Event Hub, Storage Account or to a Microsoft partner service.

The Storage Analytics logging service helps see access trends and performance, and logs every operation in real time. <u>It needs to be enabled individually</u> for each resource you want to diagnose. The diagnostic configuration can be queried in the 'Diagnostic Settings' blade for the Storage Account in the Azure portal.
