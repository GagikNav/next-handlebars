# Contributing to next-handlebars

Thank you for your interest in contributing to next-handlebars! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 16.0.0 or higher
- npm, yarn, or pnpm
- Git

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/next-handlebars.git
   cd next-handlebars
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run tests to ensure everything works:
   ```bash
   npm test
   ```

5. Start development:
   ```bash
   npm run dev
   ```

## 🛠️ Development Workflow

### Code Style

We use ESLint and Prettier to maintain consistent code style:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Check formatting
npm run format:check

# Fix formatting
npm run format
```

### Testing

- Write tests for all new features
- Ensure all tests pass before submitting PR
- Aim for good test coverage

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Type Checking

```bash
# Run TypeScript type checking
npm run typecheck
```

## 📝 Pull Request Process

1. **Branch Naming**: Use descriptive branch names
   - `feature/add-new-helper`
   - `fix/template-caching-issue`
   - `docs/update-readme`

2. **Commits**: Use conventional commit messages
   - `feat: add custom helper support`
   - `fix: resolve template caching issue`
   - `docs: update installation guide`

3. **Testing**: Ensure all tests pass and add new tests for your changes

4. **Documentation**: Update documentation if you're changing public APIs

5. **Pull Request**: 
   - Provide clear description of changes
   - Link related issues
   - Add screenshots if applicable

## 🐛 Reporting Issues

When reporting issues, please include:

- Next.js version
- Node.js version
- Package version
- Minimal reproduction example
- Error messages and stack traces
- Steps to reproduce

## 💡 Feature Requests

Before submitting feature requests:

1. Check if the feature already exists
2. Search existing issues and discussions
3. Provide clear use case and rationale
4. Consider backwards compatibility

## 🏗️ Project Structure

```
next-handlebars/
├── src/                 # Source code
│   ├── index.ts         # Main export
│   └── next-handlebars.ts # Core implementation
├── types/               # TypeScript definitions
├── test/                # Test files
│   ├── fixtures/        # Test fixtures
│   └── *.test.ts        # Test cases
├── example/             # Example implementations
└── docs/                # Additional documentation
```

## 🔄 Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release PR
4. Merge to main
5. Create GitHub release
6. Automatic NPM publish via CI/CD

## 📋 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Please be respectful and inclusive.

## ❓ Questions?

- Open a [Discussion](https://github.com/GagikNav/next-handlebars/discussions)
- Create an [Issue](https://github.com/GagikNav/next-handlebars/issues)

Thank you for contributing! 🎉
