import { test, expect, type BrowserContext, type Page } from "@playwright/test";

async function openPrivateSection(page: Page) {
  const setupBtn = page.getByRole("button", { name: /Set up/i });
  if (await setupBtn.isVisible()) {
    await setupBtn.click();
  }
}

async function waitForGeneratedRoomCode(page: Page) {
  await openPrivateSection(page);
  await expect
    .poll(async () => {
      const hintText = (await page.locator(".private-hint").textContent()) ?? "";
      return hintText.replace("Room code:", "").trim();
    })
    .not.toBe("generating…");
}

async function createPrivateLobby(page: Page, size: number) {
  await page.goto("/Home");
  await openPrivateSection(page);
  await waitForGeneratedRoomCode(page);
  await page.getByLabel("Players:").selectOption(String(size));
  await page.getByRole("button", { name: "Create lobby" }).click();
  await expect(page).toHaveURL(/\/Play\//);
  return page.url().split("/").pop()!;
}

async function joinPrivateLobby(page: Page, lobbyCode: string) {
  await page.goto("/Home");
  await openPrivateSection(page);
  await page.getByRole("textbox", { name: "room code" }).fill(lobbyCode);
  await page.getByRole("button", { name: "Join lobby" }).click();
  await expect(page).toHaveURL(new RegExp(`/Play/${lobbyCode}$`));
}

async function waitForPlayerPanels(page: Page, count: number) {
  await expect(page.locator(".play-panel")).toHaveCount(count, { timeout: 10000 });
}

async function waitForGameInputEnabled(page: Page) {
  await page.locator("#paragraph").waitFor({ state: "visible" });
  await expect(page.locator("#game-input-field")).toBeEnabled({ timeout: 15000 });
}

async function finishRaceInRankOrder(players: Page[], paragraphText: string) {
  await Promise.all(
    players.map(async (page, index) => {
      if (index > 0) {
        await page.waitForTimeout(index * 500);
      }
      await page.locator("#game-input-field").pressSequentially(paragraphText, { delay: 30 });
    })
  );
}

async function closePlayerSessions(players: Page[], contexts: BrowserContext[]) {
  await Promise.allSettled(players.map((page) => page.close()));
  await Promise.allSettled(contexts.map((context) => context.close()));
}

async function assertPlayerRank(page: Page, rankPattern: RegExp, timeout = 10000) {
  const myPanel = page.locator('.play-panel', { has: page.locator('b:has-text("(You)")') });
  await expect(myPanel.locator('.rank-img')).toHaveAttribute('src', rankPattern, { timeout });
}

test("home page loads and shows mode cards", async ({ page }) => {
  await page.goto("/Home");
  await expect(page.getByRole("button", { name: /Join a race/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Start practicing/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Set up/i })).toBeVisible();
});

test("home page can open private section and create a lobby", async ({ page }) => {
  await page.goto("/Home");
  await openPrivateSection(page);
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
  // Use a unique email each run so it is never already in the DB.
  // The server checks email before username, so a pre-existing email would
  // produce "Email already exists." and mask the username conflict.
  const uniqueEmail = `signup-test-${Date.now()}@example.test`;
  await page.goto('/SignUp');
  await page.getByRole('textbox', { name: 'Email Address' }).fill(uniqueEmail);
  await page.getByRole('textbox', { name: 'Username' }).fill('GhostTyper');
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



test("Play Again button appears after finishing single player game", async ({ page }) => {
  await page.goto('/Practice');
  await expect(page.locator('#game-input-field')).toBeEnabled();
  const paragraphText = await page.locator('#paragraph').innerText();
  await page.locator('#game-input-field').pressSequentially(paragraphText!, { delay: 50 });
  await expect(page.getByRole('button', { name: 'Play Again' })).toBeVisible({ timeout: 5000 });
});



test("Public game with two players", async ({ browser }) => {
  test.setTimeout(120000);
  const contexts = await Promise.all([browser.newContext(), browser.newContext()]);
  const players = await Promise.all(contexts.map(ctx => ctx.newPage()));

  await players[0].goto('/Home');
  await players[0].getByRole('button', { name: 'Join a race →' }).click();

  await players[1].goto('/Home');
  await players[1].getByRole('button', { name: 'Join a race →' }).click();

  await players[0].locator('#paragraph').waitFor({ state: 'visible' });
  await players[1].locator('#paragraph').waitFor({ state: 'visible' });

  const paragraphText = await players[0].locator('#paragraph').innerText();

  try {
    await Promise.all(players.map(waitForGameInputEnabled));

    await Promise.all([
      players[0].locator('#game-input-field').pressSequentially(paragraphText, { delay: 30 }),
      players[1].locator('#game-input-field').pressSequentially(paragraphText, { delay: 35 }),
    ]);

    await assertPlayerRank(players[0], /1st\.png/);
    await assertPlayerRank(players[1], /2nd\.png/);
  } finally {
    await Promise.all(players.map(p => p.close()));
    await Promise.all(contexts.map(c => c.close()));
  }
});




test("Private game with two players", async ({ browser }) => {
  test.setTimeout(120000);

  const contexts = await Promise.all([browser.newContext(), browser.newContext()]);
  const players = await Promise.all(contexts.map(ctx => ctx.newPage()));

  const lobbyCode = await createPrivateLobby(players[0], 2);
  await joinPrivateLobby(players[1], lobbyCode);

  await Promise.all(players.map(p => p.locator('#paragraph').waitFor({ state: 'visible' })));

  const paragraphText = await players[0].locator('#paragraph').innerText();

  try {
    await Promise.all(players.map(waitForGameInputEnabled));

    await Promise.all([
      players[0].locator('#game-input-field').pressSequentially(paragraphText, { delay: 30 }),
      players[1].locator('#game-input-field').pressSequentially(paragraphText, { delay: 35 }),
    ]);

    await assertPlayerRank(players[0], /1st\.png/);
    await assertPlayerRank(players[1], /2nd\.png/);
  } finally {
    await Promise.all(players.map(p => p.close()));
    await Promise.all(contexts.map(c => c.close()));
  }
});





test("Private game with three players", async ({ browser }) => {
  test.setTimeout(120000);

  const contexts = await Promise.all([browser.newContext(), browser.newContext(), browser.newContext()]);
  const players = await Promise.all(contexts.map(ctx => ctx.newPage()));
  try {
    const lobbyCode = await createPrivateLobby(players[0], 3);
    await joinPrivateLobby(players[1], lobbyCode);
    await joinPrivateLobby(players[2], lobbyCode);

    await Promise.all(players.map(p => p.locator('#paragraph').waitFor({ state: 'visible' })));

    const paragraphText = await players[0].locator('#paragraph').innerText();

    await Promise.all(players.map(waitForGameInputEnabled));
    await finishRaceInRankOrder(players, paragraphText);

    await assertPlayerRank(players[0], /1st\.png/);
    await assertPlayerRank(players[1], /2nd\.png/);
    await assertPlayerRank(players[2], /3rd\.png/);
  } finally {
    await closePlayerSessions(players, contexts);
  }
});






test("Private game with four players", async ({ browser }) => {
  test.setTimeout(120000);

  const contexts = await Promise.all([browser.newContext(), browser.newContext(), browser.newContext(), browser.newContext()]);
  const players = await Promise.all(contexts.map(ctx => ctx.newPage()));
  try {
    const lobbyCode = await createPrivateLobby(players[0], 4);

    for (const player of players.slice(1)) {
      await joinPrivateLobby(player, lobbyCode);
    }

    await Promise.all(players.map(p => p.locator('#paragraph').waitFor({ state: 'visible' })));

    const paragraphText = await players[0].locator('#paragraph').innerText();

    await Promise.all(players.map(waitForGameInputEnabled));
    await finishRaceInRankOrder(players, paragraphText);

    await assertPlayerRank(players[0], /1st\.png/);
    await assertPlayerRank(players[1], /2nd\.png/);
    await assertPlayerRank(players[2], /3rd\.png/);
    await assertPlayerRank(players[3], /4th\.png/);
  } finally {
    await closePlayerSessions(players, contexts);
  }
});







test("Private game with five players", async ({ browser }) => {
  test.setTimeout(120000);

  const contexts = await Promise.all([browser.newContext(), browser.newContext(), browser.newContext(), browser.newContext(), browser.newContext()]);
  const players = await Promise.all(contexts.map(ctx => ctx.newPage()));
  try {
    const lobbyCode = await createPrivateLobby(players[0], 5);

    for (const player of players.slice(1)) {
      await joinPrivateLobby(player, lobbyCode);
    }

    await Promise.all(players.map(p => p.locator('#paragraph').waitFor({ state: 'visible' })));

    const paragraphText = await players[0].locator('#paragraph').innerText();

    await Promise.all(players.map(waitForGameInputEnabled));
    await finishRaceInRankOrder(players, paragraphText);

    await assertPlayerRank(players[0], /1st\.png/);
    await assertPlayerRank(players[1], /2nd\.png/);
    await assertPlayerRank(players[2], /3rd\.png/);
    await assertPlayerRank(players[3], /4th\.png/);
    await assertPlayerRank(players[4], /5th\.png/);
  } finally {
    await closePlayerSessions(players, contexts);
  }
});





test("Play Again and results appear when timer expires before player finishes typing", async ({ browser }) => {
  test.setTimeout(120000);

  const contexts = await Promise.all([browser.newContext(), browser.newContext()]);
  const players = await Promise.all(contexts.map(ctx => ctx.newPage()));

  try {
    const lobbyCode = await createPrivateLobby(players[0], 2);
    await joinPrivateLobby(players[1], lobbyCode);

    await Promise.all(players.map(p => p.locator('#paragraph').waitFor({ state: 'visible' })));
    await Promise.all(players.map(waitForGameInputEnabled));

    // Type only the first few characters of the actual paragraph (not the full text)
    const paragraphText = await players[0].locator('#paragraph').innerText();
    const partialText = paragraphText.slice(0, 40);
    await players[0].locator('#game-input-field').pressSequentially(partialText, { delay: 50 });

    // Wait for timer to reach exactly 0
    await expect(players[0].locator('.time b')).toHaveText('0', { timeout: 65000 });

    // Play Again button should appear when timer expires
    await expect(players[0].getByRole('button', { name: 'Play Again' })).toBeVisible({ timeout: 5000 });

    // WPM should be displayed and greater than 0 since we typed correct characters
    const wpmText = await players[0].locator('.wpm span').innerText();
    expect(Number(wpmText)).toBeGreaterThan(0);
  } finally {
    await Promise.all(players.map(p => p.close()));
    await Promise.all(contexts.map(c => c.close()));
  }
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
  await joinPrivateLobby(returningPlayerPage, secondLobbyCode);

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



// ── Practice mode ────────────────────────────────────────────────────────────

test("Practice button navigates to /Practice", async ({ page }) => {
  await page.goto("/Home");
  await page.getByRole("button", { name: /Start practicing/i }).click();
  await expect(page).toHaveURL(/\/Practice$/);
});

test("practice page shows paragraph text immediately with no countdown", async ({ page }) => {
  await page.goto("/Practice");
  await expect(page.locator("#paragraph")).toBeVisible();
  // Input is enabled straight away — no countdown to wait through
  await expect(page.locator("#game-input-field")).toBeEnabled();
});

test("practice page shows elapsed timer label 'Time:'", async ({ page }) => {
  await page.goto("/Practice");
  await expect(page.locator(".time p")).toHaveText("Time:");
});

test("practice page timer counts up from 0", async ({ page }) => {
  await page.goto("/Practice");
  // Timer has not started yet — should show 0 regardless of page load time
  await expect(page.locator(".time b")).toHaveText("0");
  // Type a character to start the timer
  await page.locator("#game-input-field").pressSequentially("a");
  // After a couple of seconds the counter has advanced
  await page.waitForTimeout(3000);
  const elapsed = Number(await page.locator(".time b").innerText());
  expect(elapsed).toBeGreaterThanOrEqual(1);
});

test("practice mode: typing shows Play Again after completing the paragraph", async ({ page }) => {
  await page.goto("/Practice");
  await expect(page.locator("#game-input-field")).toBeEnabled();
  const paragraphText = await page.locator("#paragraph").innerText();
  await page.locator("#game-input-field").pressSequentially(paragraphText, { delay: 20 });
  await expect(page.getByRole("button", { name: "Play Again" })).toBeVisible({ timeout: 5000 });
});

test("practice mode: character disappears from race track on completion", async ({ page }) => {
  await page.goto("/Practice");
  await expect(page.locator("#game-input-field")).toBeEnabled();
  const paragraphText = await page.locator("#paragraph").innerText();
  await page.locator("#game-input-field").pressSequentially(paragraphText, { delay: 20 });
  // hideCharacterOnComplete removes both character-img and rank-img
  await expect(page.locator(".character-img")).toHaveCount(0, { timeout: 5000 });
  await expect(page.locator(".rank-img")).toHaveCount(0, { timeout: 5000 });
});

test("practice mode: Play Again loads a new paragraph", async ({ page }) => {
  await page.goto("/Practice");
  await expect(page.locator("#game-input-field")).toBeEnabled();
  const firstParagraph = await page.locator("#paragraph").innerText();
  await page.locator("#game-input-field").pressSequentially(firstParagraph, { delay: 20 });
  await page.getByRole("button", { name: "Play Again" }).click();
  // After reset no char should be marked correct
  const correctCount = await page.locator(".char.correct").count();
  expect(correctCount).toBe(0);
});

test("practice mode: timer does not end the game at 60 seconds", async ({ page }) => {
  test.setTimeout(90000);
  await page.goto("/Practice");
  // Wait past the normal 60 s game limit without typing
  await page.waitForTimeout(62000);
  // Play Again should NOT appear — practice has no time limit
  await expect(page.getByRole("button", { name: "Play Again" })).not.toBeVisible();
});
