# Contributing to VWCGApp

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd VWCGApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Run linting**
   ```bash
   npm run lint
   ```

## Code Style

This project uses ESLint for code quality. Configuration is in `eslint.config.js`.

### Key Guidelines
- Use TypeScript for all new code
- Follow existing naming conventions
- Keep components focused and reusable
- Add proper type definitions

## Pull Request Process

1. **Create a feature branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code style guidelines

3. **Run linting** before committing
   ```bash
   npm run lint
   ```

4. **Write clear commit messages** describing what changed and why

5. **Open a Pull Request** with:
   - Clear description of changes
   - Link to related issue (if applicable)
   - Screenshots for UI changes

## Reporting Issues

When reporting issues, please include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser/environment details
- Screenshots if applicable

## Project Structure

See [Technical Documentation](./docs/documentation.md) for detailed architecture information.

## Questions?

If you have questions, feel free to open a discussion or issue.
