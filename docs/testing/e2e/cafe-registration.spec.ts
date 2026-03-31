// Journey 03-A: Cafe Registration
// Tests for the 3-step cafe registration wizard at /register/cafe
// Reference: docs/testing/journeys/03-cafe.md - Misja A

import { test, expect } from '@playwright/test';

test.describe('Journey 03-A: Cafe Registration', () => {
  test.skip('completes 3-step wizard and shows success', async ({ page }) => {
    // TODO: Implement test
    // Steps from journey:
    // 1. Navigate to /register/cafe
    // 2. Fill step 1: name, city, country, description
    // 3. Click "Next" → step 2
    // 4. Fill step 2: address, lat/lng, website, instagram, phone
    // 5. Click "Next" → step 3 (preview)
    // 6. Verify all data in preview
    // 7. Click "Submit"
    // 8. Verify success message
    // Hidden effects: Cafe.status = PENDING, user.role = CAFE, email to admin
  });

  test.skip('shows validation error when name is empty', async ({ page }) => {
    // TODO: Implement test
    // Edge case from journey
  });

  test.skip('shows validation error for invalid website URL', async ({ page }) => {
    // TODO: Implement test
  });

  test.skip('shows validation error for invalid Instagram handle', async ({ page }) => {
    // TODO: Implement test
  });

  test.skip('shows validation error for lat/lng out of range', async ({ page }) => {
    // TODO: Implement test
  });

  test.skip('handles duplicate name by adding slug suffix', async ({ page }) => {
    // TODO: Implement test
  });
});

// Setup notes:
// - No auth required (public form)
// - DB: No PENDING cafes before test
// - After test: Cafe created with PENDING status