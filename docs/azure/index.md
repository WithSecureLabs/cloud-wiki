# Microsoft Azure

Microsoft's cloud platform. Portal available at https://portal.azure.com

## Basics guides

* Learning Azure Security [https://michaelhowardsecure.blog/2020/02/14/so-you-want-to-learn-azure-security/](https://michaelhowardsecure.blog/2020/02/14/so-you-want-to-learn-azure-security/)
* [https://www.gracefulsecurity.com/an-introduction-to-pentesting-azure/](https://www.gracefulsecurity.com/an-introduction-to-pentesting-azure/)
* [https://rhinosecuritylabs.com/cloud-security/common-azure-security-vulnerabilities/](https://rhinosecuritylabs.com/cloud-security/common-azure-security-vulnerabilities/)
* Microsoft Azure Essentials: Fundamentals of Azure, Second Edition: [https://blogs.msdn.microsoft.com/microsoft_press/2016/09/01/free-ebook-microsoft-azure-essentials-fundamentals-of-azure-second-edition/](https://blogs.msdn.microsoft.com/microsoft_press/2016/09/01/free-ebook-microsoft-azure-essentials-fundamentals-of-azure-second-edition/). A 260-page ebook with exercises.
* Azure Services List - [https://docs.microsoft.com/en-gb/learn/modules/welcome-to-azure/3-tour-of-azure-services](https://docs.microsoft.com/en-gb/learn/modules/welcome-to-azure/3-tour-of-azure-services)
* AWS <-> Azure Services Naming Comparison Guide: [https://docs.microsoft.com/en-gb/azure/architecture/aws-professional/services](https://docs.microsoft.com/en-gb/azure/architecture/aws-professional/services).
* Get started guide for Azure IT operators: [https://docsmsftpdfs.blob.core.windows.net/guides/azure/azure-ops-guide.pdf](https://docsmsftpdfs.blob.core.windows.net/guides/azure/azure-ops-guide.pdf).
* *Pentesting Azure Application: The Definitive Guide to Testing and Securing Deployments* - Matt Burrough 
* *Modern Authentication with Azure Active Directory for Web Applications* - Vittorio Bertocci (Deep dive into Azure AD)
* Azure AD Fundamentals - [https://youtu.be/1xnOwKr7go0](https://youtu.be/1xnOwKr7go0)
* [Attacking and Defending the Microsoft Cloud](https://adsecurity.org/wp-content/uploads/2019/10/2019-BSidesPR-AttackingAndDefendingTheMicrosoftCloud.pdf)

## Testing Requirements

* No prior permission required - notifications can be submitted at [https://portal.msrc.microsoft.com/en-us/engage/pentest](https://portal.msrc.microsoft.com/en-us/engage/pentest), rules of engagement are also linked to from there
* For configuration reviews, read-only access to all azure objects in scope is required. This can be configured through RBAC - [https://docs.microsoft.com/en-us/azure/role-based-access-control/role-assignments-portal](https://docs.microsoft.com/en-us/azure/role-based-access-control/role-assignments-portal)

## Tools

* Azurite - [https://github.com/mwrlabs/Azurite](https://github.com/mwrlabs/Azurite)
* MicroBurst : A collection of scripts for assessing Microsoft Azure security - [https://github.com/NetSPI/MicroBurst](https://github.com/NetSPI/MicroBurst)
* Azucar - [https://github.com/nccgroup/azucar/](https://github.com/nccgroup/azucar/) / [https://www.nccgroup.trust/uk/about-us/newsroom-and-events/blogs/2018/april/introducing-azucar/](https://www.nccgroup.trust/uk/about-us/newsroom-and-events/blogs/2018/april/introducing-azucar/)
* Azure Secure DevOps Kit - [https://azsk.azurewebsites.net/](https://azsk.azurewebsites.net/)
* AzSK Parser: A simple (WIP) web app to help with parsing Azure Secure DevOps Kit output - [https://git.mwrinfosecurity.com/darryl.meyer/azsk-parser](https://git.mwrinfosecurity.com/darryl.meyer/azsk-parser)
* adconnectdump: Dump Azure AD Connect credentials for Azure AD and Active Directory - [https://github.com/fox-it/adconnectdump](https://github.com/fox-it/adconnectdump)
* aadinternals - [https://github.com/Gerenios/AADInternals​](https://github.com/Gerenios/AADInternals​)
* Cloud security Suite: One stop tool for auditing the security posture of AWS/GCP/Azure infrastructure - [https://github.com/SecurityFTW/cs-suite](https://github.com/SecurityFTW/cs-suite)
* Powerzure: PowerShell script to interact with Azure - [https://github.com/hausec/PowerZure](https://github.com/hausec/PowerZure)
* Microsoft's Attack Surface Analyzer - [https://github.com/Microsoft/AttackSurfaceAnalyzer](https://github.com/Microsoft/AttackSurfaceAnalyzer)

## Training Resources

* A Penetration Tester's Guide to Azure - [https://labs.mwrinfosecurity.com/assets/BlogFiles/mwri-a-penetration-testers-guide-to-the-azure-cloud-v1.2.pdf](https://labs.mwrinfosecurity.com/assets/BlogFiles/mwri-a-penetration-testers-guide-to-the-azure-cloud-v1.2.pdf)
* Microsoft Learn: Azure Fundamentals - [https://docs.microsoft.com/en-gb/learn/paths/azure-fundamentals/](https://docs.microsoft.com/en-gb/learn/paths/azure-fundamentals/)
* AD Security - [https://adsecurity.org/](https://adsecurity.org/)
* Attacking and Defending Microsoft Cloud (Azure & Office 365) - [https://i.blackhat.com/USA-19/Wednesday/us-19-Metcalf-Attacking-And-Defending-The-Microsoft-Cloud.pdf](https://i.blackhat.com/USA-19/Wednesday/us-19-Metcalf-Attacking-And-Defending-The-Microsoft-Cloud.pdf)

## Benchmarks, Best Practices Guides etc

* CIS Benchmark for Azure - [https://www.cisecurity.org/benchmark/azure/](https://www.cisecurity.org/benchmark/azure/)
* Azure security best practices - [https://docs.microsoft.com/en-us/azure/security/security-best-practices-and-patterns](https://docs.microsoft.com/en-us/azure/security/security-best-practices-and-patterns)
* Azure security documentation - [https://docs.microsoft.com/en-us/azure/security/](https://docs.microsoft.com/en-us/azure/security/)
* Azure security white papers - [https://azure.microsoft.com/en-us/resources/whitepapers/](https://azure.microsoft.com/en-us/resources/whitepapers/)
* Azure AD Golden Configuration - [https://aka.ms/m365goldenconfig](https://aka.ms/m365goldenconfig)
* Five steps to securing your identity infrastructure  [https://docs.microsoft.com/en-us/azure/security/fundamentals/steps-secure-identity](https://docs.microsoft.com/en-us/azure/security/fundamentals/steps-secure-identity)
* Four steps to a strong identity foundation with Azure AD - [https://docs.microsoft.com/en-us/azure/security/fundamentals/steps-secure-identity](https://docs.microsoft.com/en-us/azure/security/fundamentals/steps-secure-identity)
* Top 5 things to know about Azure AD logs - [https://www.youtube.com/watch?v=BjpeowKOe3A](https://www.youtube.com/watch?v=BjpeowKOe3A)
* Azure AD Conditional Access - [https://docs.microsoft.com/en-us/azure/active-directory/conditional-access/overview](https://docs.microsoft.com/en-us/azure/active-directory/conditional-access/overview)]
* ADFS Extranet Lockout - [https://docs.microsoft.com/en-us/windows-server/identity/ad-fs/operations/configure-ad-fs-extranet-smart-lockout-protection](https://docs.microsoft.com/en-us/windows-server/identity/ad-fs/operations/configure-ad-fs-extranet-smart-lockout-protection)
* Azure AD Smart Lockout - [https://docs.microsoft.com/en-us/azure/active-directory/authentication/howto-password-smart-lockout](https://docs.microsoft.com/en-us/azure/active-directory/authentication/howto-password-smart-lockout)
* Azure AD Modern Authentication (Legacy auth deprecated 13/8/2020) - [https://docs.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/enable-or-disable-modern-authentication-in-exchange-online](https://docs.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/enable-or-disable-modern-authentication-in-exchange-online)
* Eliminate bad passwords in your org - [https://docs.microsoft.com/en-gb/azure/active-directory/authentication/concept-password-ban-bad](https://docs.microsoft.com/en-gb/azure/active-directory/authentication/concept-password-ban-bad)
* Where Microsoft think you should put your ADFS Servers - [The Bin](https://images-na.ssl-images-amazon.com/images/I/51w7Dz66ncL._SX466_.jpg)
* Azure AD staged rollout - [https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-staged-rollout](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-staged-rollout)
* Azure AD Privileged Identity Management - [https://docs.microsoft.com/en-us/azure/active-directory/privileged-identity-management/pim-configure](https://docs.microsoft.com/en-us/azure/active-directory/privileged-identity-management/pim-configure)
* Securing hybrid deployments - [https://docs.microsoft.com/en-gb/azure/active-directory/users-groups-roles/directory-admin-roles-secure](https://docs.microsoft.com/en-gb/azure/active-directory/users-groups-roles/directory-admin-roles-secure)
* Azure AD deployment plans - [https://docs.microsoft.com/en-us/azure/active-directory/fundamentals/active-directory-deployment-plans](https://docs.microsoft.com/en-us/azure/active-directory/fundamentals/active-directory-deployment-plans)
* Microsoft Cloud & Security Webinars - [https://techcommunity.microsoft.com/t5/security-privacy-compliance/security-community-webinars/m-p/927888](https://techcommunity.microsoft.com/t5/security-privacy-compliance/security-community-webinars/m-p/927888)
