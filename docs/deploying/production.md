# Deploying your container app to production

## Prerequisites

- Node 22.23.1
- Run `npm install`
- A Cloudflare account with Workers + D1, and the CLI authenticated:

  ```bash
  npx wrangler login
  ```

## Production Deployment

Production is where you should run your production container app server. This is where Scriptoria will send events to, this is where you will add the packages for your Scripture, and this is where your users will come to download Scripture on their iOS device for your container app.

### 1. Create the D1 database

This command's main goal is to create your database on Cloudflare. This is a [SQLite database](https://sqlite.org/).
After running this command it will print out to the terminal the D1 database_id that Cloudflare has assigned to the database that you will be using.

```bash
npx wrangler d1 create appbuilder-container-production --env production --binding DB --update-config 
```

- ```--env production```will push it to the production web app for Cloudflare it will alo make use of the ```env.production``` section of your wrangler.jsonc file. If you use the ```--update-config``` parameter it will save your database information to ```env.production.d1_databases[0]```.
- ```--update-config``` will simply save any new information to the config. It may ask you the name of the binding, be sure it is set to DB.

### 2. Set the Worker secrets

This set of commands will save two secrets (session secret and your scriptoria api key) to .dev.vars and it should not be committed to your fork. That would put both secrets into public view and potentially allow a bad actor to login to the /admin of your container app or host their own apps on your page.

#### Set your Session Secret

```bash
npm run set-session-secret -- --env production
```

- Note that you do have to use ```--``` this tells Node to pass the next parameters to our scripts.
- ```--env production```will push it to the production web app for Cloudflare it will alo make use of the ```env.production``` section of your wrangler.jsonc file.
- This secret signs the admin session cookies. It will save the key under your .dev.vars file in the value SESSION_SECRET.

#### Set your Scriptoria Key

For production you will need your subdomain from Cloudflare. You will need to replace <your-subdomain> with your subdomain. To find it look at the section titled [Get Cloudflare URL](#get-cloudflare-url) there you will find your subdomain. It will be highlighted in red.

```bash
npm run set-scriptoria-key -- --env production --url https://appbuilder-container-production.<your-subdomain>.workers.dev  
```

This step if you use the `--url` parameter the script will create an `endpoint.json`. Please do not commit this file as it will have your token in it.

Please [create a ticket](https://sil-appbuilder.freshdesk.com/support/tickets/new). Be sure to:

- Select the type as "Scriptoria"
- Attach the generated endpoint.json file. It will be generated at the root of the project.

### 3. Apply migrations to the remote D1 database

This step and command actually setup the tables and their relationships.

```bash
npm run db:migrate:production 
```

### 4. Deploying to Cloudflare

This command now deploys your container app to `→ https://appbuilder-container-production.<your-subdomain>.workers.dev`. Note that you will have to replace `<your-subdomain>` with whatever your subdomain.

```bash
npm run deploy:production
```

- How to find your subdomain is in [Get Cloudflare URL](#get-cloudflare-url)
- You may also want to [create an administrator user](#create-an-administrator-account) so you can login into the /admin section.

# Helpful information

## Create an administrator account

To setup your admin account because the database starts
empty, so `/admin` has no one to sign in as until you insert a credential.

### Recommended method: `npm run create-admin`

This command hashes the password and inserts the administrator row into the
**remote** D1 in one step:

```bash
npm run create-admin -- --env production --email you@example.org --password "your-admin-password" --name "Display Name"
```

- Note that you do have to use ```--``` this tells Node to pass the next parameters to our scripts.
- ```--env production``` will push it to the production web app for Cloudflare it will also make use of the ```env.production``` section of your wrangler.jsonc file.
- `--email` is required as it is your username.
- `--password` Quotes are optional.
- `--name` is optional. This is simply your display name.
- Prints the generated administrator `id` on success.

## Get Cloudflare URL

There are several places you can get the url of your site. The best is from Cloudflare.
Login | Go to Compute | Workers & Pages
You should see something like this. If the first one is not there the subdomain on the right will be. the full link will be <https://appbuilder-container-production>.<your-subdomain>.workers.dev.

NOTE: If you need to change your subdomain do it before you run set-scriptoria-key.

![Workers & Pages](../assets/appname_subdomain.png)

## Setup the Scriptoria notification

You will need an endpoint.json file. To verify that one has been generated for you and
contains the correct information use `npm run verify:endpoint -- --url <your production url>`

It will then examine your various config and generate the endpoint.json file at the root of the project. This should be ignored by git and should not be committed to your fork of the project.

Once you have this file send it to the Scriptoria team to setup.

NOTE: If you use `npm run set-scriptoria-key` command after this then you would need to run the verify:endpoint command again and send the file to the Scriptoria team.
