# Sealos API Tests

This directory contains Cypress tests for the Sealos API functions and routes.

## Test Files

### `component/sealos-api.cy.ts`
Tests the pure validation functions from `src/lib/sealos-api.ts`:
- `validateHeaders()` - Tests authorization header validation
- `validateQueryParams()` - Tests query parameter validation
- Integration scenarios with realistic data

### `component/api-routes.cy.ts`
Integration tests for the actual API routes:
- Account API routes (`/api/sealos/account/*`)
- Devbox API routes (`/api/sealos/devbox/*`)
- Error handling and response format validation

## Running the Tests

### Prerequisites
1. Make sure your Next.js development server is running:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

2. The server should be accessible at `http://localhost:3000`

### Run Component Tests
```bash
# Open Cypress Test Runner
npx cypress open --component

# Run tests in headless mode
npx cypress run --component
```

### Run Specific Test Files
```bash
# Run only the API validation tests
npx cypress run --component --spec "cypress/component/sealos-api.cy.ts"

# Run only the route integration tests
npx cypress run --component --spec "cypress/component/api-routes.cy.ts"
```

## Test Data

The tests use dummy data for validation:

### Sample Headers
- Authorization: `Bearer test-token-123`
- Authorization-Bearer: `Bearer devbox-token456`

### Sample Parameters
- region_url: `cloud.sealos.io`
- devbox_name: `my-devbox`, `test-devbox`
- mock: `true`, `false`

### Expected Responses
The integration tests expect responses to have either:
- `data` property (for successful responses)
- `message` property (for error responses)

## Test Coverage

### Validation Functions
- ✅ Header validation (single and dual auth)
- ✅ Query parameter validation
- ✅ Edge cases (empty strings, null values)
- ✅ Multiple missing parameters

### API Routes
- ✅ Account routes (`getAmount`, `auth/info`)
- ✅ Devbox routes (`getDevboxList`, `getDevboxByName`, `getSSHConnectionInfo`, `checkReady`)
- ✅ Error handling (400, 401, 405, 500)
- ✅ Response format validation

### Integration Scenarios
- ✅ Typical account requests
- ✅ Typical devbox requests
- ✅ SSH connection scenarios
- ✅ Common validation failures

## Notes

- The integration tests use `failOnStatusCode: false` to test error scenarios
- Tests validate the structure and behavior of routes, not the actual external API calls
- Mock data is used throughout to ensure tests are deterministic and fast 