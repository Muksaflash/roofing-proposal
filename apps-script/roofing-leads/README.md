# Octopus Roofing Leads Apps Script

This backend receives estimate requests from the landing page, sends an email,
and appends each lead to the Google Sheet.

## Built-in targets

- Email: `Octopusroofing@gmail.com`
- Spreadsheet: `1h2T9-MBCsqYRrpfwvnuYF5YekgHb9IeOaZkldm7jBF4`
- Leads tab: `Website Leads`
- Photo folder: `Octopus Roofing Lead Photos`

## Setup

1. Open https://script.google.com/.
2. Create a new Apps Script project.
3. Paste `Code.gs` into the editor.
4. Run `setup()` once and authorize the script.
5. Click `Deploy` -> `New deployment`.
6. Select `Web app`.
7. Use:
   - `Execute as`: `Me`
   - `Who has access`: `Anyone`
8. Deploy and copy the `/exec` Web app URL.
9. Paste that URL into `LEAD_FORM_ENDPOINT` inside `index.html`.
10. Deploy the Firebase site and submit one test lead.

Best setup: deploy this script from `Octopusroofing@gmail.com`. If another
Google account owns the script, share the `Octopus Roofing Lead Photos` Drive
folder with `Octopusroofing@gmail.com`, otherwise photo links in lead emails may
require the script owner's login.

The form posts into a hidden iframe. This avoids browser CORS problems with
Google Apps Script Web Apps.
