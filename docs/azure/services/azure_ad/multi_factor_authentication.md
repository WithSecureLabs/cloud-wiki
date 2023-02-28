# Multi-Factor Authentication

## Overview

Multi-Factor authentication in Azure is an interesting topic in its own way. At its essence it is straightforward, and you are aware of what options are available as you have seen some of them in other services and applications. But it can get confusing, as there are <i>different</i> ways it operates.

Azure supports the following options that can be set as defaults:

* Phone call
* Text message
* Microsoft Authenticator (in the form of a notification)
* Other authenticator app or hardware token (in the form of a code prompt).

In addition, Azure supports more methods like FIDO2 security keys, app passwords and email, but that is not particularly the focus of this page.

**The pre-2020s & SSPR-MFA days**
To have some context, it's before mid-2020, organizations could have _Multi-Factor Authentication (MFA)_ and _self-service password reset (SSPR)_ configured and required on account setup.

* Users would have had to configure separate authentication methods
* One would give access to features/resources in general
* The other was related to actually (re)gaining access to their account

**The "Combined security information registration experience"**
Microsoft decided that it made more sense to enforce method registration in one, combining the two methods together. The title above is the actual name. It can be found at:
`Azure Active Directory > User settings > Manage user feature preview settings"`

* Enabled by default on all new tenants created after 08/2020, disabled on all older ones
* Just for some context, if during login you are prompted for additional verification, then your account is sent through this flow: [link](https://docs.microsoft.com/en-us/azure/active-directory/authentication/media/concept-registration-mfa-sspr-combined/combined-security-info-flow-chart.png)

Albeit useful for context, the above was mostly to ease into what the general flow is and to raise awareness that there are several locations where you might either get details on your MFA status or setup/change MFA configurations:

* [https://account.activedirectory.windowsazure.com/] - domain for MFA management in Azure AD
* [https://mysignins.microsoft.com/] - domain for personal MFA management in Azure AD
* [https://account.live.com/] - domain for MFA management of Microsoft accounts

## Assessment Notes

### Microsoft MFA

Let us start outside of an Azure AD organization first. Within AAD you can have guest users that could join with a basic Microsoft account. This, for example, can be an account used for Skype, or for Xbox Game Pass or a Gmail account. These accounts albeit joined to an Azure AD as guests, the base account properties are managed at Microsoft rather than the Azure AD. As such, the choice of MFA methods and setup would be at the [Microsoft portal](https://account.live.com/).

### Azure per-user MFA

Now inside an Azure AD tenant, we have two domains where MFA methods are selected and enabled. The one where users can set their own authentication defaults and secondary verification methods would be the [mysignins.microsoft.com](https://mysignins.microsoft.com/) one. Although you cannot disable MFA or configure settings you can set other methods that are allowed in your Azure tenant.

The main one for administrative management, would be the [account.activedirectory.windowsazure.com](https://account.activedirectory.windowsazure.com/usermanagement/mfasettings.aspx) domain. In here, you can enable or disable the ability for users to create app passwords (enabled by default), setup trusted IPs where you can bypass MFA request generation, enable default MFA verification options or set an upper-limit for how long can users avoid doing MFA on devices they trusted (1-60 days range).

But the more important bit is the "Users" tab which displays all users in your Azure AD tenant and what their MFA status is. The MFA status can be one of three settings:

* Disabled - The default state for a user not enrolled in per-user Azure Multi-Factor Authentication.
* Enabled - user is enrolled in per-user Azure MFA but can still use their password for legacy authentication. User will get a prompt to register MFA methods next time they sign-in.
* Enforced - user is enrolled in per-user Azure MFA, and they cannot use legacy auth using passwords. Would need to use App passwords if enabled by admins.

### Azure Conditional Access MFA

Lastly, there is one more way you can enable MFA for users in Azure (additionally is the recommended way by Microsoft if you have the necessary Azure AD Premium license). This is applied as a criterion to allow a user access to a resource if they have fulfilled the necessary conditions beforehand. At the moment, this is the recommended approach by Microsoft as MFA can be applied to a large section of users at the same time and also other two-factor criteria could be enabled or disabled depending on what the policy is (e.g. do not require MFA when on office network, require both MFA and company device while on Starbucks network, etc...). The specific policies enforcing MFA can be seen in the "Azure Active Directory > Security > Conditional Access" setting in AAD.

### Tales from the trenches

The problem here that you might have noticed is that there are technically three levels at which MFA can be enabled in each Azure AD tenant. You might be thinking "Surely, there must be an easy way to verify?", but sadly there is not at the time of writing. You can look at the MFA status in the Azure [account.activedirectory.windowsazure.com](https://account.activedirectory.windowsazure.com/usermanagement/mfasettings.aspx) domain, but even if it all says "Disabled" this might not be representative of what is the reality of the situation.

Let us do a quick demonstration with a demo from an example tenant to illustrate why that might be so.

```PowerShell
# Install-Module MSOnline # to install if you need the module
Connect-MsolService
Get-MsolUser -All | Select-Object @{N='UserPrincipalName';E={$_.UserPrincipalName}},@{N='MFA Status';E={if ($_.StrongAuthenticationRequirements.State){$_.StrongAuthenticationRequirements.State} else {"Disabled"}}},@{N='MFA Methods';E={$_.StrongAuthenticationMethods.methodtype}} | Export-Csv -Path c:\MFA_Report.csv -NoTypeInformation
```

This script above will fetch all the users in your Azure AD and get their MFA status and their registered MFA options (call, authenticator app, etc...), but should require a user with the following permission:

* **"microsoft.directory/users/strongAuthentication/update"**

There is a [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/api/resources/credentialuserregistrationdetails?view=graph-rest-beta) in beta that should fetch the info, but it requires **"Reports.Read.All"** permission for the app accessing it or a user with **"microsoft.directory/signInReports/allProperties/read"**. (It can be a more reliable way for verification on whether an MFA method is setup).

Now, assuming you have managed to run the script with the necessary permissions you should get something like this back:

|"UserPrincipalName"|"MFA Status"|"MFA Methods"|
|:------------------|:-----------|:------------|
|"test1@\<tenant\>.onmicrosoft.com"|"Disabled"||
|"test2@\<tenant\>.onmicrosoft.com"|"Disabled"|"OneWaySMS TwoWayVoiceMobile PhoneAppOTP PhoneAppNotification"|
|"test3_gmail.com#EXT#@\<tenant\>.onmicrosoft.com"|"Disabled"||
|"test4@\<tenant\>.onmicrosoft.com"|"Enforced"|"OneWaySMS TwoWayVoiceMobile"|

Based on this it seems like the organisation admins have not really setup MFA properly as only one user has it on. Unfortunately, the reality of the situation is more like this:

|"UserPrincipalName"|"MFA Status"|"MFA Methods"|"Actually Disabled"|
|:------------------|:-----------|:------------|:------------------|
|"test1@\<tenant\>.onmicrosoft.com"|"Disabled"||"Yes"|
|"test2@\<tenant\>.onmicrosoft.com"|"Disabled"|"OneWaySMS TwoWayVoiceMobile PhoneAppOTP PhoneAppNotification"|"No"|
|"test3_gmail.com#EXT#@\<tenant\>.onmicrosoft.com"|"Disabled"||"No"|
|"test4@\<tenant\>.onmicrosoft.com"|"Enforced"|"OneWaySMS TwoWayVoiceMobile"|"No"|

Now, to clarify the confusion, here is what is the status for all four accounts:

* The test4 account has MFA enforced using the Azure per-user MFA requirement. As such, on every login they would be prompted to use 2FA.
* The test3 account is a Microsoft account used to login to the environment. It has 2FA enabled at the Microsoft account level and each login requires a 2FA prompt from the user's Authenticator app.
* The test1 account does not have Azure per-user MFA enabled nor does it have MFA enforced by a Conditional Access policy. As such, this account does not need a second-factor authentication when login in and is truly vulnerable.
* The test2 account has been configured to have MFA enforced from a Conditional Access policy. As such, the user may be registered for MFA (_has methods registered_) but is not enforced on every authentication, but rather MFA is enforced based on what the policy is and uses the sign-in state and policies to invoke MFA. The confusing bit is that CA policies can, and often will invoke MFA on all logins if a certain condition is fulfilled, however as it does not _technically_ enforce mandatory MFA for every authentication, I guess it doesn't count as being enforced on the platform.
Ultimately the best way to approach verifying MFA for all users is if possible to configure CAPs with minimal exclusions set for them and it should allow the organisation to fully control authentication flows into the Azure AD.
