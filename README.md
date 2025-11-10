# chromite — Chrome Extension Messaging Routing Kit

[![version](https://img.shields.io/npm/v/chromite)](https://www.npmjs.com/package/chromite)
[![downloads](https://img.shields.io/npm/dt/chromite)](https://www.npmjs.com/package/chromite)
[![Node.js CI](https://github.com/otiai10/chromite/actions/workflows/node-ci.yml/badge.svg)](https://github.com/otiai10/chromite/actions/workflows/node-ci.yml)
[![Chrome E2E Test](https://github.com/otiai10/chromite/actions/workflows/e2e-test.yml/badge.svg)](https://github.com/otiai10/chromite/actions/workflows/e2e-test.yml)
[![codecov](https://codecov.io/github/otiai10/chromite/branch/main/graph/badge.svg?token=wAWd6Vhy4j)](https://codecov.io/github/otiai10/chromite)
[![Maintainability](https://api.codeclimate.com/v1/badges/920634c9e31e0df99677/maintainability)](https://codeclimate.com/github/otiai10/chromite/maintainability)

Chromite streamlines Chrome extension messaging by giving you familiar routing,
request handling, and logging primitives. Instead of wiring every message in a
single `onMessage` listener, compose controllers, share request clients, and
format logs with a consistent API.

## Features

- Route extension messages with path patterns and controller handlers.
- Use a client abstraction to send structured messages without manual payloads.
- Decorate `console` output with leveled, namespaced logging.
- Ship TypeScript types and modern build artifacts out of the box.

## Installation

```bash
npm install chromite
# or
yarn add chromite
```

Chromite targets modern Chromium-based extensions (Manifest V3). Pair it with
TypeScript for the best DX.

## Quick Start

```ts
import { Router, Client, Logger, LogLevel } from "chromite";

const router = new Router();

router.on("/users/list", async () => {
  return { users: await Users.getAll() };
});

router.on("/users/{id}", async function () {
  const user = await Users.get(this.id);
  return { user };
});

router.onNotFound(() => ({ message: "Not found" }));

chrome.runtime.onMessage.addListener(router.listener());

const client = new Client(chrome.runtime);
const logger = Logger.get("chromite-demo", { level: LogLevel.INFO });

const users = await client.send("/users/list");
logger.info("Loaded users", users);
```

### Logger tips

```ts
// Reuse the same logger for a project namespace.
const logger = Logger.get("popup");

// Raise verbosity for every registered logger.
Logger.setLevel(LogLevel.DEBUG);

// Tweak shared visual configuration.
Logger.setEmoji({
  [LogLevel.INFO]: "✨"
});
Logger.setStyle({
  [LogLevel.ERROR]: "color:white; background-color:#d93025; font-weight:bold;"
});

logger.error("Failed to fetch", { status: 500 });
```

## Core Concepts

- **Router**: Registers path-based handlers and resolves parameters before
  delegating to controllers.
- **SequentialRouter**: Similar to Router but maintains a history of events,
  useful for sequential request tracking (e.g., `webRequest` API).
- **Client**: Wraps `chrome.runtime.sendMessage` with promise-based ergonomics.
- **Logger**: Formats messages with namespaced prefixes and log levels for
  easier debugging.

### Advanced: Using SequentialRouter with Chrome Events

When working with Chrome events like `webRequest`, use `typeof` to specify the
event type:

```ts
import { SequentialRouter } from "chromite";

const router = new SequentialRouter<typeof chrome.webRequest.onBeforeRequest>(
  2,
  async (details) => {
    const url = new URL(details.url);
    return { __action__: url.pathname };
  }
);

router.on(["/api/users"], async (stack) => {
  // stack contains the last 2 events
  console.log("Request history:", stack);
});

chrome.webRequest.onBeforeRequest.addListener(
  router.listener(),
  { urls: ["*://example.com/*"] },
  ["requestBody"]
);
```

This pattern works with any Chrome event type, including:
- `typeof chrome.runtime.onMessage`
- `typeof chrome.tabs.onActivated`
- `typeof chrome.webRequest.onCompleted`

See [`src/`](./src) for the TypeScript source and [`lib/`](./lib) for compiled
artifacts published to npm.

## Development Workflow

- `npm run clean` — remove build output for a fresh compilation.
- `npm run build` — compile TypeScript and emit declarations.
- `npm run lint` — run ESLint (`standard-with-typescript`) on source and tests.
- `npm run test` — execute Jest unit tests in `tests/spec/`.
- `npm run test:e2e` — rebuild the demo extension and launch Puppeteer suites.

End-to-end fixtures live in `tests/e2e/`, and coverage reports land in
`coverage/`.

## Contributing

Chromite follows Japanese Conventional Commits and documents required review
steps in [AGENTS.md](./AGENTS.md). Before opening a pull request:

1. Run the lint and test commands listed above (include logs in the PR).
2. Verify documentation changes stay consistent with the rest of the repo.
3. Provide context for any manifest or permission updates.

Issues and feature requests are welcome through GitHub Discussions or Issues.

## License

MIT © otiai10
