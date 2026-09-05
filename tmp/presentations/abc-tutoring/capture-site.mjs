import { chromium } from 'playwright';

const output = '/Users/brendanly/project-agent-upskill.github.io/tmp/presentations/abc-tutoring';
const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.4 });
await context.route(/https:\/\/.*\.posthog\.com\//, route => route.abort());
const page = await context.newPage();

await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
await page.screenshot({ path: `${output}/homepage.png` });

await page.getByRole('button', { name: 'View profile & times' }).first().click();
await page.waitForTimeout(350);
await page.screenshot({ path: `${output}/booking.png` });

await page.getByRole('button', { name: 'Close profile' }).click();
await page.getByRole('button', { name: "Dana’s admin" }).first().click();
await page.waitForTimeout(250);
await page.screenshot({ path: `${output}/admin.png` });

await browser.close();
