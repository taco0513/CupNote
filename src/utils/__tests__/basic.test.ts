import { describe, it, expect } from 'vitest'

describe('Basic Test Setup', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle string operations', () => {
    expect('Hello ' + 'World').toBe('Hello World')
  })

  it('should handle array operations', () => {
    const arr = [1, 2, 3]
    expect(arr.length).toBe(3)
  })
})