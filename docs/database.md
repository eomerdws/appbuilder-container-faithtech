# Detailed Database Model

```mermaid
erDiagram
    ADMINISTRATORS ||--o{ PACKAGE_STATUS_EVENTS : "actor_id"

    PACKAGES {
        string id PK
        uuid scriptoria_product_id
        string project_url
        string project_name
        string project_repo
        string publish_url
        string permalink_url
        integer size_bytes
        string app_builder
        string app_builder_version
        string language_tag
        string iso639_3
        string local_name
        string region_code
        string region_name
        string script_code
        string sldr
        string windows_tag
        string image_base_url
        string status
        datetime last_notification_at
        datetime created_at
        datetime updated_at
    }

    PACKAGE_NAMES ||--|| PACKAGES : "package_id"
    PACKAGE_NAMES {
        string id PK
        string name
        string normalized_name
        string kind
    }

    PACKAGE_LISTINGS ||--|| PACKAGES : "package_id"
    PACKAGE_LISTINGS {
        string id PK
        string locale
        string title
        string short_description
        html full_description
    }

    PACKAGE_IMAGES ||--|| PACKAGES : "package_id"
    PACKAGE_IMAGES {
        string id PK
        string scale
        filepath source
        string url
    }

    PACKAGE_STATUS_EVENTS ||--|| PACKAGES : "package_id"
    PACKAGE_STATUS_EVENTS {
        string id PK
        string from_status
        string to_status
        integer admin_user_id
        string reason
        datetime created_at
    }
```

## Table Summary

| Table                   | Rows (seed) | Purpose                                                                  |
| ----------------------- | ----------- | ------------------------------------------------------------------------ |
| `administrators`        | 1           | Authenticated admin users                                                |
| `packages`              | 4           | Bible asset packages (Gumawana, Quenya Elvish, Klingon, Hawaiian Pidgin) |
| `package_names`         | 13          | Primary/alternate/local language names per package                       |
| `package_listings`      | 8           | Localized product listings with titles and descriptions                  |
| `package_images`        | 9           | Retina image assets (1x/2x) for nav drawer                               |
| `package_status_events` | 5           | Audit trail of status transitions                                        |

## Seed Data Coverage

- **Notification → Pending → Approval demo path** — admin actor (`usr-demo-admin`) triggers a pending→active transition on Quenya Elvish.
- **Auth placeholder** — admin account present but with an unusable password hash; intended to be replaced via bootstrap flow before real auth testing.
