import { Page, expect } from '@playwright/test';

export async function waitForAppReady(page: Page) {
  await page.waitForLoadState('domcontentloaded');
}

export async function dismissToasts(page: Page) {
  await page.addLocatorHandler(
    page.locator('[data-sonner-toast], .Toastify__toast, [role="status"].toast, .MuiSnackbar-root'),
    async () => {
      const close = page.locator('[data-sonner-toast] [data-close], [data-sonner-toast] button[aria-label="Close"], .Toastify__close-button, .MuiSnackbar-root button');
      await close.first().click({ timeout: 2000 }).catch(() => {});
    },
    { times: 10, noWaitAfter: true }
  );
}

export async function checkForErrors(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const errorElements = Array.from(
      document.querySelectorAll('.error, [class*="error"], [id*="error"]')
    );
    return errorElements.map(el => el.textContent || '').filter(Boolean);
  });
}

// Admin login helper
export async function loginAsAdmin(page: Page) {
  await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
  await page.getByTestId('admin-username-input').fill('admin');
  await page.getByTestId('admin-password-input').fill('Khurpi2026Secure');
  await page.getByTestId('admin-login-submit-button').click();
  await page.waitForURL(/\/admin/, { timeout: 10000 });
}

// Customer login helper
export async function loginAsCustomer(page: Page, phone: string, password: string) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.getByTestId('login-phone-input').fill(phone);
  await page.getByTestId('login-password-input').fill(password);
  await page.getByTestId('login-submit-button').click();
  await page.waitForLoadState('networkidle');
}

// Navigate to admin section
export async function navigateToAdminSection(page: Page, section: string) {
  const sectionMap: Record<string, string> = {
    'users': '/admin/users',
    'products': '/admin/products',
    'orders': '/admin/orders'
  };
  
  const url = sectionMap[section] || `/admin/${section}`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
}
