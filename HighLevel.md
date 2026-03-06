# GoHighLevel (GHL) integration

The quote form creates a **contact** in GHL using your token’s **Edit Contacts (contacts.write)** and **Edit Custom Fields (locations/customFields.write)** scopes. Notes are **not** used (no notes scope required).

## What gets stored

| Form field           | Where it goes in GHL                          |
|----------------------|-----------------------------------------------|
| Name                 | Contact: First name, Last name                 |
| Email                | Contact: Email                                 |
| Phone                | Contact: Phone                                |
| Service type         | Contact: **Tags** (e.g. `Custom Deck Design`)  |
| Neighborhood         | Contact: **Tags** (e.g. `South Anchorage`)     |
| Project description  | **Tags** `quote` + `website` always; optional **custom field** if configured |

## Environment variables

Set these in Cloudflare Pages → your project → Settings → Environment variables:

| Variable                                | Required | Description |
|----------------------------------------|----------|-------------|
| `HIGHLEVEL_TOKEN`                      | Yes      | API token with **contacts.write** (and **locations/customFields.write** if using project description field). |
| `HIGHLEVEL_LOCATION_ID`                | Yes      | GHL location (sub-account) ID. |
| `HIGHLEVEL_CUSTOM_FIELD_PROJECT_DESCRIPTION` | No   | Custom field ID for “Project description”. If set, the project description is saved in this custom field. |

## Optional: custom field for project description

1. In GHL: **Settings** → **Custom Fields** → create a contact field (e.g. “Project Description”, type Text Area).
2. Copy the field **ID** (from the API or from the field’s URL/settings).
3. In Cloudflare, add env var **`HIGHLEVEL_CUSTOM_FIELD_PROJECT_DESCRIPTION`** = that ID.
4. Redeploy. New submissions will populate that custom field with the project description.

If you don’t set this, the project description is not stored in GHL (only name, email, phone, source, and tags).

## Token scopes used

- **contacts.write** – create contact and set tags.
- **locations/customFields.write** – only if you set `HIGHLEVEL_CUSTOM_FIELD_PROJECT_DESCRIPTION` and send a project description.

No notes scope is used.
