import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1520, height: 788 } });

  const refPath = 'C:/Users/vinad/OneDrive/Desktop/safesaff/tests/visual/reference/central-eventos-approved-reference.png';
  const imgBuffer = fs.readFileSync(refPath);
  const base64 = imgBuffer.toString('base64');
  
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { margin: 0; padding: 0; background: #fff; overflow: hidden; }
          img { display: block; width: 1520px; height: 788px; }
        </style>
      </head>
      <body>
        <img id="ref" src="data:image/png;base64,${base64}" />
      </body>
    </html>
  `);

  await page.waitForSelector('#ref');

  const outDir = 'C:/Users/vinad/OneDrive/Desktop/safesaff/public/events';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const clips = [
    { name: 'cover-sonic-1.jpg', clip: { x: 16, y: 136, width: 236, height: 284 } },
    { name: 'cover-sonic-2.jpg', clip: { x: 768, y: 136, width: 236, height: 284 } },
    { name: 'cover-fabio.jpg', clip: { x: 16, y: 448, width: 236, height: 284 } },
    { name: 'cover-nemer.jpg', clip: { x: 768, y: 448, width: 236, height: 284 } },
    { name: 'ref-header.png', clip: { x: 0, y: 0, width: 1520, height: 140 } },
    { name: 'ref-card-1.png', clip: { x: 14, y: 136, width: 735, height: 290 } },
  ];

  for (const item of clips) {
    const filePath = path.join(outDir, item.name);
    await page.screenshot({
      path: filePath,
      clip: item.clip,
      type: 'jpeg',
      quality: 95
    });
    console.log('Successfully saved:', filePath);
  }

  await browser.close();
}

run().catch(console.error);
