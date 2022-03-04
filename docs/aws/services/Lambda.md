# Lambda

## Service Details

* Functions as a service
* Called over HTTP through API gateway, or via triggers from other AWS services
* When executed, AWS spins up a container with the code and runtimes and executes the function

## Assessment Notes

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
* Lock down VPC endpoint policies to only permitted actions or resources

## Operational Notes

Any content related to operational considerations (I.E useful to know but not directly to be checked as part of an assessment) goes here. Good examples include how the service interacts with other services within AWS, or common deployment architectures/considerations.

## External Links

* https://d1.awsstatic.com/whitepapers/Overview-AWS-Lambda-Security.pdf
* https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html
* https://www.puresec.io/blog/aws-lambda-security-quick-guide
* Gone in 60 Milliseconds - Rich Jones
    * https://lab.dsst.io/slides/33c3/slides/7865.pdf
    * https://media.ccc.de/v/33c3-7865-gone_in_60_milliseconds