# Microsoft Purview Information Protection

Microsoft Purview Information Protection is Microsoft's offering used to discover, classify, protect, and govern sensitive information both in transit and at rest (including the data stored on-premise and in cloud). The Information Protection capabilities are part of the wider Purview risk & compliance offering, accessible in the [Microsoft Purview compliance portal](https://compliance.microsoft.com/homepage).

Microsoft Purview Information Protection is comprised of the following standalone products and uses their capabilities as part of the offering:
- Azure Information Protection
- Microsoft 365 Information Protection, such as Microsoft 365 DLP
- Windows Information Protection
- Microsoft Defender for Cloud Apps

Enterprises dealing with sensitive information such as financial data, healthcare-related and other personal records are required to adequately record and govern how this data is handled. As part of this process, the system should classify, label and control access to data in accordance with regulatory requirements. 

Due to the nature of large organisations, various bits of sensitive data can end up scattered across on-premise servers, employee devices, cloud-native applications, third-party applications and many other resources. An illustrative diagram from Microsoft's [documentation](https://learn.microsoft.com/en-us/microsoft-365/compliance/information-protection?view=o365-worldwide) shows the high-level capabilities offered by Microsoft Purview Information Protection.

![](../images/PurviewOverview.png)

## Data Discovery

There are three main ways data can be discovered using Purview:
- Manually - done by users
- Automated pattern recognition - Purview has a concept of Sensitive information types (SITs) which is used to automatically discover sensitive data based on built-in or custom declared patterns. Microsoft has created approximately 200 built-in patterns to recognise different types of card, healthcare, identity information used across different regions. A list of these patterns and their definitions can be found [here](https://learn.microsoft.com/en-gb/microsoft-365/compliance/sensitive-information-type-entity-definitions?view=o365-worldwide).
- Machine learning - Pre-trained and custom trainable classifiers are a Purview feature that is used to discover sensitive data based on its content by modelling it based on a sample set of true positive matches to sensitive data to use as training. Microsoft has several pre-trained classifiers and their definitions can be seen [here](https://learn.microsoft.com/en-us/microsoft-365/compliance/classifier-tc-definitions?view=o365-worldwide#trainable-classifiers-definitions). Custom classifiers requires an organisation to prepare a dataset of true positives for a given type of sensitive data and would need some level of training to increase its accuracy before it can be used and published. More information can be found [here](https://learn.microsoft.com/en-gb/microsoft-365/compliance/classifier-learn-about?view=o365-worldwide)

## Data Protection

Once sensitive data is discovered, it needs to be labelled with appropriate sensitivity and retention labels. These labels will configure the classification of that data and therefore prepare it to be protected and governed according to existing compliance and business needs. 

### Sensitivity Labels

New and existing sensitivity labels can be found under the "Information Protection" tab on the compliance portal.

![](../images/InformationProtection.png)

The following actions can be achieved by labelling the data:
- Encrypt emails, meeting invites, and documents to prevent unauthorized people from accessing this data
- Mark created content when you use Office apps. This is done by adding watermarks, headers or footers to emails, meeting invites and documents that have a sensitivity label applied.
- Protect content stored in containers such as sites and groups when you enable the feature to use sensitivity labels with Microsoft Teams, Microsoft 365 groups, and SharePoint sites.
- Apply the label automatically to all files and emails, or recommend a label.
- Set the default sharing link type for SharePoint sites and individual documents.

When configuring a sensitivity label, the following options are presented to a user:

#### Scope

Defines what data type labels will be applied to. As of now, there are three options available for selection: 
- Items (includes emails and files)
- Groups & Sites (includes Teams, O365 groups as well as SharePoint sites)
- Schematised data assets (includes files and schematised data access in Data Map)

#### Protection level

Defines what action(s) the label will do. There are two options: encryption (controls who and what level of access the specified user has) and mark items (adds watermark to files). By opting for encryption, the user is presented with a encryption configuration menu in which the user can configure the following settings:
- Assign permissions now or let users decide
- User access expiration
- Allow or disallow offline access - users accessing the file need to be connected to the internet
- Assign permissions to specific groups - for example, all users in the HR group can edit and view the files, whilst every other internal user can only view file.

#### Auto-labelling for files and emails

This option provides a way to configure how the data will be discovered. As mentioned above, it's possible to discover it manually, using sensitive info type and trainable classifiers. If opted for SIT, patterns will be available for review in this configuration menu. Once a user saves the document, the label will automatically be applied.
 
#### Groups & Sites 

If the user opted for "Groups & Sites" under the scope configuration menu, this configuration will allow the user to define the protection setting for groups and data. This includes the level of access that internal and external users will have for O365 and Microsoft Teams groups, as well as sharing policies of SharePoint sites with external users.

Once a label is configured with the above policies, it must be published. Labels can be published to all or selected users and groups. Furthermore, the following settings are available prior to publication:

- Users must provide a justification to remove a label or lower its classification. From a security perspective, this setting is recommended to be on as it provides more controls to govern the data landscape and increases the effort required to bypass access controls.
- Require users to apply a label to their emails and documents
- Require users to apply a label to their Power BI content
- Provide users with a link to a custom help page

## Encryption

Purview Information Protection uses Azure Rights Management (RMS) to encrypt sensitive files and emails. RMS uses Azure AD credentials to validate  whether the user has right access permissions to view the document. This applies to both internal and external users. 

The following illustration shows the high-level encryption and decryption process for a document using RMS as provided in [Microsoft's documentation](https://learn.microsoft.com/en-us/azure/information-protection/how-does-it-work):

![](../images/RMS.png)

Azure RMS uses the following cryptographic controls to encrypt the data which can be seen in the [document provided here](https://learn.microsoft.com/en-us/azure/information-protection/how-does-it-work#cryptographic-controls-used-by-azure-rms-algorithms-and-key-lengths):

![](../images/RMSCrypto.png)

Additionally, Azure RMS supports the following security, compliance, and regulatory requirements:

- Use of industry-standard cryptography and supports FIPS 140-2
- Support for nCipher nShield hardware security module (HSM) to store your tenant key in Microsoft Azure data centres.
- Azure Rights Management uses separate security worlds for its data centres in North America, EMEA (Europe, Middle East and Africa), and Asia, so your keys can be used only in your region.
Certification for the following standards:
- ISO/IEC 27001:2013 (which includes ISO/IEC 27018)
- SOC 2 SSAE 16/ISAE 3402 attestations
- HIPAA BAA
- EU Model Clause
- FedRAMP as part of Azure Active Directory in Office 365 certification, issued FedRAMP Agency   Authority to Operate by HHS
- PCI DSS Level 1