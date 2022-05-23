# Atlantis

Service that allows triggering of terraform plan/apply commands via webhooks, typically from merge request approvals in Gitlab/Github etc.

Website and documentation can be found at [https://www.runatlantis.io](https://www.runatlantis.io).

## Attack Surface

The Atlantis web interface is read only, with all configuration performed with environment variables or .yml files stored on the server. It is triggered by an external service (such as github) calling a webhook. Per-repository configuration is performed via an `atlantis.yml` file stored in the repository's root directory, details of which can be found at <https://www.runatlantis.io/guide/atlantis-yaml-use-cases.html>

## Code Execution Through Merge Requests

Running `terraform init` and `terraform plan` on untrusted code can lead to code execution through use of a malicious custom terraform provider. An attacker able to open a merge request on a repository configured with Atlantis would be able to execute arbitrary code on the system running Atlantis, and thus access any credentials etc stored on or accessible from the system.

Alex Kaskasoli put a good article together on the details here: [https://alex.kaskaso.li/post/terraform-plan-rce](https://alex.kaskaso.li/post/terraform-plan-rce)
