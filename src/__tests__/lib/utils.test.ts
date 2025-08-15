import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('class1', 'class2')
    expect(result).toBe('class1 class2')
  })

  it('should handle conditional classes', () => {
    const result = cn('base-class', true && 'conditional-class', false && 'hidden-class')
    expect(result).toBe('base-class conditional-class')
  })

  it('should handle undefined and null values', () => {
    const result = cn('base-class', undefined, null, 'another-class')
    expect(result).toBe('base-class another-class')
  })

  it('should merge tailwind classes correctly', () => {
    // This tests the twMerge functionality
    const result = cn('px-2 py-1', 'px-4')
    expect(result).toBe('py-1 px-4')
  })

  it('should handle empty input', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should handle array of classes', () => {
    const result = cn(['class1', 'class2'], 'class3')
    expect(result).toBe('class1 class2 class3')
  })

  it('should handle object with boolean values', () => {
    const result = cn({
      'active': true,
      'disabled': false,
      'visible': true
    })
    expect(result).toBe('active visible')
  })
})