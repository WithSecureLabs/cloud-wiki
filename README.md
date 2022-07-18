# Cloud Security Wiki

[![Netlify Status](https://api.netlify.com/api/v1/badges/644e83bc-c87f-4dda-9976-e14f5342f923/deploy-status)](https://app.netlify.com/sites/confident-wilson-c4de9b/deploys)

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](code_of_conduct.md)

# Running Locally

## With an existing NodeJS environment

`npx docusaurus start` from within the root directory of the repo.

## Docker

Run `docker build . -t cloud-wiki` from the root directory of the repo.

Once it is done building, run `docker run -p 3000:3000 --network host --name cloud-wiki -it cloud-wiki`.

The wiki should now be locally accessible on `http://localhost:3000`.
