# Contributing to mcp-harness

Thanks for your interest in contributing!

## Setup

```bash
git clone https://github.com/gabry-ts/mcp-harness.git
cd mcp-harness
npm install
```

## Development

```bash
npm run dev       # build in watch mode
npm test          # run tests
npm run lint      # check formatting
npm run format    # fix formatting
```

## Pull Request Workflow

1. Fork the repo and create a feature branch from `main`
2. Make your changes
3. Run `npm test` and `npm run lint` — both must pass
4. Create a changeset if your change affects the public API: `npm run changeset`
5. Open a PR against `main`

## Code Style

- TypeScript strict mode
- Prettier for formatting (singleQuote, trailingComma all, printWidth 100)
- Local imports use `.js` extension (Node16 module resolution)
- Keep tests in `test/` and fixtures in `test/fixtures/`

## Reporting Issues

Use [GitHub Issues](https://github.com/gabry-ts/mcp-harness/issues) to report bugs or request features.
