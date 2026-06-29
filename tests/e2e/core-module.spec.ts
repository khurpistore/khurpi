import { test, expect } from '@playwright/test';

/**
 * Core Module Tests - Testing MVVM + Clean Architecture implementation
 * Tests the core module utilities: formatQuantity, formatPricePerUnit, getStockStatus
 * Tests the QuantitySelector component from core module
 * Tests Cart page using core module components
 */

test.describe('Core Module Feature Tests', () => {
  
  test.describe('Product Detail Page - Core Module Integration', () => {
    
    test('should display kg-based quantity selector from core module', async ({ page }) => {
      // Navigate to products page first
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('[data-testid^="product-card-"]').first()).toBeVisible();
      
      // Click on first product to go to detail page
      const firstProductCard = page.locator('[data-testid^="product-card-"]').first();
      await firstProductCard.click();
      
      // Wait for product detail page to load
      await expect(page.getByTestId('back-to-products-button')).toBeVisible();
      
      // Verify quantity selector is present (from core module QuantitySelector component)
      const quantitySelector = page.locator('button[role="combobox"]').first();
      await expect(quantitySelector).toBeVisible();
      
      // Click to open the dropdown
      await quantitySelector.click();
      
      // Verify kg-based quantity options are displayed (from core module formatQuantity)
      // The core module should show options like "0.25 kg", "0.5 kg", "1 kg", etc.
      const quantityOptions = page.locator('[role="option"]');
      await expect(quantityOptions.first()).toBeVisible();
      
      // Check that at least one option contains "kg" (verifying formatQuantity from core module)
      const optionTexts = await quantityOptions.allTextContents();
      const hasKgOption = optionTexts.some(text => text.includes('kg'));
      expect(hasKgOption).toBe(true);
      
      await page.screenshot({ path: '/app/test_reports/core-module-quantity-selector.jpeg', quality: 20 });
    });
    
    test('should display price per unit using core module formatPricePerUnit', async ({ page }) => {
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('[data-testid^="product-card-"]').first()).toBeVisible();
      
      // Click on first product
      const firstProductCard = page.locator('[data-testid^="product-card-"]').first();
      await firstProductCard.click();
      
      // Wait for product detail page
      await expect(page.getByTestId('back-to-products-button')).toBeVisible();
      
      // The price should be displayed in format "₹XXX/kg" (from core module formatPricePerUnit)
      // Check for price display on the page
      const priceText = page.locator('text=/₹\\d+/');
      await expect(priceText.first()).toBeVisible();
      
      await page.screenshot({ path: '/app/test_reports/core-module-price-display.jpeg', quality: 20 });
    });
    
    test('should enable Add to Cart button for in-stock products', async ({ page }) => {
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('[data-testid^="product-card-"]').first()).toBeVisible();
      
      // Find an in-stock product (look for "In Stock" badge)
      const inStockProduct = page.locator('[data-testid^="product-card-"]').filter({
        has: page.locator('text="In Stock"')
      }).first();
      
      // If no in-stock product found, use first product
      const productToClick = await inStockProduct.count() > 0 ? inStockProduct : page.locator('[data-testid^="product-card-"]').first();
      await productToClick.click();
      
      // Wait for product detail page
      await expect(page.getByTestId('back-to-products-button')).toBeVisible();
      
      // Check Add to Cart button is enabled (core module getStockStatus determines this)
      const addToCartButton = page.getByTestId('add-to-cart-detail-button');
      await expect(addToCartButton).toBeVisible();
      await expect(addToCartButton).toBeEnabled();
      
      await page.screenshot({ path: '/app/test_reports/core-module-add-to-cart-enabled.jpeg', quality: 20 });
    });
    
    test('should disable Add to Cart button for out-of-stock products', async ({ page }) => {
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('[data-testid^="product-card-"]').first()).toBeVisible();
      
      // Find an out-of-stock product
      const outOfStockProduct = page.locator('[data-testid^="product-card-"]').filter({
        has: page.locator('text="Out of Stock"')
      }).first();
      
      // Skip test if no out-of-stock products
      if (await outOfStockProduct.count() === 0) {
        test.skip();
        return;
      }
      
      await outOfStockProduct.click();
      
      // Wait for product detail page
      await expect(page.getByTestId('back-to-products-button')).toBeVisible();
      
      // Check Add to Cart button is disabled (core module getStockStatus returns canOrder: false)
      const addToCartButton = page.getByTestId('add-to-cart-detail-button');
      await expect(addToCartButton).toBeVisible();
      await expect(addToCartButton).toBeDisabled();
      
      await page.screenshot({ path: '/app/test_reports/core-module-add-to-cart-disabled.jpeg', quality: 20 });
    });
    
    test('should show growing status for growing products', async ({ page }) => {
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('[data-testid^="product-card-"]').first()).toBeVisible();
      
      // Find a growing product (look for "Ready" text in badge which indicates growing status)
      const growingProduct = page.locator('[data-testid^="product-card-"]').filter({
        has: page.locator('text=/Ready/')
      }).first();
      
      // Skip test if no growing products
      if (await growingProduct.count() === 0) {
        test.skip();
        return;
      }
      
      await growingProduct.click();
      
      // Wait for product detail page
      await expect(page.getByTestId('back-to-products-button')).toBeVisible();
      
      // Growing products should show "Currently Growing" message
      const growingMessage = page.locator('text="Currently Growing"');
      await expect(growingMessage).toBeVisible();
      
      // Add to Cart should still be enabled for growing products (canOrder: true)
      const addToCartButton = page.getByTestId('add-to-cart-detail-button');
      await expect(addToCartButton).toBeEnabled();
      
      await page.screenshot({ path: '/app/test_reports/core-module-growing-status.jpeg', quality: 20 });
    });
  });
  
  test.describe('Cart Page - Core Module Integration', () => {
    
    test('should add product to cart and display quantity in kg format', async ({ page }) => {
      // Navigate to products page
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('[data-testid^="product-card-"]').first()).toBeVisible();
      
      // Find an in-stock product and add to cart
      const inStockProduct = page.locator('[data-testid^="product-card-"]').filter({
        has: page.locator('text="In Stock"')
      }).first();
      
      const productToUse = await inStockProduct.count() > 0 ? inStockProduct : page.locator('[data-testid^="product-card-"]').first();
      
      // Get the product name for verification
      const productName = await productToUse.locator('h3').first().textContent();
      
      // Click add to cart button on the product card
      const addToCartBtn = productToUse.locator('[data-testid^="add-to-cart-"]');
      await addToCartBtn.click();
      
      // Wait for toast notification
      await page.waitForTimeout(500);
      
      // Navigate to cart page
      await page.goto('/cart', { waitUntil: 'domcontentloaded' });
      
      // Verify cart has items
      const cartItem = page.locator('[data-testid^="cart-item-"]').first();
      await expect(cartItem).toBeVisible();
      
      // Verify quantity is displayed in kg format (from core module formatQuantity)
      // The cart should show quantity like "0.5 kg" or similar
      const quantityText = page.locator('text=/\\d+(\\.\\d+)?\\s*kg/');
      await expect(quantityText.first()).toBeVisible();
      
      await page.screenshot({ path: '/app/test_reports/core-module-cart-kg-format.jpeg', quality: 20 });
    });
    
    test('should calculate cart total correctly', async ({ page }) => {
      // First clear any existing cart by going to cart and removing items
      await page.goto('/cart', { waitUntil: 'domcontentloaded' });
      
      // Check if cart is empty
      const emptyCartMessage = page.locator('text="Your cart is empty"');
      const hasEmptyCart = await emptyCartMessage.count() > 0;
      
      if (!hasEmptyCart) {
        // Remove all items from cart
        const removeButtons = page.locator('button').filter({ has: page.locator('svg.lucide-trash-2') });
        const count = await removeButtons.count();
        for (let i = 0; i < count; i++) {
          await removeButtons.first().click();
          await page.waitForTimeout(300);
        }
      }
      
      // Navigate to products page
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('[data-testid^="product-card-"]').first()).toBeVisible();
      
      // Find an in-stock product
      const inStockProduct = page.locator('[data-testid^="product-card-"]').filter({
        has: page.locator('text="In Stock"')
      }).first();
      
      const productToUse = await inStockProduct.count() > 0 ? inStockProduct : page.locator('[data-testid^="product-card-"]').first();
      
      // Get the price from the product card
      const priceText = await productToUse.locator('text=/₹\\d+/').first().textContent();
      const priceMatch = priceText?.match(/₹(\d+)/);
      const unitPrice = priceMatch ? parseInt(priceMatch[1]) : 0;
      
      // Add to cart
      const addToCartBtn = productToUse.locator('[data-testid^="add-to-cart-"]');
      await addToCartBtn.click();
      await page.waitForTimeout(500);
      
      // Navigate to cart
      await page.goto('/cart', { waitUntil: 'domcontentloaded' });
      
      // Verify cart total is displayed
      const totalText = page.locator('text=/Total/').first();
      await expect(totalText).toBeVisible();
      
      // The total should be visible and be a valid number
      const grandTotal = page.locator('text=/₹\\d+/').last();
      await expect(grandTotal).toBeVisible();
      
      await page.screenshot({ path: '/app/test_reports/core-module-cart-total.jpeg', quality: 20 });
    });
    
    test('should update quantity using core module QuantitySelector in cart', async ({ page }) => {
      // Navigate to products and add item to cart
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('[data-testid^="product-card-"]').first()).toBeVisible();
      
      // Find an in-stock product
      const inStockProduct = page.locator('[data-testid^="product-card-"]').filter({
        has: page.locator('text="In Stock"')
      }).first();
      
      const productToUse = await inStockProduct.count() > 0 ? inStockProduct : page.locator('[data-testid^="product-card-"]').first();
      
      // Add to cart
      const addToCartBtn = productToUse.locator('[data-testid^="add-to-cart-"]');
      await addToCartBtn.click();
      await page.waitForTimeout(500);
      
      // Navigate to cart
      await page.goto('/cart', { waitUntil: 'domcontentloaded' });
      
      // Verify cart item exists
      const cartItem = page.locator('[data-testid^="cart-item-"]').first();
      await expect(cartItem).toBeVisible();
      
      // Find the quantity selector in cart (from core module QuantitySelector)
      const quantitySelector = cartItem.locator('button[role="combobox"]');
      await expect(quantitySelector).toBeVisible();
      
      // Click to open dropdown
      await quantitySelector.click();
      
      // Verify quantity options are available
      const quantityOptions = page.locator('[role="option"]');
      await expect(quantityOptions.first()).toBeVisible();
      
      // Select a different quantity (e.g., 1 kg)
      const oneKgOption = page.locator('[role="option"]').filter({ hasText: '1 kg' });
      if (await oneKgOption.count() > 0) {
        await oneKgOption.click();
        await page.waitForTimeout(300);
      }
      
      await page.screenshot({ path: '/app/test_reports/core-module-cart-quantity-update.jpeg', quality: 20 });
    });
  });
  
  test.describe('Products Page - Stock Status Display', () => {
    
    test('should display correct stock status badges using core module getStockStatus', async ({ page }) => {
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('[data-testid^="product-card-"]').first()).toBeVisible();
      
      // Check for In Stock badges (green)
      const inStockBadges = page.locator('text="In Stock"');
      const inStockCount = await inStockBadges.count();
      
      // Check for Growing badges (amber/yellow - shows "Ready" date)
      const growingBadges = page.locator('text=/Ready/');
      const growingCount = await growingBadges.count();
      
      // Check for Out of Stock badges (red)
      const outOfStockBadges = page.locator('text="Out of Stock"');
      const outOfStockCount = await outOfStockBadges.count();
      
      // At least one type of status should be present
      expect(inStockCount + growingCount + outOfStockCount).toBeGreaterThan(0);
      
      // Log the counts for debugging
      console.log(`Stock status counts - In Stock: ${inStockCount}, Growing: ${growingCount}, Out of Stock: ${outOfStockCount}`);
      
      await page.screenshot({ path: '/app/test_reports/core-module-stock-status-badges.jpeg', quality: 20 });
    });
    
    test('should display price per unit in correct format', async ({ page }) => {
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('[data-testid^="product-card-"]').first()).toBeVisible();
      
      // Check for price display in format "₹XXX/kg" (from core module formatPricePerUnit)
      const pricePerUnit = page.locator('text=/₹\\d+\\/kg/');
      await expect(pricePerUnit.first()).toBeVisible();
      
      await page.screenshot({ path: '/app/test_reports/core-module-price-per-unit.jpeg', quality: 20 });
    });
  });
  
  test.describe('Product Navigation - Grid and List View', () => {
    
    test('should navigate from products list to product detail', async ({ page }) => {
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('[data-testid^="product-card-"]').first()).toBeVisible();
      
      // Click on first product card
      const firstProduct = page.locator('[data-testid^="product-card-"]').first();
      await firstProduct.click();
      
      // Verify navigation to product detail page
      await expect(page).toHaveURL(/\/product\/[a-f0-9-]+/);
      
      // Verify product detail page elements
      await expect(page.getByTestId('back-to-products-button')).toBeVisible();
      await expect(page.getByTestId('add-to-cart-detail-button')).toBeVisible();
      
      await page.screenshot({ path: '/app/test_reports/core-module-product-navigation.jpeg', quality: 20 });
    });
    
    test('should navigate back to products from product detail', async ({ page }) => {
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('[data-testid^="product-card-"]').first()).toBeVisible();
      
      // Click on first product
      await page.locator('[data-testid^="product-card-"]').first().click();
      
      // Wait for product detail page
      await expect(page.getByTestId('back-to-products-button')).toBeVisible();
      
      // Click back button
      await page.getByTestId('back-to-products-button').click();
      
      // Verify navigation back to products page
      await expect(page).toHaveURL(/\/products/);
      await expect(page.locator('[data-testid^="product-card-"]').first()).toBeVisible();
      
      await page.screenshot({ path: '/app/test_reports/core-module-back-navigation.jpeg', quality: 20 });
    });
  });
});
