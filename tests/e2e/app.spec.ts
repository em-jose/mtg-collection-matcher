import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', '..', 'src', 'data', 'fixtures');
const monoBlueText = fs.readFileSync(path.join(dataDir, 'mono_blue_terror.txt'), 'utf-8');
const grixisAffinityText = fs.readFileSync(path.join(dataDir, 'grixis_affinity.txt'), 'utf-8');

// Small collection subset for fast tests (no need to paste the full CSV)
const testCollection = `4 Delver of Secrets
4 Tolarian Terror
4 Counterspell
4 Brainstorm
2 Ponder
20 Island
4 Myr Enforcer
4 Thoughtcast
4 Ichor Wellspring
3 Galvanic Blast
4 Drossforge Bridge
4 Mistvault Bridge
3 Silverbluff Bridge
3 Seat of the Synod
3 Vault of Whispers
2 Great Furnace`;

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('renders the main heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /MTG Collection Matcher/i })).toBeVisible();
  });

  test('shows collection summary after pasting collection', async ({ page }) => {
    await page.goto('/');

    const collectionTextarea = page.locator('textarea').first();
    await collectionTextarea.fill(testCollection);

    await expect(page.getByText(/unique cards/i)).toBeVisible();
  });

  test('compare button is disabled without data', async ({ page }) => {
    await page.goto('/');
    const button = page.getByRole('button', { name: /Compare Collection/i });
    await expect(button).toBeDisabled();
  });

  test('compare button enables after entering collection and deck', async ({ page }) => {
    await page.goto('/');

    // Fill collection
    const collectionTextarea = page.locator('textarea').first();
    await collectionTextarea.fill(testCollection);

    // Fill deck
    const deckTextarea = page.locator('textarea').nth(1);
    await deckTextarea.fill(monoBlueText);

    const button = page.getByRole('button', { name: /Compare Collection/i });
    await expect(button).toBeEnabled();
  });

  test('can add and remove deck inputs', async ({ page }) => {
    await page.goto('/');

    // Initially 1 deck input
    await expect(page.locator('textarea').nth(1)).toBeVisible();

    // Add another deck
    await page.getByRole('button', { name: /Add another deck/i }).click();

    // Should now have 3 textareas (1 collection + 2 decks)
    await expect(page.locator('textarea')).toHaveCount(3);

    // Remove the second deck (click the X button)
    const removeButtons = page.locator('button[title="Remove deck"]');
    await removeButtons.first().click();

    // Back to 2 textareas
    await expect(page.locator('textarea')).toHaveCount(2);
  });
});

test.describe('Comparison Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('full comparison flow with one deck', async ({ page }) => {
    await page.goto('/');

    // Fill collection
    await page.locator('textarea').first().fill(testCollection);

    // Fill Mono Blue Terror deck
    const deckNameInput = page.locator('input[placeholder*="Deck name"]').first();
    await deckNameInput.fill('Mono Blue Terror');
    await page.locator('textarea').nth(1).fill(monoBlueText);

    // Click compare
    await page.getByRole('button', { name: /Compare Collection/i }).click();

    // Should navigate to results
    await expect(page).toHaveURL(/\/results/);

    // Should show the deck name
    await expect(page.getByText('Mono Blue Terror')).toBeVisible();

    // Should show percentage
    await expect(page.getByText(/%/)).toBeVisible();

    // Should show "You have X of Y cards"
    await expect(page.getByText(/You have \d+ of \d+ cards/)).toBeVisible();
  });

  test('full comparison flow with two decks shows shared cards', async ({ page }) => {
    await page.goto('/');

    // Fill collection
    await page.locator('textarea').first().fill(testCollection);

    // Fill first deck
    await page.locator('input[placeholder*="Deck name"]').first().fill('Mono Blue Terror');
    await page.locator('textarea').nth(1).fill(monoBlueText);

    // Add second deck
    await page.getByRole('button', { name: /Add another deck/i }).click();
    await page.locator('input[placeholder*="Deck name"]').nth(1).fill('Grixis Affinity');
    await page.locator('textarea').nth(2).fill(grixisAffinityText);

    // Click compare
    await page.getByRole('button', { name: /Compare Collection/i }).click();

    // Should show both deck headings
    await expect(page.getByRole('heading', { name: 'Mono Blue Terror' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Grixis Affinity' })).toBeVisible();

    // Should show shared cards section (Blue Elemental Blast is in both)
    await expect(page.getByText(/Shared Cards Between Decks/i)).toBeVisible();

    // Should show "All Missing Cards" section
    await expect(page.getByText(/All Missing Cards/i)).toBeVisible();
  });

  test('deck details expand to show missing and owned cards', async ({ page }) => {
    await page.goto('/');

    await page.locator('textarea').first().fill(testCollection);
    await page.locator('input[placeholder*="Deck name"]').first().fill('Mono Blue Terror');
    await page.locator('textarea').nth(1).fill(monoBlueText);

    await page.getByRole('button', { name: /Compare Collection/i }).click();

    // Click on the deck to expand
    await page.getByText(/Show details/i).click();

    // Should show Missing section
    await expect(page.getByText(/Missing \(\d+ cards\)/)).toBeVisible();

    // Should show Owned section
    await expect(page.getByText(/Owned \(\d+ cards\)/)).toBeVisible();

    // Should show "Copy missing" button
    await expect(page.getByRole('button', { name: /Copy missing/i })).toBeVisible();
  });
});

test.describe('Persistence', () => {
  test('data persists after page reload', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Fill collection and deck
    await page.locator('textarea').first().fill(testCollection);
    await page.locator('input[placeholder*="Deck name"]').first().fill('Test Deck');
    await page.locator('textarea').nth(1).fill('4 Lightning Bolt');

    // Reload page
    await page.reload();

    // Collection should still be there
    const collectionValue = await page.locator('textarea').first().inputValue();
    expect(collectionValue).toContain('Delver of Secrets');

    // Deck name should still be there
    const deckName = await page.locator('input[placeholder*="Deck name"]').first().inputValue();
    expect(deckName).toBe('Test Deck');

    // Deck content should still be there
    const deckContent = await page.locator('textarea').nth(1).inputValue();
    expect(deckContent).toContain('Lightning Bolt');
  });

  test('results are available after reload on /results', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Fill and compare
    await page.locator('textarea').first().fill(testCollection);
    await page.locator('input[placeholder*="Deck name"]').first().fill('Mono Blue Terror');
    await page.locator('textarea').nth(1).fill(monoBlueText);
    await page.getByRole('button', { name: /Compare Collection/i }).click();

    // Wait for results to appear
    await expect(page.getByText(/You have \d+ of \d+ cards/)).toBeVisible();

    // Reload on /results
    await page.reload();

    // Results should still be visible (auto-comparison on mount)
    await expect(page.getByText('Mono Blue Terror')).toBeVisible();
    await expect(page.getByText(/You have \d+ of \d+ cards/)).toBeVisible();
  });

  test('reset all clears everything', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Fill data
    await page.locator('textarea').first().fill(testCollection);
    await page.locator('textarea').nth(1).fill('4 Lightning Bolt');

    // Click reset
    await page.getByRole('button', { name: /Reset all/i }).click();

    // Confirm in modal
    await page.getByRole('button', { name: /Reset all/i }).nth(1).click();

    // Collection should be empty
    const collectionValue = await page.locator('textarea').first().inputValue();
    expect(collectionValue).toBe('');

    // Deck should be empty
    const deckValue = await page.locator('textarea').nth(1).inputValue();
    expect(deckValue).toBe('');
  });
});

test.describe('Navigation', () => {
  test('can navigate between Input and Results tabs', async ({ page }) => {
    await page.goto('/');

    // Click Results nav link
    await page.getByRole('link', { name: 'Results' }).click();
    await expect(page).toHaveURL(/\/results/);

    // Click Input nav link
    await page.getByRole('link', { name: 'Input' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('results page shows empty state without data', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/results');

    await expect(page.getByText(/No results yet/i)).toBeVisible();
  });
});
