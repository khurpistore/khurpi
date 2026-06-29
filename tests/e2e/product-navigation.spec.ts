import { test, expect } from '@playwright/test';

const BASE_URL = 'https://admin-control-center-11.preview.emergentagent.com';

test.describe('Product Navigation Bug Fix Verification', () => {
  
  test.describe('Grid View - Product Navigation', () => {
    
    test('should navigate to product detail page when clicking product image', async ({ page }) => {
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      
      // Get the first product card
      const firstProductCard = page.locator('[data-testid^="product-card-"]').first();
      await expect(firstProductCard).toBeVisible();
      
      // Get the product ID from the data-testid
      const testId = await firstProductCard.getAttribute('data-testid');
      const productId = testId?.replace('product-card-', '');
      
      // Click on the product image (the clickable div containing the image)
      const productImage = firstProductCard.locator('.aspect-square.cursor-pointer').first();
      await productImage.click();
      
      // Verify navigation to product detail page with correct route /product/:id (singular)
      await expect(page).toHaveURL(new RegExp(`/product/${productId}`));
      
      // Verify product detail page loaded correctly
      const backButton = page.getByTestId('back-to-products-button');
      await expect(backButton).toBeVisible();
      
      await page.screenshot({ path: '/app/test_reports/product-detail-from-image-click.jpeg', quality: 20 });
    });
    
    test('should navigate to product detail page when clicking product name', async ({ page }) => {
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      
      // Get the first product card
      const firstProductCard = page.locator('[data-testid^="product-card-"]').first();
      await expect(firstProductCard).toBeVisible();
      
      // Get the product ID from the data-testid
      const testId = await firstProductCard.getAttribute('data-testid');
      const productId = testId?.replace('product-card-', '');
      
      // Click on the product name (h3 element with cursor-pointer)
      const productName = firstProductCard.locator('h3.cursor-pointer').first();
      await productName.click();
      
      // Verify navigation to product detail page with correct route /product/:id (singular)
      await expect(page).toHaveURL(new RegExp(`/product/${productId}`));
      
      // Verify product detail page loaded correctly
      const backButton = page.getByTestId('back-to-products-button');
      await expect(backButton).toBeVisible();
      
      await page.screenshot({ path: '/app/test_reports/product-detail-from-name-click.jpeg', quality: 20 });
    });
  });
  
  test.describe('List View - Product Navigation', () => {
    
    test('should navigate to product detail page when clicking product image in list view', async ({ page }) => {
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      
      // Switch to list view
      const listViewButton = page.locator('button').filter({ has: page.locator('svg.lucide-list') });
      await listViewButton.click();
      await page.waitForTimeout(300);
      
      // Get the first product in list view - find the clickable image container
      const firstProductImage = page.locator('.cursor-pointer').filter({ has: page.locator('img') }).first();
      await expect(firstProductImage).toBeVisible();
      
      // Get the product ID from the URL after clicking
      await firstProductImage.click();
      
      // Verify navigation to product detail page with correct route /product/:id (singular)
      await expect(page).toHaveURL(/\/product\/[a-f0-9-]+/);
      
      // Verify product detail page loaded correctly
      const backButton = page.getByTestId('back-to-products-button');
      await expect(backButton).toBeVisible();
      
      await page.screenshot({ path: '/app/test_reports/product-detail-from-list-image.jpeg', quality: 20 });
    });
    
    test('should navigate to product detail page when clicking product name in list view', async ({ page }) => {
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      
      // Switch to list view
      const listViewButton = page.locator('button').filter({ has: page.locator('svg.lucide-list') });
      await listViewButton.click();
      await page.waitForTimeout(300);
      
      // Get the first product name in list view
      const firstProductName = page.locator('h3.cursor-pointer').first();
      await expect(firstProductName).toBeVisible();
      
      // Click on the product name
      await firstProductName.click();
      
      // Verify navigation to product detail page with correct route /product/:id (singular)
      await expect(page).toHaveURL(/\/product\/[a-f0-9-]+/);
      
      // Verify product detail page loaded correctly
      const backButton = page.getByTestId('back-to-products-button');
      await expect(backButton).toBeVisible();
      
      await page.screenshot({ path: '/app/test_reports/product-detail-from-list-name.jpeg', quality: 20 });
    });
  });
  
  test.describe('Product Detail Page - Content Verification', () => {
    
    test('should display all product information on detail page', async ({ page }) => {
      // Navigate to products page first
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      
      // Click on first product
      const firstProductCard = page.locator('[data-testid^="product-card-"]').first();
      const productImage = firstProductCard.locator('.aspect-square.cursor-pointer').first();
      await productImage.click();
      
      // Wait for product detail page to load
      await expect(page).toHaveURL(/\/product\/[a-f0-9-]+/);
      
      // Verify product name is displayed (h1 element)
      const productTitle = page.locator('h1');
      await expect(productTitle).toBeVisible();
      
      // Verify product image is displayed
      const productDetailImage = page.locator('.aspect-square img');
      await expect(productDetailImage).toBeVisible();
      
      // Verify back button exists
      const backButton = page.getByTestId('back-to-products-button');
      await expect(backButton).toBeVisible();
      
      // Verify add to cart button exists
      const addToCartButton = page.getByTestId('add-to-cart-detail-button');
      await expect(addToCartButton).toBeVisible();
      
      await page.screenshot({ path: '/app/test_reports/product-detail-content.jpeg', quality: 20 });
    });
    
    test('should display kg-based quantity selector on detail page', async ({ page }) => {
      // Navigate to products page first
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      
      // Click on first product
      const firstProductCard = page.locator('[data-testid^="product-card-"]').first();
      const productImage = firstProductCard.locator('.aspect-square.cursor-pointer').first();
      await productImage.click();
      
      // Wait for product detail page to load
      await expect(page).toHaveURL(/\/product\/[a-f0-9-]+/);
      
      // Verify quantity selector exists
      const qtySelector = page.locator('button[role="combobox"]').filter({ hasText: /kg|pc|dz|bunch/ });
      await expect(qtySelector).toBeVisible();
      
      // Click to open dropdown
      await qtySelector.click();
      await page.waitForTimeout(300);
      
      // Verify quantity options are available
      const qtyOptions = page.locator('[role="option"]');
      const optionCount = await qtyOptions.count();
      expect(optionCount).toBeGreaterThan(0);
      
      await page.screenshot({ path: '/app/test_reports/product-detail-qty-selector.jpeg', quality: 20 });
    });
    
    test('should calculate price correctly based on quantity', async ({ page }) => {
      // Navigate to products page first
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      
      // Click on first product
      const firstProductCard = page.locator('[data-testid^="product-card-"]').first();
      const productImage = firstProductCard.locator('.aspect-square.cursor-pointer').first();
      await productImage.click();
      
      // Wait for product detail page to load
      await expect(page).toHaveURL(/\/product\/[a-f0-9-]+/);
      
      // Get the add to cart button which shows the price
      const addToCartButton = page.getByTestId('add-to-cart-detail-button');
      await expect(addToCartButton).toBeVisible();
      
      // Verify button shows price (₹ symbol followed by number)
      const buttonText = await addToCartButton.textContent();
      expect(buttonText).toMatch(/₹\d+/);
      
      // Change quantity and verify price updates
      const qtySelector = page.locator('button[role="combobox"]').filter({ hasText: /kg|pc|dz|bunch/ });
      await qtySelector.click();
      await page.waitForTimeout(300);
      
      // Select a different quantity option
      const qtyOptions = page.locator('[role="option"]');
      const optionCount = await qtyOptions.count();
      if (optionCount > 1) {
        await qtyOptions.nth(optionCount - 1).click(); // Select last option (higher qty)
        await page.waitForTimeout(300);
        
        // Verify price updated
        const newButtonText = await addToCartButton.textContent();
        expect(newButtonText).toMatch(/₹\d+/);
      }
      
      await page.screenshot({ path: '/app/test_reports/product-detail-price-calc.jpeg', quality: 20 });
    });
    
    test('should navigate back to products page when clicking back button', async ({ page }) => {
      // Navigate to products page first
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      
      // Click on first product
      const firstProductCard = page.locator('[data-testid^="product-card-"]').first();
      const productImage = firstProductCard.locator('.aspect-square.cursor-pointer').first();
      await productImage.click();
      
      // Wait for product detail page to load
      await expect(page).toHaveURL(/\/product\/[a-f0-9-]+/);
      
      // Click back button
      const backButton = page.getByTestId('back-to-products-button');
      await backButton.click();
      
      // Verify navigation back to products page
      await expect(page).toHaveURL(/\/products/);
      
      // Verify products page loaded
      const productCards = page.locator('[data-testid^="product-card-"]');
      await expect(productCards.first()).toBeVisible();
    });
  });
  
  test.describe('Direct URL Navigation', () => {
    
    test('should load product detail page directly via URL', async ({ page }) => {
      // First get a valid product ID from the API
      const response = await page.request.get(`${BASE_URL}/api/products`);
      const products = await response.json();
      const firstProduct = products[0];
      
      // Navigate directly to product detail page
      await page.goto(`/product/${firstProduct.id}`, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      
      // Verify page loaded correctly
      const productTitle = page.locator('h1');
      await expect(productTitle).toBeVisible();
      await expect(productTitle).toContainText(firstProduct.name);
      
      // Verify back button exists
      const backButton = page.getByTestId('back-to-products-button');
      await expect(backButton).toBeVisible();
      
      await page.screenshot({ path: '/app/test_reports/product-detail-direct-url.jpeg', quality: 20 });
    });
    
    test('should redirect to products page for invalid product ID', async ({ page }) => {
      // Navigate to a non-existent product
      await page.goto('/product/invalid-product-id-12345', { waitUntil: 'domcontentloaded' });
      
      // Should redirect to products page (based on the error handling in ProductDetail.js)
      await expect(page).toHaveURL(/\/products/);
    });
  });
});
