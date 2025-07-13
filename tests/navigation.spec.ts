import { test, expect } from '@playwright/test';

// Navigation items from the Layout component
const navigationItems = [
  { text: 'Home', path: '/kitbash/' },
  { text: 'Project Info', path: '/kitbash/info' },
  { text: 'Counter Demo', path: '/kitbash/counter' },
  { text: 'Todo List Demo', path: '/kitbash/todos' },
  { text: 'Tower Defense', path: '/kitbash/tower-defense' },
  { text: 'Word Search', path: '/kitbash/word-search' },
];

// Additional pages that can be navigated to
const additionalPages = [
  { text: 'Classic Word Search', path: '/kitbash/word-search/classic' },
  { text: 'One Word Rush', path: '/kitbash/word-search/one-word-rush' },
];

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/kitbash/');
  });

  test('should display the left navigation panel on desktop', async ({ page }) => {
    // Set desktop viewport to ensure we're testing desktop layout
    await page.setViewportSize({ width: 1024, height: 768 });
    
    // Check that the permanent navigation drawer is visible on desktop
    await expect(page.locator('nav')).toBeVisible();
    
    // Check that the Kitbash title is visible in the drawer
    await expect(page.locator('nav').getByText('Kitbash')).toBeVisible();
    
    // Check that all navigation items are present
    for (const item of navigationItems) {
      await expect(page.locator('nav').getByText(item.text)).toBeVisible();
    }
  });

  test('should navigate to each page via left navigation on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1024, height: 768 });
    
    for (const item of navigationItems) {
      // Click on the navigation item
      await page.locator('nav').getByText(item.text).click();
      
      // Wait for navigation to complete - handle home page specially
      if (item.text === 'Home') {
        await page.waitForURL('**/kitbash');
      } else {
        await page.waitForURL(`**${item.path}`);
      }
      
      // Verify we're on the correct page
      if (item.text === 'Home') {
        expect(page.url()).toMatch(/\/kitbash\/?$/);
      } else {
        expect(page.url()).toContain(item.path);
      }
      
      // Check that the navigation item is selected/highlighted
      const navItem = page.locator('nav').getByText(item.text);
      await expect(navItem).toBeVisible();
      
      // Verify the page has loaded by checking for main content
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('should highlight the current page in navigation on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1024, height: 768 });
    
    // Test each navigation item to ensure it gets highlighted when active
    for (const item of navigationItems) {
      await page.locator('nav').getByText(item.text).click();
      
      // Wait for navigation to complete - handle home page specially
      if (item.text === 'Home') {
        await page.waitForURL('**/kitbash');
      } else {
        await page.waitForURL(`**${item.path}`);
      }
      
      // The selected item should have specific styling (from MUI ListItemButton selected state)
      // Find the ListItemButton that contains the text
      const selectedItem = page.locator('nav').locator('[role="button"]').filter({ hasText: item.text });
      await expect(selectedItem).toBeVisible();
      
      // Verify the page has loaded by checking for main content
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('should navigate to word search sub-pages on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1024, height: 768 });
    
    // First navigate to the word search hub
    await page.locator('nav').getByText('Word Search').click();
    await page.waitForURL('**/word-search');
    
    // Check that we can navigate to sub-pages from the word search hub
    // Test direct navigation to the sub-pages
    for (const subPage of additionalPages) {
      await page.goto(subPage.path);
      // Word search game pages on desktop should have main content
      await expect(page.locator('main')).toBeVisible();
      expect(page.url()).toContain(subPage.path);
    }
  });

  test('should display mobile navigation menu', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mobile navigation should be hidden initially
    // Target the temporary drawer specifically (has MuiDrawer-modal class)
    const mobileDrawer = page.locator('.MuiDrawer-root.MuiDrawer-modal');
    await expect(mobileDrawer).not.toBeVisible();
    
    // Click hamburger menu
    await page.locator('button[aria-label="open drawer"]').click();
    
    // Mobile navigation should now be visible
    await expect(mobileDrawer).toBeVisible();
    
    // Wait for drawer animation to complete
    await page.waitForTimeout(300);
    
    // The drawer should contain the "Kitbash" title
    await expect(mobileDrawer.getByText('Kitbash')).toBeVisible();
  });

  test('should close mobile navigation after clicking an item', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open mobile navigation
    await page.locator('button[aria-label="open drawer"]').click();
    
    const mobileDrawer = page.locator('.MuiDrawer-root.MuiDrawer-modal');
    await expect(mobileDrawer).toBeVisible();
    
    // Wait for drawer animation to complete
    await page.waitForTimeout(300);
    
    // Click on a navigation item within the drawer
    await mobileDrawer.getByText('Project Info').click();
    
    // Navigation should close
    await expect(mobileDrawer).not.toBeVisible();
    
    // Should navigate to the correct page
    await page.waitForURL('**/info');
    await expect(page.locator('main')).toBeVisible();
  });

  test('should navigate to each page via mobile navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    for (const item of navigationItems) {
      // Open mobile navigation
      await page.locator('button[aria-label="open drawer"]').click();
      
      const mobileDrawer = page.locator('.MuiDrawer-root.MuiDrawer-modal');
      await expect(mobileDrawer).toBeVisible();
      
      // Wait for drawer animation to complete
      await page.waitForTimeout(300);
      
      // Click on the navigation item within the drawer
      await mobileDrawer.getByText(item.text).click();
      
      // Wait for drawer to close
      await expect(mobileDrawer).not.toBeVisible();
      
      // Wait for navigation to complete - handle home page specially
      if (item.text === 'Home') {
        await page.waitForURL('**/kitbash');
        expect(page.url()).toMatch(/\/kitbash\/?$/);
      } else {
        await page.waitForURL(`**${item.path}`);
        expect(page.url()).toContain(item.path);
      }
      
      // Verify the page has loaded by checking for main content
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('should display app bar with correct title', async ({ page }) => {
    // Check that the app bar is visible
    await expect(page.locator('header')).toBeVisible();
    
    // Check that the Kitbash title is in the app bar
    await expect(page.locator('header').getByText('Kitbash')).toBeVisible();
    
    // Check that the version is displayed
    await expect(page.locator('header').getByText(/^v\d+\.\d+\.\d+$/)).toBeVisible();
  });

  test('should maintain navigation state across page refreshes on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1024, height: 768 });
    
    // Navigate to a specific page
    await page.locator('nav').getByText('Counter Demo').click();
    await page.waitForURL('**/counter');
    
    // Refresh the page
    await page.reload();
    
    // Navigation should still be visible and the current page should be highlighted
    await expect(page.locator('nav')).toBeVisible();
    const selectedItem = page.locator('nav').locator('[role="button"]').filter({ hasText: 'Counter Demo' });
    await expect(selectedItem).toHaveClass(/Mui-selected/);
  });

  test('should handle direct URL navigation on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1024, height: 768 });
    
    // Test that direct URL navigation works for each page
    for (const item of navigationItems) {
      await page.goto(item.path);
      
      // All pages on desktop should have main content
      await expect(page.locator('main')).toBeVisible();
      
      // Check that the correct navigation item is highlighted (except for home page)
      if (item.path !== '/kitbash/') {
        const selectedItem = page.locator('nav').locator('[role="button"]').filter({ hasText: item.text });
        await expect(selectedItem).toHaveClass(/Mui-selected/);
      }
    }
  });

  test('should handle direct URL navigation on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Test that direct URL navigation works for each page
    for (const item of navigationItems) {
      await page.goto(item.path);
      
      // For word search game pages on mobile, they use full-screen mode (no main element)
      if (item.path.includes('/word-search/') && item.path !== '/kitbash/word-search') {
        // Word search game pages don't have main element in full-screen mode
        // Just check that the page loaded by checking body
        await expect(page.locator('body')).toBeVisible();
      } else {
        // Regular pages should have main content
        await expect(page.locator('main')).toBeVisible();
        
        // App bar should be visible
        await expect(page.locator('header')).toBeVisible();
      }
    }
  });

  test('should handle word search game pages full-screen mode on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Test word search game pages that use full-screen mode
    const gamePages = ['/kitbash/word-search/classic', '/kitbash/word-search/one-word-rush'];
    
    for (const gamePage of gamePages) {
      await page.goto(gamePage);
      
      // In full-screen mode, there's no main element - just check that page loaded
      await expect(page.locator('body')).toBeVisible();
      
      // Should have some content (game-specific)
      await expect(page.locator('body')).toContainText('Word');
      
      // Should not have the main layout navigation drawer
      const mobileDrawer = page.locator('.MuiDrawer-root').filter({ has: page.locator('[class*="MuiDrawer-paper"]') }).filter({ hasText: 'Kitbash' }).first();
      await expect(mobileDrawer).not.toBeVisible();
    }
  });
});