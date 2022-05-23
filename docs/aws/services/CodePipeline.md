# CodePipeline

## Service Details

Service for tying together multiple build steps into a pipeline.

## Assessment Notes

* Build worker
  * Can be CodeBuild or Jenkins
  * See assessment guides for those elsewhere in the wiki
* Source stage
  * Review where the source is being pulled in from, ensure that access controls around that are suitable
  * Review how access to the source code is being provided to the pipeline, ensure that's being managed sensibly
* Access control
  * Review iam users/roles who have access to manipulate the pipeline
    * If the environment uses a continuous delivery model, review those able to trigger the pipeline as well
* Environment separation
  * It's a good idea to keep pipelines for different environments separate
  * Consider a CI/CD account that the pipelines run in, using cross-account role assumption to access resources in dev/staging/prod accounts
  * Consider using output from one pipeline as input to the next, via an S3 bucket - that way, code can't make it to staging without going through dev, or to prod without going through staging etc

## Operational Notes

## Exam tips

## External Links

<https://d1.awsstatic.com/whitepapers/DevOps/practicing-continuous-integration-continuous-delivery-on-AWS.pdf>
