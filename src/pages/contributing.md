# Contributing

import Link from '@docusaurus/Link';

Thank you for considering contributing to this knowledge base! We welcome all input from the community.  If you'd like to contribute but aren't sure where to start, pick an open issue from the GitHub repository on a topic you know something about and begin work there.

The contribution process is as follows:

* Fork the repository
* Make your changes to the appropriate files under `/docs`, following the style guide below where possible.
* Open a merge request, and fill in the merge template

Drop Nick Jones, Christian Philipov or Mohit Gupta a line on the Cloud Security Forum Slack workspace, or Twitter, if you have questions or need some support.

## Code of Conduct

All contributors must follow our [code of conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

## Style Guide

This style guide exists to inform the creation and amendment of articles in the cloud wiki. This will help:

* ensure consistency when creating articles
* inform the minimum content for a given article

Not all services are the same, some just aren't very security-relevant, or are small, focused and don't allow lots of options. For instance:

* A page for AWS Marketplace could not really have the same level of detail as that of AWS EC2.
* Azure Backups, although an important service, will not have the same amount of content as Azure AD.

The purpose of this wiki is to support cloud security professionals in their work, and is intended to serve as a reference rather than a location for blog-style content. For this purpose we encourage that article writing:

* be factually accurate, grammarly correct and professional
* biases towards easy-to-skim content formats, making extensive use of bullets, tables and other similar styles to break the content up and make it easier to read.
* presents facts and the topic in a light, concise yet more descriptive (where relevant), easy-to-follow, informal even, fashion.
  * this would logically apply better to the larger, core topics which would require more extensive articles.

### Template guidelines for the "minimalistic" style service pages

Below is a table defining for what would constitute the absolute _bare minimum_ a service page should contain, for it to be considered for publication (most of you will already be familiar with this):

| Authorization type            | Notes                                                                                                                                                                                                                                                                                                                    |
| :---------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Title                         |                                                                                                                                                                                                                                                                                                                          |
| Service Details / Description | Brief introduction to the service, what it is, what it does. Is it based on/related to any other service(e.g. Azure Blobs - part of Azure Storage Accounts)? Anything else related to the service that could provide better understanding.                                                                               |
| Assessment Notes              | Fill in with specific things to check for as part of a security assessment. Where possible, include specific, actionable instructions on how to verify (where in the web console to check, which CLI commands to run etc).                                                                                               |
| Operational Notes             | Any content related to operational considerations (I.E useful to know but not directly to be checked as part of an assessment) goes here. Good examples include how the service interacts with other services within the relevant cloud provider, or common deployment architectures/considerations.                     |
| External Links                | Relevant resources for learning/dealing with this service. Could either point to relevant official cloud provider documentation pages, or any articles/blogs presenting techniques, vulnerabilities or any other test-aiding material. Helpful to have as well for inclusion in reports' "Further Information" sections. |

* Make use of subheadings wherever relevant, to ensure presentation clarity and logical separation of topics; this would be most relevant in the "Assessment Notes" section
* Aim at presenting the content under the form of concise statements, making use of bullet points and clear examples
* Ensure, at minimum, a degree of structure and professionalism for the content presented
  * Do not leave it as a pure brain dump/excessively notes-like and scarce, difficult to make much sense of for anyone who's not the author
  * Be mindful these needs to be helpful at all times, both for people already familiar with the topic, but especially for someone performing testing for the very first time, too

### Guidelines for the "larger" service pages

Now, for the topics that would definitely end up turning into a bigger article, you could apply the things discussed earlier. The key objectives with these larger articles are to:

* Keep the reader interested, while also..
* Allow them to still find the facts they're looking for
* Find them with ease

It is essential that these articles continue to serve their purpose of providing the relevant information about the service, actions to be taken during testing, and things to be on the lookout for.

* Include more comprehensive descriptions about the service in question, referencing bits of information that could actually be useful:
  * to better understand the service and how it operates, or if there are multiple areas of it, how they interoperate
  * trivial aspects of it, areas that have changed over time and might be relevant during testing or for the recommendations to be given
  * elements that might interest the client, lesser-known areas/features useful in discussions with them
* Continue using bullet point-style statements for clear and simple information
  * We don't want to make a service page pointlessly overly-descriptive
  * Also helps break the flow when reading
* Make use of tables, images, or any other medium that can help better drive across/highlight the bits that are beign discussed
* Include any interesting information from experiences on engagements
* Huge topics such as IAM, or Azure Storage Accounts, which might have multiple services contributing to them, are better structured to:
  * Be presented in a general page discussing the service, perhaps written in the "larger article" style
    * it can mention and briefly give information about relevant related services
    * describe how these interact with each other, "building up" the main service/topic of discussion
  * Still have separate pages for each of the services that make it up, going into details there, rather than overfilling the main service page

### Examples

Check the pages for [Azure MFA](azure/assessment-guide/service-guides/Azure_MFA) and [AWS KMS](aws/assessment-guide/service-guides/KMS) for examples of "larger" articles.

* The former is a great example of the maximum length, descriptiveness and informal style that coudl/should be present
* The latter is a bit less descriptive and it's even more bullet-to-the-pointy, yet also conveying the idea of structure that we're aiming at

For an idea of a complete article of the "minimalistic" kind, have a look at [AWS CloudTrail](aws/assessment-guide/service-guides/CloudTrail) instead. This shows the minimum info we should aim at having in an article that's not _that_ big requiring too much explanation.
