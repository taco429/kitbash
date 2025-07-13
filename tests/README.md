# Playwright Test Suite

This directory contains the Playwright end-to-end test suite for the Kitbash application. The tests ensure the application works correctly across different browsers and devices.

## Test Structure

### Configuration (`playwright.config.ts`)

The test suite is configured with the following key settings:

- **Test Directory**: `./tests`
- **Parallel Execution**: Tests run in parallel for faster execution
- **Base URL**: `http://localhost:4173` (Vite preview server)
- **Retries**: 2 retries on CI, 0 locally
- **Workers**: 1 worker on CI, unlimited locally
- **Reporter**: HTML reporter for detailed test reports
- **Trace Collection**: Enabled on first retry for debugging

### Browser Coverage

Tests run against multiple browsers and devices:

**Desktop Browsers:**
- Chromium (Chrome)
- Firefox
- WebKit (Safari)

**Mobile Devices:**
- Mobile Chrome (Pixel 5 viewport)
- Mobile Safari (iPhone 12 viewport)

## Testing Workflows

### 1. Local Development Testing

```bash
# Run all tests in headless mode
npm run test

# Run tests with UI mode (interactive)
npm run test:ui

# Run tests in debug mode (step-by-step)
npm run test:debug

# View the latest test report
npm run test:report
```

### 2. CI/CD Testing

The configuration automatically adapts for CI environments:
- Uses 1 worker instead of unlimited for stability
- Enables 2 retries for flaky tests
- Disables `test.only` to prevent accidental test isolation
- Uses existing server when available

### 3. Debugging Failed Tests

When tests fail, you can:

1. **View HTML Report**: Run `npm run test:report` to see detailed test results
2. **Use Debug Mode**: Run `npm run test:debug` for step-by-step debugging
3. **Check Traces**: Failed tests automatically generate traces for debugging
4. **UI Mode**: Use `npm run test:ui` for interactive test execution

### 4. Adding New Tests

When adding new pages or features:

1. **Update Navigation Tests**: Add new navigation items to `navigationItems` array in `navigation.spec.ts`
2. **Add Page Tests**: Create new test cases in `pages.spec.ts` for page-specific functionality
3. **Update Responsive Tests**: Include new pages in the responsive design test suite
4. **Test Mobile Navigation**: Ensure new pages work with mobile navigation drawer

### 5. Test Maintenance

**Before Running Tests:**
- Ensure the development server is built: `npm run build`
- The preview server will start automatically during test execution

**Test Data:**
- Tests use the built application from the `dist/` directory
- No test data setup required - tests work with the actual application

**Test Isolation:**
- Each test starts from the home page (`beforeEach` hook)
- Tests are independent and can run in any order
- No shared state between tests

## Test Reports

After running tests, you can find:
- **HTML Report**: `playwright-report/index.html` - Detailed test results with screenshots and traces
- **Test Results**: `test-results/` - Raw test output and artifacts
- **Traces**: Available for failed tests to help with debugging

## Browser-Specific Testing

The test suite runs against multiple browsers to ensure compatibility:

- **Chromium**: Primary testing browser (Chrome-like)
- **Firefox**: Mozilla's rendering engine
- **WebKit**: Safari's rendering engine
- **Mobile Chrome**: Mobile Chrome browser simulation
- **Mobile Safari**: iOS Safari simulation

Each browser may have different rendering behaviors, so comprehensive testing ensures the application works correctly across all major browsers and devices.

## Performance Considerations

- **Parallel Execution**: Tests run in parallel for faster execution
- **Headless Mode**: Default mode for faster execution
- **Retry Logic**: Automatic retries help with flaky tests
- **Resource Management**: Tests clean up after themselves

## Troubleshooting

**Common Issues:**
1. **Port Conflicts**: Ensure port 4173 is available for the preview server
2. **Build Issues**: Run `npm run build` before testing
3. **Browser Issues**: Update Playwright browsers with `npx playwright install`
4. **Timeout Issues**: Increase timeout in config for slower environments
5. **Mobile Navigation Issues**: Tests automatically handle mobile drawer opening/closing
6. **Responsive Layout Issues**: Tests set explicit viewport sizes for consistent behavior

**Recent Fixes (2024):**
- Fixed mobile navigation tests to properly open/close the drawer
- Added viewport size handling for desktop vs mobile layouts
- Fixed word search game page tests to handle full-screen mode on mobile
- Separated desktop and mobile test cases for better reliability

**Debug Commands:**
```bash
# Install/update browsers
npx playwright install

# Show browser status
npx playwright --help

# Run specific test file
npx playwright test navigation.spec.ts

# Run tests for specific browser
npx playwright test --project=chromium

# Run tests with specific viewport
npx playwright test --project="Mobile Chrome"

# Run tests in headed mode to see browser
npx playwright test --headed

# Run specific test with debug output
npx playwright test --debug navigation.spec.ts
``` 