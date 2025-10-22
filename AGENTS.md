# Repository Guidelines

## Project Structure & Module Organization
TypeScript sources live in `src/`, and release bundles are emitted to `lib/`. Add new public exports in `src/index.ts`; never edit `lib/` manually. Jest unit tests sit in `tests/spec/`, Puppeteer E2E scenarios in `tests/e2e/`, and coverage reports in `coverage/`. Follow the existing kebab-case directories and snake_case keys, checking `.vscode/` and `tsconfig.json` when you adjust tooling defaults.

## Build, Test, and Development Commands
- `npm run clean`: Clear `lib/` and the E2E build output for reproducible builds.
- `npm run build`: Compile TypeScript to JavaScript plus d.ts files in `lib/`.
- `npm run lint`: Apply ESLint (`standard-with-typescript`) to `src/` and `tests/`.
- `npm run test`: Run Jest suites in `tests/spec/` for unit regression coverage.
- `npm run test:e2e`: Rebuild the demo extension and execute Puppeteer integration flows.

## Coding Style & Naming Conventions
Respect Standard with TypeScript rules and two-space indentation. Format TOML and JSON with two spaces, prefer snake_case keys, use kebab-case directories, PascalCase classes, and SCREAMING_SNAKE_CASE internal constants. Auto-fix with your editor’s ESLint integration or `npm run lint -- --fix`.

## Testing Guidelines
Add unit tests alongside the target module (e.g., `router.spec.ts` in `tests/spec/`). Capture UI-style or background messaging flows with E2E tests and phrase scenario titles as actions. Run `npm run build` before long suites to surface type issues, then inspect `coverage/` to close gaps on new logic.

## Commit & Pull Request Guidelines
Author commits in Japanese Conventional Commits format (e.g., `feat: Router にハンドラー登録の優先度を追加`) and keep each one scoped to a single change. Pull requests must include a summary, manual verification commands with results, language check status, risk notes, and linked issues. Before review, execute `npm run lint`, `npm run test`, and, when affected, `npm run test:e2e`, attaching logs. Align documentation changes with `README.md` and highlight any large narrative updates in the PR description.

## Security & Configuration Tips
Do not commit secrets—`.gitignore` already covers sensitive files. Keep shared configuration in `tsconfig.json` and `package.json` scripts, while host-specific tweaks stay in ignored files like `.env`. When Chrome messaging permissions change, update the E2E manifest and note the adjustment in the PR so reviewers can trace the impact quickly.
