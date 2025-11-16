# Testing Setup

This project now includes a comprehensive testing setup using Jest and React Testing Library.

## Testing Framework

- **Jest**: Test runner and assertion library
- **React Testing Library**: For testing React components
- **@testing-library/jest-dom**: Additional Jest matchers for DOM elements
- **@testing-library/user-event**: For simulating user interactions

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are located in the `src/__tests__/` directory, mirroring the source code structure:

```
src/__tests__/
├── _config/
│   └── routes.test.ts
├── components/
│   └── ui/
│       ├── button.test.tsx
│       └── card.test.tsx
└── lib/
    └── utils.test.ts
```

## Current Test Coverage

The project currently has **100% test coverage** for the tested files:

- `src/lib/utils.ts` - Utility functions (cn function)
- `src/_config/routes.ts` - Navigation configuration
- `src/components/ui/button.tsx` - Button component with all variants
- `src/components/ui/card.tsx` - Card component and all sub-components

## Test Examples

### Utility Function Tests
- Tests for the `cn` utility function covering class merging, conditional classes, and Tailwind CSS class merging

### Component Tests
- Button component tests covering all variants (default, destructive, outline, secondary, ghost, link)
- Button size tests (default, sm, lg, icon)
- Event handling tests
- Card component tests for all sub-components (Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter)

### Configuration Tests
- Navigation menu structure validation
- Route configuration validation
- Authentication configuration tests

## Adding New Tests

When adding new tests:

1. Create test files in the `src/__tests__/` directory
2. Mirror the source code directory structure
3. Use descriptive test names and group related tests with `describe` blocks
4. Test both happy paths and edge cases
5. Aim for high test coverage while focusing on meaningful tests

## Configuration

The Jest configuration is set up in `jest.config.js` and uses Next.js's built-in Jest configuration for optimal compatibility with the Next.js framework.