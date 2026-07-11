
# SvelteKit Cloudflare Worker Application

A SvelteKit application deployed as a **Cloudflare Worker** using the official SvelteKit Cloudflare adapter.

This project uses SvelteKit for the application framework and Cloudflare Workers as the serverless runtime.

---

## Technology Stack

- **SvelteKit** - Full-stack web application framework
- **Svelte** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Build tooling
- **Cloudflare Workers** - Serverless deployment runtime
- **Wrangler** - Cloudflare CLI deployment tool
- **@sveltejs/adapter-cloudflare** - SvelteKit Cloudflare Worker adapter

---

# Project Creation

## 1. Create the SvelteKit Application

The project was created using the official Svelte CLI:

```bash
npx sv create <project-name>



#SvelteKit
# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.16.2 create --template minimal --types ts --install npm scriptoria-poller
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
