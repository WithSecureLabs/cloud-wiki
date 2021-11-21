# Azure Key Vault

## Service Details

* Centralized cloud storage for everything related to access secrets.
* Provides access logging functionality, permission controls and secure access.
    * Secrets management - tight control over access to tokens, passwords, certificates, Application Programming Interface (API) keys, and other secrets
    * Encryption Key Management
    * Certificate Management
    * *Hardware Security Modules* (HSMs) protection of secrets

## Assessment notes

* Limit the number of people that have access to Key Vault
  * RBAC could be used to grant granular access to Key Vault and it's contents
* Key Vault should be in a separate subscription for particularly sensitive secrets
* Based on what the keys are used for, they could be pre-encrypted before being put in Key Vault
* Enable audit logging for Key Vault (https://docs.microsoft.com/en-us/azure/key-vault/key-vault-logging/)

https://docs.microsoft.com/en-us/azure/key-vault/key-vault-secure-your-key-vault/

## Operational Notes
