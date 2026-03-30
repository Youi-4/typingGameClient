const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  await page.goto('http://localhost:5173/Home');
  await page.getByText('HomeLoginMenuMore Coming SoonLogoutSign UpCreate a room or join one to play').click();
  await page.getByRole('button', { name: 'Close tanstack query devtools', exact: true }).click();
  await page.getByRole('button', { name: 'Create lobby' }).click();
  await page.locator('div').filter({ hasText: 'A plant is one of the most' }).nth(2).click();
  await page.locator('#game-input-field').fill('.');

  // ---------------------
  await context.close();
  await browser.close();
})();