# Deploying the container app

There are two deployment targets available to you on Cloudflare.

1. [staging](staging.md), is intended to test features and other items
2. [production](production.md), is intended to be the actual site you use to deploy for the container app

## Determining which deployment you need

This basically boils down to these questions:

- Are you needing to test something or understand how it works? -> staging
- Do you need practice deploying it before it is in a real environment? -> staging
- Are you ready to serve your Bible apps in a container app? -> production

More then likely the answer you are searching for is **you need it in production**.

## Deployment structure

Deploy targets are defined in `wrangler.jsonc` under `env.staging` and
`env.production`. Each is a separate Worker (`appbuilder-container-staging` or `appbuilder-container-production`) with its own D1 database and secrets. The steps below are for
**staging**; production are essentially the same with a change to the  `--env` with either `staging` or `production` and its own
database, secrets, and origin.

For local development and the route list, see [`local_dev.md`](./local_dev.md).

If you are using [Volta](https://volta.sh/) then the installation process of Node should be handled fairly easily. For example:

```bash
volta install node@22.23.1
```

## Prerequisites

- Node 22.23.1
- Run `npm install`
- A Cloudflare account with Workers + D1, and the CLI authenticated:

  ```bash
  npx wrangler login
  ```

  ```bash
  npm run setup:deploy
  ```

Then choose the instructions you need based on [staging](staging.md) or [production](production.md).
