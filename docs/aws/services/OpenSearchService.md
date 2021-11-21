# OpenSearch Service

#### General Security Notes

| *Service Type* | *Can Pentest* | *Security Focused* | *VPC Endpoint* | *KMS Support*  |
|:---------------|:--------------|:-------------------|:---------------|:---------------|
| ?              | ?             | ?                  | ?              | ?              |


#### IAM Support

| *Resource-level permissions* | *Resource-based policies* | *Service-Linked Roles*  |
|:-----------------------------|:--------------------------|:------------------------|
| ?                            | ?                         | ?                       |


## Service Details

AWS's Managed ElasticSearch / Kibana Instances

## Assessment Notes

### Encryption at rest

* `aws es list-domain-names` - Get list of domains, select the ones you want to investigate

* `aws es describe-elasticsearch-domain --domain-name <domain-name>` - Gets info about the domain

Investigate the options of `EncryptionAtRestOptions`

### Node to node encryption

* `aws es list-domain-names` - Get list of domains, select the ones you want to investigate

* `aws es describe-elasticsearch-domain --domain-name <domain-name>` - Gets info about the domain

Investigate the options of `NodeToNodeEncryptionOptions`

### ElasticSearch version

* `aws es list-elasticsearch-versions` - Gets a list of supported ES versions

* `aws es list-domain-names` - Get list of domains, select the ones you want to investigate

* `aws es describe-elasticsearch-domain --domain-name <domain-name>` - Gets info about the domain

Investigate the contents of `ElasticsearchVersion` and compare against the list of ES version available

### Access policy

* `aws es list-domain-names` - Get list of domains, select the ones you want to investigate

* `aws es describe-elasticsearch-domain --domain-name <domain-name>` - Gets info about the domain

Investigate the options of `AccessPolicies` - look at roles and if they whitelist IP addresses

### Publically accessible

* `aws es list-domain-names` - Get list of domains, select the ones you want to investigate

* `aws es describe-elasticsearch-domain --domain-name <domain-name>` - Gets info about the domain

Investigate the options of `Endpoint` - if present then is accessible publically, if null only accessible via VPC

### Authentication

Check if the ElasticSearch instances are set up to use Cognito, and if so check Cognito configuration per Cognito section. In particular, validate that standard cognito users are not granted admin rights to ElasticSearch.

### Software version

Make sure AWS specific auto upgrades aren't disabled in the console.

## Operational Notes
