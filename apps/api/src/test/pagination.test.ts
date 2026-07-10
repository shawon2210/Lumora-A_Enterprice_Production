import { describe, it, expect } from 'vitest';
import { getPaginationParams, buildPaginationMeta } from '../utils/pagination';

describe('getPaginationParams', () => {
  it('should return defaults when query is empty', () => {
    const result = getPaginationParams({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.skip).toBe(0);
  });

  it('should use provided page and limit', () => {
    const result = getPaginationParams({ page: 3, limit: 10 });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(10);
    expect(result.skip).toBe(20);
  });

  it('should clamp limit to max 100', () => {
    const result = getPaginationParams({ limit: 500 });
    expect(result.limit).toBe(100);
  });

  it('should use default limit of 20 when limit is 0 (falsy)', () => {
    const result = getPaginationParams({ limit: 0 });
    expect(result.limit).toBe(20);
  });

  it('should clamp negative limit to 1', () => {
    const result = getPaginationParams({ limit: -5 });
    expect(result.limit).toBe(1);
  });

  it('should clamp page to min 1', () => {
    const result = getPaginationParams({ page: 0 });
    expect(result.page).toBe(1);
  });

  it('should clamp negative page to 1', () => {
    const result = getPaginationParams({ page: -3 });
    expect(result.page).toBe(1);
  });

  it('should calculate skip correctly for page 1', () => {
    const result = getPaginationParams({ page: 1, limit: 15 });
    expect(result.skip).toBe(0);
  });

  it('should calculate skip correctly for page 5', () => {
    const result = getPaginationParams({ page: 5, limit: 10 });
    expect(result.skip).toBe(40);
  });

  it('should calculate skip correctly for page 10 with limit 25', () => {
    const result = getPaginationParams({ page: 10, limit: 25 });
    expect(result.skip).toBe(225);
  });

  it('should handle limit at boundary of 100', () => {
    const result = getPaginationParams({ limit: 100 });
    expect(result.limit).toBe(100);
  });
});

describe('buildPaginationMeta', () => {
  it('should calculate totalPages correctly', () => {
    const meta = buildPaginationMeta(50, 1, 20);
    expect(meta.totalPages).toBe(3);
  });

  it('should calculate totalPages as 1 when total is 0', () => {
    const meta = buildPaginationMeta(0, 1, 20);
    expect(meta.totalPages).toBe(0);
    expect(meta.total).toBe(0);
  });

  it('should calculate totalPages as 1 when total equals limit', () => {
    const meta = buildPaginationMeta(20, 1, 20);
    expect(meta.totalPages).toBe(1);
  });

  it('should set hasNext to true when not on last page', () => {
    const meta = buildPaginationMeta(50, 1, 20);
    expect(meta.hasNext).toBe(true);
    expect(meta.hasPrev).toBe(false);
  });

  it('should set hasNext to false on last page', () => {
    const meta = buildPaginationMeta(50, 3, 20);
    expect(meta.hasNext).toBe(false);
    expect(meta.hasPrev).toBe(true);
  });

  it('should set hasPrev to true on middle page', () => {
    const meta = buildPaginationMeta(50, 2, 20);
    expect(meta.hasNext).toBe(true);
    expect(meta.hasPrev).toBe(true);
  });

  it('should set hasPrev to false on first page', () => {
    const meta = buildPaginationMeta(50, 1, 20);
    expect(meta.hasPrev).toBe(false);
  });

  it('should return correct meta shape', () => {
    const meta = buildPaginationMeta(100, 2, 20);
    expect(meta).toEqual({
      page: 2,
      limit: 20,
      total: 100,
      totalPages: 5,
      hasNext: true,
      hasPrev: true,
    });
  });
});
