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
  const player1 = await browser.newPage();
  const player2 = await browser.newPage();


  // Player 1 creates a lobby
  await player1.goto('/Home');
  await player1.getByRole('button', { name: 'Close tanstack query devtools', exact: true }).click();
  await player1.getByRole('button', { name: 'Join online game' }).click();

  // Player 2 joins the same room
  const url = player1.url();
  const roomId = url.slice(-6);

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

  // Both players type at different speeds
  await player1.locator('#game-input-field').pressSequentially(paragraphText, { delay: 30 });
  await player2.locator('#game-input-field').pressSequentially(paragraphText, { delay: 80 });

  // Assert player 1 finished
  await expect(player1.locator('.rank-img')).not.toHaveAttribute('src', /Idle/, { timeout: 2000 });
  await expect(player2.locator('.rank-img')).not.toHaveAttribute('src', /Idle/, { timeout: 2000 });
  
  await player1.close();
  await player2.close();
});