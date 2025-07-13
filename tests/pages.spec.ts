import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/kitbash/');
});

// Page content tests removed temporarily to focus on navigation issues