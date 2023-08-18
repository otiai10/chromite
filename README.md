# chromite

[![Node.js CI](https://github.com/otiai10/chromite/actions/workflows/node-ci.yml/badge.svg)](https://github.com/otiai10/chromite/actions/workflows/node-ci.yml)
[![Chrome E2E Test](https://github.com/otiai10/chromite/actions/workflows/e2e-test.yml/badge.svg)](https://github.com/otiai10/chromite/actions/workflows/e2e-test.yml)
[![codecov](https://codecov.io/github/otiai10/chromite/branch/main/graph/badge.svg?token=wAWd6Vhy4j)](https://codecov.io/github/otiai10/chromite)

Chrome Extension Messaging Routing Kit

* Use `Router` to simplify your `onMessage` event listener routing
* Use `Client` as a shorthand for `sendMessage`

# Why?

[`Message Passing`](https://developer.chrome.com/docs/extensions/mv3/messaging/) plays a crucial role in the development of Chrome extensions. Therefore, as Chrome extensions become more feature-rich, the variety of messages being sent and received between the `background` and other contexts increases. Managing all of this within a single `onMessage.addListener` and dispatching to different handlers can make the code quite **messy**.

Which is like this:

```javascript
// This is what we do usually... 😰
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  switch (message.action) {
    case '/users/list':
      const users = await Users.getAll()
      sendResponse({ users });
      break;
    case '/users/get':
      const user = await Users.get(message.userId);
      sendResponse({ user });
      break;
    case '/users/update':
      const user = Users.get(message.userId)
      // more your code here...
      break;
    default:
      sendResponse({ message: "Not Found..." });
  }
  return true;
});
```

This is very similar to what we write when we build a web application and routing for HTTP request. Then, if we organize the code in that manner, we can create a Chrome extension source code that is more comprehensible and maintainable.

Specifically, it would look like this:

```javascript
const router = new Router();

router.on("/users/list", ListUsersController);
router.on("/users/{id}", GetUserController);
router.on("/users/{id}/update", UpdateUserController);
router.onNotFound(NotFoundController);

chrome.runtime.onMessage.addListener(router.listener());
// Simple! 🤗
```

then one of your controllers will look like this:

```javascript
async function ListUsersController(message, sender) {
    const users = await Users.getAll();
    return { users }; // You don't even need sendResponse
}

async function GetUserController(this: {id: string}, message, sender) {
    // You can retrieve path parameter from `this` arg
    const user = await Users.get(this.id);
    return { user };
}
```