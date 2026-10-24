import { chromium } from "playwright-core";
const exe = process.env.HOME + "/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const browser = await chromium.launch({ executablePath: exe, headless: true, args: ["--no-sandbox"] });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const errs = []; page.on("pageerror", (e) => errs.push(e.message)); page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const reqs = []; page.on("request", (r) => /\/api\/session(\/sample)?$/.test(new URL(r.url()).pathname) && r.method() === "POST" && reqs.push(new URL(r.url()).pathname));
await page.goto("http://localhost:3100/new", { waitUntil: "networkidle" });
await page.screenshot({ path: "/tmp/pw/t-1-new.png" });
// A) demo look → prepared sample (no live analysis)
const zone = page.locator('label[for="look-file"]');
await page.getByRole("button", { name: "Use Frost Silver" }).dragTo(zone);
await page.getByRole("button", { name: /Analyze This Look/ }).click();
await page.waitForURL("**/s/**", { timeout: 30000 }); log("demo look → breakdown; POSTs:", reqs.join(","));
await page.waitForTimeout(1500); await page.screenshot({ path: "/tmp/pw/t-2-demo-breakdown.png" });
// B) test look → real analysis
await page.goto("http://localhost:3100/new", { waitUntil: "networkidle" });
reqs.length = 0;
await page.getByRole("button", { name: "Use Smoky Plum" }).dragTo(page.locator('label[for="look-file"]'));
await page.waitForTimeout(600);
await page.getByRole("button", { name: /Analyze This Look/ }).click();
await page.waitForTimeout(2500); await page.screenshot({ path: "/tmp/pw/t-3-test-analyzing.png" });
const t0 = Date.now();
await page.waitForURL("**/s/**", { timeout: 90000 }); log("test look → breakdown after", Date.now() - t0 + 2500, "ms; POSTs:", reqs.join(","));
await page.waitForTimeout(1500); await page.screenshot({ path: "/tmp/pw/t-4-test-breakdown.png" });
// selfie: demo selfie + test selfie both apply for real
await page.getByRole("button", { name: /See It On Me/ }).click();
await page.getByRole("button", { name: "Use Light Neutral" }).dragTo(page.locator('label[for="selfie-file"]')); // test face
await page.waitForTimeout(800); await page.screenshot({ path: "/tmp/pw/t-5-selfie.png" });
console.log("errors:", errs);
await browser.close();
