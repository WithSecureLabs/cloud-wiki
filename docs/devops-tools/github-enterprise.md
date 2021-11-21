# Github Enterprise

## Authentication

- [ ] What authentication mechanism are they using?
- [ ] are they allowing built-in users too?
  - [Allowing built-in authentication for users outside your identity provider - GitHub Help](https://help.github.com/en/enterprise/2.15/admin/user-management/allowing-built-in-authentication-for-users-outside-your-identity-provider)
- [ ] Is 2FA enforced?
  - [About two-factor authentication - GitHub Help](https://help.github.com/en/enterprise/2.15/user/articles/about-two-factor-authentication)
  - [Requiring two-factor authentication for an organization - GitHub Help](https://help.github.com/en/enterprise/2.15/admin/user-management/requiring-two-factor-authentication-for-an-organization)
  - Not supported for SAML or CAS - needs to be enforced at the idp for these
- [ ] check the user audit log
  - [Auditing users across your instance - GitHub Help](https://help.github.com/en/enterprise/2.15/admin/user-management/auditing-users-across-your-instance)

## Authorisation

- [ ] Is an Administrators group defined if using federation? If so, who are the members?
- [ ] What's the permissions model like for repositories?
  - [Repository permission levels for an organization - GitHub Help](https://help.github.com/en/enterprise/2.15/user/articles/repository-permission-levels-for-an-organization)
- [ ] What's the default repository visibility?
  - [Configuring the default visibility of new repositories on your appliance - GitHub Help](https://help.github.com/en/enterprise/2.15/admin/installation/configuring-the-default-visibility-of-new-repositories-on-your-appliance)

## Logging

- [ ] Is log forwarding enabled?
  - [Log forwarding - GitHub Help](https://help.github.com/en/enterprise/2.15/admin/installation/log-forwarding)
- [ ] is collectd enabled?
  - [Configuring collectd - GitHub Help](https://help.github.com/en/enterprise/2.15/admin/installation/configuring-collectd)
- [ ] How's audit logging working? [Audit logging - GitHub Help](https://help.github.com/en/enterprise/2.15/admin/installation/audit-logging)

## Services

- [ ] are pages enabled? Potentially problematic if public pages enabled because the websites become available to unauthed users too
- [ ] is LFS enabled?
  - [Configuring Git Large File Storage - GitHub Help](https://help.github.com/en/enterprise/2.15/admin/installation/configuring-git-large-file-storage)

## Webhooks

- [ ] Check webhook configurations in use
  - [Continuous integration using Jenkins - GitHub Help](https://help.github.com/en/enterprise/2.15/admin/developer-workflow/continuous-integration-using-jenkins)
- [ ] Are any global webhooks enabled?
  - [Managing global webhooks - GitHub Help](https://help.github.com/en/enterprise/2.15/admin/user-management/managing-global-webhooks)
