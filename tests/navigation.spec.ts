import { test, expect } from '@playwright/test';

// Navigation items from the Layout component
const navigationItems = [
  { text: 'Home', path: '/' },
  { text: 'Project Info', path: '/info' },
  { text: 'Counter Demo', path: '/counter' },
  { text: 'Todo List Demo', path: '/todos' },
  { text: 'Tower Defense', path: '/tower-defense' },
  { text: 'Word Search', path: '/word-search' },
];

// Additional pages that can be navigated to
const additionalPages = [
  { text: 'Classic Word Search', path: '/word-search/classic' },
  { text: 'One Word Rush', path: '/word-search/one-word-rush' },
];

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/');
  });

  test('should display the left navigation panel on desktop', async ({ page }) => {
    // Check that the navigation drawer is visible on desktop
    await expect(page.locator('nav')).toBeVisible();
    
    // Check that the Kitbash title is visible in the drawer
    await expect(page.locator('nav').getByText('Kitbash')).toBeVisible();
    
    // Check that all navigation items are present
    for (const item of navigationItems) {
      await expect(page.locator('nav').getByText(item.text)).toBeVisible();
    }
  });

  test('should navigate to each page via left navigation', async ({ page }) => {
    for (const item of navigationItems) {
      // Click on the navigation item
      await page.locator('nav').getByText(item.text).click();
      
      // Wait for navigation to complete
      await page.waitForURL(`**${item.path}`);
      
      // Verify we're on the correct page
      expect(page.url()).toContain(item.path);
      
      // Check that the navigation item is selected/highlighted
      const navItem = page.locator('nav').getByText(item.text);
      await expect(navItem).toBeVisible();
      
      // Verify the page has loaded by checking for main content
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('should highlight the current page in navigation', async ({ page }) => {
    // Test each navigation item to ensure it gets highlighted when active
    for (const item of navigationItems) {
      await page.locator('nav').getByText(item.text).click();
      await page.waitForURL(`**${item.path}`);
      
      // The selected item should have specific styling (from MUI ListItemButton selected state)
      const selectedItem = page.locator('nav').getByText(item.text).locator('..');
      await expect(selectedItem).toHaveClass(/Mui-selected/);
    }
  });

  test('should navigate to word search sub-pages', async ({ page }) => {
    // First navigate to the word search hub
    await page.locator('nav').getByText('Word Search').click();
    await page.waitForURL('**/word-search');
    
    // Check that we can navigate to sub-pages from the word search hub
    // This depends on the specific implementation of the word search hub page
    // We'll test direct navigation to the sub-pages
    for (const subPage of additionalPages) {
      await page.goto(subPage.path);
      await expect(page.locator('main')).toBeVisible();
      expect(page.url()).toContain(subPage.path);
    }
  });

  test('should display mobile navigation menu', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // On mobile, the navigation should be hidden initially
    const drawer = page.locator('nav [role="presentation"]').first();
    await expect(drawer).toBeHidden();
    
    // Click the menu button to open navigation
    await page.locator('button[aria-label="open drawer"]').click();
    
    // Navigation should now be visible
    await expect(drawer).toBeVisible();
    
    // Navigation items should be present
    for (const item of navigationItems) {
      await expect(page.locator('nav').getByText(item.text)).toBeVisible();
    }
  });

  test('should close mobile navigation after clicking an item', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open mobile navigation
    await page.locator('button[aria-label="open drawer"]').click();
    const drawer = page.locator('nav [role="presentation"]').first();
    await expect(drawer).toBeVisible();
    
    // Click on a navigation item
    await page.locator('nav').getByText('Project Info').click();
    
    // Navigation should close on mobile after clicking
    await expect(drawer).toBeHidden();
    
    // Should navigate to the correct page
    await page.waitForURL('**/info');
    expect(page.url()).toContain('/info');
  });

  test('should display app bar with correct title', async ({ page }) => {
    // Check that the app bar is visible
    await expect(page.locator('header')).toBeVisible();
    
    // Check that the Kitbash title is in the app bar
    await expect(page.locator('header').getByText('Kitbash')).toBeVisible();
    
    // Check that the version is displayed
    await expect(page.locator('header').getByText(/^v\d+\.\d+\.\d+$/)).toBeVisible();
  });

  test('should maintain navigation state across page refreshes', async ({ page }) => {
    // Navigate to a specific page
    await page.locator('nav').getByText('Counter Demo').click();
    await page.waitForURL('**/counter');
    
    // Refresh the page
    await page.reload();
    
    // Navigation should still be visible and the current page should be highlighted
    await expect(page.locator('nav')).toBeVisible();
    const selectedItem = page.locator('nav').getByText('Counter Demo').locator('..');
    await expect(selectedItem).toHaveClass(/Mui-selected/);
  });

  test('should handle direct URL navigation', async ({ page }) => {
    // Test that direct URL navigation works for each page
    for (const item of navigationItems) {
      await page.goto(item.path);
      await expect(page.locator('main')).toBeVisible();
      
      // Check that the correct navigation item is highlighted
      if (item.path !== '/') { // Home page might not have the same highlighting behavior
        const selectedItem = page.locator('nav').getByText(item.text).locator('..');
        await expect(selectedItem).toHaveClass(/Mui-selected/);
      }
    }
  });
});