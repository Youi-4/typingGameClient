import { test, expect } from "@playwright/test";

async function waitForGeneratedRoomCode(page: import("@playwright/test").Page) {
  await expect
    .poll(async () => {
      const hintText = (await page.locator(".lobby-hint").textContent()) ?? "";
      return hintText.replace("Room code:", "").trim();
    })
    .not.toBe("");
}

async function createPrivateLobby(page: import("@playwright/test").Page, size: number) {
  await page.goto("/Home");
  await waitForGeneratedRoomCode(page);
  await page.getByLabel("Players:").selectOption(String(size));
  await page.getByRole("button", { name: "Create lobby" }).click();
  await expect(page).toHaveURL(/\/Play\//);
  return page.url().split("/").pop()!;
}

async function joinPrivateLobby(page: import("@playwright/test").Page, lobbyCode: string) {
  await page.goto("/Home");
  await page.getByRole("textbox", { name: "room code" }).fill(lobbyCode);
  await page.getByRole("button", { name: "Join lobby" }).click();
  await expect(page).toHaveURL(new RegExp(`/Play/${lobbyCode}$`));
}

async function waitForPlayerPanels(page: import("@playwright/test").Page, count: number) {
  await expect(page.locator(".play-panel")).toHaveCount(count, { timeout: 10000 });
}

async function waitForGameInputEnabled(page: import("@playwright/test").Page) {
  await page.locator("#paragraph").waitFor({ state: "visible" });
  await expect(page.locator("#game-input-field")).toBeEnabled({ timeout: 15000 });
}

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

  const lobbyCode = await createPrivateLobby(players[0], 2);
  await joinPrivateLobby(players[1], lobbyCode);

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

  const lobbyCode = await createPrivateLobby(players[0], 3);
  await joinPrivateLobby(players[1], lobbyCode);
  await joinPrivateLobby(players[2], lobbyCode);

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

  const lobbyCode = await createPrivateLobby(players[0], 4);

  for (const player of players.slice(1)) {
    await joinPrivateLobby(player, lobbyCode);
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

  const lobbyCode = await createPrivateLobby(players[0], 5);

  for (const player of players.slice(1)) {
    await joinPrivateLobby(player, lobbyCode);
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





test("Play Again and results appear when timer expires before player finishes typing", async ({ page }) => {
  test.setTimeout(120000);

  // Start a single-player game
  await page.goto('/Home');
  await page.getByRole('button', { name: 'Create lobby' }).click();
  await page.locator('#paragraph').waitFor({ state: 'visible' });

  // Wait for input to be enabled
  for (let i = 0; i < 10; i++) {
    const disabled = await page.locator('#game-input-field').isDisabled();
    if (!disabled) break;
    await page.waitForTimeout(1000);
  }

  // Type only the first few characters of the actual paragraph (not the full text)
  const paragraphText = await page.locator('#paragraph').innerText();
  const partialText = paragraphText.slice(0, 40);
  await page.locator('#game-input-field').pressSequentially(partialText, { delay: 50 });

  // Wait for timer to reach exactly 0
  await expect(page.locator('.time b')).toHaveText('0', { timeout: 65000 });

  // Play Again button should appear when timer expires
  await expect(page.getByRole('button', { name: 'Play Again' })).toBeVisible({ timeout: 5000 });

  // WPM should be displayed and greater than 0 since we typed correct characters
  const wpmText = await page.locator('.wpm span').innerText();
  expect(Number(wpmText)).toBeGreaterThan(0);
});



test("Leaving a private game removes that player from the remaining player's view", async ({ browser }) => {
  test.setTimeout(120000);

  const contexts = await Promise.all([browser.newContext(), browser.newContext()]);
  const [hostPage, guestPage] = await Promise.all(contexts.map(ctx => ctx.newPage()));

  const lobbyCode = await createPrivateLobby(hostPage, 2);
  await joinPrivateLobby(guestPage, lobbyCode);

  await Promise.all([
    waitForPlayerPanels(hostPage, 2),
    waitForPlayerPanels(guestPage, 2),
  ]);

  await guestPage.getByRole("link", { name: "Home" }).click();
  await expect(guestPage).toHaveURL(/\/Home$/);

  await waitForPlayerPanels(hostPage, 1);

  await Promise.all([hostPage.close(), guestPage.close()]);
  await Promise.all(contexts.map(c => c.close()));
});



test("A player can join a new private lobby after leaving a previous one", async ({ browser }) => {
  test.setTimeout(120000);

  const contexts = await Promise.all([
    browser.newContext(),
    browser.newContext(),
    browser.newContext(),
  ]);
  const [firstHostPage, returningPlayerPage, secondHostPage] = await Promise.all(
    contexts.map(ctx => ctx.newPage())
  );

  const firstLobbyCode = await createPrivateLobby(firstHostPage, 2);
  await joinPrivateLobby(returningPlayerPage, firstLobbyCode);

  await Promise.all([
    waitForPlayerPanels(firstHostPage, 2),
    waitForPlayerPanels(returningPlayerPage, 2),
  ]);

  await returningPlayerPage.getByRole("link", { name: "Home" }).click();
  await expect(returningPlayerPage).toHaveURL(/\/Home$/);

  const secondLobbyCode = await createPrivateLobby(secondHostPage, 2);
  await returningPlayerPage.getByRole("textbox", { name: "room code" }).fill(secondLobbyCode);
  await returningPlayerPage.getByRole("button", { name: "Join lobby" }).click();
  await expect(returningPlayerPage).toHaveURL(new RegExp(`/Play/${secondLobbyCode}$`));

  await Promise.all([
    waitForPlayerPanels(secondHostPage, 2),
    waitForPlayerPanels(returningPlayerPage, 2),
    waitForGameInputEnabled(secondHostPage),
    waitForGameInputEnabled(returningPlayerPage),
  ]);

  await Promise.all([firstHostPage.close(), returningPlayerPage.close(), secondHostPage.close()]);
  await Promise.all(contexts.map(c => c.close()));
});



test("A host can create a new private lobby after leaving a previous one", async ({ browser }) => {
  test.setTimeout(120000);

  const contexts = await Promise.all([
    browser.newContext(),
    browser.newContext(),
    browser.newContext(),
  ]);
  const [returningHostPage, firstGuestPage, secondGuestPage] = await Promise.all(
    contexts.map(ctx => ctx.newPage())
  );

  const firstLobbyCode = await createPrivateLobby(returningHostPage, 2);
  await joinPrivateLobby(firstGuestPage, firstLobbyCode);

  await Promise.all([
    waitForPlayerPanels(returningHostPage, 2),
    waitForPlayerPanels(firstGuestPage, 2),
  ]);

  await returningHostPage.getByRole("link", { name: "Home" }).click();
  await expect(returningHostPage).toHaveURL(/\/Home$/);

  await waitForGeneratedRoomCode(returningHostPage);
  await returningHostPage.getByLabel("Players:").selectOption("2");
  await returningHostPage.getByRole("button", { name: "Create lobby" }).click();
  await expect(returningHostPage).toHaveURL(/\/Play\//);
  const secondLobbyCode = returningHostPage.url().split("/").pop()!;

  await joinPrivateLobby(secondGuestPage, secondLobbyCode);

  await Promise.all([
    waitForPlayerPanels(returningHostPage, 2),
    waitForPlayerPanels(secondGuestPage, 2),
    waitForGameInputEnabled(returningHostPage),
    waitForGameInputEnabled(secondGuestPage),
  ]);

  await Promise.all([returningHostPage.close(), firstGuestPage.close(), secondGuestPage.close()]);
  await Promise.all(contexts.map(c => c.close()));
});
