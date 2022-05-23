# Hashicorp Vault

Hashicorp Vault ([https://www.vaultproject.io/](https://www.vaultproject.io/)) is an open source secrets management platform popular in enterprise cloud environments. Hashicorp also offer an enterprise version with a number of additional capabilities. This guide considers the feature set available within the open source version.

## Host hardening

* Vault should be the only thing running on the system where it is installed
* Disable swap to avoid plaintext secrets being written to disk from memory
* Turn off core dumps, for similar reasons
* Run Vault as a low privileged user
* Use SELinux/AppArmor
* If using Docker, use overlayfs2 or similar to make sure that mlock is supported (which prevents memory being swapped to disk)
  * Use `sudo setcap cap_ipc_lock=+ep $(readlink -f $(which vault))` to give Vault the ability to call that without running as root
* Treat Vault systems as immutable
  * Disable SSH/RDP
  * Upgrade by tearing down old Vault servers and deploying updated VMs/containers running the upgraded version
  * Use configuration as code to configure Vault - [https://www.hashicorp.com/blog/codifying-vault-policies-and-configuration](https://www.hashicorp.com/blog/codifying-vault-policies-and-configuration)

## Authentication

* Avoid using the root tokens for anything they're not explicitly required for
  * Revoke root token after initial setup
  * Generate new ones when required using the unseal keys - [https://learn.hashicorp.com/tutorials/vault/generate-root](https://learn.hashicorp.com/tutorials/vault/generate-root)
* Leverage platform authentication methods (AWS/GCP IAM, Azure Application Groups, Kubernetes Namespaces and similar) to authenticate systems wherever possible
* Use TLS certificates in preference to API tokens and password-based credentials

## Access Control

* Apply principle of least privilege everywhere
* Define different policies for different applications and teams, to reduce the blast radius of a given compromise

## Storage Backends

* Pick a highly-available storage backend where possible. Consul is the default preference, but the filesystem backend should not be used for production.
* Restrict access to the storage backend to only those administrators who maintain it. While data is encrypted at rest, it's likely possible to corrupt secrets etc by attacking data at rest on disk.

## Logging and monitoring

* Ensure there's an audit log configured
  * Ensure this log is shipped off to a SIEM or similar for the SOC/security team to monitor
* Monitor the audit log for potential malicious activity (note these are all very use case specific):
  * Unusual user access
  * Changes to the permissions model
  * Secrets being accessed or rotated unexpectedly
* Ensure the OS logs (syslog/auditd, windows event log) are shipped to a SIEM or similar too

## Unsealing

* Ensure multiple keys are required to unseal, if not using AWS/GCP KMS or similar for auto unseal
* Review the processes for accessing and using the unseal keys to ensure that it would take multiple administrators to access the keys, and that each can not access more than one unseal key

## Encryption

* Enforce TLS on Vault
* Don't terminate TLS between client and vault itself (for instance on intermediary load balancers, CDNs or similar)

## Networking

* Firewall off the Vault system from everything it doesn't need to talk to, both inbound and outbound

## External Content

* [https://learn.hashicorp.com/tutorials/vault/production-hardening](https://learn.hashicorp.com/tutorials/vault/production-hardening)
* [https://www.hashicorp.com/resources/adopting-hashicorp-vault](https://www.hashicorp.com/resources/adopting-hashicorp-vault)
* [https://www.hashicorp.com/resources/securing-aws-accounts-with-hashicorp-vault](https://www.hashicorp.com/resources/securing-aws-accounts-with-hashicorp-vault)
* [https://www.hashicorp.com/resources/securing-kubernetes-applications-with-hashicorp-vault](https://www.hashicorp.com/resources/securing-kubernetes-applications-with-hashicorp-vault)
* [https://medium.com/hashicorp-engineering/how-id-attack-your-hashicorp-vault-and-how-you-can-prevent-me-system-hardening-ce151454e26b](https://medium.com/hashicorp-engineering/how-id-attack-your-hashicorp-vault-and-how-you-can-prevent-me-system-hardening-ce151454e26b)
* [https://www.marcolancini.it/2017/blog-vault/](https://www.marcolancini.it/2017/blog-vault/)
