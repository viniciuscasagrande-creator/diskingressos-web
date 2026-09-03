import { chromium } from 'playwright';

(async () => {
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    console.log('Navigating to login...');
    await page.goto('https://safesaff.vercel.app/login', { waitUntil: 'networkidle' });
    await page.locator('input[type="email"]').fill('vinicius@diskingressos.com.br');
    await page.locator('input[type="password"]').fill('Produtor@123');
    await page.locator('button:has-text("Entrar no sistema")').click();
    await page.waitForTimeout(4000);
    
    console.log('Navigating to /app/finance-refunds...');
    await page.goto('https://safesaff.vercel.app/app/finance-refunds', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);
    
    const url = page.url();
    console.log('Current URL:', url);
    const h1s = await page.locator('h1').allInnerTexts();
    console.log('H1 elements:', h1s);
    
    const bodyText = await page.locator('body').innerText();
    console.log('Has "Centro de Controle de Estornos":', bodyText.includes('Centro de Controle de Estornos'));
    console.log('Has "Estornos executados":', bodyText.includes('Estornos executados'));
    
    const screenshotPath = 'C:/Users/vinad/.gemini/antigravity-cli/brain/38eacf3b-e19f-4d1f-8bd6-df7ccbadc6ae/live-screen.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Saved screenshot to:', screenshotPath);
    
    await browser.close();
  } catch (err) {
    console.error('Error during capture:', err);
  }
})();
