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
### 1. Create the D1 database 
After running this command it will print out to the terminal the D1 database_id that Cloudflare of the database you are using.

```bash
npx wrangler d1 create appbuilder-container-staging --env staging --binding DB --update-config

```

   * ```--env staging```will push it to the staging web app for Cloudflare it will alo make use of the ```env.staging``` section of your wrangler.jsonc file. If you use the ```--update-config``` parameter it will save your database information to ```env.staging.d1_databases[0]```. 
   * ```--update-config``` will simply save any new information to the config. It may ask you the name of the binding, be sure it is set to DB.

### 2. Set the Worker secrets 

This will save this to .dev.vars and it should not be committed to your fork. That would put this secret into public view and potentially allow a bad actor to login to the /admin of your container app.

  ```bash
npm run set-session-secret -- --env staging   
```
  * Note that you do have to use ```--``` this tells Node to pass the next parameters to our scripts.
   * ```--env staging```will push it to the staging web app for Cloudflare it will alo make use of the ```env.staging``` section of your wrangler.jsonc file.
 * This secret signs the admin session cookies. It will save the key under your .dev.vars file in the value SESSION_SECRET.

### Set your Scriptoria Key

For production you will need your subdomain from Cloudflare. In staging it is preferred that this not be setup.

```bash
npm run set-scriptoria-key -- --env staging 
```
* Note that you do have to use ```--``` this tells Node to pass the next parameters to our scripts.
* ```--env staging```will push it to the staging web app for Cloudflare it will alo make use of the ```env.staging``` section of your wrangler.jsonc file.




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

