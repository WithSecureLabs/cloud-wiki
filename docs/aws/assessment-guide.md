# Assessment Guide

## General Approach

* Book a kick off call, meeting or similar with the project team for them to run through the architecture with you, highlight any expected privileged IAM accounts and what they're for, get details on any particular concerns they have. This should ideally be the first thing you do.
* Run the automated audit tools - Scoutsuite and Prowler
* Run cloudmapper, first in collect mode and then in audit mode. It provides a useful snapshot of some of the environment if we have to come back to it later
* Do an IAM user/role/policy review
  * Best to do this early, to leave time to talk through your results with project team if needed as a lot of this is contextual.
  * Tools that can help with this:
    * PMapper
    * Cartography
    * awspx
* After that, cover off the resources deployed by the project team into the environment. As part of every assessment, cover (at a bare minimum):
  * IAM
  * KMS
  * Cloudtrail - one should always be enabled per the service guide here
  * GuardDuty - this should always be enabled in every region in every account, per the service guide here
  * Config, if enabled
  * Security Hub, if deployed
  * VPC

## Service Specific Guides

You'll find guidance for specific services in the AWS Service Guides category in the menu to the left.