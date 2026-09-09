import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('https://safesaff.vercel.app/login');
  await page.getByText(/Produtor \(Vinicius\)/i).click();
  await page.waitForTimeout(2000);

  await page.goto('https://safesaff.vercel.app/eventos');
  await page.waitForSelector('[data-testid="events-page"]', { timeout: 15000 });
  await page.waitForTimeout(1000);

  const screenshotPath = 'C:/Users/vinad/.gemini/antigravity-cli/brain/38eacf3b-e19f-4d1f-8bd6-df7ccbadc6ae/live-vercel-events.png';
  await page.screenshot({ path: screenshotPath });
  console.log('Saved live screenshot to:', screenshotPath);
  await browser.close();
}

run().catch(console.error);
