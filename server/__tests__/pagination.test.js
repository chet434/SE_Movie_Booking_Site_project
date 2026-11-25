/**
 * Unit tests for pagination middleware.
 */

const { parsePagination } = require('../middleware/pagination');

describe('parsePagination middleware', () => {
  let mockReq, mockRes, nextFn;

  beforeEach(() => {
    mockReq = { query: {} };
    mockRes = {};
    nextFn = jest.fn();
  });

  test('sets default pagination values when no params provided', () => {
    parsePagination(mockReq, mockRes, nextFn);

    expect(mockReq.pagination).toEqual({
      page: 1,
      limit: 20,
      skip: 0
    });
    expect(nextFn).toHaveBeenCalled();
  });

  test('parses custom page and limit', () => {
    mockReq.query = { page: '3', limit: '50' };

    parsePagination(mockReq, mockRes, nextFn);

    expect(mockReq.pagination).toEqual({
      page: 3,
      limit: 50,
      skip: 100 // (3 - 1) * 50
    });
    expect(nextFn).toHaveBeenCalled();
  });

  test('handles single-digit page', () => {
    mockReq.query = { page: '1' };

    parsePagination(mockReq, mockRes, nextFn);

    expect(mockReq.pagination).toEqual({
      page: 1,
      limit: 20,
      skip: 0
    });
  });

  test('coerces string numbers to integers', () => {
    mockReq.query = { page: '2', limit: '10' };

    parsePagination(mockReq, mockRes, nextFn);

    expect(mockReq.pagination.page).toBe(2);
    expect(mockReq.pagination.limit).toBe(10);
  });

  test('handles page as number type', () => {
    mockReq.query = { page: 5, limit: 25 };

    parsePagination(mockReq, mockRes, nextFn);

    expect(mockReq.pagination).toEqual({
      page: 5,
      limit: 25,
      skip: 100
    });
  });
});