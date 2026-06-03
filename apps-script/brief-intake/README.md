# Google Apps Script Brief Intake

This folder contains the Apps Script backend for the client brief form.

## Setup

1. Open https://script.google.com/.
2. Create a new Apps Script project.
3. Paste `Code.gs` into the editor.
4. In `setupConfig()`, replace:
   - `your-email@example.com` with the email that should receive brief submissions.
   - `change-this-passcode` with the passcode clients must enter before sending.
5. Run `setupConfig()` once and authorize the script.
6. Click `Deploy` -> `New deployment`.
7. Select `Web app`.
8. Use:
   - `Execute as`: `Me`
   - `Who has access`: `Anyone`
9. Deploy and copy the `/exec` Web app URL.
10. Paste that URL into `APPS_SCRIPT_URL` inside `client-brief.html`.

The form uses a normal HTML POST into a hidden iframe, so it does not need
frontend CORS configuration.
