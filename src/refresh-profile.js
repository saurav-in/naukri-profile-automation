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
  await page.goto("https://login.naukri.com/nLogin/Login.php", {
  waitUntil: "domcontentloaded",
  timeout: 60000,
});

await page.waitForTimeout(3000);

console.log("Login URL:", page.url());

await page.locator("#emailTxt, input[name='USERNAME']").first().fill(loginEmail);

await page.locator("#pwd1, input[name='PASSWORD']").first().fill(loginPassword);

await page.locator("#sbtLog, input[type='submit'], button[type='submit']").first().click();

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
