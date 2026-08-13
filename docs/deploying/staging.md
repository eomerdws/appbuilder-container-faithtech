# Deploying your container app to staging

For staging the service so that you can test features for development or for just seeing if the look and fill is a good fit.

## Prerequisites

- Node 22.23.1
- Run `npm install`
- A Cloudflare account with Workers + D1, and the CLI authenticated:

  ```bash
  npx wrangler login
  ```

## Staging Deployment

### 1. Create the D1 database

This command's main goal is to create your database on Cloudflare. This is a [SQLite database](https://sqlite.org/).
After running this command it will print out to the terminal the D1 database_id that Cloudflare has assigned to the database that you will be using.

```bash
npx wrangler d1 create appbuilder-container-staging --env staging --binding DB --update-config
```

- ```--env staging```will push it to the staging web app for Cloudflare it will alo make use of the ```env.staging``` section of your wrangler.jsonc file. If you use the ```--update-config``` parameter it will save your database information to ```env.staging.d1_databases[0]```.
- ```--update-config``` will simply save any new information to the config. It may ask you the name of the binding, be sure it is set to DB.

### 2. Set the Worker secrets

This set of commands will save two secrets (session secret and your scriptoria api key) to .dev.vars and it should not be committed to your fork. That would put both secrets into public view and potentially allow a bad actor to login to the /admin of your container app or host their own apps on your page.

#### Set your Session Secret

  ```bash
npm run set-session-secret -- --env staging   
```

- Note that you do have to use ```--``` this tells Node to pass the next parameters to our scripts.
- ```--env staging```will push it to the staging web app for Cloudflare it will alo make use of the ```env.staging``` section of your wrangler.jsonc file.
- This secret signs the admin session cookies. It will save the key under your .dev.vars file in the value SESSION_SECRET.

#### Set your Scriptoria Key

For production you will need your subdomain from Cloudflare. In staging, it is preferred that that you not setup a Scriptoria Key. However, if you need it for testing you can add `--url [url]` replacing `[url]` with your Cloudflare URL.

```bash
npm run set-scriptoria-key -- --env staging 
```

- Note that you do have to use ```--``` this tells Node to pass the next parameters to our scripts.
- ```--env staging``` will push it to the staging web app for Cloudflare it will also make use of the ```env.staging``` section of your wrangler.jsonc file.

### 3. Apply migrations to the remote D1 database

This step and command actually setup the tables and their relationships.

```bash
npm run db:migrate:staging 
```

### 4. Deploying to Cloudflare

```bash
npm run deploy:staging
```

This command now deploys your container app to `→ https://appbuilder-container-staging.<your-subdomain>.workers.dev`. Note that you will have to replace `<your-subdomain>` with whatever your subdomain.

- How to find your subdomain is in [Get Cloudflare URL](#get-cloudflare-url)
- You may also want to [create an administrator user](#create-an-administrator-account) so you can login into the /admin section.

## Helpful Information

## Get Cloudflare URL

There are several places you can get the url of your site. The best is from Cloudflare.
Login | Go to Compute | Workers & Pages
You should see something like this. If the first one is not there the subdomain on the right will be. the full link will be <https://appbuilder-container-staging>.<your-subdomain>.workers.dev.

NOTE: If you need to change your subdomain do it before you run set-scriptoria-key.

![Workers & Pages](../assets/appname_subdomain.png)

## Create an administrator account

To setup your admin account because the database starts
empty, so `/admin` has no one to sign in as until you insert a credential.

### Recommended method: `npm run create-admin`

This command hashes the password and inserts the administrator row into the
**remote** D1 in one step:

```bash
npm run create-admin -- --env staging --email you@example.org --password "your-admin-password" --name "Display Name"
```

- Note that you do have to use ```--``` this tells Node to pass the next parameters to our scripts.
- ```--env staging``` will push it to the staging web app for Cloudflare it will also make use of the ```env.staging``` section of your wrangler.jsonc file.
- `--email` is required as it is your username.
- `--password` Quotes are optional.
- `--name` is optional. This is simply your display name.
- Prints the generated administrator `id` on success.

### Manual method

If you'd rather generate the hash and run the insert SQL command yourself, generate a
password hash:

```bash
npm run hash:password -- "your-admin-password"
```

This will print out your password has as follows `→ pbkdf2$100000$<salt>$<hash>`, the salt and hash will be long generated text and numbers.

Then insert the administrator row into the **remote** D1 (use the hash above and
the current UTC timestamp for the date columns):

```bash
npx wrangler d1 execute DB --remote --env staging --command \
  "INSERT INTO administrators (id,email,display_name,password_hash,disabled,created_at,updated_at)
   VALUES ('admin-1','you@example.org','You','pbkdf2\$100000\$<salt>\$<hash>',0,datetime('now'),datetime('now'))
```

Be sure to replace the following variables
----------------------------------------

| value       | With                    |
| -------|---------------|
| 'admin-1'| 'UUID' (can be generated from [UUIDGenerator](https://www.uuidgenerator.net))|
| '<you@example.org>'| 'your email address'|
| 'You'| 'Your Display Name'|
|'pbkdf2\$100000\$<salt>\$<hash>'| Hash from the previous command (npm run hash:password)|
