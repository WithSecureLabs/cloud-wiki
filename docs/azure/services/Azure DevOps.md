# Azure DevOps

## Service Details

Azure DevOps is a Software-as-a-Service solution which encompasses a comprehensive set of development tools and services provided by Microsoft to facilitate the software development lifecycle (SDLC) as well as IaC (Infrastructure as Code). It is used by organisations to plan, build, test, deploy, and monitor applications efficiently, which consists of the following services:

- Pipelines
- Repositories
- Boards
- Test Plans
- Artifacts

## Assessment Notes

### Protected Resources

In Azure DevOps, a resource is anything used by a pipeline that lives outside the pipeline. A subset of these resources are classified as **Protected Resource** which are a selection of resources that support several additional controls and checks. In YAML pipelines, the following are considered a *Protected Resource*:

- Agent Pools
- Secret variables in variable groups
- Secure files
- Service connections
- Environments
- Repositories

Firstly, these resources cant be access by users and pipelines outside of a project. Secondly, it is possible to run other manual or automated checks on these resources everu time a YAML pipleine tries to use them. For example Approvals & [checks](https://learn.microsoft.com/en-us/azure/devops/pipelines/security/resources?view=azure-devops#checks) can be enforced on each resource type. Approvals allow you to define a user who must approve the use of this resource when a pipeline tries to access it for example. Additionally, it is possible to [define a list](https://learn.microsoft.com/en-us/azure/devops/pipelines/security/resources?view=azure-devops#pipeline-permissions) of pipelines that should be able to access a specfic resource. This limits the overall attack surface of the environment; if someone compromised a development pipeline then they might not be able to access more sensitve resources because of this strict allow-list.

### Organizational Settings

Azure DevOps has the concepts of "Organizations", which is a high level grouping used to connect groups of related projects. Provisioning of a DevOps Organization can be conducted either via the portal or through the REST API, however, as of the time of writing this, there are not a lot of tools that utilise the REST API for reviewing DevOps environments. This is why a number of examples are provided using the portal.

By default, when accessing a DevOps Organization with a personal account, your identity is authenticated by the global directory for Microsoft accounts. Additional users can be added to the Organization within the Organizational settings and their permissions can be defined to provision access to specific Projects or resources. Alternatively, a work account can be used instead and an Organization can be connected to a specific directory, including Entra ID. While there is no limit on how many Organizations can be connected to a directory, these can be limited with an [Entra tenant policy](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/azure-ad-tenant-policy-restrict-org-creation?view=azure-devops). This can be useful for larger organisations to have control over their Intellectual Property (IP) and limit potential exposure. To administer this policy, users need to be assigned the **Azure DevOps Administrator** in Entra ID.

Where possible, a review of the Organizational policies should be conducted. It should be noted however, this might not always be possible, especially if this is centrally controlled within an organisaton. In this case, only review the project and project settings. When set at an Organizational level, most, if not all settings will not be possible to redefine at the Project level. In these cases it might be that this is a business decision that has been made and risk accepted. However, its worth trying to understand why this was set and if possible changing it.

When reviewing an Azure DevOps environment, you should look at the Organizational policies as there are a number of options to harden the overall security posture of the environment and centralise control over a number of sensitive actions.

**Public Projects**
The use of public projects should be disabled where possible, especially within organisations developing internal tooling or proprietary software. By setting this at an Organizational level, it means that individual projects/ Project Administrators will be unable to change this configuration, allowing it to be applied consistently throughout the environment. This setting can be found under `Organization Settings > Security > Policies > Security Policies > Allow public projects` within the console.

**External guest access**
While there is a legitimate use case for guest user access, it can pose a risk if it is not required. If external guest access is not needed, it should be disabled as it can be used by attackers to maintain persistence to an environemnt or as a data exfiltration method. Guest access can be disabled under `Organization Settings > Security > Policies > User Policies > External guest access`.

**Personal Access Token (PAT)**
PATs are an alternate password to authenticate to Azure DevOps. They can be used to identify you, your accessible Organizations and your scope of permissions. They are commonly used when primary authentication methods are unavailable i.e. when using third-party tools that dont support Microsoft or Microsoft Entra accounts. PATs are time sensitive and their scope can be global, which means that the PAT has full access, but a PAT can also be scoped to certain restricted to provide access to specific resources. They can also be revoked at any point which makes them a preffered authentication method over passwords. Additionally, PATs can be subject to Conditional Access Policies (CAP). Entra Conditioanl Access is a policy based access management feature that allows you to control who can access what from where. To configure Conditional Access for PATs you must be a member of the `Project Collection Administrators` group. CAPs for PATs is nit enabled by default, but can be enabled within the Organizational settings under `Security > Policies > Enable IP Conditional Access policy Validation`. When this setting is enabled, all ***new*** PATs will be subject to CAPs. Therefore, any pre-existing PATs will need to be regenerated.

> It should be noted that Multi Factor Authentication (MFA) is not supported for PATs.

**SSH Authentication**
Although SSH authentication is a secure way to authenticate Git repositories, it could be used as a persistence mechanism within Azure DevOps allowing an attacker to maintain persistent access to a repository, bypassing Conditional Access Policies (CAP). A recommended way to authenticate to Git repositories in Azure DevOps is to use [Git Credential Manager](https://learn.microsoft.com/en-us/azure/devops/repos/git/set-up-credential-managers?view=azure-devops). Git Credential Manager forces users to authenticate through the organisation's identity provider. However, this method generates a Personal Access Token (PAT) which is subsequently used to authenticate requests made with the Git CLI tool to a repository. While the use of PATs can pose a similar risk to a project, IP restrictions can be applied to them with the [**Enable IP Conditional Access policy Validation**](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/change-application-access-policies?view=azure-devops#cap-support-on-azure-devops) policy within the DevOps Organization policies.  Further to this, the creation, scope and lifespan of PATs can be [limited](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/manage-pats-with-policies-for-administrators?view=azure-devops) to reduce the potential risk and impact of a compromised PAT. While both methods have benefits and drawbacks, the preferred use of either solution should be considered on a case by case basis balanced alongside the business requirements and potential impact.

![[Organizationa-settings-ssh.png]]

At run time, Azure pipelines may need to access other resources in Azure DevOps. They do this by using a `job access token` (details [here](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/access-tokens?view=azure-devops&tabs=yaml) and [here](https://learn.microsoft.com/en-us/azure/devops/pipelines/build/variables?view=azure-devops&tabs=yaml#systemaccesstoken)). This token is dynamically generated by Azure Pipelines for each job at run time. The agent that the job is running on uses this token in order to access these resources. It is possible to apply restrictions to these tokens to limit the impact of a compromised pipeline. These can also be configured at an Organizational level. Details of which and their recommended configuration have been outlined below:

- Enable `Protect access to repositories in YAML pipelines`
- Enable `Limit job authorization scope to current project for non-release pipelines`
- Enable `Limit job authorization scope to current project for release pipelines`
- Enable `Disable creation of classic build pipelines`
- Enable `Disable creation of classic release pipelines`
- Disable `Allow team and project administrators to invite new users`

**Protect access to repositories in YAML pipelines**
By default, pipelines can access any Azure DevOps repositories in authorised projects, unless this setting is enabled. As a result, the scope of access for all pipelines will be reduced, limiting the overall impact of a compromised pipeline.

**Protect access to repositories in YAML pipelines** is enabled by default for new organizations and projects created after May 2020. [ref](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/access-tokens?view=azure-devops&tabs=yaml#protect-access-to-repositories-in-yaml-pipelines)

**Limit job authorization scope to current project for non-release/ release pipelines**
As previously mentioned, Azure pipelines need a way to access other resources in an Azure DevOps environment which is done with `job access tokens`. This provides an indetity to the pipeline; it uses this identity to conduct tasks at runtime, such as, accessing an Azure DevOps repository, uploading logs from the agent to the service, checkout a Git repository etc. The overall permissions of these tokens are derived from two things:

- The **job authorization scope**; and
- The permissions you set on a project or collection build service account.

It is possible to control which resources your pipeline has access to, by modifying the scope of these `job access tokens`. The scope of these tokens can be set to be either **collection** or **project** level. By setting the scope to collection, your pipeline will be allowed to access all resources in your Organization. Whereas if it was set to project, the pipeline would only have access to [Protected Resources](https://learn.microsoft.com/en-us/azure/devops/pipelines/security/resources?view=azure-devops#protected-resources) that are in the same project as the pipeline. More on these later.

To make your pipeline use a project-level identity, turn on the *Limit job authorization scope to current project for non-release pipelines* setting. This setting can be found under `Organization settings > Pipelines > Settings`. Alternatively, it can also be configured for specific projects under `Project settings > Pipelines > Settings`.

> It should be noted, if the scope is set to **project** at the Organization level, you cannot change the scope in each project.

**Disable creation of classic build/release pipelines**

YAML based pipelines offer better security for Azure pipelines. As a result, they should be preferred over the classic build and release pipelines. This is because YAML pipelines:

- Can be code reviewed - This makes it easier to identify malicious code embedded into a pipeline by a malicious threat actor
- Provide resource access management - To set fine-grained access control for a pipeline, limiting access to sensitive resource
- Support [runtime parameters](https://learn.microsoft.com/en-gb/azure/devops/pipelines/process/runtime-parameters?view=azure-devops&tabs=script) - Helping to avoid against attacks like **argument injection**

Again, this can be found under `Organization settings > Pipelines > Settings`.

**Allow team and project administrators to invite new users**
Disabling this policy blocks Team and Project Administrators from inviting new users. This can help reduce the potential attack surface to the environment, preventing potentially unauthorised users or accounts from being provisioned.

> One caveat with this policy is that even with the policy turned off, Team and Project Administrators can re-invite users who were previously members of the Organization.

#### Organization Permissions

Within Azure DevOps, permissions for users and groups can be set at a number of different levels, including the Organizational level, Project level or Object level. The Organizational permissions will be scoped globally, so any permissions assigned at this level will grant access to all projects and resources within an Organization. A number permissions we deemed sensitive have been provided below which should be reviewed and kept to a minimum.

![[Organization-permissions.png]]

| Permission | Description |
| ---- | ---- |
| Create new projects | Add a project to the Organization or project collection. |
| Delete a team project | Allows a user to delete projects. This cannot be undone and can result in all data in that project being lost. |
| Edit instance-level information | Can set Organization and project-level settings. This could be used by an attacker to weaken the overall security posture of the project to conduct further attacks against the environment. |
| Make requests on behalf of others | Can perform operations on behalf of other users or services. This should only be assigned to service accounts. |
| Manage build resources | Can manage build computers, build agents, and build controllers. Could be used to add new, attacker controlled build agents within a pipeline allowing access to sensitive resources or gain access to privileged identities. |
| Manage pipeline policies | Can manage pipeline settings set through **Organization settings, Pipelines, Settings**. This could be used by an attacker to weaken the overall security posture of the project to conduct further attacks against the environment.  |

#### Microsoft Entra

Within Azure DevOps, you have the ability to [connect](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/connect-organization-to-azure-ad?view=azure-devops) your Organization to your Microsoft Entra tenant. This allows you to enable SSO and centrally manage access to your Organizations. When reviewing DevOps with a connection to Entra ID, there are a few configurations that should be enabled, for example:

All of these can be found under `Organizational Settings > Microsoft Entra`

- `Restrict global personal access token creation` should be enabled if Personal Access Tokens (PAT) are not required in the environment

If you require  the use of PATs, the following settings can be applied to set additional controls:

- Enable `Restrict full-scoped personal access token creation`
- Enable `Enforce maximum personal access token lifespan` and set a reasonable time period. The maximum token lifespan is something that needs to be considered on a case by case basis but we consider a generally reasonable time period to be 30 days.

The restriction of PATs is one that should be considered based on the environment and the your risk profile. As discussed earlier when talking about the use of **SSH Authentication**, PATs are required by some services such as Git Credential Manager which might be a preferred authentication mechanism. However, PATs provide anyone within their possession, access as their associating user, they can be likened to a password or a session token, as such, they are highly sensitive and some people feel that enabling them pose too much of a risk.

### Pipelines

A pipeline is a set of automated processes and tools that foster a culture of automation to allow for the Continuous Integration and Continuous Development (CI/CD) of software within an organisation. When reviewing a pipeline there are a number of things you want to look for to identify ways to reduce its overall attack surface. A high level summary of these have been provided below:

- Pipeline Permissions
- Injection vectors
- Pipeline Logic
- Logging

Before creating a pipeline, consideration should be taken to appropriately plan for [securing your resources](https://learn.microsoft.com/en-us/azure/devops/pipelines/security/approach?view=azure-devops). One key point to consider is, if you develop *only* YAML pipelines, creation of classic build and release pipelines should be disabled. Doing so prevents a security concern that stems from YAML and classic pipelines sharing the same resources, for example, the same service connections. Additional examples of this can occur when applying `Pipeline permissions to a repository resource`. Details of this have been covered later.

#### Pipeline permissions

Permissions can be configured within pipelines to limit the number of users that have access to sensitive functionality. There are two different types of pipeline permissions that can be set:

- Project-level Permissions - These will be set against all pipelines in a project
- Object-level Permissions - These will set permissions for an individual pipeline

**Project-level Permissions**

These can be set under a specific Project within `Project Settings > Permissions`. A more detailed description of project level permissions can be found [here](https://learn.microsoft.com/en-us/azure/devops/organizations/security/permissions?view=azure-devops&tabs=preview-page#project-level-permissions), however, we have highlighted ones of potential interest to look out for when reviewing custom groups or permissions that have been assigned to individual users. When reviewing RBAC, if it is found that a large number of users have privileged role assignments, the context into why this is the case should be understood to restrict these assignments where possible. The number of users with privileged roles being considered "excessive" is one for debate and varies from environment to environemnt, depending on the size of their DevOps Organization or project.

| Permission                | Description                                                     |
| ------------------------- | --------------------------------------------------------------- |
| Delete team project       | Can delete a project from an Organization or project collection |
| Update Project Visibility | Can make a project public or private                            |

**Object-level Permissions**

These can be set under a specific pipeline within a project within `Pipelines > Pipelines` and then select the specific pipeline to edit  and then `More actions > Manage Security`.

![[pipeline-object-level-permissions.png]]

Each DevOps environment should limit the number of users with sensitive roles or permissions. Within DevOps we might consider a user or role as privileged if they can:

- Trigger pipelines
- Modify or delete pipeline definitions / templates (Branch policies can be used for Defence-in-Depth to prevent attackers from implementing malicious steps to the pipelines)
- Pass arguments or variables to pipelines during execution

A list of potentially sensitive permissions have been detailed in the table below. This should be assigned cautiously and not to a large number of individuals. More information on object level permissions can be found [here](https://learn.microsoft.com/en-us/azure/devops/organizations/security/permissions?view=azure-devops&tabs=preview-page#project-level-permissions).

| Permission                            | Description                                                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Administer build permissions          | Can administer the build permissions for other users.                                                         |
| Delete build pipeline                 | Can delete build definitions for this project i.e a user can delete the pipeline YAML definition              |
| Delete builds                         | Can delete pipelines; however, builds that are deleted are retained in the Delete tab                         |
| Destroy builds                        | Can permanently delete pipelines                                                                             |
| Edit build pipeline                   | Edit pipeline definition. This could allow an attacker to gain code execution on your pipeline runners/agents |
| Queue builds                          |  Can queue a pipeline execution                                                                                                             |

#### Repos

Repositories are critical components to protect and is where a lot of the granular controls for protecting your sensitive code can be found.

**[Repository Resource Check](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/repository-resource?view=azure-devops)**

Approvals can be enforced on repositories (infact they can be enforced on all "Protected Resources" as mentioned earlier) to review all commits before being merged into a specific branch. This can prevent an attacker with compromised credentials i.e. a PAT or SSH key, or access to the affected project from directly pushing malicious code into the environment. These can be set under `Project Settings > Repositories > <select a specifc repo> > <Select the three dots> > Approvals and checks`.

![[approvals-and-checks.png]]

Specific approvers can then be set, however, the `Allow approvers to approve their own runs` should not be checked. This allows users to approve their own runs, therefore disabling this would prevent malicious insiders or a compromised approver account from being able to compromise the entire environment.

![[approvers.png]]

**Pipeline permissions to a repository resource**

You can set a repository to be used on specific YAML pipelines. This prevents attackers from pushing malicious code to a repository and running it on any pipeline to gain code execution on the runners, limiting access to other identities or service connections, which can be abused for lateral movement or privilege escalation within the DevOps or Entra environment.

> This only applies to YAML pipelines, therefore cannot be set for classic pipelines. As such, all classic pipelines will be able to use this repository

These can be set under `Project Settings > Repositories > <select a specifc repo> > Security > Pipeline Permissions`.

**Branch Protections**

Branch policies are an important protection for Azure Repos. Policies can be listed using the DevOps CLI as such:

```bash
az repos policy list --repository-id <ID> --branch <probably main> --output table
```

Details of a specific policy can be viewed with the follow az cli command:

```bash
az repos policy show --id <ID of the policy>
```

Details on the types of policies that can be set can be found [here](https://learn.microsoft.com/en-us/azure/devops/repos/git/branch-policies-overview?view=azure-devops). When reviewing DevOps, we will want to ensure that `Require a minimum number of reviewers` is set to at least 2. As previously mentioned, `Allow requestors to approve their own changes`  should not be set, while `Prohibit the most recent pusher from approving their own changes` should be, to prevent someone with access to this account from compromising the repository and pipeline.

![[Branch-Protections.png]]

**Bypassing of policies**

Review which users have the following permissions assigned. Ensure this is kept to an absoloute minimum as this undermines any created branch policies. This can serve a purpose but if possible the number of users with this access should be zero.

- **Bypass policies when completing pull requests.** Users with this permission will be able to use the "Override" experience for pull requests.
- **Bypass policies when pushing.** Users with this permission will be able to push directly to branches that have required policies configured.

![[Bypassing-of-policies.png]]

**Secrets**

When reviewing repositories, be sure there are no hard coded secrets or SAS Tokens etc. Pull the repository locally and run some regex queries against it or use some tools such as [Truffle Hog](https://github.com/trufflesecurity/trufflehog).

In order to scan with truffle hog you can pull the repo locally and use the file protocol to search on disk.

```bash
trufflehog git file://path/to/git/repo 
```

##### Forks

Forks are a dangerous feature of Azure repos since they can originate from outside your Organization. A number of considerations should be taken into account when configuring repositories.

**Don't provide secrets to fork builds**

By default, pipelines are configured to automatically build forks. However, secrets and protected resources aren't made available to the jobs in those pipelines - ensure this is not turned off. To review this, check if `Make fork builds have the same permissions as regular builds` or `Make Secrets available to builds of forks` is enabled under `Pipelines > <your pipeline> > edit > three dots > Triggers`. After enabling the **Pull request trigger**, you will be able to see the necessary settings.

![[Forks-Git-Trigger.png]]

![[Forks-Git-PullRequest.png]]

However, there is an Organizational policy that is [enabled by default](https://learn.microsoft.com/en-us/azure/devops/release-notes/2023/sprint-229-update#building-prs-from-forked-github-repositories) that prevents this trigger from being enabled. Allowing centralised control over this highly risky setting for all pipelines and projects. To set this, this organisational policy will need to be disabled.

> It should be noted this is only an option for Git repositories

![[Forks-Git-Organizational-Policy.png]]

**Consider manually triggering for builds**

Automatic fork builds can be disabled and pull requests can be used instead, as a way to manually build these contributions. These pull requests can then be code reviewed for any malicious additions. It is possible to configure triggers withing your pipeline trigger settings as detailed above.

**Use Microsoft hosted agents for Fork builds**

To prevent malicious code introduced to a repository through a fork. Dedicated Microsoft hosted agents should be used to prevent an attacker from gaining remote access to sensitive runners/ agents, especially if an Organization is using shared infrastructure. This could allow an attacker to pull or commit to other sensitive repositories, or even get a foothold onto your corporate network. Further details has been highlighted in [[DevOps - SecWiki#Agents/ Agent Pools]].

#### Variables and Runtime Parameters

[Runtime parameters](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/runtime-parameters?view=azure-devops&tabs=script) give you much more control over what values can be passed to pipelines, preventing against attacks such as [argument injection](https://devblogs.microsoft.com/devops/pipeline-argument-injection/). These are the recommended way to pass values to a pipeline at runtime as you can limit parameters to certain, expected values. Parameters have data types such as boolean or string, and they can be restricted to a subset of values. Parameters can be defined within parameter templates and then used within your pipeline definition. An example has been highlighted below.

A template has been defined below with a Runtime parameter called `yesNoWithsecure` of type `boolean`. Therefore, this parameter will only accept a value of `true` or `false`.

```yaml
# File: simple-param.yml
parameters:
- name: yesNoWithsecure # name of the parameter; required
  type: boolean # data type of the parameter; required
  default: false

steps:
- script: echo ${{ parameters.yesNoWithSecure }}
```

Running the pipeline and passing the value `false` to the defined Runtime parameter matches the expected format and as a result, the pipeline would run successfully.

```yaml
# File: azure-pipelines.yml
trigger:
- main

extends:
  template: simple-param.yml
  parameters:
      yesNoWithSecure: false # set to a non-boolean value to have the build fail
```

Whereas if a string such as `headphones` was provided, it would fail as it does not match its predefined format.

```yaml
# File: azure-pipelines.yml
trigger:
- main

extends:
  template: simple-param.yml
  parameters:
      yesNoWithSecure: headphones # Incorrect value. Pipeline fails.
```

Alternatively, instead of using parameters, or variables, you can use tool-specific tasks. Microsoft provides a series of built in tools into pipelines which can be utilised to limit the number of command line scripts or programs within a pipeline. For example, instead of using the `MsBuild` command line tool, use the `MsBuild` **task**.

Another benefit is that input to tasks are escaped and appropriately rejected if they contain characters known escape characters like `"`. An example task definition has been provided below.

```yaml
pool: { vmImage: 'windows-latest' }

steps:
- task: MSBuild@1
  inputs:
    solution: App1.sln
    platform: $(platform)
    configuration: $(configuration)
```

Whereas this is what an equivalent pipeline definition might look like using the `MsBuild` command line tool. Therefore, the use of variables within the `script` definition leaves the pipeline vulnerable to argument injection since there is no input validation etc.

```yaml

pool: { vmImage: 'windows-latest' }

steps:
- script: >
  msbuild App1.sln
    /p:platform="$(platform)"
    /p:configuration="\$(configuration)"
```

A further defence-in-depth measure would be to use absolute paths for executables to prevent PATH poisoning attacks against your agents.

#### Agents/ Agent Pools

In order to have a functioning pipeline, an organisation must have at least one agent which runs on the underlying host you want to use to compile or execute your code on. There are three types of agents:

- Microsoft hosted agents - Agents deployed onto infrastructure managed by Microsoft
- Self hosted agents - Agents you deploy onto pre-existing/ self managed infrastructure
- Azure Virtual Machine Scale Set Agents - A form of self-hosted agents, using Azure Virtual Machine Scale Sets, that can be auto-scaled to meet demands

While self hosted agents can be a good option if you have existing on-premise infrastructure or you need more control around the deployment or integrity of the data for compliance reasons, there are some security related items to take into consideration.

If an organisation uses one agent/ Virtual Machine for a number of different projects, an adversary that is able to compromise one insecure pipeline could force this agent to execute commands on the host. This could allow them to push or pull code to and from other repositories in other projects, leaking potentially sensitive information, or even implementing backdoors into more critical software components. Alternatively, an attacker could identify credentials within these repositories, or utilise existing service connections to authenticate to and conduct malicious actions against third party resources such as a KeyVault within your Azure environment.

There should be appropriate segregation of infrastructure between projects and teams to prevent this. Where possible [Microsoft hosted agents](https://learn.microsoft.com/en-us/azure/devops/pipelines/security/infrastructure?view=azure-devops)/ pools should be used as these provide a clean virtual machine for each run of a pipeline. An agent can be bound to only one pool, therefore you might want to share agent pools between projects, but this leads to the same issues as mentioned above. As such, it is important to keep separate agents and separate pools for each project.

Low privileged user accounts should be used to run agents. Agents that are backed by Microsoft Entra ID can directly access Azure DevOps APIs. To mitigate this, agents should be ran with low privileged local accounts. Further to this, [Microsoft specifically highlighted](https://learn.microsoft.com/en-us/azure/devops/pipelines/security/infrastructure?view=azure-devops#use-low-privileged-accounts-to-run-agents) that their Azure DevOps group `Project Collection Service Accounts` is misleadingly named. By design, this group is a member of the `Project Collection Administrators` group. Microsoft have found that often customers run their agents using an Entra backed identity with the `Project Collection Service Accounts` permissions. However, this configuration would allow anyone with the ability to control that agent to completely compromise the Azure DevOps environment.

The scope of Service Connections should adhere to the principle of least privilege to prevent any unnecessary privilege escalation vectors. For example, when creating a service connection, always select a resource group. This resource group should contain only the Virtual Machines and resources the build requires.

Much like other Protected Resources, Agent Pools can be confifgured with Approvals & Checks and Pipeline permissions. These can be used to restrict which pipelines can use the agent pool, whether there should be an approval process or specific checks that must pass before the resource can be used. This can be found under `Project Settings > Pipelines > Agent Pools > <Agent Pool> > Approvals and checks`.

Additionally, Agent Pools has its own object level RBAC. However, it is not as granular as seen elsewhere throughout Azure DevOps. Users or groups can be assigned as:

- Administrator
- Creator
- User
- Reader

The number of creators and administrators should be limited and not excessive. As usual this will vary per environment.

#### Service Connections

Service Connections are a way to assign an identity to your pipeline and provide a way to connect to external services such as:

- Azure / Your Entra tenant
- GitHub
- Kubernetes
- Docker registry
- An online Continuous Integration environment i.e. Jenkins
- Services installed on remote computers

**Azure Resource Manager Connections**

At times, a pipeline may need an identity to authenticate and communicate with resources hosted in Azure. When these workloads run on Azure (Microsoft Hosted Agents or Using Azure VMs), you can use **Managed Identities**, where the Azure platform handles the management and distribution of these credentials for you. For a software workload running outside of Azure, you need to use application credentials (a secret or certificate) to access Microsoft Entra protected resources. This introduces a number of security issues and difficulties when it comes to storing and managing these credentials.

However, there is a now a new authentication method that can be adopted called **Workload Identity Federation**. This is a type of Azure Resource Manager Service Connections, and can be configured to use user assigned managed identities or app registrations. Under the hood, it uses an OAuth Open ID Connect (OIDC) flow with short lived tokens to reduce the need for credentials to be required. Workload Identity Federation should be the preferred method to authenticate workloads into an Entra tenant, as they reduce the need to use or maintain secrets.

**Protecting Service Connections**

Due to the nature of YAML pipelines, they can be executed without the need for a pull request which introduces a security risk. It is good practice to use Pull Requests (PR) and perform Code Reviews to ensure the code being deployed does not contain any malicious modifications. Since YAML pipelines can be executed without PRs, a malicious user could push malicious code to a pipeline and reuse an existing service connection to modify resources in your external applications or services.

To prevent accidental misuse of Service Connections, there are several checks that can be configured. These checks are enabled on the Service Connection themselves, so, they can only be configured by the owner or administrator of that Service Connection. The configuration can be applied in the "Approvals and Checks" menu on the Service Connection.

![[ServiceConnections.png]]

Within this menu, **Branch Control** can be set. Branch Control allows you to define when the Service Connection can be used. Specifically, it allows you to define that the Service Connection can only be used when a pipeline is running from a specific branch.

> When setting a wildcard for the Allowed Branches, anyone could still create a branch matching that wildcard and would be able to use the Service Connection. Using [git permissions](https://learn.microsoft.com/en-us/azure/devops/repos/git/require-branch-folders#enforce-permissions) it can be configured so only administrators are allowed to create certain branches, like release branches.

By setting Branch Control to only allow the `main` branch, you can ensure a YAML Pipeline can only use the Service Connection after any changes to that pipeline have been merged into the main branch, and therefore has passed any Pull Requests checks and Code Reviews.

![[BranchControl.png]]

### Miscellaneous checks

While reviewing pipelines there are a number of additional miscellaneous checks you should perform. A list of these are provided below:

**Pipeline logs**
Often logs from the pipeline run can contain sensitive information. Check these logs for any credentials or secrets insecurely output within these runs. To view individual logs for each step, navigate to the build results for the run, and select the job and step.

![[Pipeline-Logs.png]]

Then you can navigate to the build results for the run and download the logs as seen below:

![[Download-Pipeline-Logs.png]]

**Templates**
Check the templates for basic security practices i.e using HTTPs for storage account communication and not HTTP.

The use of linters such as `tflint` can be useful to identify these basic misconfigurations if they are using Terraform.

**Pipeline Logic**
Review Pipeline logic. Does it makes sense? Are there any potential logic vulnerabilities here

### RBAC

Just like in an Azure configuration review, the number of privileged role assignments should be reviewed to ensure there are not an excessive number of users to privileged access to resources.  As discussed above, access within Azure DevOps is extremely granular and can be applied at multiple levels:

- The Organisational level
- Project level
- On the Resource itself

## External References

- [Microsoft - Security Quick Reference Index](https://learn.microsoft.com/en-us/azure/devops/organizations/security/quick-reference-index-security?view=azure-devops)
- [Microsoft - Security Best Practices](https://learn.microsoft.com/en-us/azure/devops/organizations/security/security-best-practices?view=azure-devops)
- [Microsoft - Security Groups in DevOps](https://learn.microsoft.com/en-us/azure/devops/organizations/security/permissions?view=azure-devops&tabs=preview-page)
- [Microsoft - Permissions Index](https://learn.microsoft.com/en-us/azure/devops/organizations/security/permissions-lookup-guide?view=azure-devops)
- [Microsoft - Permissions in DevOps](https://learn.microsoft.com/en-us/azure/devops/organizations/security/about-permissions?view=azure-devops&tabs=preview-page)
- [Microsoft - Default Permissions Quick Reference](https://learn.microsoft.com/en-us/azure/devops/organizations/security/permissions-access?view=azure-devops)
- [Microsoft - Git Repository Permissions](https://learn.microsoft.com/en-us/azure/devops/repos/git/set-git-repository-permissions?view=azure-devops)
- [Microsoft - Git Authenticaton](https://learn.microsoft.com/en-us/azure/devops/repos/git/auth-overview?view=azure-devops)
- [Microsoft techcommunity - DevOps Workload Identity Federation](https://techcommunity.microsoft.com/t5/azure-devops-blog/introduction-to-azure-devops-workload-identity-federation-oidc/ba-p/3908687)
- [Microsoft - Service Connections](https://learn.microsoft.com/en-us/azure/devops/pipelines/library/service-endpoints?view=azure-devops&tabs=yaml#common-service-connection-types)
- [Microsoft - Agent Authentication Options](https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/agent-authentication-options?view=azure-devops)
- [Microsoft - Bicep Secrets Management](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/scenarios-secrets)
- [Microsoft devblogs - Hack a pipeline: Argument Injection](https://devblogs.microsoft.com/devops/pipeline-argument-injection/)
- [Microsoft devblogs - Hack a pipeline: Shared Infrastructure](https://devblogs.microsoft.com/devops/pipeline-shared-infrastructure/)
- [Microsoft devblogs - Hack a pipeline: Steal Source Code Repositories](https://devblogs.microsoft.com/devops/pipeline-stealing-another-repo/)
- [Microsoft - Runtime Parameters](https://learn.microsoft.com/en-gb/azure/devops/pipelines/process/runtime-parameters?view=azure-devops&tabs=script)
- [NCSC - Protect your code repository](https://www.ncsc.gov.uk/collection/developers-collection/principles/protect-your-code-repository)
- [Microsoft - Pipelines; Job Authorization Scope](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/access-tokens?view=azure-devops&tabs=yaml#job-authorization-scope)
- [Microsoft - Pipeline Task Index](https://learn.microsoft.com/en-gb/azure/devops/pipelines/tasks/reference/?view=azure-pipelines&viewFallbackFrom=azure-devops)
- [Microsoft - Service Connections - ARM](https://learn.microsoft.com/en-us/azure/devops/pipelines/library/connect-to-azure?view=azure-devops)
- [Microsoft - Service Connections](https://learn.microsoft.com/en-us/azure/devops/pipelines/library/service-endpoints?view=azure-devops&tabs=yaml)
- [Microsoft - Protecting Service Connections](https://microsoft.github.io/code-with-engineering-playbook/continuous-integration/dev-sec-ops/azure-devops/service-connection-security/)
- [Microsoft devblogs - Workload Identity Federation](https://devblogs.microsoft.com/devops/public-preview-of-workload-identity-federation-for-azure-pipelines/)
- [Microsoft - Workload Identity Federation](https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation)
