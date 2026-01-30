# Contributing to enval

Thanks for your interest in contributing to enval! This guide will help you get started.

## Development Setup

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0

### Getting Started

1. Fork the repository
2. Clone your fork:
   ```sh
   git clone https://github.com/YOUR_USERNAME/enval.git
   cd enval
   ```
3. Install dependencies:
   ```sh
   bun install
   ```

This automatically sets up a pre-commit hook that runs linting on staged files.

## Development Workflow

### Running Tests

```sh
bun test
```

Tests are written using Bun's built-in test runner. All tests should pass before submitting a PR.

### Linting

We use [Biome](https://biomejs.dev/) for linting and formatting.

```sh
# Check for issues
bun run lint

# Auto-fix issues
bun run lint:fix
```

### Building

```sh
# Build all distribution files
bun run build

# Clean build artifacts
bun run clean
```

The build process generates:
- ESM bundle (`dist/index.js`)
- Minified ESM (`dist/index.min.js`)
- CJS bundle (`dist/index.cjs`)
- Minified CJS (`dist/index.min.cjs`)
- TypeScript declarations (`dist/index.d.ts`)

## Editor Integration

### Zed

This project includes `.zed/settings.json` that automatically configures:
- Format on save with Biome
- Real-time linting feedback
- Automatic fixing of style issues

### VS Code

Install the [Biome extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) and add to your workspace settings:

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true
}
```

### Other Editors

See [Biome's editor integration docs](https://biomejs.dev/guides/integrate-in-editor/) for other editors.

## Pre-commit Hook

The pre-commit hook automatically:
- Runs Biome on **only the files you're staging**
- Fixes issues automatically where possible
- Re-stages fixed files

This ensures code quality before it reaches CI.

To manually reinstall the hook:

```sh
bun run prepare
```

## Code Style Guidelines

- **TypeScript**: Use strict typing, avoid `any` when possible
- **Naming**: Use descriptive variable names
- **Functions**: Keep functions small and focused
- **Comments**: Only comment complex logic that needs clarification
- **Formatting**: Let Biome handle it automatically

## Testing Guidelines

- Write tests for all new features
- Ensure edge cases are covered
- Test both success and failure paths
- Keep tests readable and maintainable

## Pull Request Process

1. Create a new branch for your feature/fix:
   ```sh
   git checkout -b feat/my-feature
   ```

2. Make your changes and commit:
   ```sh
   git add .
   git commit -m "feat: add new feature"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `chore:` - Maintenance tasks
   - `refactor:` - Code refactoring
   - `test:` - Test changes

3. Push to your fork:
   ```sh
   git push origin feat/my-feature
   ```

4. Open a Pull Request on GitHub

5. Ensure CI passes:
   - All tests pass
   - Linting passes
   - Build succeeds

## Project Structure

```
enval/
├── index.ts              # Main source code
├── index.test.ts         # Test suite
├── scripts/
│   ├── build.ts          # Build script
│   ├── publish-jsr.ts    # JSR publishing
│   ├── publish-npm.ts    # npm publishing
│   ├── create-release.ts # GitHub release automation
│   ├── utils.ts          # Shared utilities
│   └── pre-commit-hook.sh # Git hook script
├── dist/                 # Built artifacts (generated)
├── .zed/                 # Zed editor config
└── biome.json            # Biome configuration
```

## Need Help?

- Open an [issue](https://github.com/fossiq/enval/issues) for bug reports or feature requests
- Check existing issues before creating a new one
- Be respectful and constructive in discussions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
