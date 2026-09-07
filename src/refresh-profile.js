import { readFile } from "node:fs/promises";
import { chromium } from "playwright";

const loginEmail = process.env.NAUKRI_EMAIL;
const loginPassword = process.env.NAUKRI_PASSWORD;

if (!loginEmail || !loginPassword) {
  throw new Error("NAUKRI_EMAIL and NAUKRI_PASSWORD repository secrets are required.");
}

const summary = (await readFile("profile-summary.txt", "utf8")).trim();
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await page.goto("https://www.naukri.com/nlogin/login", { waitUntil: "domcontentloaded" });
  await page.locator("#usernameField, input[type='email'], input[name='email']").first().fill(loginEmail);
  await page.locator("#passwordField, input[type='password'], input[name='password']").first().fill(loginPassword);
  await page.locator("button:has-text('Login'), button:has-text('Sign in')").first().click();
  await page.waitForTimeout(2500);

  const pageText = await page.locator("body").innerText();
  if (/captcha|one-time password|\botp\b|verification code/i.test(pageText)) {
    throw new Error("Naukri requested OTP, CAPTCHA, or verification. Manual sign-in is required.");
  }

  if (!/mnjuser/.test(page.url())) {
    throw new Error("Naukri sign-in did not reach the authenticated profile area.");
  }

  await page.goto("https://www.naukri.com/mnjuser/profile", { waitUntil: "domcontentloaded" });
  const profileSummary = page.locator(".widgetHead").filter({ hasText: "Profile summary" });
  await profileSummary.locator("span.edit").click();
  await page.getByRole("textbox", { name: "Type here..." }).fill(summary);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.getByText("Profile updated successfully", { exact: true }).waitFor({ timeout: 15000 });
  console.log("Naukri profile summary updated successfully.");
} finally {
  await browser.close();
}
