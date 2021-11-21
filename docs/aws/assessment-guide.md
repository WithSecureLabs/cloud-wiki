# Assessment Guide

## General Approach

* Book a kick off call, meeting or similar with the project team for them to run through the architecture with you, highlight any expected privileged IAM accounts and what they're for, get details on any particular concerns they have. This should ideally be the first thing you do.
* Run the automated audit tools - Scoutsuite and Prowler
* Run cloudmapper, first in collect mode and then in audit mode. It provides a useful snapshot of some of the environment if we have to come back to it later
* Get [awspx](https://github.com/FSecureLABS/awspx) up and running, get it downloading IAM data in particular, but once you have that then S3 bucket data etc as well
* Do an IAM user/role/policy review
  * Best to do this early, to leave time to talk through your results with project team if needed as a lot of this is contextual. awspx and [iam-hunter](https://git.f-secure.com/cloud/aws/iam-hunter) will help with this.
* After that, cover off the resources deployed by the project team into the environment. As part of every assessment, cover (at a bare minimum):
  * IAM
  * KMS
  * Cloudtrail - one should always be enabled per the service guide here
  * GuardDuty - this should always be enabled in every region in every account, per the service guide here
  * Config, if enabled
  * Security Hub, if deployed
  * VPC

## Service Specific Guides

The following links provide details on specific services within AWS.

**Note that while we do our best to keep this information updated, treat it as a starting point. Do your own reading and research, and review with the specifics of the environment in mind.**


### Compute

* [Lambda](./services/Lambda)

### Customer Engagement

* [Simple Email_Service](./services/Simple_Email_Service)

### Database

* [OpenSearch Service](./services/OpenSearchService)
* [Redshift](./services/Redshift)

### Developer Tools

* [CodeBuild](./services/CodeBuild)
* [CodeCommit](./services/CodeCommit)
* [CodePipeline](./services/CodePipeline)

### Security, Identity and Compliance

* [Directory Service](./services/DirectoryService)
* [GuardDuty](./services/GuardDuty)


### Service Tables

At the top of each service, you'll find a pair of summary tables. They includes the following fields:

| **Field**                  | **Description**           |
|----------------------------|---------------------------|
| Service Type               | Whether it's IaaS or PaaS |
| Can Pentest                | Whether it's a service we're allowed to penetration test under AWS' Terms of Service. If yes, check AWS' penetration testing guidance to see what's allowed |
| Security Focused           | Whether the service is explicitly security focused, and thus something we should be checking on every engagement |
| VPC Endpoint               | Whether a VPC endpoint is available. VPC endpoints allow in-VPC systems to communicate with services without routing via the public internet, meaning they can be accessed from subnets with no routes to the outside world. It's also possible to lock down a resource to only be accessible through the endpoint. |
| KMS Support                | Whether the service supports data at rest encryption using AWS Key Management Service. |
| Resource-level permissions | Whether it's possible to assign permissions to specific resources, as opposed to the service as a whole |
| Resource-based policies    | Whether it's possible to apply a policy to individual resources, like with S3 buckets |
| Service-Linked Roles       | Whether it's possible to give the service permission to access resources in other services to complete an action on behalf of a user. |
