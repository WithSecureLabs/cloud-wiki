# Cognito

## Service Details

AWS Cognito is a managed identity provider and user management service comprised of two main services:

- User pools
- Identity pools

A user pool is a directory of users . It integrates with other SSO providers such as Google, Amazon and Apple. This allows customers to create a user account in the user pool by simply authenticating with their chosen SSO provider. It uses OpenID Connect or SAML to delegate authentication to third party identity providers. Additionally, it can be used to store custom attributes about users. Users can be assigned read/ write permissions to these attributes when the user pool is configured.

An identity pool allows users to access the accounts AWS resources, by provisioning a specific IAM role which a person who is authenticated with a user pool can assume. It can also allow unauthenticated users to assume a different IAM role if configured to do so.

Listed below are the common terms, grant flows and types of client required to understand Cognito

| Name                | Type       | Description                                                  |
| ------------------- | ---------- | ------------------------------------------------------------ |
| SAML                | Protocol   | Security Assertion Markup language is a protocol used to delegate authentication from a service provider to a third party identity provider. It uses SAML assertions, which are XML documents used by identity providers to describe users. These are parsed by the service provider and used to authenticate the user with the service. |
| OAuth               | Protocol   | Open Authorisation is a protocol identity servers use to implement fine grained access control on some service to a resource server. It provides an access token to the service which has a scope describing which actions the token authorises. |
| OIDC                | Protocol   | Open ID Connect is an extension to the OAuth protocol. It adds an ID token which the application can parse to view claims about the identity of the authenticated user. |
| JWT | Token | JSON web tokens are tokens containing a signed payload often used when authenticating a user. |
| Access token        | Token      | An access token is used to authorise API calls against a resource server. |
| ID token            | Token      | An ID token is a JWT containing claims used to authenticate a user. |
| Authorisation code  | Grant flow | The user receives an authorisation code after authenticating with the identity server. This is sent to the service specified by the redirect URI. The code can subsequently be exchanged for an access token by the client when presented to the OAuth endpoint alongside a client secret (if specified). |
| Implicit grant      | Grant flow | The user directly receives an access token after authenticating with the identity server. |
| Confidential client | Client     | The client is considered confidential, meaning client secrets can be stored on it. An example would be a backend server. |
| Public client       | Client     | The client is not confidential, meaning client secrets cannot be stored on it. An example would be a web application. |

## Assessment Notes

The methodology for assessing the security of Cognito differs when testing a user pool or an identity pool. User pools are easy to misconfigure, potentially allowing for access tokens to be retrieved by the user to run AWS CLI commands with. It is also important to consider how downstream applications handle claims, assertions and user attributes. Attributes can sometimes be directly changed by users with an access token through the AWS CLI depending on the configuration of read/write permissions. This can potentially lead to privilege escalation or account takeover.

However, identity pools can be attacked by discovering the identity pool ID and using it to get an IAM role in the underlying AWS account. The success of the attack depends on the whether the identity pool is configured to allow unauthenticated access, whether the attacker can obtain a valid identity token to authenticate as a user in the corresponding user pool and the privileges of the IAM roles assigned to both types of users.

### User pools

#### Getting an access token and an ID token

The first step is typically getting credentials for a user in the user pool. This is typically done through the registration page of the website, but a registration flow may not always be exposed on the front end.

In this case, a client ID needs to be found in order to register an account in the user pool which may be found in JavaScript files served by the website. Once found, the following AWS CLI command can be used to register a user.

```bash
aws cognito-idp signup --client-id <client ID> --username <username> --password <password>
aws cognito-idp confirm-sign-up --client-id <client ID> --username <username> --confirmation-code <confirmation code>
```

Following this, an access token and Identity token need to be obtained using the users credentials. If the application is a public client, the tokens can be retrieved directly with the following CLI command:

```bash
aws cognito-idp initiate-auth --client-id <client ID> --auth-flow USER_PASSWORD_AUTH --auth-parameters USERNAME=<username>,PASSWORD=<password>
```

However, applications which are confidential clients require a client secret in addition to the client ID, which should be securely kept on the client.

When configuring the client, always set it as a confidential client if it is possible for the server to securely store a client secret. Limiting users access to the AWS CLI will restrict their ability to obtain a token and carry out attacks described below.

#### Modifying user attributes

Access tokens can be used to modify user attributes using the AWS CLI. In certain misconfigurations, this can be used in privilege escalation or even account takeover. Since they are JWT's, they can be decoded to get information such as user pool id, scope and username UUID.

List the attributes of the current user:

```bash
aws cognito-idp get-user --access-token <access token>
```

Change an attribute of the current user:

```bash
aws cognito-idp update-user-attributes --access-token <access token> --user-attributes Name=<attribute name>,Value=<attribute value>
```

Developers may miss the fact that these attributes are controllable by users directly:

- If an account has an admin field that is writable by the user, a developer may not realise this and use that attribute to authorise an account to perform privileged actions. This would lead to a privilege escalation vector.
- Cognito allows for email addresses to be changed through the CLI. If this is misconfigured to reflect changes before they are confirmed via an email/SMS code, a downstream service could potentially use the unconfirmed address when authenticating the user. This would result in an account takeover vector. See [Flickr account takeover](https://security.lauritz-holtmann.de/advisories/flickr-account-takeover/) for more detail.

- **When configuring the user pool ensure *Keep original attribute value active when an update is pending* is enabled. This would stop changes in the email address from being reflected until it is verified.**
- **Read/ write access control can be applied on user attributes. Limit read/write access to attributes which are used in downstream services, especially for authentication and authorisation.**
- **Avoid using the 'email' attribute when authenticating a user. Instead, use the 'sub' attribute, which is guaranteed to be unique for each user.**

### Identity Pools

#### Getting an identity pool ID

When testing a Cognito identity pool, its identity pool id must first be enumerated. They may be hardcoded in various JavaScript files hosted on the website, and are of the form REGION:GUID.

#### Assuming roles using an Identity pool ID

An unauthenticated role can be assumed through the following:

```bash
aws cognito-identity get-id --identity-pool-id <identity pool id>
```

```bash
aws cognito-identity get-credentials-for-identity --identity-id <identity id>
```

The credentials from the last command can be added to environment variables, or a profile can be created with it. This would allow for a role to be assumed within the AWS account.

Before assuming a role for an authenticate user, the ID token for an authenticated user must be obtained. This can be done using the methods explained previously. Using an ID token, the following CLI commands can be used to obtain an authenticated role:

```bash
aws cognito-identity get-id --identity-pool-id <identity pool id> --login <ISS>=<Identity token>
```

```bash
cognito-identity get-credentials-for-identity --identity-id <identity id> --login <ISS>=<Identity token>
```

*\<ISS\> is equivalent to the issuer of the token, which can be found inside the payload of the ID token JWT*

**When configuring an identity pool, apply the principle of least privilege. Disable the unauthenticated role if possible, and apply the minimum privileges required for the authenticated role using IAM policies. See [here](https://docs.aws.amazon.com/cognito/latest/developerguide/role-based-access-control.html) for more details**

## Operational Notes

- If the client ID cannot be found, it is still worth investigating the login page. If the response type is changed to token, it will cause the client to an implicit flow if the implicit flow is enabled. This will directly return the access tokens to the resource specified by the redirect uri.
- It is worth checking for open redirect with the redirect URI. However, it is worth bearing in mind the Cognito hosted UI uses an allow list for which URIs the page can redirect to.
- If people are not meant to be able to create users in the user pool themselves, disable "Enable self-registration" in the user pool configuration.
- The issuer (ISS) field typically takes the form of cognito-idp.\<region\>.amazonaws.com/\<user pool id\>

## External references

1. OktaDev. (2019, November 5). An Illustrated Guide to OAuth and OpenID Connect [Video]. YouTube. [https://www.youtube.com/watch?v=t18YB3xDfXI](https://www.youtube.com/watch?v=t18YB3xDfXI)
2. OktaDev. (2021, April 9). A Developer’s Guide to SAML [Video]. YouTube. [https://www.youtube.com/watch?v=l-6QSEqDJPo](https://www.youtube.com/watch?v=l-6QSEqDJPo)
3. Worthington, D. (2022, October 19). What Is SAML Assertion? JumpCloud. [https://jumpcloud.com/blog/what-is-saml-assertion](https://jumpcloud.com/blog/what-is-saml-assertion)
4. Vogelsang, L. (2023, January 19). AWS Cognito pitfalls: Default settings attackers love (and you should know about). SECFORCE [https://www.secforce.com/blog/aws-cognito-pitfalls-default-settings-attackers-love-and-you-should-know-about/](https://www.secforce.com/blog/aws-cognito-pitfalls-default-settings-attackers-love-and-you-should-know-about/)
5. Holtmann, L. (2021, December 18). Flickr Account Takeover. [https://security.lauritz-holtmann.de/advisories/flickr-account-takeover/](https://security.lauritz-holtmann.de/advisories/flickr-account-takeover/)
