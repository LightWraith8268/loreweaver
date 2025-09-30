# Repository Guidelines

## Project Structure & Module Organization
- `app/` holds Expo Router routes for worldbuilding flows (e.g., `character-edit.tsx`, drawer layout). Match file name to route slug when adding screens.
- `components/` stores reusable React Native UI, including AI tooling and modals; co-locate styles at the bottom of each file.
- `services/`, `hooks/`, and `utils/` provide data access, local storage, and derived logic. Favor `@/` imports to reference these folders.
- `constants/` centralizes themes and schema definitions; update alongside any new domain types.
- `assets/` and `public/` contain images and Electron preload scripts. Build outputs land in `dist/` and platform packages in `win/`.

## Build, Test, and Development Commands
- `npm install` bootstraps dependencies; rerun after cloning or syncing the lockfile.
- `npm start` launches Expo Go; `npm run start-web` serves the web build, while `npm run electron:dev` pairs Expo with the desktop shell.
- `npm run lint` executes `expo lint` with the shared ESLint config; resolve all warnings before proposing changes.
- `npm run build:web`, `npm run build:android`, and `npm run build:win` generate distribution artifacts; prefer `npm run dist` for a full Electron release.
- `npm run version:update` syncs semantic version metadata prior to tagging.

## Coding Style & Naming Conventions
Use TypeScript, function components, and hooks. Maintain two-space indentation, trailing commas, and PascalCase component files; reserve camelCase for functions and variables. Keep route files lowercase with hyphenated slugs (`magic-edit.tsx`). Rely on path aliases (`@/components/...`) instead of relative traversals. Run `npm run lint` plus format via your editor's ESLint integration before committing.

## Testing & QA
Automated unit tests are not yet established; treat `npm run lint` as the minimum guardrail. For manual verification, run platform targets (`expo run:android`, `npm run test:win`) and capture regressions in `logs/` or `reports/`. When reproducing bugs, note Expo SDK and device info in the report. New features should include smoke-test steps covering navigation, data persistence, and AI prompts.

## Commit & Pull Request Guidelines
Follow Conventional Commit prefixes (`feat`, `fix`, `chore`, etc.) as seen in recent history. Commits should be scoped, describing both intent and impacted platform. Pull requests must include a concise summary, linked issue or ticket, confirmation of lint/build results, and screenshots or recordings for UI changes. Update `CHANGELOG.md` when shipping user-facing updates.
