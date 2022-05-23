# CodeCommit

## Service Details

Git repositories in the cloud.

## Assessment Notes

* Repositories encrypted at rest by default, not user configurable
* Authentication typically managed in one of three ways:
  * Git credentials over HTTPS - <https://docs.aws.amazon.com/codecommit/latest/userguide/setting-up-gc.html>
  * SSH keys over ssh, as you'd expect. These SSH keys are tied to IAM users, normally
  * Temporary access via SAML, role assumption etc - <https://docs.aws.amazon.com/codecommit/latest/userguide/temporary-access.html>
  * Recommendation: SSH keys if IAM users in use, if not then temporary access
* Review cross account access by looking for roles that have permissions to the repo and have cross account access configured in the AssumeRolePolicyDocument
* Access controls applied at the IAM level
  * <https://docs.aws.amazon.com/codecommit/latest/userguide/auth-and-access-control-iam-access-control-identity-based.html>
* Triggers
  * Allow actions to happen off the back of commits being pushed up - lambda functions, SNS notifications etc
  * For each trigger, review what its triggering, make sure it's sane and appropriate access policies are applied

### IAM Notes

The following outlines what (at the time of writing) are the more important IAM permissions for CodeCommit - it excludes anything around reading metadata.

To download the repo contents:

* codecommit:GetBlob
* codecommit:GetFile
* codecommit:GitPull

To alter the contents of the repo:

* codecommit:CreateBranch
* codecommit:CreatePullRequest
* codecommit:DeleteBranch
* codecommit:DeleteCommentContent
* codecommit:DeleteFile
* codecommit:GitPush
* codecommit:MergePullRequestByFastForward
* codecommit:PostCommentForComparedCommit
* codecommit:PostCommentForPullRequest
* codecommit:PostCommentReply
* codecommit:PutFile
* codecommit:UpdateComment
* codecommit:UpdatePullRequestDescription
* codecommit:UpdatePullRequestStatus
* codecommit:UpdatePullRequestTitle

To modify the repository itself:

* codecommit:CancelUploadArchive
* codecommit:CreateRepository
* codecommit:DeleteRepository
* codecommit:PutRepositoryTriggers
* codecommit:TestRepositoryTriggers
* codecommit:UpdateDefaultBranch
* codecommit:UpdateRepositoryDescription
* codecommit:UpdateRepositoryName
* codecommit:UploadArchive

## Operational Notes

Commonly deployed alongside CodePipeline, CodeBuild and CodeDeploy to build an AWS native pipeline

## Exam tips

## External Links

* <https://aws.amazon.com/blogs/devops/secure-aws-codecommit-with-multi-factor-authentication/>
