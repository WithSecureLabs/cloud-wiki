# Github Enterprise

The following should serve as a basic checklist list for reviewing Github Enterprise deployments. It'll largely apply to Github Organizations on github.com too.

## Authentication

- What authentication mechanism is being used?
- Are built-in users allowed too?
  - [Allowing built-in authentication for users outside your identity provider - GitHub Help](https://help.github.com/en/enterprise/2.15/admin/user-management/allowing-built-in-authentication-for-users-outside-your-identity-provider)
- Is two factor authentication (2FA) enforced?
  - [About two-factor authentication - GitHub Help](https://help.github.com/en/enterprise/2.15/user/articles/about-two-factor-authentication)
  - [Requiring two-factor authentication for an organization - GitHub Help](https://help.github.com/en/enterprise/2.15/admin/user-management/requiring-two-factor-authentication-for-an-organization)
  - Not supported for SAML or CAS; Github Enterprise trusts the IdP's assertions as to authentication, and thus 2FA needs to be enforced at the IdP
- check the user audit log
  - [Auditing users across your instance - GitHub Help](https://help.github.com/en/enterprise/2.15/admin/user-management/auditing-users-across-your-instance)

## Authorisation

- Is an Administrators group defined if using federation? If so, who are the members?
- What's the permissions model like for repositories?
  - [Repository permission levels for an organization - GitHub Help](https://help.github.com/en/enterprise/2.15/user/articles/repository-permission-levels-for-an-organization)
- What's the default repository visibility?
  - [Configuring the default visibility of new repositories on your appliance - GitHub Help](https://help.github.com/en/enterprise/2.15/admin/installation/configuring-the-default-visibility-of-new-repositories-on-your-appliance)

## Logging

- Is log forwarding enabled?
  - [Log forwarding - GitHub Help](https://help.github.com/en/enterprise/2.15/admin/installation/log-forwarding)
- is collectd enabled?
  - [Configuring collectd - GitHub Help](https://help.github.com/en/enterprise/2.15/admin/installation/configuring-collectd)
- How's audit logging working? [Audit logging - GitHub Help](https://help.github.com/en/enterprise/2.15/admin/installation/audit-logging)

## Services

- Are pages enabled? This can potentially be problematic if public pages are enabled because the websites become available to unauthenticated users too
- Is LFS enabled?
  - [Configuring Git Large File Storage - GitHub Help](https://help.github.com/en/enterprise/2.15/admin/installation/configuring-git-large-file-storage)

## Webhooks

- Check webhook configurations in use
  - [Continuous integration using Jenkins - GitHub Help](https://help.github.com/en/enterprise/2.15/admin/developer-workflow/continuous-integration-using-jenkins)
- Are any global webhooks enabled?
  - [Managing global webhooks - GitHub Help](https://help.github.com/en/enterprise/2.15/admin/user-management/managing-global-webhooks)
