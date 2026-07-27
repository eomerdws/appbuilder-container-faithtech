import { env } from 'cloudflare:test';
import { hashPassword } from '../src/lib/server/auth';

export const notification = {
  project_url: 'https://app.scriptoria.io/projects/722',
  project_name: 'gvs Gumawana',
  project_repo: 's3://sil-prd-aps-projects/scriptureappbuilder/gvs-1380-gvs-Gumawana',
  publish_url:
    'https://sil-prd-scriptoria-files.s3.amazonaws.com/asset-package/d54c912a-979c-4fa2-9eac-164d7e2f575d/org.wycliffe.gvs.gumawana.bible.zip',
  permalink_url:
    'https://app.scriptoria.io/api/products/d54c912a-979c-4fa2-9eac-164d7e2f575d/files/published/asset-package',
  size: '11351769}',
  app_builder: 'scripture-app-builder',
  app_builder_version: '9.3',
  app_lang: {
    full: 'gvs-Latn-PG',
    iana: ['Gumawana'],
    iso639_3: 'gvs',
    localname: 'Gumawana',
    localnames: ['Gumawana'],
    name: 'Gumawana',
    names: ['Domdom', 'Gumasi', 'Gumasila'],
    region: 'PG',
    regionname: 'Papua New Guinea',
    script: 'Latn',
    sldr: true,
    windows: 'gvs-Latn'
  },
  image: {
    baseurl:
      'https://app.scriptoria.io/api/products/d54c912a-979c-4fa2-9eac-164d7e2f575d/files/published',
    files: [
      { size: '1x', src: 'nav_drawer.png' },
      { size: '2x', src: 'nav_drawer@2x.png' }
    ]
  },
  listing: [
    {
      lang: 'en-US',
      title: 'Gumawana Bible',
      short_description: 'The Bible in Gumawana of Papua New Guinea [gvs]',
      full_description: '<b>Buki Kimaasabaina</b>'
    }
  ]
};

export const adminEmail = 'admin@example.invalid';
export const adminPassword = 'demo-password-123';

export async function seedAdministrator(): Promise<string> {
  const passwordHash = await hashPassword(adminPassword);
  await env.DB.prepare(
    `INSERT INTO administrators
     (id, email, display_name, password_hash, disabled, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, ?, ?)`
  )
    .bind(
      'admin-test',
      adminEmail,
      'Test Administrator',
      passwordHash,
      '2026-07-11T00:00:00.000Z',
      '2026-07-11T00:00:00.000Z'
    )
    .run();
  return 'admin-test';
}
