# Lambda

## Service Details

* Functions as a service.
* AWS executes code you give it in a (usually) AWS-managed containerized environment.
  * A number of standard runtime environments maintained by AWS
  * Can provide your own as Docker/OCI images
* Called over HTTP through API gateway, or via triggers from other AWS services.
* When executed, AWS spins up a container with the code and runtimes and executes the function.

## Assessment Notes

### Lambda Security Model

#### Isolation

* Each function invocation executes inside a FireCracker MicroVM
* MicroVMs reused between invocation, if still alive. Commonly kept running in a "warm" state for 10/15 minutes after function finishes executing
* Read [Firecracker internals: a deep dive inside the technology powering AWS Lambda](https://www.talhoffman.com/2021/07/18/firecracker-internals/) for a deep dive on the internal security model.

#### Credential Management

* Credentials associated with roles are loaded in as environment variables
* Lambda calls `sts:AssumeRole` under the hood to acquire them, requests for 12 hour validity.
* Credentials are not rotated for the duration of the MicroVM's existence, but [experimentation suggests they live for up to 2 hours if continually invoked](https://www.keithrozario.com/2020/06/access-keys-in-aws-lambda.html).

If you are able to compromise a lambda function, it may be possible to steal these credentials out of lambda, use normal methods to retrieve them. Lambda also uses a data endpoint where the configuration of the function is actually passed to the VM on `http://localhost:9001/2018-06-01/runtime/invocation/next`. Check here for any secrets that have been stored in the code or other configuration.

#### Persistence Inside Lambdas

Maintaining persistence inside a Lambda function you've exploited can be challenging long term, given the short lifespan of any particular instance of a function. The three most common options here are:

* Make repeated requests to a function in an attempt to keep the exploited container alive
* Repeatedly exploit the initial flaw
* Pivot out into the broader AWS environment using the Lambda function's IAM role, by stealing the access keys from the relevant environment variables.

Further information about this topic can be found [here](https://hackingthe.cloud/aws/post_exploitation/lambda_persistence/).

### Configuration review

* Review all IAM policies attached to Lambda roles and ensure they meet principle of least privilege
* The same IAM role shouldn't be shared between Lambda functions requiring different permission sets
* Review Lambda policies, ensure they're configured to restrict who can execute the functions
  * `aws lambda get-policy --region REGION --function-name FUNCTION`
  * Ensure the principal is not `AWS:*` or similar
* Review API gateway resources associated with Lambda functions and ensure there are no extraneous API resources.
* VPC-enabled Lambda functions should be used if they need to access resources inside the VPC
  * `aws lambda get-function --region REGION --query 'Configuration.VpcConfig.VpcId' --function-name FUNCTION`
  * will return null if not in a VPC, a VPC ID if it is
* Review your Lambda functions’ security groups, ensuring they have minimal privilege policies
* Review how your Lambda functions connect to DynamoDB and S3, use VPC-enabled Lambda functions and VPC endpoints where possible
* Where VPC endpoints are used, avoid associating all subnets with VPC endpoints, associate only subnets that need access to required endpoint resources
* Lock down VPC endpoint policies to only allow access to permitted resources
* Are they using [code signing](https://aws.amazon.com/blogs/aws/new-code-signing-a-trust-and-integrity-control-for-aws-lambda/)? Probably not worth it if the project team's not already set up for it, but worth considering as part of long-term security improvements for sensitive environments or highly privileged functions

## Operational Notes

### Lambda URLs

Call Lambdas directly via URL, instead of invoking via an AWS API call or integration with other service.

#### IAM and SCP Configuration

* To prevent an account’s principals from invoking functions via URLs, deny:
  * `lambda:InvokeFunctionUrl`
* To prevent creation of function URL configs altogether, deny:
  * `lambda:CreateFunctionUrlConfig`
  * `lambda:UpdateFunctionUrlConfig`
* The `lambda:FunctionUrlAuthType` policy condition key applies to the above actions and can be used to limit how they're used

This is documented in the AWS documentation at [https://docs.aws.amazon.com/lambda/latest/dg/urls-auth.html#urls-governance](https://docs.aws.amazon.com/lambda/latest/dg/urls-auth.html#urls-governance)

#### Lambda Function Versioning

It's possible to set a particular version of a Lambda function as the version to execute. This allows the version of a function's code to be pinned and only updated when the function is intentionally redeployed. This is often set to `$LATEST`, whatever the newest version of the code uploaded is. [Aidan Steele wrote a great blog](https://awsteele.com/blog/2020/12/24/aws-lambda-latest-is-dangerous.html) explaining why `$LATEST` is a bad idea from a security perspective.

## External Links

* <https://d1.awsstatic.com/whitepapers/Overview-AWS-Lambda-Security.pdf>
* <https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html>
* <https://www.puresec.io/blog/aws-lambda-security-quick-guide>
* Gone in 60 Milliseconds - Rich Jones
  * <https://lab.dsst.io/slides/33c3/slides/7865.pdf>
  * <https://media.ccc.de/v/33c3-7865-gone_in_60_milliseconds>
* [Access Keys in Lambda Functions](https://www.keithrozario.com/2020/06/access-keys-in-aws-lambda.html)
