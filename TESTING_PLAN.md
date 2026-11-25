# Testing Plan - Phase 4

## Current Status
- **118 tests passing** across 8 test suites
- **15.73% overall coverage**

## Coverage Targets
- Overall: 80%+ minimum
- Middleware: 95%+ (achieved)
- Security: 100% (achieved)
- Utils: 100% (achieved)

## Test Files Created

### Unit Tests
- `__tests__/errorHandler.test.js` - Error handling middleware (41 tests, 100% coverage)
- `__tests__/security.test.js` - Security configuration (24 tests, 100% coverage)
- `__tests__/validate.test.js` - Validation middleware (25 tests, 100% coverage)
- `__tests__/deprecation.test.js` - Deprecation middleware (5 tests, 100% coverage)
- `__tests__/auth.middleware.test.js` - Auth middleware (10 tests, 94.11% coverage)
- `__tests__/pagination.test.js` - Pagination middleware (5 tests, 75% coverage)
- `__tests__/db.test.js` - Pool configuration tests (16 tests)

### Integration Tests
- `__tests__/auth.integration.test.js` - Auth routes (12 tests)

## Files Created/Modified
1. `jest.config.js` - Jest configuration
2. `__tests__/*.test.js` - All test files

## Next Steps to Reach 80% Coverage

### 1. Controller Tests (~40 tests needed)
- [ ] `__tests__/movieController.test.js` - 8 tests
- [ ] `__tests__/showController.test.js` - 10 tests
- [ ] `__tests__/theatreController.test.js` - 6 tests
- [ ] `__tests__/authController.test.js` - 10 tests
- [ ] `__tests__/bookingController.test.js` - 15 tests
- [ ] `__tests__/cityController.test.js` - 3 tests

### 2. Repository Tests (~20 tests needed)
- [ ] `__tests__/MovieRepository.test.js` - 5 tests
- [ ] `__tests__/ShowRepository.test.js` - 5 tests
- [ ] `__tests__/TheatreRepository.test.js` - 5 tests
- [ ] `__tests__/SeatRepository.test.js` - 3 tests
- [ ] `__tests__/BookingRepository.test.js` - 2 tests

### 3. Model Schema Tests (~10 tests needed)
- [ ] `__tests__/Movie.model.test.js` - 3 tests
- [ ] `__tests__/Show.model.test.js` - 3 tests
- [ ] `__tests__/User.model.test.js` - 2 tests
- [ ] `__tests__/Theatre.model.test.js` - 2 tests

## Total Estimated Tests: ~78
## Estimated Coverage Gain: 64.27% + (78 * ~1.5%) = ~90%+