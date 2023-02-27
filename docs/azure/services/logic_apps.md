# Logic Apps

## General Security Notes

Azure Logic Apps – Azure’s no-code platform used to run automated workflows to integrate apps, data, services and systems.

| Terminology | Definition |
|:------------------|:-------------|
| Workflow | A collection of triggers and actions used to accomplish a given task. |
| Trigger | An action which starts a workflow. Each workflow must contain at least one trigger. |
| Action | Each step in the workflow following the trigger. An action can be viewed as an abstraction of certain operation, i.e., retrieve the contents of the blob, send an email, etc. |
| Managed Connector | A prebuilt construct used to authenticate against other application, data, service or a system. |
|Standard Logic App | Logic app resource which runs in the single-tenant environment; therefore, they are only available in the tenant they are registered in. |
| Consumption Logic App | Logic app resource runs in the multi-tenant environment or integration service environment (ISE), therefore they are available to users in their home tenant and other tenants. |

When creating a logic app, it’s possible to choose between two plans of logic apps:

- Standard Logic App – runs in a single-tenant environment and can run multiple workflows
- Consumption Logic App – runs in a multi-tenant environment or integration service environment (ISE) and only runs a single workflow

Which plan to choose will depend on the organisational needs, policies and procedures, however if opting for a multi-tenant environment it’s good to have an elaborate security standard in place utilising conditional access policies, principle of least privilege, etc. More information on differences between single and multi-tenant environments can be found [here](https://docs.microsoft.com/en-us/azure/active-directory/develop/single-and-multi-tenant-apps).

When assessing the security posture of a logic app, it’s good to think about two scenarios:

- External access to logic app
  - What triggers the workflow?
  - Are there any limitations to workflow triggers?
  - What data is passed to the workflow?
  - How is authentication implemented?
  - Are there any known vulnerabilities enterprise applications have that could affect the workflow?
- Internal access to logic app
  - IAM roles
  - Are there any locks on the Logic App’s history?
  - How does a workflow authenticate against other Azure services and third-party applications?
  - Is private endpoint implemented?

## Assessment Notes

### Internal Access

Every logic app has its own ARM template which describes the infrastructure and configuration of the logic app. This template includes each workflow’s configuration such as triggers and actions.

Reviewing a logic app’s templates can be a good way to check if certain security policies have been applied on workflow’s actions and triggers such as `IncludeAuthorizationHeadersInOutputs` and `NotAfter` keys.

In the Azure portal, this template is accessible from the “Overview” tab of the assessed logic app for both Standard and Consumption plans.

To review workflow configuration only using the Azure portal, navigate to “Code View” inside Logic App’s designer.

When assessing multiple Logic Apps, it can be useful to find this information programmatically. However, it’s worth mentioning that this feature is only available for Logic Apps created with a Consumption plan.

The following command returns an object with a list of properties detailing each logic app:

```PowerShell
Get-AzLogicApp
```

The properties can then be used to “dig” out more information such as inputs and parameters. These could often contain sensitive information such as authentication details, secrets, tokens etc.

For example, using a `Definition` property in the following way, returns a JSON object containing workflow configuration:

```PowerShell
(Get-AzLogicApp –Name <name>).Definition.ToString() 
```

This logic can be then used to dig deeper in search for inputs or parameters.

More on Logic App commands, properties and templates can be found:

[az logic workflow](https://docs.microsoft.com/en-us/cli/azure/logic/workflow?view=azure-cli-latest)

[AzLogicApp – PowerShell](https://docs.microsoft.com/en-us/azure/logic-apps/quickstart-logic-apps-azure-powershell)

[Workflow – Schema for Triggers and Actions](https://docs.microsoft.com/en-us/azure/logic-apps/logic-apps-workflow-actions-triggers)

[Workflow Class -Properties](https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.management.logic.models.workflow?view=azure-dotnet#properties)

To access and manipulate the logic apps, a user must have a relevant role assigned. As always, it’s important to look out for owner, contributor, reader and user access administrator roles which could be inherited and as such cant be removed.

Additionally, the two roles specific to Azure Logic Apps are:

- Logic App Contributor – provides the ability to manage Logic Apps, but not change access to them

- Logic App Reader – ability to read, enable and disable Logic Apps

A good way to check all the assigned roles to the assessed logic app or any other resource is to use the `-scope` flag:

```CLI
az role assignment list -Scope <scope>
```

```PowerShell
Get-AzRoleAssignment -Scope <scope> 
```

The easiest way to determine the scope is to run the role assignment command first and find the relevant scope. Otherwise, the scopes of a certain resource can be determined in the portal. A detailed guide on how to construct one and where the find the scopes can be found [here](https://docs.microsoft.com/en-us/azure/role-based-access-control/scope-overview).

Special attention should be paid to `actions` and `dataActions` permissions, especially if they appear to be over permissive (*). This is especially the case with the custom roles. To retrieve role definitions for a specific scope, we can use the following commands:

```CLI
az role definition list -Scope <scope> --custom-role-only true
```

```PowerShell
Get-AzRoleDefinition -Scope <scope> IsCustom=True
```

The role “Logic App Reader” can read and steal confidential data such as authentication details and from there either escalate privileges or make lateral movements.

The reader role also allows reading of the previous logic app’s versions found under the “Development Tools” tab. Versions contain previous logic app runs and therefore all input and output information. In workflow’s lifetime, consider checking this output for sensitive data. There are two ways to control access to logic app’s versions:

- Restrict access by an IP address range – this is configured from the “Workflow settings” tab.

- Secure data in “Runs history” by using obfuscation – enabled in workflow designer for secure inputs and outputs. It can also be enabled in workflow template using the `securestring` and `secureobject` types. It is important to note that Azure Logic Apps API for handling workflow history doesn’t return secured outputs. To find out more navigate to [here](https://docs.microsoft.com/en-us/azure/logic-apps/logic-apps-securing-a-logic-app?tabs=azure-resource-manager).

The “Logic App Contributor” role allows for editing the logic app. A good example would be a logic app which has an established connection with Azure Key Vault. Due to the possibility to edit the workflow, it would be possible to further manipulate the connection and exfiltrate additional sensitive information.

Another example could be if contributor role scopes to a resource group which has an established API Connection to a resource running under a different scope. A new logic app can be created to attempt to manipulate that connection.

Azure Policies provides an option to block using the connectors for services in logic apps. This can also be a good way to mitigate the scenarios mentioned above. More can be found [here](https://docs.microsoft.com/en-us/azure/logic-apps/block-connections-connectors).

To avoid use of credentials, secrets, or Azure AD tokens when authenticating to access other Azure resources, it’s possible to use managed identities. Managed identities can be enabled under the “Identity” section of “Settings” tab.

## External Connections

When assessing a logic app, it’s important to think about the public access to trigger the logic app.  

Request-based triggers contain a Shared Access Signature in their URL. The following is an example of such URL:

`https://<request-endpoint-URI>sp=<permissions>sv=<SAS-version>sig=<signature>`

There are three parts to this URL:

- sp - permissions for the allowed HTTP methods to use
- sv – SAS version
- sig – signature used to authenticate the access to trigger the workflow. The signature authenticates against a secret key stored within Azure Logic Aps.

The following are the policies to check where SAS URL is used:

- If Access keys are regenerated on a regular basis – this invalidates previous URLs as the new keys have new signature. Access keys can be found under “Settings” tab of the workflow.
- Check if expiration date has been implemented for the URLs – workflow configuration file should have `NotAfter` key.
- Create the URL with primary or secondary key.

Additionally, for Consumption Logic App workflow, request-based triggers can be authenticated by Azure AD OAuth by adding Azure AD Authorisation Policy. These policies contain claim types which are checked against requester’s access token. Accessing these claims can provide a rich insight in what user is triggering the workflow and with which claims. To find out more on how to set up policies and inspect the claims follow this [link](https://gotoguy.blog/2020/12/31/protect-logic-apps-with-azure-ad-oauth-part-1-management-access/).

Using Azure AD OAuth for authorising inbound calls for request-based triggers, we can use `IncludeAuthorizationHeadersInOutputs` in trigger’s JSON definition to ensure that that the authorization header carrying the token with access claims is present. This can also be enabled in workflow designer.

Access to trigger the workflow can also be controlled on a network level. One way of managing this is if the user has opted to expose the workflow through Azure API Management. Azure API Management includes additional security controls for endpoint management. Otherwise, inbound access can be controlled by navigating to the “Workflow settings” section under the “Settings” tab of a specified workflow/logic app. More information on securing the logic apps can be found [here](https://docs.microsoft.com/en-us/azure/logic-apps/logic-apps-securing-a-logic-app?tabs=azure-resource-manager).
