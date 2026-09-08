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
  await page.goto("https://www.naukri.com/nlogin/login", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  await page.waitForTimeout(3000);

  console.log("Login URL:", page.url());

  // Naukri has more than one login-page layout.
  const emailField = page.locator(
    "#usernameField, #emailTxt, input[name='USERNAME'], input[type='email'], input[placeholder*='Email' i], input[placeholder*='Username' i]"
  ).first();

  const passwordField = page.locator(
    "#passwordField, #pwd1, input[name='PASSWORD'], input[type='password'], input[placeholder*='Password' i]"
  ).first();

  await emailField.waitFor({ state: "visible", timeout: 30000 });
  await emailField.fill(loginEmail);

  await passwordField.waitFor({ state: "visible", timeout: 10000 });
  await passwordField.fill(loginPassword);

  // Handle both login-page button variants.
  const loginButton = page.locator(
    "#sbtLog, button:has-text('Login'), button:has-text('Sign in'), button[type='submit'], input[type='submit']"
  ).first();

  await loginButton.waitFor({ state: "visible", timeout: 10000 });
  await loginButton.click();

  await page.waitForTimeout(5000);

  console.log("After login URL:", page.url());

  const pageText = await page.locator("body").innerText();

  if (/captcha|one-time password|\botp\b|verification code/i.test(pageText)) {
    throw new Error("Naukri requested OTP, CAPTCHA, or verification.");
  }

  if (!/mnjuser/i.test(page.url())) {
    throw new Error(`Naukri login failed. Current URL: ${page.url()}`);
  }

  console.log("Naukri login successful.");

  await page.goto("https://www.naukri.com/mnjuser/profile", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  await page.waitForTimeout(3000);

  const profileSummary = page
    .locator(".widgetHead")
    .filter({ hasText: "Profile summary" })
    .first();

  await profileSummary.waitFor({ state: "visible", timeout: 30000 });

  await profileSummary.locator("span.edit").click();

  await page
    .getByRole("textbox", { name: "Type here..." })
    .fill(summary);

  await page
    .getByRole("button", { name: "Save", exact: true })
    .click();

  await page
    .getByText("Profile updated successfully", { exact: true })
    .waitFor({ timeout: 15000 });

  console.log("Naukri profile summary updated successfully.");
} finally {
  await browser.close();
}
