# Angular Dev Shop

An e-commerce web application built with Angular 21 featuring Server-Side Rendering (SSR), modern design with glass effects, theme support, and a comprehensive shopping experience.

## Features

- 🚀 Angular 21 with Server-Side Rendering (SSR)
- 🎨 Modern glass morphism design inspired by angular.dev
- 🌓 Light/Dark theme support with persistence
- 🛒 Shopping basket with LocalStorage persistence
- 🔍 Product search and category filtering
- 📱 Fully responsive design
- ⚡ Lazy-loaded routes for optimal performance
- 🧪 Comprehensive testing with Vitest and Playwright
- 🎯 Property-based testing with fast-check

## Project Structure

```
src/app/
├── core/                    # Core application functionality
│   ├── layout/             # Layout components (header, footer, main-layout)
│   ├── services/           # Global services (basket, theme, product)
│   ├── interceptors/       # HTTP interceptors
│   └── guards/             # Route guards
├── features/               # Feature modules (lazy-loaded)
│   ├── products/           # Product listing and display
│   ├── product-details/    # Product detail pages
│   └── basket/             # Shopping basket
├── shared/                 # Shared components and utilities
│   ├── components/         # Reusable components
│   ├── directives/         # Custom directives
│   ├── pipes/              # Custom pipes
│   └── utils/              # Utility functions
└── styles/                 # Global styles and themes
    ├── themes/             # Light and dark theme definitions
    ├── glass-effects.scss  # Glass morphism styles
    └── _breakpoints.scss   # Responsive breakpoints
```

## Getting Started

### Prerequisites

- Node.js 22.x or higher
- npm 10.x or higher

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers (for E2E tests)
npx playwright install
```

### Development

```bash
# Start development server
npm start

# Build for production
npm run build

# Build with SSR
npm run build:ssr

# Serve SSR build
npm run serve:ssr:angular-dev-shop
```

### Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run e2e

# Run E2E tests with UI
npm run e2e:ui
```

## Technology Stack

- **Framework**: Angular 21 with standalone components
- **SSR**: Angular Universal (built-in)
- **State Management**: Angular signals
- **Styling**: SCSS with CSS custom properties
- **Storage**: Browser LocalStorage API
- **Routing**: Angular Router with lazy loading
- **Unit Testing**: Vitest
- **Property-Based Testing**: fast-check
- **E2E Testing**: Playwright

## Architecture

The application follows a well-structured architecture:

- **Core**: Application engine with layout, global state, and core services
- **Features**: Isolated, lazy-loaded feature modules with smart/dumb component separation
- **Shared**: Business-agnostic reusable components and utilities

### Key Design Patterns

- Standalone components throughout
- Signal-based reactive state management
- Smart/dumb component pattern
- Lazy loading for optimal bundle size
- SSR-safe patterns with platform detection

## Theme System

The application supports light and dark themes with:

- CSS custom properties for easy theming
- Smooth transitions between themes
- LocalStorage persistence
- Angular.dev inspired color palette

## Testing Strategy

### Dual Testing Approach

- **Unit Tests**: Verify specific examples and edge cases
- **Property-Based Tests**: Verify universal properties across all inputs
- **E2E Tests**: Validate complete user flows

Both unit and property-based tests are complementary and necessary for comprehensive coverage.

## Contributing

This project follows Angular style guide conventions and uses:

- Standalone components exclusively
- Modern signal-based APIs (input, output, computed)
- Proper component encapsulation
- Logical directory structure

## License

This project is private and proprietary.
