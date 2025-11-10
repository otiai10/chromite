# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chromite is a Chrome extension messaging routing library that provides Router, SequentialRouter, Client, and Logger primitives. The library is published to npm and targets Manifest V3 Chrome extensions with TypeScript support.

## Development Commands

```bash
# Core development workflow
pnpm build              # Compile TypeScript to lib/ with declarations
pnpm test               # Run Jest unit tests in tests/spec/
pnpm lint               # Run ESLint with standard-with-typescript
pnpm clean              # Remove lib/ and E2E build output

# E2E testing
pnpm build:e2e          # Build demo extension in tests/e2e/app/dist/
pnpm test:e2e           # Build and run Puppeteer integration tests
```

Individual test files can be run with Jest directly:
```bash
npx jest tests/spec/router.spec.ts
```

## Architecture

### Core Module Structure

The library exports four main components from `src/index.ts`:
- **Router**: Path-based message routing with pattern matching (`/users/{id}`)
- **SequentialRouter**: Event history tracking router for sequential patterns
- **Client**: Promise-based wrapper for `chrome.runtime.sendMessage`
- **Logger**: Namespaced, leveled console output decorator

### Type System Design

The routing system uses conditional types to extract callback signatures from Chrome event types:

**RoutingTargetEvent**: Accepts `chrome.events.Event<T>` or `chrome.webRequest.WebRequestEvent<T, U>`. Users should pass event types using `typeof`, e.g., `typeof chrome.runtime.onMessage` or `typeof chrome.webRequest.onBeforeRequest`.

**ExtractCallback**: Extracts the callback function type from an event object, enabling type-safe handler registration without manual type annotations.

**ActionKey system**: Messages are routed by an `__action__` field (with aliases `_act_` and `action` defined in `src/keys.ts`). The `DefaultResolver` automatically extracts this from incoming messages.

### Router vs SequentialRouter

**Router** (`src/router.ts`): Single-event routing with path patterns. Handlers receive the current event arguments and route parameters extracted from patterns like `/users/{id}`.

**SequentialRouter** (`src/sequential-router.ts`): Maintains a rolling history of events up to a specified length. Handlers receive a `stack` array of historical events plus current arguments, enabling multi-step request tracking (e.g., tracking webRequest lifecycle across onBeforeRequest → onCompleted).

## Code Standards

- **Language**: All code, comments, and commit messages must be in English
- **Formatting**: 2-space indentation, Standard with TypeScript rules
- **Testing**: Always run `pnpm build && pnpm test` before committing
- **Type Safety**: Avoid `any`; prefer `string[]`, generics, or conditional types
- **Chrome Types**: Use `@types/chrome@^0.1.27` with `typeof` pattern for event types

## Important Context

**Action Key Aliases**: When implementing message handlers, recognize that incoming messages may use `__action__`, `_act_`, or `action` to specify routes. The resolver checks all three.

**E2E Tests**: The E2E suite builds a real Chrome extension in `tests/e2e/app/` and uses Puppeteer to verify routing behavior. When modifying Router or SequentialRouter, verify E2E tests still pass.

**Type Inference**: The conditional type system automatically infers handler argument types from the event type parameter. When users write `new Router<typeof chrome.runtime.onMessage>()`, handlers automatically receive typed `(message, sender, sendResponse)` arguments.
