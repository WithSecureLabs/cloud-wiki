# Azure Identity Protection

## Service Details

Service that uses Machine Learning and behavioral analysis, looking at users' login patterns, how they do it, location, MFA, etc. in an attempt to learn about user behaviours and help automate the detection of anomalous behaviour that wouldn't be easily noticable by a human user looking at logs.
Based on documentation it uses predictive models based on analytics from Microsoft's own services such as Xbox and Microsoft account sign-ons to try to model the types of activities a regular user would perform. 

Azure AD Premium P2 license is required for full access to this feature.

### Risks

There's the concept of risks: suspicious activity and actions by users when they sign in, or when they take actions after signing in. Therefore, they sit within these two broad categories:

- Sign-in risks - Identity Protection scrutinizes each authentication request to estimate the probability that a given request hasn't been performed by the expected identity owner.
- User risks - the rating of whether a user's identity/account has been compromised

As part of sign-in risks, Microsoft provides the following detection types (documentation could be found here [(List of Identity Protection risks)](https://docs.microsoft.com/en-us/azure/active-directory/identity-protection/concept-identity-protection-risks)):

* Atypical travel – for example, when two or more sign-ins occur from distant locations in an unrealistically short time period
* Anomalous token - detection based on variations from the expected type of session or refresh token lifetime or usage. Can be a noisy detection but can be useful for verification of anomalous activity
* Token Issuer anomaly - detection that points out issues with the SAML token issuer or the claims in the token
* Suspicious browser usage
  - Malware-linked IP address – for instance, if the IP address where the sign-in originates is known to have been in contact with an active bot server
  - Anonymous IP address – for instance, a sign-in originates from an anonymous IP address. Because these details can be used by attackers to hide their real IP address or location, a risk detection is raised
- Unfamiliar sign-in properties - detection that bases user sign-in behaviour based on what it sees the user do during its initial learning period once a new user is setup. Once that passes the detection will generate alerts when major deviations are noted from a user's general behaviour.
- Malicious IP address - detection based on the risk rating of a given address
- Password spray - detection based on whether the service has detected similar patterns of account bruteforcing against multiple usernames in the tenant.
- Anonymous IP address - detection on sign-ins from an anonymous VPN or Tor.
- Admin confirmed user compromised - this generates an alert if an admin has marked a user as confirmed compromised.
- Azure AD threat intelligence - detection based on suspicious activity that is based on internal or external threat intelligence sources in Microsoft.

Additionally, Azure Identity Protection has several detections that make use of the Microsoft Defender for Cloud Apps service to generate alerts. These detection types are the following:
- Suspicious inbox manipulation rules - detection that attempts to alert when it recognises new mailbox rules that can be the result of malicious activity. 
- Impossible travel - for example, when two or more sign-ins occur from distant locations in an unrealistically short time period
- New country - logins from a new country that the user has not been to before. 
- Activity from anonymous IP address - detection based on activity from an anonymous proxy IP range
- Suspicious inbox forwarding - detection that aims to alert on suspicious forwarding rules sending email to an external address
- Mass Access to Sensitive Files - detection that tries to profile regular user activity with OneDrive and SharePoint and alert if this gets exceeded. 

Lastly, the service also has several user risk detection types:

* Possible attempt to access Primary Refresh Token (PRT) - this detection is actually supported by Microsoft Defender for Endpoint (MDE) as such unless the organisation has it integrated and enabled this will not run or create alerts.
* Leaked credentials - detection indicates if a user's credentials have been leaked. Based on Microsoft's services that check against different sources such as paste sites, dark web forums, etc...
* Azure AD threat intelligence - similar to the sign-in risk detection in the usage of known patterns of behaviour from Microsoft's services.
### Protection workflow

- Self-remediation workflow – risk policies are used to automatically respond to detected threats for you.
  - You configure a policy to decide how you want Identity Protection to respond to a particular type of risk
  - Then you choose the action to user is asked to complete (self-service password reset, MFA enforcement, etc.)
[id-protection-1](id-protection-1.png)

- Administrator remediation workflow – you can have admins decide how a risk should be remediated when it's been detected by your risk policies. This allows for more tailored decisions
  - Here, the admin configures risk policies
  - Policies then monitor for identity risks
  - The admin gets notified of risks in a report
  - They can view it and take appropriate action to remediate this risk (ex. Sign-in is safe, so accept the risk
[id-protection-2](id-protection-2.png)

### Risk policies

You configure a risk policy to decide how you want Identity Protection to respond to a particular type of risk. Do you want to block or allow access? Do you want to make users go through additional authentication before you allow access? Risk policies help you respond to risks rapidly.

**Sign-in risk policies** - A sign-in risk policy scrutinizes every sign-in, and gives it a risk score. This score indicates the probability that the sign-in was attempted by the person whose credentials are used. You decide which level of risk is acceptable by choosing a threshold of low, medium, or high. Based on the risk level, you choose whether to allow access, automatically block, or allow access only after additional requirements are met.

- Specify the users this policy should target
- The conditions that must be met – such as how high a score triggers this policy
- How you want to respond
[id-protection-3](id-protection-3.png)

**User risk policies** - Here, Identity Protection learns the user's normal behavioral patterns. Then, this knowledge is used to calculate the likely risk that the  user's identity was compromised. Based on this risk, the admin can decide whether to allow access, block it, or allow access only after additional requirements are met.

**MFA registration policy** – Adds a second layer of protection to your users' identities. You can use an MFA registration policy to make sure all users are registered for MFA from the first time they use their account. You also configure this policy so you can enforce sign-in risk policies. This way, you let users self-remediate after a sign-in risk is detected.
Users must complete registration within 14 days, and they can keep skipping signing in during that period. But after the 14 days they have to complete the registration before they're allowed to sign in again. Further details on configuring it can be seen here: [(MFA registration policy)](https://docs.microsoft.com/en-us/azure/active-directory/identity-protection/howto-identity-protection-configure-mfa-policy)

#### Investigate reports

[id-protection-4](id-protection-4.png)

You can also access *risk detection type reports*, which combine information about risky user detections and sign-in detections. Use these reports to see how different risk types are related and take appropriate action.

#### Remediate risks

[id-protection-5](id-protection-5.png)

#### Unblock users

User accounts can be blocked by risk policies or manually by the admin after an investigation. How these user accounts are unblocked depends on the type of risk that caused the blockage:

- Blocked because of sign-in risk – need to exclude the user from the policy, or if the admin asks the user to sign in from a familiar location or device;
- Blocked because of user risk – the admin can reset the password for the user to unblock it. The admin might also dismiss the activity identified as risky, or again exclude the user from the policy.

### Azure AD Identity Secure Score

This is not technically part of Azure Identity Protection, but it's another useful service that's related to the identity risks and helps have a better overall picture of the entire identity-related posture. It's actually a subset of the Office365 Secure Score, and more directly related to Microsoft Defender for Identity (previously known as Azure ATP).

## Assessment notes

Check if the client has an Azure AD P2 license, and if the service is enabled. The main service page will show you a series of dashboards with the most important information at a glance, such as the users which were identified as the most at-risk, based on their behavior, or the geographical locations from which users log in, with any suspicious, impossible travel scenarios flagged. Look at the history of risky events, locations they've been coming from, the users that are most flagged as suspicious, to start building a picture of the events surrounding the tenant. Look at any of the policies that have been already set up by the client, and consider any improvement points. If there aren't any, discuss with the client their biggest concerns and objectives, and advise how to build adequate sign-in and user risk policies, based off on their concerns.

There's a good chance that if the client is aware of this service using it, then they are already streaming logs from Identity Protection into a SIEM (such as Sentinel). If not, then this is definitely a point at which you should have a conversation with the client and strongly advise them to do so. Identity Protection provides a consolidated view at risk users, risk detections and vulnerabilities, with the ability to remediate risks immediately, and set policies to auto-remediate future events, so this is definitely worth for clients to consider.

## Operational Notes

This service has a very good integration with Azure AD Conditional Access policies, and as such, if a client has a P2 licence, definitely should recommend activating it and taking advantage of it. Any existing conditional access policies the client might be implementing can be enhanced with Identity Protection risk-based checks.

In order to configure Identity Protection, you need to head into the Marketplace and create it from there. Then you head into the `Service menu > Users at risk > Detection alerts` and configure sending emails based on low/medium/high alerts, to specific users.
You also get to configure the policies for the kind of risks and actions you want (sing-in risks, MFA not enforced, etc.)

## External Links

<https://docs.microsoft.com/en-us/azure/active-directory/identity-protection/overview-identity-protection>
