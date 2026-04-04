import { test, expect } from "@playwright/test";

test("home page loads and can create a lobby", async ({ page }) => {
  await page.goto("/Home");
  await expect(page.getByRole("button", { name: "Create lobby" })).toBeVisible();
});



test("can navigate to login page", async ({ page }) => {
  await page.goto('/Home');
  await page.getByRole("link", { name: "Log in" }).click();
  await expect(page).toHaveURL(/Login/);
});



test("can navigate to signup page", async ({ page }) => {
  await page.goto('/Home');
  await page.getByRole('link', { name: 'Sign up' }).click();
  await expect(page).toHaveURL(/SignUp/);
});



test("login redirects to home on success", async ({ page }) => {
  await page.goto('/Login');
  await page.getByRole('textbox', { name: 'Username or Email' }).fill('test@test.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('test');
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page).toHaveURL(/Home/, { timeout: 5000 });
});



test("login with empty fields shows error", async ({ page }) => {
  await page.goto('/Login');
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page.getByText('Login failed:')).toBeVisible({ timeout: 5000 });
});



test("signup with empty username shows toast", async ({ page }) => {
  await page.goto('/SignUp');
  await page.getByRole('textbox', { name: 'Email Address' }).fill('valid@email.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('Test1234!');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page.getByText('Username is required.')).toBeVisible({ timeout: 3000 });
});



test("Signup validation toast for invalid username", async ({ page }) => {
  await page.goto('/SignUp');
  await page.getByRole('textbox', { name: 'Username' }).fill('ab');
  await page.getByRole('textbox', { name: 'Email Address' }).fill('valid@email.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('Test1234!');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page.getByText('Username: 3–20 characters, letters/numbers/_ and - only.')).toBeVisible({ timeout: 3000 });
});



test("Signup validation toast for invalid email", async ({ page }) => {
  await page.goto('/SignUp');
  await page.getByRole('textbox', { name: 'Username' }).fill('ValidUser');
  await page.getByRole('textbox', { name: 'Email Address' }).fill('notanemail');
  await page.getByRole('textbox', { name: 'Password' }).fill('Test1234!');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible({ timeout: 3000 });
});



test("Signup validation toast for weak password", async ({ page }) => {
  await page.goto('/SignUp');
  await page.getByRole('textbox', { name: 'Username' }).fill('ValidUser');
  await page.getByRole('textbox', { name: 'Email Address' }).fill('valid@email.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('weak');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page.getByText('Password must be at least 6 characters.')).toBeVisible({ timeout: 3000 });
});



test("Signup validation toast for password missing uppercase", async ({ page }) => {
  await page.goto('/SignUp');
  await page.getByRole('textbox', { name: 'Username' }).fill('ValidUser');
  await page.getByRole('textbox', { name: 'Email Address' }).fill('valid@email.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('test123!');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page.getByText('Password must contain at least one uppercase letter.')).toBeVisible({ timeout: 3000 });
});



test("Signup validation toast for password missing number", async ({ page }) => {
  await page.goto('/SignUp');
  await page.getByRole('textbox', { name: 'Username' }).fill('ValidUser');
  await page.getByRole('textbox', { name: 'Email Address' }).fill('valid@email.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('TestTest!');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page.getByText('Password must contain at least one number.')).toBeVisible({ timeout: 3000 });
});



test("Signup validation toast for password missing special character", async ({ page }) => {
  await page.goto('/SignUp');
  await page.getByRole('textbox', { name: 'Username' }).fill('ValidUser');
  await page.getByRole('textbox', { name: 'Email Address' }).fill('valid@email.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('Test1234');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page.getByText('Password must contain a special character (@$!%*?&_#^()).')).toBeVisible({ timeout: 3000 });
});



test("Signup test not succesfull, username already in use", async ({ page }) => {
  await page.goto('/SignUp');
  await page.getByRole('textbox', { name: 'Email Address' }).fill('John@gmail.com');
  await page.getByRole('textbox', { name: 'Username' }).fill('test');
  await page.getByRole('textbox', { name: 'Password' }).fill('Test1234!');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page.getByText('Sign up failed: Username already exists.')).toBeVisible({ timeout: 5000 });
});



test("Signup test not succesfull, email already in use", async ({ page }) => {
  await page.goto('/SignUp');
  await page.getByRole('textbox', { name: 'Email Address' }).fill('test@test.com');
  await page.getByRole('textbox', { name: 'Username' }).fill('Johnny');
  await page.getByRole('textbox', { name: 'Password' }).fill('Test1234!');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page.getByText('Sign up failed: Email already exists.')).toBeVisible({ timeout: 5000 });
});



test("Login test succesfull", async ({ page }) => {
  await page.goto('/Login');
  await page.getByRole('textbox', { name: 'Username or Email' }).fill('test@test.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('test');
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page.getByText('Logged in successfully')).toBeVisible({ timeout: 5000 });
});



test("Login test not succesfull because of username/email", async ({ page }) => {
  await page.goto('/Login');
  await page.getByRole('textbox', { name: 'Username or Email' }).fill('no@no.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('test');
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page.getByText('Login failed: Invalid username or password.')).toBeVisible({ timeout: 5000 });
});



test("Login test not succesfull because of password", async ({ page }) => {
  await page.goto('/Login');
  await page.getByRole('textbox', { name: 'Username or Email' }).fill('test@test.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('no');
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page.getByText('Login failed: Invalid username or password.')).toBeVisible({ timeout: 5000 });
});



test("Stats nav link is hidden when logged out", async ({ page }) => {
  await page.goto('/Home');
  await expect(page.getByRole('link', { name: 'Stats' })).not.toBeVisible();
});



test("Stats nav link is visible when logged in", async ({ page }) => {
  await page.goto('/Login');
  await page.getByRole('textbox', { name: 'Username or Email' }).fill('test@test.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('test');
  await page.getByRole('button', { name: 'Log In' }).click();
  await page.waitForURL(/Home/);
  await expect(page.getByRole('link', { name: 'Stats' })).toBeVisible();
});



test("can navigate to Stats page when logged in", async ({ page }) => {
  await page.goto('/Login');
  await page.getByRole('textbox', { name: 'Username or Email' }).fill('test@test.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('test');
  await page.getByRole('button', { name: 'Log In' }).click();
  await page.waitForURL(/Home/);
  await page.getByRole('link', { name: 'Stats' }).click();
  await expect(page).toHaveURL(/Stats/);
});



test("leaderboard page loads", async ({ page }) => {
  await page.goto('/Leaderboard');
  await expect(page.getByRole('link', { name: 'Leaderboard' })).toBeVisible();
});



test("theme toggle switches between light and dark", async ({ page }) => {
  await page.goto('/Home');
  const html = page.locator('html');
  const initialTheme = await html.getAttribute('data-theme');
  await page.getByTitle(initialTheme === 'light' ? 'Dark mode' : 'Light mode').click();
  const newTheme = await html.getAttribute('data-theme');
  expect(newTheme).not.toBe(initialTheme);
});



test("Single player game", async ({ page }) => {
  await page.goto('/Home');
  await page.getByRole('button', { name: 'Create lobby' }).click();
  await page.locator('#paragraph').waitFor({ state: 'visible' });
  await page.locator('#paragraph').click();
  const paragraphText = await page.locator('#paragraph').innerText();

  for (let i = 0; i < 10; i++) {
    const disabled = await page.locator('#game-input-field').isDisabled();
    if (!disabled) break;
    await page.waitForTimeout(1000);
  }

  await page.locator('#game-input-field').pressSequentially(paragraphText!, { delay: 50 });
  await expect(page.locator('.rank-img')).not.toHaveAttribute('src', /Idle/, { timeout: 5000 });
});




test("Play Again button appears after finishing single player game", async ({ page }) => {
  await page.goto('/Home');
  await page.getByRole('button', { name: 'Create lobby' }).click();
  await page.locator('#paragraph').waitFor({ state: 'visible' });
  const paragraphText = await page.locator('#paragraph').innerText();

  for (let i = 0; i < 10; i++) {
    const disabled = await page.locator('#game-input-field').isDisabled();
    if (!disabled) break;
    await page.waitForTimeout(1000);
  }

  await page.locator('#game-input-field').pressSequentially(paragraphText!, { delay: 50 });
  await expect(page.getByRole('button', { name: 'Play Again' })).toBeVisible({ timeout: 5000 });
});



test("Public game with two players", async ({ browser }) => {
  test.setTimeout(120000);
  const contexts = await Promise.all([browser.newContext(), browser.newContext()]);
  const players = await Promise.all(contexts.map(ctx => ctx.newPage()));

  await players[0].goto('/Home');
  await players[0].getByRole('button', { name: 'Join online game' }).click();

  await players[1].goto('/Home');
  await players[1].getByRole('button', { name: 'Join online game' }).click();

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

  await Promise.all([
    players[0].locator('#game-input-field').pressSequentially(paragraphText, { delay: 30 }),
    players[1].locator('#game-input-field').pressSequentially(paragraphText, { delay: 35 }),
  ]);

  await expect(players[0].locator('.rank-img').first()).toHaveAttribute('src', /1st.png/, { timeout: 5000 });
  await expect(players[1].locator('.rank-img').nth(1)).toHaveAttribute('src', /2nd.png/, { timeout: 5000 });

  await Promise.all(players.map(p => p.close()));
  await Promise.all(contexts.map(c => c.close()));
});




test("Private game with two players", async ({ browser }) => {
  test.setTimeout(120000);

  const contexts = await Promise.all([browser.newContext(), browser.newContext()]);
  const players = await Promise.all(contexts.map(ctx => ctx.newPage()));

  await players[0].goto('/Home');
  await players[0].getByLabel('Players:').selectOption('2');
  await players[0].getByRole('button', { name: 'Create lobby' }).click();
  const lobbyCode = players[0].url().split('/').pop()!;

  await players[1].goto('/Home');
  await players[1].getByRole('textbox', { name: 'room code' }).fill(lobbyCode);
  await players[1].getByRole('button', { name: 'Join lobby' }).click();

  await Promise.all(players.map(p => p.locator('#paragraph').waitFor({ state: 'visible' })));

  const paragraphText = await players[0].locator('#paragraph').innerText();

  await Promise.all(players.map(async (p) => {
    for (let i = 0; i < 10; i++) {
      const disabled = await p.locator('#game-input-field').isDisabled();
      if (!disabled) break;
      await p.waitForTimeout(1000);
    }
  }));

  await Promise.all([
    players[0].locator('#game-input-field').pressSequentially(paragraphText, { delay: 30 }),
    players[1].locator('#game-input-field').pressSequentially(paragraphText, { delay: 35 }),
  ]);

  await expect(players[0].locator('.rank-img').first()).toHaveAttribute('src', /1st.png/, { timeout: 5000 });
  await expect(players[1].locator('.rank-img').nth(1)).toHaveAttribute('src', /2nd.png/, { timeout: 5000 });

  await Promise.all(players.map(p => p.close()));
  await Promise.all(contexts.map(c => c.close()));
});





test("Private game with three players", async ({ browser }) => {
  test.setTimeout(120000);

  const contexts = await Promise.all([browser.newContext(), browser.newContext(), browser.newContext()]);
  const players = await Promise.all(contexts.map(ctx => ctx.newPage()));

  await players[0].goto('/Home');
  await players[0].getByLabel('Players:').selectOption('3');
  await players[0].getByRole('button', { name: 'Create lobby' }).click();
  const lobbyCode = players[0].url().split('/').pop()!;

  await players[1].goto('/Home');
  await players[1].getByRole('textbox', { name: 'room code' }).fill(lobbyCode);
  await players[1].getByRole('button', { name: 'Join lobby' }).click();

  await players[2].goto('/Home');
  await players[2].getByRole('textbox', { name: 'room code' }).fill(lobbyCode);
  await players[2].getByRole('button', { name: 'Join lobby' }).click();

  await Promise.all(players.map(p => p.locator('#paragraph').waitFor({ state: 'visible' })));

  const paragraphText = await players[0].locator('#paragraph').innerText();

  await Promise.all(players.map(async (p) => {
    for (let i = 0; i < 10; i++) {
      const disabled = await p.locator('#game-input-field').isDisabled();
      if (!disabled) break;
      await p.waitForTimeout(1000);
    }
  }));

  await Promise.all([
    players[0].locator('#game-input-field').pressSequentially(paragraphText, { delay: 30 }),
    players[1].locator('#game-input-field').pressSequentially(paragraphText, { delay: 35 }),
    players[2].locator('#game-input-field').pressSequentially(paragraphText, { delay: 40 }),
  ]);

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

  await players[0].goto('/Home');
  await players[0].getByLabel('Players:').selectOption('4');
  await players[0].getByRole('button', { name: 'Create lobby' }).click();
  const lobbyCode = players[0].url().split('/').pop()!;

  for (const player of players.slice(1)) {
    await player.goto('/Home');
    await player.getByRole('textbox', { name: 'room code' }).fill(lobbyCode);
    await player.getByRole('button', { name: 'Join lobby' }).click();
  }

  await Promise.all(players.map(p => p.locator('#paragraph').waitFor({ state: 'visible' })));

  const paragraphText = await players[0].locator('#paragraph').innerText();

  await Promise.all(players.map(async (p) => {
    for (let i = 0; i < 10; i++) {
      const disabled = await p.locator('#game-input-field').isDisabled();
      if (!disabled) break;
      await p.waitForTimeout(1000);
    }
  }));

  await Promise.all([
    players[0].locator('#game-input-field').pressSequentially(paragraphText, { delay: 30 }),
    players[1].locator('#game-input-field').pressSequentially(paragraphText, { delay: 35 }),
    players[2].locator('#game-input-field').pressSequentially(paragraphText, { delay: 40 }),
    players[3].locator('#game-input-field').pressSequentially(paragraphText, { delay: 45 }),
  ]);

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

  await players[0].goto('/Home');
  await players[0].getByLabel('Players:').selectOption('5');
  await players[0].getByRole('button', { name: 'Create lobby' }).click();
  const lobbyCode = players[0].url().split('/').pop()!;

  for (const player of players.slice(1)) {
    await player.goto('/Home');
    await player.getByRole('textbox', { name: 'room code' }).fill(lobbyCode);
    await player.getByRole('button', { name: 'Join lobby' }).click();
  }

  await Promise.all(players.map(p => p.locator('#paragraph').waitFor({ state: 'visible' })));

  const paragraphText = await players[0].locator('#paragraph').innerText();

  await Promise.all(players.map(async (p) => {
    for (let i = 0; i < 10; i++) {
      const disabled = await p.locator('#game-input-field').isDisabled();
      if (!disabled) break;
      await p.waitForTimeout(1000);
    }
  }));

  await Promise.all([
    players[0].locator('#game-input-field').pressSequentially(paragraphText, { delay: 30 }),
    players[1].locator('#game-input-field').pressSequentially(paragraphText, { delay: 35 }),
    players[2].locator('#game-input-field').pressSequentially(paragraphText, { delay: 40 }),
    players[3].locator('#game-input-field').pressSequentially(paragraphText, { delay: 45 }),
    players[4].locator('#game-input-field').pressSequentially(paragraphText, { delay: 50 }),
  ]);

  await expect(players[0].locator('.rank-img').first()).toHaveAttribute('src', /1st.png/, { timeout: 5000 });
  await expect(players[1].locator('.rank-img').nth(1)).toHaveAttribute('src', /2nd.png/, { timeout: 5000 });
  await expect(players[2].locator('.rank-img').nth(2)).toHaveAttribute('src', /3rd.png/, { timeout: 5000 });
  await expect(players[3].locator('.rank-img').nth(3)).toHaveAttribute('src', /4th.png/, { timeout: 5000 });
  await expect(players[4].locator('.rank-img').nth(4)).toHaveAttribute('src', /5th.png/, { timeout: 5000 });

  await Promise.all(players.map(p => p.close()));
  await Promise.all(contexts.map(c => c.close()));
});
