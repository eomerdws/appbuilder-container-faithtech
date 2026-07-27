// Stand-in for SvelteKit's $app/navigation, aliased in vitest.config.components.ts.
export async function goto(): Promise<void> {}
export async function invalidateAll(): Promise<void> {}
export function beforeNavigate(): void {}
export function afterNavigate(): void {}
