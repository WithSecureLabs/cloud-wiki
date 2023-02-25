# Azure Active Directory (AAD)

## Glossary of terms

Before we get started here is some key terminology that will be useful when trying to wrap your head around some of the AAD concepts.

| Terminology | Definition |
|:------------|:-----------|
| Tenant | Effectively the base unit that represents an organization in Azure. It is an instance of Azure AD that is created when an organization signs up for cloud services with Microsoft. It is used to manage user permissions and access to not only Azure services but to other Microsoft SaaS offerings as well (Microsoft365, Intune, Dynamics365). |
| Subscriptions | Effectively a separate payment agreement between the organization in question and Microsoft within their Azure tenant. You can have as many subscriptions as you want, they would logically separate your resources based on how you want to manage their costs. This would be a common high-level point where organisation resources would be segregated at. |
| Identity | An entity that can have permissions assigned to it and authenticate to the platform. Users can be thought of having an identity because they'd authenticate with creds, same as an app authenticating with certificates or keys, can therefore be thought of having an identity. |
| Azure AD account | An identity created through Azure AD which is stored in AAD and accessible to all the organization's cloud service subscriptions|
| Azure AD directory | Each tenant has a dedicated Azure AD directory. It is made up of all the identities associated to the organization (users, groups, and apps) and is used to perform identity and access management functions|
|Azure Management group|A high-level abstraction of a group of several subscriptions. This is used to centralise management of access, policies and compliance related to several relevant subscriptions. All subscriptions in a management group inherit conditions assigned to the group.|

## AAD Roles and Assignment

As discussed, Azure AD is Microsoft's cloud-based identity and access management service in Azure and in general across their SaaS offerings as well. It has some similarities to on-premises Active Directory but also some significant differences.

Now in terms of access within Azure AD there isn't, in theory, a global admin that has access to all resources across all subscriptions *by default*. So, to get a better idea of how Azure manages access please refer to this diagram provided by Microsoft in their Azure documentation [located here](https://docs.microsoft.com/en-gb/azure/role-based-access-control/media/rbac-and-directory-admin-roles/rbac-admin-roles.png).

The two boxes that we care about are the green and the blue box. The green Azure AD roles (aka Administrative roles) refer to the level of access a user has to Azure AD specifically. What that means is that that level of access does not translate to the underlying projects and resources (VMs, storage, subnets, etc.) deployed in Azure.

- They are only meant to manage permissions for *identities* in AD itself
- They cannot be set to groups by default - if you really need to give, say, Security Admin privileges to users of a group, you need to assign them to each individual user
  - A new `isAssignable` property can be set when creating a group, which will allow it to be assigned an Azure AD role

The blue box refers to Azure (resource) roles (aka RBAC roles). As such it represents a high-level representation of access to Azure projects within a given tenant. This is where all the deployed resources and services would be found within a given subscription.

- They are meant for the resources and subscriptions containing these resources
- They can be assigned to both users and groups

Normally the Azure RBAC roles and Azure AD roles are separated to keep complete access away from one user at any given point in time. ***However***, a user with the Global Administrator role within Azure AD can elevate their privileges by enabling the "Access management for Azure resources" control in Azure AD > Properties. This would then assign them the "User Access Administrator" role at the root (/) level, which translates to *all* subscriptions in the tenant. With this, the GA can now assign themselves *or others* any level of access to Azure resources.

Here is a quick list of the most commonly encountered roles within Azure AD as well as the general level of permissions assigned to them. If you want to see specific details and permissions assigned to each you can check over [here](https://docs.microsoft.com/en-gb/azure/active-directory/users-groups-roles/directory-assign-admin-roles#role-permissions).

| Role | Level of access |
|:-----|:----------------|
|Global Administrator|User with full access to all administrative features in AAD as well as any services that use AAD (Microsoft365, Exchange Online, Dynamics365)|
|Global Reader| So global reader represents the read-only equivalent of Global Administrator, however, it is not exactly there yet atm. There are several limitations regarding the role (OneDrive admin center does not work, very limited access to M365 admin center, Office Security&Compliance Center, Teams Admin Center and some other bits). Overall, this would preferably be the role we would ideally like when reviewing environments, however the cases in which organisations have actually given us this role are rare. |
|Privileged Role Administrator|This is mostly related to Azure PIM (which is discussed in the following sub-section). This role would grant a user the ability to manage role assignments within AAD and Azure AD PIM. As such, this role can ultimately grant users the ability to become Global Administrators. |
|Directory Readers|Users can read basic directory information. Is usually used to grant a set of users read access to the Azure portal and general read-only information about a specific directory within the Azure environment|
|Security Reader|Users with this role have global read-only access to most security related features in Azure AD. Can see role assignments in Azure PIM as well. Usually what we request for assessments alongside Reader access to the relevant subscription where the resources lie. |

Now to compliment the list above, let us do a quick table of relevant roles within Azure. Again, detailed permissions can be seen in the following link from Microsoft's documentation [https://docs.microsoft.com/en-gb/azure/role-based-access-control/built-in-roles]

| Role | Level of access |
|:-----|:----------------|
|Owner|The Owner role provides full access to all Azure resources within the assigned scope of the user's role. This can be limited in a granular fashion to just a resource group or to all subscriptions in the tenant as well. |
|Contributor|The only difference between Owner and Contributor is that Contributor does not have permissions to perform any of the user access management tasks. As such, if the intent is to compromise machines or deploy new ones, you realistically would only need Contributor access|
|Reader|Allows a user full read-only access to resources within the assigned scope to your role. Again, can be pretty granular but usually on assessments we would like to get Reader access assigned at a subscription level ideally to see all relevant resources. |
|User Access Administrator|Lets you manage user access to Azure resources. Overall, not something you want to give to people often even at a relatively constrained scope as they would have full access to anything within that scope. |

Before moving on, now that we've got a better understanding of these basic concepts, there's a few more terms we need to introduce/explain better. It's usually valuable for services or apps to have identities that can allow them to directly perm actions such as grabbing secrets material without needing hardcoded credentials. To address these issues Azure AD provides two methods:

- **Service principals**
  - An *identity* is just a thing that can be authenticated (user with creds, app with keys/certs)
  - A *principal* is an identity acting with certain roles or claims, not really separate from identity. This can be imagined in a way similar to running "sudo" in a terminal: you're still the same user, but you changed the role under which you execute. Groups can be considered principals as they can have rights assigned to them.
  - A *service principal* is an identity that is used by a service or application. And like other identities, it can be assigned roles.
- **Managed identities for Azure services**
  - Creating service principals is a tedious process and they are difficult to maintain, Managed identities will do most of the work for you. MI can be created instantly for any Azure service supporting it. It's effectively creating an account on an organization's AD tenant
  - The Azure infrastructure will take care of authenticating the service and managing the account, to then be used as any other Azure AD account, with access to other Azure resources

To get what user roles have been assigned to your account once you are logged into the Azure CLI. You can run:

```bash
az role assignment list --all
```

This would tell you all the assignments that have been provided to your account at the various scopes at which they have been assigned. As by default without the "--all" argument, it would fetch only assignments scoped to the subscription level. Take note of the "scope" key in the resulting JSON file as it signifies at what level your account has been assigned that role. Although not as useful for pre-defined roles, you can get the permissions assigned to custom roles in the environment. You can get all the custom roles in the Azure environment by doing the following:

```bash
az role definition list --custom-role-only true
```

Usually worth checking for any custom roles that have wildcard (\*) assignments, as these could have some unintended consequences that were assigned just to avoid having to specifically specify which actions that role should have.

### Azure AD Privileged Identity Management (PIM)

Azure AD PIM is Microsoft's service to manage and monitor access to resources within an organization. Essentially it attempts to solve the issue of users being set privileged user roles and then being left to their own devices for longer than needed.

It provides users with an approval-based role activation that can have a time-based expiration set to it. This would ensure that any sensitive operation is performed within a given time-frame and if required additional access requests can be raised. This also has the side-effect of providing a clear audit history when users request access to a given resource or subscription in the environment.

There are two general concepts relevant to PIM that would be crucial to understand what user has what access rights:

- eligible - this is a role assignment to a user. They can perform an "activation" of that role when needed before being able to use it. They will need to perform *an* action as part of that activation (MFA check, business justification, or request approval, etc.). These settings are all decided when creating the role assignment in PIM.
- ***active*** - this means the user does not have to perform any actions before being able to use the role, i.e. it's *directly assigned* as active. This means that even if for instance the role would normally require the user to MFA, a user assigned an "active" role won't be required to MFA
- ***activated*** - this means that a user had an **eligible role assigned to them**, they requested it to be enabled, have performed the necessary actions, and it's now enabled. Slight, but important distinction from the "active" role above.

In addition, despite PIM intending to restrict access to user role permissions to a given timeframe, it still allows administrators to set so called "permanent" attributes to the roles. This effectively could mean a user permanently can be eligible or have a role permanently be "active", thus removing the time limit component, but still keeping an audit log of assignments.

Finally, there's also the "expire active" and "expire eligible" roles, which essentially refer to the user able to use, and respectively activate a role, only within a specified start/end date. The main point here being that now you've not only got a time limit, you've also got a specific window in which you'd ever be able to use/activate that role. When that windows is finished, even your "eligible" status is gone. This feature can be useful for guest users.

If you are provided access to Azure PIM and want to see what roles have been assigned to you, then you can find any roles that have been assigned or that have been made eligible for activation in the "Privileged Identity Management" service and in the "My roles" blade of the dashboard. There you would have two categories for the two types of available roles: "Azure AD roles" for Azure AD and "Azure resources" for Azure RBAC roles.

To see the Azure AD role assignments, you would have to have the "**Security Reader**" role assigned to you. However, you will not be able to see the assignments for Azure resource roles just using that role. You would need an Azure role assigned to your account such as "Reader" at minimum to see assignments.

## Assessment notes

### Verify access

As a start, check if you have access to any subscription by going to the "Subscriptions" service in Azure. A good place to start as you would usually be assigned access to the relevant subscription where the resources, you are going to test are hosted in. If there is nothing there, then it is likely you don't have any assigned access, but it might not be necessarily true. You can further verify this by going to "All resources" in the search bar and if nothing shows up there then you likely have an Azure AD user that is not assigned any Azure roles.

You can further verify what access you have by doing:

```bash
az role assignment list --all
```

If you are integrating with a Microsoft SaaS product, then you won't necessarily need access to Azure resources to access those solutions via Azure AD. Here are some common Microsoft SaaS offerings that you might actually have access to:

- dev.azure.com - Azure DevOps (could be connected to Azure AD or separately managed with Microsoft accounts)
- admin.microsoft.com - Microsoft Admin panel
- endpoint.microsoft.com - Microsoft Device Management Endpoint
- home.dynamics.com - Dynamics365 panel

### AZ CLI and PowerShell cmdlets

There are three main ways to interact with Azure programmatically apart from the web dashboard. This is done through the Azure CLI, Azure PowerShell cmdlets or the Azure REST API. Links to how to install and work with the three components can be seen below:

- [AZ CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)
- [AZ PowerShell](https://docs.microsoft.com/en-us/powershell/azure/install-az-ps?view=azps-4.5.0)
- [AZ REST API](https://docs.microsoft.com/en-us/rest/api/azure/)

Additionally, you should be aware that interacting with Azure Active Directory is done via a different set of PowerShell modules. Specifically it would be the following two, the first of which is the main one to use and the second is the older version which will be eventually deprecated:

- [AzureAD PowerShell](https://docs.microsoft.com/en-us/powershell/azure/active-directory/install-adv2?view=azureadps-2.0)
- [MSOL PowerShell](https://docs.microsoft.com/en-us/powershell/azure/active-directory/install-msonlinev1?view=azureadps-1.0)
- [Microsoft Graph SDK for PowerShell](https://docs.microsoft.com/en-us/powershell/microsoftgraph/overview?view=graph-powershell-1.0)

One thing to keep in mind with the CLI and PowerShell modules is that commands that you run will by default be run against what is configured as a **default subscription**. A default subscription is assigned after you have logged in and created a valid access token for the CLI or PowerShell. Checking what is the current configured default can be done using:

```bash
az account show # AZ CLI command to show the current default command
```

```PowerShell
Get-AzContext # AZ PowerShell command to get the current subscription set as the default
```

Now this is not an issue when you only have access to one subscription, but it is often that you might have several subscriptions in which case **running commands will only query the default subscription and won't show you stuff in the other ones**.

Best way to approach running tests and verifying issues when you're working on several subscriptions is to use just some simple for loops in either bash or PowerShell to iterate through all relevant subscriptions as you can always specify which subscription will the command be run against. This is done by using the "--subscription "<sub_name>" parameter. A simple example loop to fetch all the Azure Key Vaults in each subscription you have access it is the following using PowerShell and the Azure CLI:

```PowerShell
az account list --all --query "[].name" -o tsv
foreach ($sub in $subscriptions) {echo $sub; az keyvault list --subscription $sub}
```

```bash
az account list --all --query "[].name" -o tsv
while read sub; 
do 
  echo "$sub"; 
  az keyvault list --subscription $sub; 
done
```

If you do not want to have to add the "--subscription" parameter always, you also have the option of setting a default subscription or "current context" to your CLI or PowerShell session. In the Az PowerShell module you can set an explicit subscription and even Azure AD Tenant by running the following command:

```PowerShell
Set-AzContext -Subscription "xxxx-xxxx-xxxx-xxxx" -Tenant "xxxx-xxxx-xxxx-xxxx"
```

This is the equivalent one for the Azure CLI, note that for the Azure CLI you need to configure the organisation's tenant at the start if you've been provided access via a guest account using your F-Secure email. So make sure you do this, otherwise it might default to running commands against whatever home(default) tenant your account is assigned to. The value of the "--tenant" parameter could either be the ".onmicrosoft.com" or custom domain for that organisation or the Azure object ID (easiest way to find is after logging in via the browser):

```bash
az login --tenant "xxxx-xxxx-xxxx-xxxx"
az account set --subscription XXX
```

On a similar note, it is important to point out how to authenticate to the Azure AD PowerShell module via a guest account access. When you've been given access via your main account, you should make sure that you authenticate correctly to their Azure AD tenant as otherwise all the commands will attempt to execute to your home organisation. When connecting to the AzureAD PowerShell module you can do the following:

```PowerShell
Connect-AzureAD -AccountId $AdminUPN -TenantId "xxxx-xxxx-xxxx-xxxx"
```

### Removing access following engagement

Credentials and access via the CLI or PowerShell modules could persist for longer then you could expect and if not cleared up, you might end up running commands against infrastructure that you don't own. As such, it is important to clear up your active sessions after each engagement or review. Here is how to clear your shell/terminals from the various CLI or PowerShell modules discussed above:

- Azure CLI

```bash
az logout
```

- Az PowerShell

```PowerShell
Disconnect-AzAccount -Scope CurrentUser
Clear-AzContext -Scope CurrentUser
Clear-AzDefault -Scope CurrentUser
```

- AzureAD Powershell

```PowerShell
Disconnect-AzureAD
```

This should complete all the access removal if you have been provided an account in their organisation tenant for the duration of the assessment.

In the event you have been granted access via a guest user account and you used your main account, then there is one extra step to perform. Go to [https://myaccount.microsoft.com/organizations](https://myaccount.microsoft.com/organizations) and once you've logged in with your credentials you should see a list of the organisations you are a member of at the moment. Once you've finished a review of a cloud environment there is no need for you to stay a member of their organisation and as such, you should click "Leave organization" on any organization you are a member of.

### User roles and permissions

To start off with, one good thing to understand is whether the organisation is using Azure AD Privileged Identity Management (PIM) or they are not. Go to the Privileged Identity Management service and check out what roles are available to you or have been assigned to you. If you have not been assigned your current roles, then it is likely that they are not using it as role assignment should normally all be handled through PIM otherwise what would the point of it be.

If you have been assigned access sufficient access and PIM is included in the scope of the assessment, then the best thing to review would be the settings applied to some of the highly privileged Azure AD roles. Go to "Settings" and check any of the accounts that have the Modified attribute set to yes. Investigate what attributes have been enabled or disabled and whether it seems reasonable from a security standpoint. Especially regarding whether permanent active assignments can be set.

Otherwise, in terms of high-privileged account access, verify the number of Global Administrators that are setup in the environment. Microsoft recommends as a best practice to have between 2-4 accounts depending on how many backup accounts you would require. At minimum, all high-privileged accounts should have MFA enabled. Details on how to check and everything you would ever need to know about MFA in Azure [can be found here](./multi_factor_authentication).

Once that is established, it is worth checking that the domain does not have a vast amount of guest user accounts. Mainly as these accounts could potentially be overlooked so worth checking for the existing of them. However, if the organisation requires active collaboration with a large variety of organisations in a rapid fashion, then a better approach would be working with the IT team to setup some restrictions that would be applied to guests via Conditional Access Policies. Verifying the amount of guest users can be done by just querying the list of users by doing the following:

```bash
az ad user list --query "[?additionProperties.userType=='Guest']"
```

Following this, it is time to move to user roles and permissions. I would list all custom roles and assess what those roles allow a user to do. This is in an attempt to see if there are any overprivileged user roles in either scope or in the actions that they can do. List all roles using:

```bash
az role definition list --custom-role-only true
```

Here is an example of a high-privileged Azure role, albeit this is one of the predefined ones. Generally you can see the fact that the scope is assigned "/" which means the directory root and would provide you access to all subscriptions under it:

```json
{
    "assignableScopes": [
      "/"
    ],
    "description": "Lets you manage user access to Azure resources.",
    "id": "/subscriptions/af009c5c-27ca-43c9-8471-b26857d9ac87/providers/Microsoft.Authorization/roleDefinitions/18d7d88d-d35e-4fb5-a5c3-7773c20a72d9",
    "name": "18d7d88d-d35e-4fb5-a5c3-7773c20a72d9",
    "permissions": [
      {
        "actions": [
          "*/read",
          "Microsoft.Authorization/*",
          "Microsoft.Support/*"
        ],
        "dataActions": [],
        "notActions": [],
        "notDataActions": []
      }
    ],
    "roleName": "User Access Administrator",
    "roleType": "BuiltInRole",
    "type": "Microsoft.Authorization/roleDefinitions"
  }
```

Lastly, it is worth reviewing the actual Azure roles assigned to users in the environment. As kind of mentioned, Azure has 4 primitive roles which are "Owner", "Contributor", "Reader" and "User Access Administrator". Ultimately it is decently common for projects or resources to have an inordinate number of users with Owner or Contributor level access to a resource. As you might suspect, this does give them a lot of privileges and if they are Owners, they can assign access to other accounts. Good practice is to not have more than 3 at the subscription level, but obviously this might be a bit context dependant so worth discussing with the organisation you're reviewing if possible to figure out who has Owner/Contributor access and whether they would still need it.

### Enterprise applications

A couple of things that can be configured improperly are part of the "User settings" configuration in AAD. This is found on the sidebar "User settings". These controls would be mainly related to the usage of enterprise applications that use your AAD as an identity system. These settings will not necessarily be wrong, but it is important to raise a discussion with an IT team on what business case exists for enterprise applications.

There are four general types of enterprise applications in Azure AD:

- Azure AD Gallery applications - Applications that are prepared to integrate with Azure AD. A lot of SaaS applications with native support fall in this category. [Here](https://docs.microsoft.com/en-us/azure/active-directory/saas-apps/tutorial-list) is a list of them.
- On-prem applications with Azure AD Application Proxy - integrated on-prem web apps using Application Proxy to support single sign-on (SSO). Some more detail on the [Application Proxy](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/application-proxy) is available in their documentation.
- Custom-developed apps - apps that are registered with Azure AD to support single sign-on
- Non-Gallery apps - applications that support SSO using SAML or OpenID connect

If they would only expect certain users to on-board new applications that could use password single-sign on or should general users be able to perform so. Admittedly, I would argue that there should not be too many circumstances where these settings would be enabled to allow users to allow applications to access their data without being pre-vetted by administrators. But still, worth asking if unsure.

One thing to keep note of is that a lot of times, organisations use a lot of applications that use Azure AD as an identity provider without even having been approved apps by administrators. There was an excellent talk by Mark and Michael from Microsoft on enterprise application phishing which was presented at a BSides event which can be seen [here](https://www.youtube.com/watch?v=mxOHcqHxpi8).

Some important notes from the talk can be seen below alongside with some stats:

- 140 apps are used on average within an organisation
- 80% of employees use non-approved apps for work
- 87% of users can consent to applications

Ultimately, it's best to think about this in the same way as you think about mobile apps. When you install an app you often need to approve the permissions it will require for it's day-to-day operations. In the context of Azure AD, this would be the organisation data that an application can access through resource APIs that expose permissions. Ultimately, these permissions to access organisational data can be granted through application consent done by either an admin, or an end-user if they are allowed to.

Here is a quick glossary of terms so that we are all on the same page here:

- Client applications - application (mobile/web/background service) requesting access to data on behalf of the user
- Resource application - the application or API that exposes data or functionality
- Permissions - the ability for a client application to perform some action on data owned by a resource application (e.g. read emails in Exchange Online through Microsoft Graph API)
- Consent prompt - the pop-up where a user is asked to grant an application the requested permissions
- Consent grant - the result of saying "yes" to the consent prompt
- Admin Consent - a slightly different method of giving consent within an organisation. An admin can grant an application access to requested permissions that cannot be granted by a regular user. Usually these would be dangerous permissions. However, admin consent can also be done to automatically consent to given permissions to an application for all users in an organisation(as such end-users would not have to faff around with granting consent themselves).
- Applications - the definition of an application in Azure AD (Application registration)
- Service principal - the representation of an app in a given tenant (Azure AD Enterprise application)

There are two types of permissions in Azure AD, delegated and application permissions:

- Delegated permissions
  - More often used permission model.
  - Used by apps that have a signed-in user present in order to make calls on behalf of that user
  - Can be consented to by non-admin users, but high-privileged permissions will likely require explicit admin consent first.
  - "Effective permissions" are the intersection of the User's permissions and what the application has been granted consent to do. (e.g. you might have the ability to read, write to OneDrive, but the application would only ask for read access. As such effectively, it only has your read permission to your OneDrive)
- Application permissions
  - Slightly less often, but definitely more dangerous
  - used by apps that DO NOT require a signed-in user present (so imagine a daemon or background service)
  - application has permissions to do what it was consented to (e.g. if you give it Read to the OneDrive service, it has read access to OneDrive as a whole. So any user in the organisation)
  - Application permissions always require admin consent

Back to the applications now, it is key to mind the service principals in your tenant. Applications can be authorised to access data and as such, an application's service principal is also its security principal. Service principals can be granted access to various bits in the tenant using the following methods:

- Azure role assignment
- Azure AD role assignment
- Owner of group, application or service principal
- App-only permissions grants
- Delegated permission grants
- Azure Key Vault ACLs

Ultimately, applications can be an effective way of getting access to an organisation as an initial foothold. This is known as "consent phishing" where users are targeted with seemingly innocuous attachments that ask users to consent to application permissions. All in all the attack plays out as follows:

1. An attacker registered an app with an OAuth 2.0 provider such as Azure AD
2. App is configured in a way to make it look trustworthy, like using the name of a popular product.
3. Attacker gets a link in front of users, which can be done in various ways
4. User clicks the link and is shown an authentic consent prompt asking them to grant the app permission to data
5. If a user clicks accept, they grant the app permissions to access sensitive data
6. The app gets an authorization code which it redeems for an access token, and potentially a refresh token
7. The access token is used to make API calls on behalf of the user.

The key questions to ask yourself on an engagement and review of cloud apps in the following:

- What is this? - where did this app come from, and who assigned it to people
- Who is this assigned to? - if you know what this app is, then ask yourself whether it has been assigned to the correct people
- What are these permissions? - if you know about this app, then are you aware of what sort of permissions it's asking from users in the directory

So as a start, it would be useful to establish what high-privileged permissions are in use within an organisation's estate and make a list of them. As with a lot of stuff, these ones should be already expected, but it's always worth being safe and if you do find something that they aren't aware of it might be cause for concern. the following permissions are some stuff to look out for:

- Mail.*
- Mail.Send
- MailboxSettings.*
- Contacts.*
- People.*
- Files.*
- Notes.*
- Directory.AccessAsUser.All
- Directory.ReadWrite.All
- Application.ReadWrite.All
- Domain.ReadWrite.All
- EduRoster.ReadWrite.All
- Group.ReadWrite.All
- Member.Read.Hidden
- RoleManagement.ReadWrite.Directory
- User.ReadWrite.All
- User.ManageCreds.All
- user_impersonation

Some common low-level permission are the following which should constitute an almost minimal required set of perms in order to allow apps to use SSO for login:

- User.Read
- open_id
- email
- profile

So you're on an engagement and you want to have a look for suspicious apps. Well there are two general options. If there aren't that many apps and you know what you're looking for, then perhaps the most thorough way would be to go through the audit logs for apps and look for signs of suspicious activity. Stuff like "IsAdminConsent" set to True which indicated a global admin has granted an app broad permissions to data. Go through all the apps in the "Enterprise Apps" section in Azure AD and check audit logs.

If there are a decent amount of apps and you don't feel as comfy doing an assessment of each one individually, then [this script](https://aka.ms/getazureadpermissions) can be pretty useful. The script is made by Microsoft people and it generated a CSV file with all the apps and permissions assigned to them as well as marks potentially dangerous permissions for you.

Using it you can start off with all the marked high risk applications and compare against user assigned count for those apps. Be weary of apps marked as high risk and where users are set to AllUsers. Although this could be common for Microsoft apps, any other third-party apps should be carefully reviewed. Also review the "HighRiskUsers" tab where it lists all the users with high privilege or access to sensitive information. Try to check if there are any you probably don't want to have access to that (e.g. H.R, financials, etc.). Lastly, check the actual permissions assigned to each application. Look for any of the above listed dangerous permissions and verify if these are necessary.

To try to remediate these issues you have a couple of options but usually a combination of all of them would be the best way to harden this potential attack vector:

#### Set Policies

Use application consent policies to limit user consent to applications. One common scenario is to allow users to only consent to Microsoft verified applications or publishers requesting low risk permissions. These permissions are defined by the administrator of the tenant and can be modified based on company requirements. In addition, if an organisation is already using Microsoft Cloud App Security, then they can set an app permissions policy that would automatically revoke an app or a specific user from an app when risk is detected.

#### Risk-based user step-up consent (enabled by default)

When a risky request is detected, the request will be "stepped up" to require admin approval. Users will see the warning, but an admin will have to approve it. Admins should have a process in place when these requests come in, that they don’t just hang there – it is important to assign owners and take action based on what you see in your audit logs.  

#### Detect risky OAuth applications

As a start, it would be useful for the organisation to frequently audit applications in the directory. One simple solution would be running the script from earlier, but that still involves some manual work. A better solution would be to configure some Azure Monitor alerts to send notifications to admins when an OAuth app has reached some criteria such as requiring high permissions or being authorized by more than 50 users. Ultimately the best solution would be to use Microsoft Cloud App Security and perform frequent hunts for dangerous apps.

#### Developer training

Although not really a useful recommendation for your run of the mill engagements. This ultimately would be a really useful one for organisations that have a lot of internal apps with dangerous permissions enabled. Sometimes these apps would need these permissions but at the same time, it's possible that it's just devs not fully understanding the exact permissions they need and just asking for the easiest solution.

Here is a link for best practices for people using the Microsoft Graph API: <https://docs.microsoft.com/en-us/graph/best-practices-concept>

### Device Management

Organizations are likely to want to get corporate devices joined to the Azure AD tenant. Or they might need to join devices that are in an on-premises directory added to Azure AD. This is where you can have Hybrid Azure AD joined devices. Need to make a point that when you are combining an on-premises AD and Azure AD using hybrid joined devices you might be opening up yourself to a potential attack vector to target your on-premises organization from the cloud. Further details can be seen [in this useful article](https://posts.specterops.io/death-from-above-lateral-movement-from-azure-to-on-prem-ad-d18cb3959d4d) from SpecterOps on targeting Intune device management. Keep in mind that the lateral movement vector would require either **Global Administrator** or **Intune Administrator**.

But from a general standpoint to minimise this, you should not allow any person to join their device to Azure AD directly. Usually this would be best done by configuring an Azure AD group that can join their devices to Azure AD and add users there as required. In addition, Azure AD provides users with the ability to set users that can elevate to local admin on Azure AD joined devices. Which, as you might suspect, could be a bit bad. All these settings can be found in the "Devices" -> "Device settings" blade in the Azure portal.

Now this by itself is mostly useful for getting base information about devices added to your AAD. Getting the proper device management happens through Intune usually. The device management admin panel can be found here: endpoint.microsoft.com

### Security policies

Azure has several security controls commonly associated with AAD and used to enhance and limit access to all sorts of related SaaS and cloud related products. So, let us explore the ones that you will likely encounter on an engagement.

#### Conditional Access Policies (CAP)

Now if you've ever been greeted with a warning when attempting to login to an Azure AD account that says something like "oh you're not permitted to login with this device" or "oh you've signed in ok, but your device isn't allowed" then you've likely encountered a Conditional Access policy. At their core they are if-else statements that assess how a user attempts to access cloud resources and whether they can do so. Although simple as a concept, they can be surprisingly granular. Some general signals that CA policies can use to establish whether you can login is the following high-level areas:

- User or group membership
- IP address range
- Device platform
- Application
- Real-time and calculated risk detection - used in conjunction to analytics provided by Azure ID Identity Protection
- Microsoft Cloud App Security (MCAS) - enables user app access and sessions to be monitored and controlled in real time, increasing visibility and control over access to and activities performed within your cloud environment.

As for what decisions can come from this, you can either block on match or grant access on match. And in the event that you want to grant access you can still require some additional controls to be satisfied:

- Require MFA
- Require device to be marked as compliant
- Require Hybrid Azure AD joined device
- Require approved client app
- Require app protection policy

If you are in the process of analysing policies, then exercise an educated judgement on whether policies seem reasonable and any that do not, should be discussed with IT as for what business case exists for it. And if none, then raise it as an issue if you feel it adds a realistic level of risk of compromise.

#### Identity Protection

AAD Identity Protection is Microsoft's attempt to perform some trend analytics and machine learning on sign-in attempts across all their services and use that to provide SIEM functionality to your directory.

Some examples of risk events detection AAD Identity Protection has are:

- Atypical travel
- Anonymous IP address
- Unfamiliar/suspicious sign-in properties (such as multiple failed logins followed by a success)
- Malware linked IP address
- Leaked Credentials
- Azure AD threat intelligence - slightly less descriptive but should use Microsoft's internal and external threat intelligence sources regarding known attack paths

Examples of vulnerabilities flagged by AAD Identity Protection:

- Users without MFA
- Weak authentication for a privileged role
- Too many global admins
- Unamanged apps

There is not much to be configured here from a security point of view as it is usually just block conditions based on how the risk level has been associated (Low, Medium, or High). There are however alerting policies that can be customised besides the default ones, so as long as they have some form of either alerting or blocking for High risk sign-ins then that should be fine. Be reasonable with suggestions here.

#### Microsoft Defender for Cloud

Centralised portal where you can get alerts and recommendations on what actions are needed to improve the organization's security score. Really useful as a sort of starting point as it usually should pick up all sorts of low-hanging fruit. Just be sensible with recommendations especially around some low risk issues.

An interesting feature of Defender for Cloud is that you get *alerts* as we said, but it will also correlate data and create *incidents*, in which you can also see the set of alerts that are related to that individual incident, and gives analysts a better view into what happened and the set of actions that caused what.

One thing to keep in mind is that it can sometimes mistakenly complain about MFA not being setup, but that's only if they have the premium edition license for Azure AD. Azure AD free edition can still enforce MFA requirement for all users by using [Security defaults](https://docs.microsoft.com/en-us/azure/active-directory/fundamentals/concept-fundamentals-security-defaults), but Security Center will still complain that MFA is not enabled. So as mentioned before, for MFA as we will rarely get proper access to figure out whether it's implemented, worth just asking and discussing with an organisation. Usually checking MFA status would require access to: (account.activedirectory.windowsazure.com)

#### MFA

As discussed before, the general configuration of users with MFA access can be seen in the following [portal](https://account.activedirectory.windowsazure.com/). However, more advanced configuration controls surrounding MFA can be found in the Azure AD service in the "Security" -> "MFA" blade. That is where you can set account lockouts based on denied authentication attempts as well configure fraud alerts if you are an organization where users can report MFA requests they did not initiate. Not much interest apart from figuring out what is the current state of MFA enrolment. Is it none, admins-only or all users?
