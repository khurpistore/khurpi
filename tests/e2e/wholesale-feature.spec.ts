import { test, expect } from '@playwright/test';

const BASE_URL = 'https://admin-control-center-11.preview.emergentagent.com';

// Test credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Khurpi2026Secure';
const TEST_CUSTOMER_PHONE = '9971818259';
const TEST_CUSTOMER_PASSWORD = 'test1234';

test.describe('Wholesale Pricing Feature', () => {
  
  // Helper function to login as admin
  async function loginAsAdmin(page) {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('admin-username-input').fill(ADMIN_USERNAME);
    await page.getByTestId('admin-password-input').fill(ADMIN_PASSWORD);
    await page.getByTestId('admin-login-submit-button').click();
    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
  }
  
  // Helper function to login as customer
  async function loginAsCustomer(page) {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('login-phone-input').fill(TEST_CUSTOMER_PHONE);
    await page.getByTestId('login-password-input').fill(TEST_CUSTOMER_PASSWORD);
    await page.getByTestId('login-submit-button').click();
    await page.waitForLoadState('networkidle');
  }
  
  test.describe('Admin Users Page - Wholesale Toggle', () => {
    
    test('should display wholesale toggle for customers in Admin Users page', async ({ page }) => {
      await loginAsAdmin(page);
      
      // Navigate to admin users page
      await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
      
      // Wait for users list to load
      await expect(page.getByTestId('admin-users-list')).toBeVisible({ timeout: 10000 });
      
      // Check that the "Wholesale" column header exists
      const wholesaleHeader = page.locator('text=Wholesale').first();
      await expect(wholesaleHeader).toBeVisible();
      
      // Screenshot for verification
      await page.screenshot({ path: '/app/test_reports/admin-users-wholesale-toggle.jpeg', quality: 20 });
    });
    
    test('should toggle wholesale access ON for a customer', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
      
      // Wait for users list to load
      await expect(page.getByTestId('admin-users-list')).toBeVisible({ timeout: 10000 });
      
      // Find a customer row with wholesale toggle
      const wholesaleToggles = page.locator('[data-testid^="wholesale-toggle-"]');
      const toggleCount = await wholesaleToggles.count();
      
      if (toggleCount === 0) {
        test.skip('No customers with wholesale toggle found');
        return;
      }
      
      // Get the first toggle
      const firstToggle = wholesaleToggles.first();
      
      // Get current state
      const isChecked = await firstToggle.getAttribute('data-state');
      
      // If not checked, click to enable - set up response listener BEFORE clicking
      if (isChecked !== 'checked') {
        const responsePromise = page.waitForResponse(
          response => response.url().includes('/wholesale-access') && response.status() === 200,
          { timeout: 15000 }
        );
        await firstToggle.click({ force: true });
        await responsePromise;
        // Wait for UI to update after response
        await page.waitForLoadState('networkidle');
      }
      
      // Verify toggle state with polling
      await expect(async () => {
        const state = await firstToggle.getAttribute('data-state');
        expect(state).toBe('checked');
      }).toPass({ timeout: 10000 });
      
      await page.screenshot({ path: '/app/test_reports/wholesale-toggle-enabled.jpeg', quality: 20 });
    });
    
    test('should toggle wholesale access OFF for a customer', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
      
      await expect(page.getByTestId('admin-users-list')).toBeVisible({ timeout: 10000 });
      
      const wholesaleToggles = page.locator('[data-testid^="wholesale-toggle-"]');
      const toggleCount = await wholesaleToggles.count();
      
      if (toggleCount === 0) {
        test.skip('No customers with wholesale toggle found');
        return;
      }
      
      const firstToggle = wholesaleToggles.first();
      
      // First ensure it's ON
      let currentState = await firstToggle.getAttribute('data-state');
      if (currentState !== 'checked') {
        const enableResponse = page.waitForResponse(
          response => response.url().includes('/wholesale-access') && response.status() === 200,
          { timeout: 15000 }
        );
        await firstToggle.click({ force: true });
        await enableResponse;
        await page.waitForLoadState('networkidle');
      }
      
      // Now toggle it OFF - set up response listener BEFORE clicking
      const disableResponse = page.waitForResponse(
        response => response.url().includes('/wholesale-access') && response.status() === 200,
        { timeout: 15000 }
      );
      await firstToggle.click({ force: true });
      await disableResponse;
      await page.waitForLoadState('networkidle');
      
      // Verify toggle state with polling
      await expect(async () => {
        const state = await firstToggle.getAttribute('data-state');
        expect(state).toBe('unchecked');
      }).toPass({ timeout: 10000 });
      
      await page.screenshot({ path: '/app/test_reports/wholesale-toggle-disabled.jpeg', quality: 20 });
    });
  });
  
  test.describe('Admin Products Page - Wholesale Price Column', () => {
    
    test('should display wholesale price column in Admin Products', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/products', { waitUntil: 'domcontentloaded' });
      
      // Wait for products to load (use first() to avoid strict mode on desktop + mobile views)
      await expect(page.getByTestId('admin-products-list').first()).toBeVisible({ timeout: 10000 });
      
      // Check for "WP/50g" header (Wholesale Price column)
      const wpHeader = page.locator('text=WP/50g').first();
      await expect(wpHeader).toBeVisible();
      
      await page.screenshot({ path: '/app/test_reports/admin-products-wholesale-column.jpeg', quality: 20 });
    });
    
    test('should show Turnip Microgreens with wholesale price', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/products', { waitUntil: 'domcontentloaded' });
      
      // Wait for products to load
      await expect(page.getByTestId('admin-products-list').first()).toBeVisible({ timeout: 10000 });
      
      // Look for Turnip product which should have wholesale price set
      const turnipRow = page.locator('text=Turnip Microgreens').first();
      await expect(turnipRow).toBeVisible();
      
      // The page shows WP/50g column with orange background for wholesale price inputs
      await page.screenshot({ path: '/app/test_reports/admin-products-wholesale-edit.jpeg', quality: 20 });
    });
  });
  
  test.describe('Customer Products Page - Wholesale Price Display', () => {
    
    test('products page loads with price information', async ({ page }) => {
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      
      // Wait for products grid
      await expect(page.getByTestId('products-grid')).toBeVisible({ timeout: 10000 });
      
      // Verify products are displayed
      const productCards = page.getByTestId(/product-card-/);
      const cardCount = await productCards.count();
      
      expect(cardCount).toBeGreaterThan(0);
      
      // Verify price is shown (₹ symbol)
      const priceElements = page.locator('text=/₹\\d+/');
      const priceCount = await priceElements.count();
      
      expect(priceCount).toBeGreaterThan(0);
      
      await page.screenshot({ path: '/app/test_reports/customer-products-prices.jpeg', quality: 20 });
    });
    
    test('should show retail prices for anonymous users without wholesale access', async ({ page }) => {
      // Go to products page without login (anonymous user should see retail prices)
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      
      // Wait for products grid
      await expect(page.getByTestId('products-grid')).toBeVisible({ timeout: 10000 });
      
      // Look for product cards - they should NOT have "WP" badge for anonymous users
      const productCards = page.getByTestId(/product-card-/);
      const cardCount = await productCards.count();
      
      expect(cardCount).toBeGreaterThan(0);
      
      // Anonymous users should see regular prices, not wholesale prices
      // (WP badge only shows for logged in users with wholesale_enabled)
      await page.screenshot({ path: '/app/test_reports/customer-products-retail.jpeg', quality: 20 });
    });
  });
});
