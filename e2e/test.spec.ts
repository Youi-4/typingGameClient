import { test, expect } from "@playwright/test";

test("home page loads and can create a lobby", async ({ page }) => {
  await page.goto("/Home");
  await expect(page.getByRole("button", { name: "Create lobby" })).toBeVisible();
});





test("can navigate to login page", async ({ page }) => {
  await page.goto('/Home');
  await page.getByRole("link", { name: "Login" }).click();
  await expect(page).toHaveURL(/Login/);
});





test("can navigate to signup page", async ({ page }) => {
  await page.goto('/Home');
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('link', { name: 'Sign Up' }).click();
  await expect(page).toHaveURL(/SignUp/);
});




test("Signup test not succesfull, username already in use", async ({ page }) => {

  await page.goto('/Home');
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('link', { name: 'Sign Up' }).click();
  await page.getByRole('textbox', { name: 'Enter email address' }).click();
  await page.getByRole('textbox', { name: 'Enter email address' }).fill('John@gmail.com');
  await page.getByRole('textbox', { name: 'Enter user name' }).click();
  await page.getByRole('textbox', { name: 'Enter user name' }).fill('test');
  await page.getByRole('textbox', { name: 'Enter user name' }).press('Tab');
  await page.getByRole('textbox', { name: 'Enter password' }).fill('test');
  await page.getByRole('button', { name: 'SignUp' }).click();
  await expect(page.getByText('Sign Up failure, Username already exists.')).toBeVisible({ timeout: 5000 });

});





test("Signup test not succesfull, email already in use", async ({ page }) => {

  await page.goto('/Home');
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('link', { name: 'Sign Up' }).click();
  await page.getByRole('textbox', { name: 'Enter email address' }).click();
  await page.getByRole('textbox', { name: 'Enter email address' }).fill('test@test.com');
  await page.getByRole('textbox', { name: 'Enter user name' }).click();
  await page.getByRole('textbox', { name: 'Enter user name' }).fill('Johnny');
  await page.getByRole('textbox', { name: 'Enter user name' }).press('Tab');
  await page.getByRole('textbox', { name: 'Enter password' }).fill('test');
  await page.getByRole('button', { name: 'SignUp' }).click();
  await expect(page.getByText('Sign Up failure, Email already exists.')).toBeVisible({ timeout: 5000 });

});





test("Login test succesfull", async ({ page }) => {

  await page.goto('/Home');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Enter username or email' }).click();
  await page.getByRole('textbox', { name: 'Enter username or email' }).fill('test@test.com');
  await page.getByRole('textbox', { name: 'Enter username or email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Enter password' }).fill('test');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByText('Login successfully')).toBeVisible({ timeout: 5000 });

});




test("Login test not succesfull because of username/email", async ({ page }) => {

  await page.goto('/Home');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Enter username or email' }).click();
  await page.getByRole('textbox', { name: 'Enter username or email' }).fill('no@no.com');
  await page.getByRole('textbox', { name: 'Enter username or email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Enter password' }).fill('test');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByText('Login failure, Invalid username or password.')).toBeVisible({ timeout: 5000 });

});


test("Login test not succesfull because of password", async ({ page }) => {

  await page.goto('/Home');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Enter username or email' }).click();
  await page.getByRole('textbox', { name: 'Enter username or email' }).fill('test@test.com');
  await page.getByRole('textbox', { name: 'Enter username or email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Enter password' }).fill('no');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByText('Login failure, Invalid username or password.')).toBeVisible({ timeout: 5000 });

});




test("Single player game", async ({ page }) => {

  await page.goto('/Home');
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
  await expect(page.locator('.rank-img')).not.toHaveAttribute('src', /Idle/, { timeout: 5000 });

});




test("Public game with two players", async ({ browser }) => {
  test.setTimeout(60000);
  // Separate contexts so each player gets their own session
  const contexts = await Promise.all([browser.newContext(), browser.newContext()]);
  const players = await Promise.all(contexts.map(ctx => ctx.newPage()));

  // Player 1 joins online game
  await players[0].goto('/Home');
  await players[0].getByRole('button', { name: 'Join online game' }).click();

  // Player 2 joins online game
  await players[1].goto('/Home');
  await players[1].getByRole('button', { name: 'Join online game' }).click();

  // Wait for game to start for both
  await players[0].locator('#paragraph').waitFor({ state: 'visible' });
  await players[1].locator('#paragraph').waitFor({ state: 'visible' });

  const paragraphText = await players[0].locator('#paragraph').innerText();

  await Promise.all(players.map(async (p) => {
    for (let i = 0; i < 10; i++) {
      const disabled = await p.locator('#game-input-field').isDisabled();
      if (!disabled) break;
      await p.waitForTimeout(1000);
    }
  }));

  // Both players type in parallel
  await Promise.all([
    players[0].locator('#game-input-field').pressSequentially(paragraphText, { delay: 30 }),
    players[1].locator('#game-input-field').pressSequentially(paragraphText, { delay: 35 }),
  ]);

  // Assert player 1 finished
  await expect(players[0].locator('.rank-img').first()).toHaveAttribute('src', /1st.png/, { timeout: 5000 });
  await expect(players[1].locator('.rank-img').nth(1)).toHaveAttribute('src', /2nd.png/, { timeout: 5000 });

  await Promise.all(players.map(p => p.close()));
  await Promise.all(contexts.map(c => c.close()));
});




test("Private game with two players", async ({ browser }) => {
  test.setTimeout(60000);

  const contexts = await Promise.all([browser.newContext(), browser.newContext()]);
  const players = await Promise.all(contexts.map(ctx => ctx.newPage()));

  // Player 1 creates a private lobby
  await players[0].goto('/Home');
  await players[0].getByLabel('Players:').selectOption('2');
  await players[0].getByRole('button', { name: 'Create lobby' }).click();
  const lobbyCode = players[0].url().split('/').pop()!;

  // Player 2 joins via room code
  await players[1].goto('/Home');
  await players[1].getByRole('textbox', { name: 'Room code' }).fill(lobbyCode);
  await players[1].getByRole('button', { name: 'Join lobby' }).click();
  // Wait for game to start for both
  await Promise.all(players.map(p => p.locator('#paragraph').waitFor({ state: 'visible' })));

  const paragraphText = await players[0].locator('#paragraph').innerText();

  await Promise.all(players.map(async (p) => {
    for (let i = 0; i < 10; i++) {
      const disabled = await p.locator('#game-input-field').isDisabled();
      if (!disabled) break;
      await p.waitForTimeout(1000);
    }
  }));

  // Both players type in parallel
  await Promise.all([
    players[0].locator('#game-input-field').pressSequentially(paragraphText, { delay: 30 }),
    players[1].locator('#game-input-field').pressSequentially(paragraphText, { delay: 35 }),
  ]);

  // Assert both players finished
  await expect(players[0].locator('.rank-img').first()).toHaveAttribute('src', /1st.png/, { timeout: 5000 });
  await expect(players[1].locator('.rank-img').nth(1)).toHaveAttribute('src', /2nd.png/, { timeout: 5000 });

  await Promise.all(players.map(p => p.close()));
  await Promise.all(contexts.map(c => c.close()));
});





test("Private game with three players", async ({ browser }) => {
  test.setTimeout(60000);

  const contexts = await Promise.all([browser.newContext(), browser.newContext(), browser.newContext()]);
  const players = await Promise.all(contexts.map(ctx => ctx.newPage()));

  // Player 1 creates a private lobby
  await players[0].goto('/Home');
  await players[0].getByLabel('Players:').selectOption('3');
  await players[0].getByRole('button', { name: 'Create lobby' }).click();
  const lobbyCode = players[0].url().split('/').pop()!;

  // Player 2 joins via room code
  await players[1].goto('/Home');
  await players[1].getByRole('textbox', { name: 'Room code' }).fill(lobbyCode);
  await players[1].getByRole('button', { name: 'Join lobby' }).click();

  // Player 3 joins via room code
  await players[2].goto('/Home');
  await players[2].getByRole('textbox', { name: 'Room code' }).fill(lobbyCode);
  await players[2].getByRole('button', { name: 'Join lobby' }).click();

  // Wait for game to start for both
  await Promise.all(players.map(p => p.locator('#paragraph').waitFor({ state: 'visible' })));

  const paragraphText = await players[0].locator('#paragraph').innerText();

  await Promise.all(players.map(async (p) => {
    for (let i = 0; i < 10; i++) {
      const disabled = await p.locator('#game-input-field').isDisabled();
      if (!disabled) break;
      await p.waitForTimeout(1000);
    }
  }));

  // Both players type in parallel
  await Promise.all([
    players[0].locator('#game-input-field').pressSequentially(paragraphText, { delay: 30 }),
    players[1].locator('#game-input-field').pressSequentially(paragraphText, { delay: 35 }),
    players[2].locator('#game-input-field').pressSequentially(paragraphText, { delay: 40 }),
  ]);

  // Assert both players finished
  await expect(players[0].locator('.rank-img').first()).toHaveAttribute('src', /1st.png/, { timeout: 5000 });
  await expect(players[1].locator('.rank-img').nth(1)).toHaveAttribute('src', /2nd.png/, { timeout: 5000 });
  await expect(players[2].locator('.rank-img').nth(2)).toHaveAttribute('src', /3rd.png/, { timeout: 5000 });
  await Promise.all(players.map(p => p.close()));
  await Promise.all(contexts.map(c => c.close()));
});





test("Private game with four players", async ({ browser }) => {
  test.setTimeout(120000);

  const contexts = await Promise.all([browser.newContext(), browser.newContext(), browser.newContext(), browser.newContext()]);
  const players = await Promise.all(contexts.map(ctx => ctx.newPage()));

  // Player 1 creates a private lobby
  await players[0].goto('/Home');
  await players[0].getByLabel('Players:').selectOption('4');
  await players[0].getByRole('button', { name: 'Create lobby' }).click();
  const lobbyCode = players[0].url().split('/').pop()!;

  // Player 2 joins via room code
  await players[1].goto('/Home');
  await players[1].getByRole('textbox', { name: 'Room code' }).fill(lobbyCode);
  await players[1].getByRole('button', { name: 'Join lobby' }).click();

  // Player 3 joins via room code
  await players[2].goto('/Home');
  await players[2].getByRole('textbox', { name: 'Room code' }).fill(lobbyCode);
  await players[2].getByRole('button', { name: 'Join lobby' }).click();

  // Player 4 joins via room code
  await players[3].goto('/Home');
  await players[3].getByRole('textbox', { name: 'Room code' }).fill(lobbyCode);
  await players[3].getByRole('button', { name: 'Join lobby' }).click();

  // Wait for game to start for both
  await Promise.all(players.map(p => p.locator('#paragraph').waitFor({ state: 'visible' })));

  const paragraphText = await players[0].locator('#paragraph').innerText();

  await Promise.all(players.map(async (p) => {
    for (let i = 0; i < 10; i++) {
      const disabled = await p.locator('#game-input-field').isDisabled();
      if (!disabled) break;
      await p.waitForTimeout(1000);
    }
  }));

  // Both players type in parallel
  await Promise.all([
    players[0].locator('#game-input-field').pressSequentially(paragraphText, { delay: 30 }),
    players[1].locator('#game-input-field').pressSequentially(paragraphText, { delay: 35 }),
    players[2].locator('#game-input-field').pressSequentially(paragraphText, { delay: 40 }),
    players[3].locator('#game-input-field').pressSequentially(paragraphText, { delay: 45 }),
  ]);

  // Assert both players finished
  await expect(players[0].locator('.rank-img').first()).toHaveAttribute('src', /1st.png/, { timeout: 5000 });
  await expect(players[1].locator('.rank-img').nth(1)).toHaveAttribute('src', /2nd.png/, { timeout: 5000 });
  await expect(players[2].locator('.rank-img').nth(2)).toHaveAttribute('src', /3rd.png/, { timeout: 5000 });
  await expect(players[3].locator('.rank-img').nth(3)).toHaveAttribute('src', /4th.png/, { timeout: 5000 });
  await Promise.all(players.map(p => p.close()));
  await Promise.all(contexts.map(c => c.close()));
});





test("Private game with five players", async ({ browser }) => {
  test.setTimeout(120000);

  const contexts = await Promise.all([browser.newContext(), browser.newContext(), browser.newContext(), browser.newContext(), browser.newContext()]);
  const players = await Promise.all(contexts.map(ctx => ctx.newPage()));

  // Player 1 creates a private lobby
  await players[0].goto('/Home');
  await players[0].getByLabel('Players:').selectOption('5');
  await players[0].getByRole('button', { name: 'Create lobby' }).click();
  const lobbyCode = players[0].url().split('/').pop()!;

  // Player 2 joins via room code
  await players[1].goto('/Home');
  await players[1].getByRole('textbox', { name: 'Room code' }).fill(lobbyCode);
  await players[1].getByRole('button', { name: 'Join lobby' }).click();

  // Player 3 joins via room code
  await players[2].goto('/Home');
  await players[2].getByRole('textbox', { name: 'Room code' }).fill(lobbyCode);
  await players[2].getByRole('button', { name: 'Join lobby' }).click();

  // Player 4 joins via room code
  await players[3].goto('/Home');
  await players[3].getByRole('textbox', { name: 'Room code' }).fill(lobbyCode);
  await players[3].getByRole('button', { name: 'Join lobby' }).click();

  // Player 5 joins via room code
  await players[4].goto('/Home');
  await players[4].getByRole('textbox', { name: 'Room code' }).fill(lobbyCode);
  await players[4].getByRole('button', { name: 'Join lobby' }).click();
  // Wait for game to start for both
  await Promise.all(players.map(p => p.locator('#paragraph').waitFor({ state: 'visible' })));

  const paragraphText = await players[0].locator('#paragraph').innerText();

  await Promise.all(players.map(async (p) => {
    for (let i = 0; i < 10; i++) {
      const disabled = await p.locator('#game-input-field').isDisabled();
      if (!disabled) break;
      await p.waitForTimeout(1000);
    }
  }));

  // Both players type in parallel
  await Promise.all([
    players[0].locator('#game-input-field').pressSequentially(paragraphText, { delay: 30 }),
    players[1].locator('#game-input-field').pressSequentially(paragraphText, { delay: 35 }),
    players[2].locator('#game-input-field').pressSequentially(paragraphText, { delay: 40 }),
    players[3].locator('#game-input-field').pressSequentially(paragraphText, { delay: 45 }),
    players[4].locator('#game-input-field').pressSequentially(paragraphText, { delay: 50 }),
  ]);

  // Assert both players finished
  await expect(players[0].locator('.rank-img').first()).toHaveAttribute('src', /1st.png/, { timeout: 5000 });
  await expect(players[1].locator('.rank-img').nth(1)).toHaveAttribute('src', /2nd.png/, { timeout: 5000 });
  await expect(players[2].locator('.rank-img').nth(2)).toHaveAttribute('src', /3rd.png/, { timeout: 5000 });
  await expect(players[3].locator('.rank-img').nth(3)).toHaveAttribute('src', /4th.png/, { timeout: 5000 });
  await expect(players[4].locator('.rank-img').nth(4)).toHaveAttribute('src', /5th.png/, { timeout: 5000 });
  await Promise.all(players.map(p => p.close()));
  await Promise.all(contexts.map(c => c.close()));
});