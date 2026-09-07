# Naukri Profile Automation

This project keeps the approved Naukri profile summary in one versioned place and documents the daily refresh workflow.

## Approved profile summary

The content to use is in `profile-summary.txt`.

## Daily refresh

The Codex scheduled task runs at 9:00 AM IST every day. It opens the Naukri profile update flow, verifies that the saved summary still matches this file, and refreshes the profile only after the account is authenticated and the content remains accurate.

Naukri may require a login, OTP, or CAPTCHA. Those steps must be completed manually; this project never stores credentials or bypasses account controls.

## Maintenance

Edit `profile-summary.txt` whenever your skills, experience, role, or projects change. Commit and push that accurate update before the next refresh.
