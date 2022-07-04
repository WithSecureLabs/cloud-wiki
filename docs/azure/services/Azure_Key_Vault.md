# Azure Key Vault

## Service Details

* Centralized cloud storage for everything related to access secrets.
* Provides access logging functionality, permission controls and secure access.
  * Secrets management - tight control over access to tokens, passwords, certificates, Application Programming Interface (API) keys, and other secrets
  * Encryption Key Management
  * Certificate Management
  * *Hardware Security Modules* (HSMs) protection of secrets

## Assessment notes

Azure Key Vaults by their nature contain highly privileged information that can often be used to move laterally between other Azure services. As such, the primary concern of any security assessment of Azure Key Vault is to ensure that access is as restricted as possible.

### Access Controls

Whilst Key Vault supports access control through Azure RBAC alone, it also possesses an additional layer of access control through the "Vault access policy" permission model. This is generally more commonly found and is the default for a newly created Key Vault. 

Where vault access policies are in place, these should be the first aspect to review as it can reveal many excessive privileges that may otherwise be missed.

With Reader privileges, the number of Key, Secret, and Certificate permissions can be viewed in the Portal as below:

![Azure Portal Key Vault Access Policies]{../../images/az-keyvault-access-policy-1.png}

This can be useful for diagnosing blatantly over-privileged principals or situations where a large number of human users have significant and unnecessary access. Reader users can view the specific access granted to a principal through the CLI with the following command for each Key Vault: ([Check for Key Vault Full Administrator Permissions | Trend Micro](https://www.trendmicro.com/cloudoneconformity/knowledge-base/azure/KeyVault/full-admin-permissions.html)) 

```
az keyvault show
    --name "example-key-vault"
    --query 'properties.accessPolicies[*].{"PrincipalId":objectId, "permissions":permissions}'
```

When reviewing a given key vault policy configuration and RBAC role assignments, look out for the following elements:

* Human users with access to secrets in production Key Vaults.

* Principals with more permissions than should be necessary for their roles.

* Large numbers of service principals with permissive access policies.

To a certain extent, this can be audited from the Portal with Reader access just by the number of permissions assigned to a user. Getting the actual fine-grained permissions from the CLI is clearly preferable, however. 

Notably, the user that creates a Key Vault utilising vault access policies will automatically receive an access policy with all possible permissions. This can be a common cause for service principals or users being left with unnecessary full access to the Key Vault and its secrets. 

On the Azure RBAC level, it is important to note that any user with Contributor or above to a Key Vault can assign vault access policies. Essentially, this means that possessing Contributor access to a Key Vault grants a user the ability both to access keys and secrets and grant this access to other users -- roughly the equivalent of Owner to other resources. Due to the sensitivity of a Key Vault's contents, especially in production environments, these rights should be even more tightly restricted than usual. 

### Network Access Controls

Key Vaults support the same standard networking controls as most Azure resources including firewall rules and options for private endpoints. Due to the sensitivity of a Key Vault's contents, any network connectivity should be restricted as much as possible. In the ideal scenario, connectivity should only be allowed through private endpoints within the corporate Azure estate. Any exceptions to this should have sufficient justification and be appropriately recorded as a possible impact to the exposed attack surface. Restricting access in such a way is important as it helps ensure that even if a set of service principal credentials are leaked, an attacker is not able to able to directly access Key Vault contents from their own infrastructure and must attempt to gain a foothold within the corporate network. This increases the complexity of an attack and adds further potential opportunities for detection.

### Audit Logging

Audit logging enables record keeping of operations on the keys, secrets, and certificates. This has clear benefits in that if an attacker does get access to valid credentials to a Key Vault, attempts to actually use that access leave a trail that can be used for detection or forensics. With AuditEvents logging configured, attempts to access a secret create logs with "operationName" set to "VaultGet" and information about the identity used. Azure Monitor also allows logging of changes made on a resource level, such as the intentional relaxation of network access controls.

The audit logging configuration can be viewed in the "Monitoring" blade under "Diagnostic settings" ([Enable Azure Key Vault logging | Microsoft Docs](https://docs.microsoft.com/en-us/azure/key-vault/general/howto-logging?tabs=azure-cli)). "AuditEvents" records actions against secrets within the Key Vault. These should be sent to somewhere that makes sense for the use case. For instance, if there is an intention to build detections based on unusual access, then logs should go to the relevant Log Analytics Workspace. 
