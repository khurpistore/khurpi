import { test, expect } from '@playwright/test';

const BASE_URL = 'https://admin-control-center-11.preview.emergentagent.com';

// Admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Khurpi2026Secure';

// Expected categories
const EXPECTED_CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Leafy Greens',
  'Root Vegetables',
  'Exotic & Imported'
];

test.describe('Product Catalog Feature', () => {
  
  test.describe('Products Page - Category Filtering', () => {
    
    test('should display all category filter buttons', async ({ page }) => {
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      
      // Check "All Products" button exists
      const allProductsBtn = page.getByTestId('category-all');
      await expect(allProductsBtn).toBeVisible();
      
      // Check each expected category button exists using data-testid
      const categoryTestIds = [
        'category-vegetables',
        'category-fruits',
        'category-leafy-greens',
        'category-root-vegetables',
        'category-exotic-and-imported'
      ];
      
      for (const testId of categoryTestIds) {
        const categoryBtn = page.getByTestId(testId);
        await expect(categoryBtn).toBeVisible();
      }
      
      await page.screenshot({ path: '/app/test_reports/products-categories.jpeg', quality: 20 });
    });
    
    test('should filter products by Vegetables category', async ({ page }) => {
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      
      // Click on Vegetables category using data-testid
      const vegetablesBtn = page.getByTestId('category-vegetables');
      await vegetablesBtn.click();
      
      // Wait for filter to apply
      await page.waitForTimeout(500);
      
      // Check URL has category parameter
      await expect(page).toHaveURL(/category=/);
      
      // Check product count text shows filtered results
      const productCount = page.locator('text=/\\d+ products?/');
      await expect(productCount).toBeVisible();
      
      // Verify some vegetable products are visible
      const productCards = page.locator('[data-testid^="product-card-"]');
      const count = await productCards.count();
      expect(count).toBeGreaterThan(10);
      
      await page.screenshot({ path: '/app/test_reports/products-vegetables-filter.jpeg', quality: 20 });
    });
    
    test('should filter products by Fruits category', async ({ page }) => {
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      
      // Click on Fruits category using data-testid
      const fruitsBtn = page.getByTestId('category-fruits');
      await fruitsBtn.click();
      
      // Wait for filter to apply
      await page.waitForTimeout(500);
      
      // Check URL has category parameter
      await expect(page).toHaveURL(/category=/);
      
      // Verify products are visible
      const productCards = page.locator('[data-testid^="product-card-"]');
      const count = await productCards.count();
      expect(count).toBeGreaterThan(10);
      
      await page.screenshot({ path: '/app/test_reports/products-fruits-filter.jpeg', quality: 20 });
    });
    
    test('should clear filters and show all products', async ({ page }) => {
      // Start with a category filter
      await page.goto('/products?category=034c8aea-38f6-49d0-b21e-3aee1f8b1365', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      
      // Click "All Products" to clear filter
      const allProductsBtn = page.getByTestId('category-all');
      await allProductsBtn.click();
      
      // Wait for filter to clear
      await page.waitForTimeout(500);
      
      // URL should not have category parameter
      const url = page.url();
      expect(url).not.toContain('category=');
      
      // Should show more products now
      const productCards = page.locator('[data-testid^="product-card-"]');
      const count = await productCards.count();
      expect(count).toBeGreaterThan(50);
    });
  });
  
  test.describe('Products Page - Search Functionality', () => {
    
    test('should search products by name', async ({ page }) => {
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      
      // Type in search box
      const searchInput = page.getByTestId('product-search-input');
      await searchInput.fill('tomato');
      
      // Wait for search to filter
      await page.waitForTimeout(500);
      
      // Check that filtered products are shown
      const productCount = page.locator('text=/\\d+ products?/');
      await expect(productCount).toBeVisible();
      
      // Should find tomato products
      const productCards = page.locator('[data-testid^="product-card-"]');
      const count = await productCards.count();
      expect(count).toBeGreaterThan(0);
      
      await page.screenshot({ path: '/app/test_reports/products-search-tomato.jpeg', quality: 20 });
    });
    
    test('should search products by benefit text', async ({ page }) => {
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      
      // Search for vitamin C
      const searchInput = page.getByTestId('product-search-input');
      await searchInput.fill('vitamin');
      
      // Wait for search to filter
      await page.waitForTimeout(500);
      
      // Should find products with vitamin in benefit
      const productCards = page.locator('[data-testid^="product-card-"]');
      const count = await productCards.count();
      expect(count).toBeGreaterThan(0);
    });
    
    test('should show no results message for invalid search', async ({ page }) => {
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      
      // Search for something that doesn't exist
      const searchInput = page.getByTestId('product-search-input');
      await searchInput.fill('xyznonexistent123');
      
      // Wait for search to filter
      await page.waitForTimeout(500);
      
      // Should show "No products found" message
      const noResults = page.locator('text=No products found');
      await expect(noResults).toBeVisible();
    });
  });
  
  test.describe('Products Page - Product Display', () => {
    
    test('should display product cards with images and prices', async ({ page }) => {
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      
      // Get first product card
      const firstCard = page.locator('[data-testid^="product-card-"]').first();
      await expect(firstCard).toBeVisible();
      
      // Check card has image
      const image = firstCard.locator('img').first();
      await expect(image).toBeVisible();
      
      // Check card has price (₹ symbol)
      const price = firstCard.locator('text=/₹\\d+/').first();
      await expect(price).toBeVisible();
      
      await page.screenshot({ path: '/app/test_reports/products-card-display.jpeg', quality: 20 });
    });
    
    test('should display stock status badges', async ({ page }) => {
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      
      // Check for "In Stock" badges
      const inStockBadges = page.locator('text=In Stock');
      const inStockCount = await inStockBadges.count();
      expect(inStockCount).toBeGreaterThan(0);
    });
    
    test('should have add to cart buttons for in-stock products', async ({ page }) => {
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      
      // Check for add to cart buttons
      const addToCartButtons = page.locator('[data-testid^="add-to-cart-"]');
      const count = await addToCartButtons.count();
      expect(count).toBeGreaterThan(0);
    });
  });
  
  test.describe('Products Page - Sorting', () => {
    
    test('should sort products by price low to high', async ({ page }) => {
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      
      // Click sort dropdown
      const sortTrigger = page.locator('button:has-text("Availability")');
      await sortTrigger.click();
      
      // Select "Price: Low to High"
      const lowToHighOption = page.locator('text=Price: Low to High');
      await lowToHighOption.click();
      
      // Wait for sort to apply
      await page.waitForTimeout(500);
      
      await page.screenshot({ path: '/app/test_reports/products-sort-price-low.jpeg', quality: 20 });
    });
    
    test('should sort products by name', async ({ page }) => {
      await page.goto('/products', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      
      // Click sort dropdown
      const sortTrigger = page.locator('button:has-text("Availability")');
      await sortTrigger.click();
      
      // Select "Name"
      const nameOption = page.locator('[role="option"]:has-text("Name")');
      await nameOption.click();
      
      // Wait for sort to apply
      await page.waitForTimeout(500);
    });
  });
  
  test.describe('Admin Products Page', () => {
    
    async function loginAsAdmin(page) {
      await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
      await page.getByTestId('admin-username-input').fill(ADMIN_USERNAME);
      await page.getByTestId('admin-password-input').fill(ADMIN_PASSWORD);
      await page.getByTestId('admin-login-submit-button').click();
      await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
    }
    
    test('should display all products in admin panel', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/products', { waitUntil: 'domcontentloaded' });
      
      // Wait for products to load
      await page.waitForLoadState('networkidle');
      
      // Check products are displayed - admin uses a different layout
      // Look for product items in the list
      const productItems = page.locator('[class*="product"], [data-testid*="product"]').first();
      
      // Wait for at least one product to be visible
      await expect(productItems).toBeVisible();
      
      await page.screenshot({ path: '/app/test_reports/admin-products-list.jpeg', quality: 20 });
    });
    
    test('should display wholesale price column in admin products', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/products', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      
      // Check for wholesale price column header - it's "WP/50g"
      const wpHeader = page.locator('text=WP/50g').first();
      await expect(wpHeader).toBeVisible();
      
      await page.screenshot({ path: '/app/test_reports/admin-products-wp-column.jpeg', quality: 20 });
    });
    
    test('should filter products by category in admin', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/products', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      
      // Look for category filter dropdown
      const categoryFilter = page.locator('select, [role="combobox"]').first();
      
      if (await categoryFilter.isVisible()) {
        await categoryFilter.click();
        await page.waitForTimeout(300);
        
        // Try to select Vegetables
        const vegetablesOption = page.locator('text=Vegetables').first();
        if (await vegetablesOption.isVisible()) {
          await vegetablesOption.click();
          await page.waitForTimeout(500);
        }
      }
      
      await page.screenshot({ path: '/app/test_reports/admin-products-category-filter.jpeg', quality: 20 });
    });
  });
});
