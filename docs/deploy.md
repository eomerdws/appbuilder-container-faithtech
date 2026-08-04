# Deploying the container app

There are two deployment targets available to you on Cloudflare.

1. staging, it is intended to test features and other items
2. production, it is intended to be the actual site you use to deploy for the container app

Deploy targets are defined in `wrangler.jsonc` under `env.staging` and
`env.production`. Each is a separate Worker (`appbuilder-container-staging` /
`-production`) with its own D1 database and secrets. The steps below are for
**staging**; production is the same with `--env production` and its own
database, secrets, and origin.

For local development and the route list, see [`running.md`](./running.md).

## Prerequisites

- Node 22.23.1
- Run `npm install`
- A Cloudflare account with Workers + D1, and the CLI authenticated:

  ```bash
  npx wrangler login
  ```

## Staging deploy

```bash
# 1. Create the D1 database — prints the real database_id
npx wrangler d1 create appbuilder-container-staging --env staging --binding DB --update-config
#   --env staging will ensure when it is written to wrangler.jsonc that it saves 
#   the database information to env.staging.d1_databases[0]. 
#   --update-config will simply update the config. It may ask you the name of the 
#   binding, be sure it is set to DB.

# 1b. Create the R2 bucket for admin-uploaded hero background images
npx wrangler r2 bucket create appbuilder-container-hero-images-staging
#   Unlike `wrangler d1 create`, this has no --update-config flag — the
#   env.staging.r2_buckets entry (binding HERO_IMAGES) is already present in
#   wrangler.jsonc.example; just confirm the bucket_name here matches it.

# 2. Set the Worker secrets (never committed). Use DIFFERENT secrets for
#    staging and production.
npm run set-session-secret -- --env staging   # generates + sets SESSION_SECRET
#    Signs admin session cookies. Never printed — nothing outside this
#    Worker needs it, unlike SCRIPTORIA_API_KEY below.

npm run set-scriptoria-key -- --env staging --url https://appbuilder-container-staging.<your-subdomain>.workers.dev   # generates + sets SCRIPTORIA_API_KEY

#    Prints the value once at the end — that's what you send to your
#    Scriptoria build-engine operator (see "Wire up the Scriptoria
#    notification" below). It can't be retrieved again after this.

```

There are several places you can get your site. The best is from Cloudflare.
Login | Goto Compute | Workers & Pages
You should see something like this. If the first one is not there the subdomain on the right will be. the full link will be <https://appbuilder-container-staging>.<your-subdomain>.workers.dev.

NOTE: If you need to change your subdomain do it before you run set-scriptoria-key.

![Workers & Pages](assets/appname_subdomain.png)

```bash

# 3. Apply migrations to the remote D1 database
npm run db:migrate:staging 

# 4. Deploy — the output prints the Worker URL
npm run deploy:staging
#    → https://appbuilder-container-staging.<your-subdomain>.workers.dev
```

On minor changes you can use `npm run deploy:staging:full`.

## Create an administrator

To setup your admin account because the database starts
empty, so `/admin` has no one to sign in as until you insert a credential.

### Recommended method: `npm run create-admin`

This hashes the password and inserts the administrator row into the
**remote** D1 in one step:

```bash
npm run create-admin -- --env staging --email you@example.org --password "your-admin-password" --name "Display Name"
```

- `--name` is optional.
- Prints the generated administrator `id` on success.

### Manual alternative

If you'd rather generate the hash and run the insert yourself, generate a
password hash:

```bash
npm run hash:password -- "your-admin-password"
# → pbkdf2$100000$<salt>$<hash>
```

Then insert the administrator row into the **remote** D1 (use the hash above and
the current UTC timestamp for the date columns):

```bash
npx wrangler d1 execute DB --remote --env staging --command \
  "INSERT INTO administrators (id,email,display_name,password_hash,disabled,created_at,updated_at)
   VALUES ('admin-1','you@example.org','You','pbkdf2\$100000\$<salt>\$<hash>',0,'2026-07-12T00:00:00Z','2026-07-12T00:00:00Z')"
```

## Production

Repeat the whole flow with the production environment — a separate database,
separate secrets, and its own origin:

```bash
npx wrangler d1 create appbuilder-container-production --env production --binding DB --update-config
npx wrangler r2 bucket create appbuilder-container-hero-images-production
npm run set-session-secret -- --env production
npm run set-scriptoria-key -- --env production --url https://appbuilder-container-production.<your-subdomain>.workers.dev   # generates + sets SCRIPTORIA_API_KEY
npm run db:migrate:production
npm run deploy:production
npm run create-admin -- --env production --email you@example.org --password "your-admin-password" --name "Display Name"
```

Send the endpoint.json file to the Scriptoria team (next section).

On future minor changes you can use `npm run deploy:production:full`.

## Setup the Scriptoria notification

You will need an endpoint.json file. To verify that one has been generated for you and
contains the correct information use `npm run verify:endpoint -- --url <your production url>`

It will then examine your various config and generate the endpoint.json file at the root of the project. This should be ignored by git and should not be committed to your fork of the project.

Once you have this file send it to the Scriptoria team to setup.

NOTE: If you use `npm run set-scriptoria-key` command after this then you would need to run the verify:endpoint command again and send the file to the Scriptoria team.

## Rollback

`wrangler deploy` keeps prior versions. Roll back from the Cloudflare dashboard
(Workers → the Worker → Deployments → roll back), or redeploy a known-good commit.
Migrations are forward-only — never edit an applied migration; add a new numbered
one instead.
