# Cloud Security Wiki

[![Netlify Status](https://api.netlify.com/api/v1/badges/644e83bc-c87f-4dda-9976-e14f5342f923/deploy-status)](https://app.netlify.com/sites/confident-wilson-c4de9b/deploys)

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

This is the git repository containing the source for [https://secwiki.cloud](https://secwiki.cloud), a cloud security knowledge base curated by the cloud security team at WithSecure. Secwiki.cloud is intended to be an open cloud security knowledge base, covering both defensive and offensive topics across most common cloud platforms and cloud-adjacent tooling. It's been built following a set of core principles:

* Summarize and cite, don't compete - we credit/cite any existing research on a topic, and wherever possible, we reference content elsewhere rather than reinventing the wheel.
* Update little and often - it's often hard to find time to make substantial additions and improvements, but lots of little contributions add up fast
* Make it easy to consume and use - we bias towards easy-to-skim content formats, making extensive use of bullets, tables and other similar styles to break the content up and make it easier to find what you need quickly.

## Contributing

We welcome any and all positive contributions from everyone in the community, from small fixes and improvements to submissions for whole services. Before you contribute, there are a few things to be aware of:

* The contents of the repository are licensed under [Apache 2.0](https://github.com/WithSecureLabs/cloud-wiki/blob/main/LICENSE.md), and your contributions will be too.
* We've put together a [contribution guide](https://github.com/WithSecureLabs/cloud-wiki/blob/main/src/pages/contributing.md) to help keep the content consistent when people contribute significant changes. Please review this before submitting significant improvements.
* We expect contributors to follow the [Code of Conduct](https://github.com/WithSecureLabs/cloud-wiki/blob/main/CODE_OF_CONDUCT.md) when interacting with other users and repository maintainers in issues, merge requests and so on.

You do not need to be able to run the site locally to contribute to the repository. You can make edits and create new pages directly from GitHub. Simply browse to the file you'd like to edit, or the directory you'd like to add a new file to, and click "Add File" above the code browser. GitHub will then open the built-in Markdown editor, and you can submit your pull request from there. That said, if you are making significant changes, you may find it easier to validate your work locally before pushing, per the instructions below.

## Running Locally

The wiki is built on [Docusaurus](https://docusaurus.io/). You'll need `node` and `npm` installed as prerequisites. Once you have node set up, to run the wiki locally:

* `git clone git@github.com:WithSecureLabs/cloud-wiki.git`
* `npm install`
* `npm start`

## Contributors

We maintain a list of content contributors on the home page. We do our best to update it periodically, but if you've made contributions and wish to be added to that list before we get to it, please just open another pull request and add your GitHub username and a Twitter handle, if you have one, to the table of contributors in the [home page](docs/home.md).
