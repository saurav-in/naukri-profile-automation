# Naukri Profile Automation

This project keeps the approved Naukri profile summary in one versioned place and refreshes it through GitHub Actions.

## Approved profile summary

The content to use is in `profile-summary.txt`.

## GitHub Actions refresh

The workflow in `.github/workflows/daily-naukri-refresh.yml` runs daily at 9:00 AM IST. It signs in, verifies that no OTP or CAPTCHA is required, then saves the summary from `profile-summary.txt`.

Add these encrypted repository secrets before enabling the workflow:

- `NAUKRI_EMAIL`
- `NAUKRI_PASSWORD`

The project never stores credentials in Git. Naukri may require an OTP or CAPTCHA; the workflow stops in that case and does not bypass account controls.

## Maintenance

Edit `profile-summary.txt` whenever your skills, experience, role, or projects change. Commit and push that accurate update before the next refresh.
