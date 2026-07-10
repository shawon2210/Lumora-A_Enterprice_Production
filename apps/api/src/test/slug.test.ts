import { describe, it, expect, vi } from 'vitest';
import { generateSlug, makeUniqueSlug } from '../utils/slug';

describe('generateSlug', () => {
  it('should convert title to lowercase', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  it('should replace spaces with hyphens', () => {
    expect(generateSlug('my blog post')).toBe('my-blog-post');
  });

  it('should remove special characters', () => {
    expect(generateSlug('Hello, World! How are you?')).toBe('hello-world-how-are-you');
  });

  it('should replace underscores with hyphens', () => {
    expect(generateSlug('hello_world_test')).toBe('hello-world-test');
  });

  it('should collapse multiple spaces into single hyphen', () => {
    expect(generateSlug('hello   world')).toBe('hello-world');
  });

  it('should trim leading hyphens', () => {
    expect(generateSlug('---hello-world')).toBe('hello-world');
  });

  it('should trim trailing hyphens', () => {
    expect(generateSlug('hello-world---')).toBe('hello-world');
  });

  it('should handle empty string by returning untitled', () => {
    expect(generateSlug('')).toBe('untitled');
  });

  it('should handle string with only special characters', () => {
    expect(generateSlug('!!! ???')).toBe('untitled');
  });

  it('should truncate to 200 characters', () => {
    const longTitle = 'a'.repeat(300);
    const slug = generateSlug(longTitle);
    expect(slug.length).toBeLessThanOrEqual(200);
  });

  it('should handle single word', () => {
    expect(generateSlug('Hello')).toBe('hello');
  });

  it('should handle already valid slug', () => {
    expect(generateSlug('hello-world')).toBe('hello-world');
  });
});

describe('makeUniqueSlug', () => {
  it('should append a random suffix to the slug', () => {
    const slug = 'hello-world';
    const unique = makeUniqueSlug(slug);
    expect(unique).toMatch(/^hello-world-[a-z0-9]+$/);
    expect(unique.length).toBeGreaterThan(slug.length);
  });

  it('should produce different results on successive calls', () => {
    const slug = 'test';
    const results = new Set<string>();
    for (let i = 0; i < 50; i++) {
      results.add(makeUniqueSlug(slug));
    }
    expect(results.size).toBe(50);
  });

  it('should produce a 6-char random suffix', () => {
    const unique = makeUniqueSlug('slug');
    const suffix = unique.split('-').pop()!;
    expect(suffix.length).toBe(6);
    expect(/^[a-z0-9]+$/.test(suffix)).toBe(true);
  });
});
