import { test, expect } from "@playwright/test";

test("home page loads and can create a lobby", async ({ page }) => {
  await page.goto("/Home");
  await expect(page.getByRole("button", { name: "Create lobby" })).toBeVisible();
});

test("can navigate to login page", async ({ page }) => {
  await page.goto("/Home");
  await page.getByRole("link", { name: "Login" }).click();
  await expect(page).toHaveURL(/Login/);
});

test("can play a single player game", async ({ page }) => {

  await page.goto('/Home');
  await page.getByRole('button', { name: 'Close tanstack query devtools', exact: true }).click();
  await page.getByRole('button', { name: 'Create lobby' }).click();

  await page.locator('#paragraph').waitFor({ state: 'visible' });
  await page.locator('#paragraph').click();
  const paragraphText = await page.locator('#paragraph').innerText();
  //console.log("paragraphText:", paragraphText)

  for (let i = 0; i < 10; i++) {
    const disabled = await page.locator('#game-input-field').isDisabled();
    if (!disabled) break;
    await page.waitForTimeout(1000);
  }



  await page.locator('#game-input-field').pressSequentially(paragraphText!, { delay: 50 });
  await expect(page.locator('.rank-img')).not.toHaveAttribute('src', /Idle/, { timeout: 1000 });

});


test("multiplayer public game with two players", async ({ browser }) => {
  test.setTimeout(60000);
  // Separate contexts so each player gets their own session
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();
  const player1 = await context1.newPage();
  const player2 = await context2.newPage();

  // Player 1 joins online game
  await player1.goto('/Home');
  await player1.getByRole('button', { name: 'Close tanstack query devtools', exact: true }).click();
  await player1.getByRole('button', { name: 'Join online game' }).click();

  // Player 2 joins online game
  await player2.goto('/Home');
  await player2.getByRole('button', { name: 'Close tanstack query devtools', exact: true }).click();
  await player2.getByRole('button', { name: 'Join online game' }).click();

  // Wait for game to start for both
  await player1.locator('#paragraph').waitFor({ state: 'visible' });
  await player2.locator('#paragraph').waitFor({ state: 'visible' });

  const paragraphText = await player1.locator('#paragraph').innerText();

  for (let i = 0; i < 10; i++) {
    const disabled = await player1.locator('#game-input-field').isDisabled();
    if (!disabled) break;
    await player1.waitForTimeout(1000);
  }

  // Both players type in parallel
  await Promise.all([
    player1.locator('#game-input-field').pressSequentially(paragraphText, { delay: 30 }),
    player2.locator('#game-input-field').pressSequentially(paragraphText, { delay: 35 }),
  ]);

  // Assert player 1 finished
  await expect(player1.locator('.rank-img').first()).not.toHaveAttribute('src', /Idle/, { timeout: 1000 });
  await expect(player1.locator('.rank-img').nth(1)).not.toHaveAttribute('src', /Idle/, { timeout: 1000 });
  
  await player1.close();
  await player2.close();
  await context1.close();
  await context2.close();
});