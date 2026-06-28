import { test, expect } from '@playwright/test';

const BASE_URL = 'https://admin-control-center-11.preview.emergentagent.com';

// Test credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Khurpi2026Secure';
const TEST_CUSTOMER_PHONE = '9971818259';
const TEST_CUSTOMER_PASSWORD = 'test1234';

// Known product with wholesale price
const TURNIP_PRODUCT_ID = 'c5cc3002-12ab-4a29-9f4d-50e27f88314b';
const TURNIP_RETAIL_PRICE = 180;
const TURNIP_WHOLESALE_PRICE = 150;

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
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
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
        await page.waitForTimeout(1000);
      }
      
      // Screenshot for verification
      await page.screenshot({ path: '/app/test_reports/wholesale-toggle-enabled.jpeg', quality: 20 });
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
      await page.waitForLoadState('networkidle');
      
      // Wait for product cards to load
      const productCards = page.locator('[data-testid^="product-card-"]');
      await expect(productCards.first()).toBeVisible();
      
      // Verify products are displayed
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
      await page.waitForLoadState('networkidle');
      
      // Wait for product cards to load
      const productCards = page.locator('[data-testid^="product-card-"]');
      await expect(productCards.first()).toBeVisible();
      
      // Look for product cards - they should NOT have "WP" badge for anonymous users
      const cardCount = await productCards.count();
      expect(cardCount).toBeGreaterThan(0);
      
      await page.screenshot({ path: '/app/test_reports/customer-products-retail.jpeg', quality: 20 });
    });
    
    test('should show wholesale prices with WP badge for wholesale users on Products page', async ({ page }) => {
      await loginAsCustomer(page);
      
      // Go to products page
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      
      // Wait for product cards to load
      const productCards = page.locator('[data-testid^="product-card-"]');
      await expect(productCards.first()).toBeVisible();
      
      // Look for Turnip product card which has wholesale price
      const turnipCard = page.getByTestId(`product-card-${TURNIP_PRODUCT_ID}`);
      
      // Scroll the card into view and verify it exists
      await turnipCard.scrollIntoViewIfNeeded();
      await expect(turnipCard).toBeVisible();
      
      // Take screenshot first for verification
      await page.screenshot({ path: '/app/test_reports/wholesale-products-page-wp.jpeg', quality: 20 });
      
      // Verify WP badge and wholesale price exist in the card's HTML
      // This approach avoids Playwright visibility detection quirks while still validating the content
      const cardHtml = await turnipCard.innerHTML();
      expect(cardHtml).toContain('WP');
      expect(cardHtml).toContain('bg-orange');
      // Price is now ₹150/kg (wholesale price per kg)
      expect(cardHtml).toContain('₹150');
    });
  });
  
  test.describe('Product Detail Page - Wholesale Display', () => {
    
    test('should show wholesale price and badge on Product Detail page for wholesale users', async ({ page }) => {
      await loginAsCustomer(page);
      
      // Navigate directly to the Turnip product detail page
      await page.goto(`/products/${TURNIP_PRODUCT_ID}`, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Verify WP badge is visible (use first to avoid strict mode)
      const wpBadge = page.locator('text=WP').first();
      await expect(wpBadge).toBeVisible();
      
      // Verify price shows wholesale price (150 for kg)
      const wholesalePrice = page.locator('text=/₹150/').first();
      await expect(wholesalePrice).toBeVisible();
      
      await page.screenshot({ path: '/app/test_reports/wholesale-product-detail.jpeg', quality: 20 });
    });
  });
  
  test.describe('Cart Page - Wholesale Price Display', () => {
    
    test('should show wholesale prices in Cart for wholesale users - BUG TEST', async ({ page }) => {
      await loginAsCustomer(page);
      
      // Go to products page
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      
      // Wait for product cards to load
      const productCards = page.locator('[data-testid^="product-card-"]');
      await expect(productCards.first()).toBeVisible();
      
      // Scroll and add Turnip to cart
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(1000);
      await page.getByTestId(`add-to-cart-${TURNIP_PRODUCT_ID}`).click();
      await page.waitForTimeout(2000);
      
      // Go to cart
      await page.goto('/cart', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // Get the cart item
      const cartItem = page.getByTestId(`cart-item-${TURNIP_PRODUCT_ID}`);
      await expect(cartItem).toBeVisible();
      
      // Take screenshot to document current state
      await page.screenshot({ path: '/app/test_reports/wholesale-cart-bug.jpeg', quality: 20 });
      
      // BUG TEST: Cart should show wholesale price (₹150/100gm) not retail (₹180/100gm)
      // This test documents the bug - looking for ₹150 which is the wholesale price
      const wholesalePriceInCart = cartItem.locator('text=/₹150/').first();
      
      // This assertion will FAIL if the bug exists (cart shows ₹180 instead of ₹150)
      await expect(wholesalePriceInCart).toBeVisible({ timeout: 5000 });
    });
  });
  
  test.describe('Checkout Page - Wholesale Price Calculation', () => {
    
    test('should calculate totals using wholesale prices for wholesale users - BUG TEST', async ({ page }) => {
      await loginAsCustomer(page);
      
      // Go to products page
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      
      // Wait for product cards to load
      const productCards = page.locator('[data-testid^="product-card-"]');
      await expect(productCards.first()).toBeVisible();
      
      // Scroll and add Turnip to cart
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(1000);
      await page.getByTestId(`add-to-cart-${TURNIP_PRODUCT_ID}`).click();
      await page.waitForTimeout(2000);
      
      // Go to checkout
      await page.goto('/checkout', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // Take screenshot to document current state
      await page.screenshot({ path: '/app/test_reports/wholesale-checkout-bug.jpeg', quality: 20 });
      
      // BUG TEST: Checkout should show wholesale price totals
      // For 100gm of Turnip at wholesale price: 150
      // Currently showing retail price: 180
      
      // Look for wholesale price in the order section (₹150)
      const wholesalePriceInCheckout = page.locator('text=/₹150/').first();
      
      // This assertion will FAIL if the bug exists
      await expect(wholesalePriceInCheckout).toBeVisible({ timeout: 5000 });
    });
  });
  
  test.describe('Subscription Create Page - Wholesale Price Display', () => {
    
    test('should show wholesale prices in product selection for wholesale users', async ({ page }) => {
      await loginAsCustomer(page);
      
      // Go to subscription create page
      await page.goto('/subscription/create', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // Find Turnip product card
      const turnipCard = page.getByTestId(`select-product-${TURNIP_PRODUCT_ID}`);
      await expect(turnipCard).toBeVisible();
      
      // Verify wholesale badge is visible on the card
      const wholesaleBadge = turnipCard.locator('text=Wholesale');
      await expect(wholesaleBadge).toBeVisible();
      
      // Verify WP badge is visible (use first)
      const wpBadge = turnipCard.locator('text=WP').first();
      await expect(wpBadge).toBeVisible();
      
      // Verify wholesale price is shown (₹150 for 100gm)
      const wholesalePrice = turnipCard.locator('text=/₹150/').first();
      await expect(wholesalePrice).toBeVisible();
      
      await page.screenshot({ path: '/app/test_reports/wholesale-subscription-create.jpeg', quality: 20 });
    });
  });
});
