# API Gateway

## Service Details

Amazon API Gateway (API GW) helps developers to create and manage APIs to back-end systems running on Amazon EC2, AWS Lambda, or any publicly addressable web service. With Amazon API Gateway, you can generate custom client SDKs for your APIs, to connect your back-end systems to mobile, web, and server applications or services.

API GW supports multiple endpoint types:

- HTTP API
- WebSocket API
- REST API
- REST API

Certain API endpoint types have different configuration available. For example, a REST API can be authenticated with IAM but an HTTP API can't. This article will generalize assessment and operational notes to try and avoid confusion. However, each endpoint type should be validated against its specific configuration.

## Assessment Notes

- Integrations are what an API triggers upon invocation, for example an HTTP API may trigger a Lambda function. Care should be taken to make sure any downstream invocations are not exploitable in some way.
- CloudTrail can be used to monitor API's that are invoking Lambda functions etc. In addition, CloudWatch support for other types of API level logging is available.
- If the gateway is intended to be behind an elastic load balancer or internal, then `endpointConfiguration`-> `types` should say `PRIVATE`
- Ensure any resource based policies that are applied to an API is secure, ensure condition checks are in place.

## Operational Notes

- It's possible to stage changes to any API and publish changes when ready.

### Request Throttling

Requests to API GW are throttled by default to prevent abuse.

- 10,000 requests per second (RPS) per gateway.
- 5,000 request burst limit that applies across all APIs within an account.
- Returns 429 Too Many Requests error response when exceeded.
- Can be increased on request (to AWS support or via Service Quotas).

![image](/img/api_gw_throttle.png)

### Caching

API GW supports caching to reduce hits on API.

- Default cache time is 300 seconds
- Max 3600 seconds (1 hour)
- TTL=0 means caching disabled

### Authentication

- Resource based policies are supported in API GW, take care when configuring these and always enforce conditional checks.
- Private API's can only be called from within the VPC.
- API keys are supported for API's hosted in API GW.
- Amazon Cognito user pools can be used for API auth.

### API GW Authorizers

Authorizers provide the ability to authenticate users/systems with an API endpoint via a Lambda function or Cognito user pool. API GW will create a resource policy based on the chosen function or user pool.

When a client makes a request to one of your API's methods, API Gateway calls your Lambda authorizer, which takes the caller's identity as input and returns an IAM policy as output.

There are two types of Lambda authorizers:

- A token-based Lambda authorizer (also called a TOKEN authorizer) receives the caller's identity in a bearer token, such as a JSON Web Token (JWT) or an OAuth token.
- A request parameter-based Lambda authorizer (also called a REQUEST authorizer) receives the caller's identity in a combination of headers, query string parameters, stageVariables, and `$context` variables.

### Networking

- API GW does not support HTTP endpoints, all will be HTTPS by default.
- Fully integrates with AWS WAF for endpoint protection.
- VPC endpoints are available for private API's.
- Cross-origin resource sharing (CORS) support for custom domains.

#### Custom Domain Names

Custom domain names can be created directly in API GW. An SSL certificate must exist with the `us-east-1` region which matches the domain name.

- TLS will be enabled by default (1.2). However, TLS 1.0 can be used for REST API's.

![image](/img/api_gw_domain_name.png)

### Data Security

- REST API caching can be encrypted.
- To ensure HTTP requests to your back-end services are originating from API Gateway, you can use Client Certificates to verify the requester's authenticity.
- Support for TLS TLS-1-0 and TLS-1-2. Aim to use the latest available where possible.  
- All endpoints are HTTPS by default.

## External References

- API Gateway developer guide [https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html)
