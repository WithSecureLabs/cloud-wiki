# Azure Identity Protection

## Service Details

Service that effectively uses Machine Learning and behavioral analysis, looking at users' login patterns, how they do it, location, MFA, etc. in an attempt to learn about it and spot and minimize false positives and false negatives in the future.
Detection, Investigation, Remediation. In addition, automation of this process is another main selling point.

Azure license P2 is required for this feature.

### Risks

There's the concept of risks: suspicious activity and actions by users when they sign in, or when they take actions after signing in. Therefore, two categories:

- Sign-in risks - here, Identity Protection scrutinizes each authentication request to judge whether it was authorized by the owner of the identity
  - Unfamiliar sign-in properties – Identity Protection remembers and learns a particular user's sign-in history. For example, when a sign-in occurs from a location that's unusual for the user
  - Atypical travel – for example, when two or more sign-ins occur from distant locations in an unrealistically short time period
  - Malware-linked IP address – for instance, if the IP address where the sign-in originates is known to have been in contact with an active bot server
  - Anonymous IP address – for instance, a sign-in originates from an anonymous IP address. Because these details can be used by attackers to hide their real IP address or location, a risk detection is raised
- User risks - a user's identity or account is compromised
  - Unusual behavior - The account showed unusual activity or the patterns of usage are similar to those patterns that Microsoft systems and experts have identified as attacks
  - Locked credentials - The user's credentials could have been leaked. For instance, MS might have found a list of leaked credentials on the dark web, which could affect your user accounts.

### Protection workflow

- Self-remediation workflow – risk policies are used to automatically respond to detected threats for you.
  - You configure a policy to decide how you want Identity Protection to respond to a particular type of risk
  - Then you choose the action to user is asked to complete (self-service password reset, MFA enforcement, etc.)
<img src="/azure/images/id-protection-1.png" alt="Self-remediation-workflow" width="500"/>

- Administrator remediation workflow – you can have admins decide how a risk should be remediated when it's been detected by your risk policies. This allows for more tailored decisions
  - Here, the admin configures risk policies
  - Policies then monitor for identity risks
  - The admin gets notified of risks in a report
  - They can view it and take appropriate action to remediate this risk (ex. Sign-in is safe, so accept the risk
<img alt="Admin-workflow" src="/azure/images/id-protection-2.png" width="600"/>

### Risk policies

You configure a risk policy to decide how you want Identity Protection to respond to a particular type of risk. Do you want to block or allow access? Do you want to make users go through additional authentication before you allow access? Risk policies help you respond to risks rapidly.

**Sign-in risk policies** - A sign-in risk policy scrutinizes every sign-in, and gives it a risk score. This score indicates the probability that the sign-in was attempted by the person whose credentials are used. You decide which level of risk is acceptable by choosing a threshold of low, medium, or high. Based on the risk level, you choose whether to allow access, automatically block, or allow access only after additional requirements are met.

- Specify the users this policy should target
- The conditions that must be met – such as how high a score triggers this policy
- How you want to respond
<img alt="Risk-policies" src="/azure/images/id-protection-3.png" width="300"/>

**User risk policies** - Here, Identity Protection learns the user's normal behavioral patterns. Then, this knowledge is used to calculate the likely risk that the  user's identity was compromised. Based on this risk, the admin can decide whether to allow access, block it, or allow access only after additional requirements are met.

**MFA registration policy** – Adds a second layer of protection to your users' identities. You can use an MFA registration policy to make sure all users are registered for MFA from the first time they use their account. You also configure this policy so you can enforce sign-in risk policies. This way, you let users self-remediate after a sign-in risk is detected.
Users must complete registration within 14 days, and they can keep skipping signing in during that period. But after the 14 days they have to complete the registration before they're allowed to sign in again.

#### Investigate reports

<img alt="risk-report-types" src="/azure/images/id-protection-4.png" width="600"/>

You can also access *risk detection type reports*, which combine information about risky user detections and sign-in detections. Use these reports to see how different risk types are related and take appropriate action.

#### Remediate risks

<img alt="Risk-remediation-types" src="/azure/images/id-protection-5.png" width="700"/>

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
