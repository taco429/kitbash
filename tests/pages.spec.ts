import { test, expect } from '@playwright/test';

test.describe('Page Content Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Home page should load with expected content', async ({ page }) => {
    await page.locator('nav').getByText('Home').click();
    await page.waitForURL('**/');
    
    // Check that the page has loaded
    await expect(page.locator('main')).toBeVisible();
    
    // Home page should have some content (this will depend on your actual home page)
    await expect(page.locator('main')).toContainText('Welcome');
  });

  test('Project Info page should load with expected content', async ({ page }) => {
    await page.locator('nav').getByText('Project Info').click();
    await page.waitForURL('**/info');
    
    await expect(page.locator('main')).toBeVisible();
    
    // Info page should have project information
    await expect(page.locator('main')).toContainText('Project');
  });

  test('Counter Demo page should load with expected content', async ({ page }) => {
    await page.locator('nav').getByText('Counter Demo').click();
    await page.waitForURL('**/counter');
    
    await expect(page.locator('main')).toBeVisible();
    
    // Counter page should have counter functionality
    await expect(page.locator('main')).toContainText('Counter');
  });

  test('Todo List Demo page should load with expected content', async ({ page }) => {
    await page.locator('nav').getByText('Todo List Demo').click();
    await page.waitForURL('**/todos');
    
    await expect(page.locator('main')).toBeVisible();
    
    // Todo page should have todo functionality
    await expect(page.locator('main')).toContainText('Todo');
  });

  test('Tower Defense page should load with expected content', async ({ page }) => {
    await page.locator('nav').getByText('Tower Defense').click();
    await page.waitForURL('**/tower-defense');
    
    await expect(page.locator('main')).toBeVisible();
    
    // Tower defense page should have game content
    await expect(page.locator('main')).toContainText('Tower');
  });

  test('Word Search page should load with expected content', async ({ page }) => {
    await page.locator('nav').getByText('Word Search').click();
    await page.waitForURL('**/word-search');
    
    await expect(page.locator('main')).toBeVisible();
    
    // Word search hub should have word search content
    await expect(page.locator('main')).toContainText('Word');
  });

  test('Classic Word Search page should load directly', async ({ page }) => {
    await page.goto('/word-search/classic');
    
    await expect(page.locator('main')).toBeVisible();
    
    // Classic word search should have game content
    await expect(page.locator('main')).toContainText('Word');
  });

  test('One Word Rush page should load directly', async ({ page }) => {
    await page.goto('/word-search/one-word-rush');
    
    await expect(page.locator('main')).toBeVisible();
    
    // One word rush should have game content
    await expect(page.locator('main')).toContainText('Word');
  });

  test('All pages should have proper document titles', async ({ page }) => {
    const pages = [
      { path: '/', expectedTitle: 'Kitbash' },
      { path: '/info', expectedTitle: 'Kitbash' },
      { path: '/counter', expectedTitle: 'Kitbash' },
      { path: '/todos', expectedTitle: 'Kitbash' },
      { path: '/tower-defense', expectedTitle: 'Kitbash' },
      { path: '/word-search', expectedTitle: 'Kitbash' },
      { path: '/word-search/classic', expectedTitle: 'Kitbash' },
      { path: '/word-search/one-word-rush', expectedTitle: 'Kitbash' },
    ];

    for (const pageDef of pages) {
      await page.goto(pageDef.path);
      await expect(page).toHaveTitle(pageDef.expectedTitle);
    }
  });

  test('All pages should be responsive', async ({ page }) => {
    const pages = ['/', '/info', '/counter', '/todos', '/tower-defense', '/word-search'];
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 1024, height: 768 },  // Tablet
      { width: 375, height: 667 },   // Mobile
    ];

    for (const pagePath of pages) {
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto(pagePath);
        
        // Check that main content is visible
        await expect(page.locator('main')).toBeVisible();
        
        // Check that the page doesn't have horizontal scrollbar
        const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
        const clientWidth = await page.evaluate(() => document.body.clientWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // Allow for rounding
      }
    }
  });
});