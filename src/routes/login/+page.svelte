<script lang="ts">
  import { superForm } from "sveltekit-superforms";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  // The form intentionally initializes once from the server-loaded page data.
  // svelte-ignore state_referenced_locally
  const { form, errors, message, enhance, submitting } = superForm(data.form);
</script>

<svelte:head><title>Administrator sign in</title></svelte:head>

<section class="login-panel" aria-labelledby="login-title">
  <div class="login-intro">
    <p>Administrator access</p>
    <h1 id="login-title">Welcome back</h1>
    <span>Sign in to review and manage Scripture packages.</span>
  </div>

  {#if data.isLocal}
    <aside class="dev-login" aria-label="Local development login">
      <strong>Local development login</strong>
      <code>admin@example.invalid</code>
      <code>demo-password-123</code>
      <small>Run <code>npm run db:seed:dev</code> once before signing in.</small>
    </aside>
  {/if}

  <form method="post" use:enhance>
    {#if $message}
      <p class="form-message" role="alert">{$message}</p>
    {/if}

    <label>
      <span>Email address</span>
      <input
        type="email"
        name="email"
        autocomplete="username"
        bind:value={$form.email}
        aria-invalid={$errors.email ? "true" : undefined}
        required
      />
      {#if $errors.email}<small class="field-error">{$errors.email}</small>{/if}
    </label>

    <label>
      <span>Password</span>
      <input
        type="password"
        name="password"
        autocomplete="current-password"
        bind:value={$form.password}
        aria-invalid={$errors.password ? "true" : undefined}
        required
      />
      {#if $errors.password}<small class="field-error">{$errors.password}</small>{/if}
    </label>

    <button type="submit" disabled={$submitting}>
      {$submitting ? "Signing in…" : "Sign in"}
    </button>
  </form>

  <a href="/" class="catalogue-link">← Return to the public catalogue</a>
</section>

<style>
  .login-panel {
    width: min(100%, 27rem);
    border: 1px solid #303844;
    border-radius: 1.4rem;
    background: rgb(20 25 31 / 94%);
    padding: clamp(1.4rem, 5vw, 2.25rem);
    box-shadow: 0 2rem 6rem rgb(0 0 0 / 35%);
  }

  .login-intro p {
    margin: 0 0 0.4rem;
    color: var(--blue);
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .login-intro h1 {
    margin: 0;
    font-size: 2.2rem;
    letter-spacing: -0.04em;
  }

  .login-intro > span {
    display: block;
    margin-top: 0.4rem;
    color: var(--muted);
  }

  .dev-login {
    display: grid;
    gap: 0.25rem;
    margin-top: 1.4rem;
    border: 1px solid rgb(120 180 255 / 28%);
    border-radius: 0.8rem;
    background: rgb(120 180 255 / 7%);
    padding: 0.9rem;
  }

  .dev-login strong {
    margin-bottom: 0.25rem;
    font-size: 0.78rem;
  }

  .dev-login code {
    color: #b8d8ff;
    font-size: 0.74rem;
  }

  .dev-login small {
    margin-top: 0.35rem;
    color: #7f8998;
    line-height: 1.45;
  }

  form {
    display: grid;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  label,
  label > span {
    display: grid;
    gap: 0.45rem;
  }

  label > span {
    color: #c5cbd4;
    font-size: 0.82rem;
    font-weight: 700;
  }

  input {
    width: 100%;
    min-height: 3.1rem;
    border: 1px solid #3a4451;
    border-radius: 0.75rem;
    background: #0f1318;
    color: #fff;
    padding: 0 0.9rem;
  }

  input[aria-invalid="true"] {
    border-color: #ff7883;
  }

  .field-error,
  .form-message {
    color: #ff9da5;
    font-size: 0.75rem;
  }

  .form-message {
    margin: 0;
    border-radius: 0.65rem;
    background: rgb(255 110 121 / 10%);
    padding: 0.75rem;
  }

  form button {
    min-height: 3.2rem;
    border: 0;
    border-radius: 0.8rem;
    background: var(--blue);
    color: #061322;
    font-weight: 850;
    cursor: pointer;
  }

  form button:disabled {
    cursor: wait;
    opacity: 0.65;
  }

  .catalogue-link {
    display: block;
    margin-top: 1.25rem;
    color: #909aa8;
    font-size: 0.78rem;
    text-align: center;
    text-decoration: none;
  }
</style>
