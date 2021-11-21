# SaaS Review Methodology

This methodology exists to suggest areas of potential review for SaaS applications/platforms. It is intended for use as a guide when more specific guidance isn't available, or to support the development of service-specific guidance.

## Authentication

How do users and administrators authenticate to the system? Common options include:

* Active Directory (AD) / Active Directory Federated Services (ADFS)
* Azure Active Directory (AAD)
* A Single Sign-On (SSO) platform
* A user store maintained within the application

Preference should be for some sort of centralised single sign on platform, rather than a SaaS specific user store. This is so that the business can follow their usual joiner/leaver processes to manage access. Should users not be managed through an SSO of some sort, make sure there's provisions in the joiner/leaver process to account for removing access from the SaaS on departure.

**Ensure Multi-Factor Authentication (MFA) is enforced where at all possible.**  This is a critical control for internet-exposed systems, and should it not be possible to deploy MFA, concerns should be raised as to the security posture of the entire SaaS platform. In addition, where possible, look to use certificate-based authentication rather than passwords.

In addition, look to apply location-based security controls, such as restricting the IPs the system can be accessed from to office IPs and VPNs. This is becoming less feasible for many organisations due to the nature of modern remote working, but if possible is a useful secondary control.

## Authorization / Access Control

Ensure that a range of user roles are configured, appropriate to the different use cases of the application's users. Work with the team implementing the organisation to understand the different use cases and ensure that the roles configured for them are appropriate, and apply principle of least privilege.

### User Privilege Audits

Ensure that the roles of the users are reviewed on a periodic basis, and ensure that user access is updated in line with people changing roles within the organisation.

### Administrators

Ensure that at least two users have the highest privilege administrator role, in order to prevent the organisation being locked out should one leave/die/forget their password.

## Credential and Secrets Management

* Where the SaaS interacts with third party systems, how is the authentication between them handled?
* How does the SaaS store the credentials?
  * Which users have access to read or change them?

## API end points

* Use per service, per environment accounts
* Api keys
* Restrict access to the intended Ips

## Monitoring

Review what audit logs the service makes available. Where possible, export these and ingest into the organisation's SOC. Look to monitor on the following:

* Access from unexpected locations
* Modifications to the IAM model (permissions changes, users added/removed from groups etc)
* Activity by administrative users
* If possible, users accessing unusual amounts of data, or in unusual patterns. Will require user behavior analytics in the SOC.

## Webhooks

Webhooks are calls made by the SaaS to third party platforms in order to trigger activity within the other platforms. There are several aspects to consider here:

* Architectural protections
* Per-service credentials
* Assess impact of credential misuse
* Restrict IP addresses
* Validate information from the hook

## Design review considerations

If reviewing the SaaS within the broader business context, there are a number of risk management and governance.

### Availability

* Subscribe to service availability notifications
* Filter out unused services/components
* Out of hours support
  * Filter out the noise using office hours to filter out standard stuff

### Security posture

* Request pentest reports or letters of attestation
  * If they say they do it every 6 months, ask for the last few
  * Should ideally include independent review by competent third parties, rather than just internal pentests

### Compliance

* What are the termination conditions?
* Make sure your contract allows you to audit them
* Require them to produce evidence of their security controls
  
### Data Management

* Document the data they hold for you
* Limit the data they hold to that they need
* Record their data retention policy, make sure it matches your requirement
