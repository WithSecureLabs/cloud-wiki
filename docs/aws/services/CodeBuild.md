# CodeBuild

## Service Details

Service for executing build processes - compiling applications etc. Commonly deployed as part of a CodePipeline CI/CD set up.

## Assessment Notes

* Where's the code coming from?
    * If part of CodePipeline, it's loaded in via an S3 bucket from the pipeline-defined source
    * If standalone, can be git repos from codecommit, bitbucket, github or github enterprise. Also possible to load as zip files from S3
* Review the buildspec.yml files used, if possible
    * https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html
    * Look at which container is used
        * AWS standard containers listed here: https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-available.html
        * If custom or third party container (i.e not one of the AWS provided ones), review where that's being pulled from, and ideally do a security review of that too
    * Where is the buildspec kept? By default, it's `buildspec.yml` in the source code root directory
        &* Best to define a buildspec file in the project description rather than using one loaded out of the repo, as that way devs can't alter unless they have permissions to the codebuild project as well as the code repo
    * Review the build steps being executed, make sure they're not executing anything too crazy
    * Make sure they're not saving secrets, api keys etc in the buildspec
        * Parameter store mappings work well here, if the params in the param store are KMS-encrypted
        * Equally, using the IAM role to access AWS secrets manager or Vault or similar is another good approach
* IAM permissions
    * Review the role attached to the build - it'll need certain permissions to S3 buckets and cloudwatch logs
    * Make sure that the build role's not handed AdministratorAccess or anything equally privileged
    * Review permissions of users and roles who have access to codebuild, make sure it's sensible
    * https://docs.aws.amazon.com/codebuild/latest/userguide/auth-and-access-control-iam-access-control-identity-based.html
    * https://docs.aws.amazon.com/codebuild/latest/userguide/auth-and-access-control-iam-identity-based-access-control.html
    * https://docs.aws.amazon.com/codebuild/latest/userguide/auth-and-access-control-permissions-reference.html
* Build Artefacts
    * These are written to an S3 bucket that is protected by [KMS](./KMS) with a CMK
    * Check S3 bucket and KMS key permissions per their service guides
    * https://docs.aws.amazon.com/codebuild/latest/userguide/security-key-management.html
* Logging/Auditing/Monitoring
    * Cloudtrail to log API calls
    * Build logs should probably be ingested somewhere, so they have logs of individual builds for forensic purposes if required
* VPC Endpoints
    * If any other resources are communicating with codebuild, or codebuild's communicating with other resources, a VPC endpoint should be deployed
    * If communicating with on-prem services, either a site-to-site vpn within the VPC or AWS PrivateLink should be used to ensure traffic security

### Stealing CodeBuild Credentials

You can pass `--debug-session-enabled` to `aws codebuild start-build` to enable debug mode. Doing this causes the CodeBuild executable on the agent to connect to Systems Manager Session Manager for the duration of the build. You can then effectively remotely log into the build container using Systems Manager Session Manager, if you have permissions, and steal the access keys from there. 

## Operational Notes

Any content related to operational considerations (I.E useful to know but not directly to be checked as part of an assessment) goes here. Good examples include how the service interacts with other services within AWS, or common deployment architectures/considerations.

## Exam tips

Any comments specifically related to AWS exams, for instance AWS Certified Security Specialty

## External Links