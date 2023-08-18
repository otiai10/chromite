# chromite - Chrome Extension Messaging Routing Kit

[![Node.js CI](https://github.com/otiai10/chromite/actions/workflows/node-ci.yml/badge.svg)](https://github.com/otiai10/chromite/actions/workflows/node-ci.yml)
[![Chrome E2E Test](https://github.com/otiai10/chromite/actions/workflows/e2e-test.yml/badge.svg)](https://github.com/otiai10/chromite/actions/workflows/e2e-test.yml)
[![codecov](https://codecov.io/github/otiai10/chromite/branch/main/graph/badge.svg?token=wAWd6Vhy4j)](https://codecov.io/github/otiai10/chromite)


* Use `Router` to simplify your `onMessage` event listener routing
* Use `Client` as a shorthand for `sendMessage`

to write your Chrome Extension in the way of Web Application Development.

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

this will make our life easier.

Then simply you can send message to this listener like this:

```javascript
const users = await chrome.runtime.sendMessage({action: '/users/list'});
// Nothing different to whant we do usually.
```

# Client

In case you need some shorthand to send message, which might be a HTTP client in web application, there is `Client` you can use and you can avoid using `action` field in your message.

```javascript
const client = new Client(chrome.runtime);

// path (=action) only
const users = await client.send('/users/list');

// path with request body
const updated = await client.send(`/users/${id}/update`, {name: "otiai20"});
```

# ActiveRecord?

Now you might want something like `ActiveRecord` to access and OR-mapping `chrome.storage`.
There is a separated package: `jstorm` - JavaScript ORM for `chrome.storage` and `LocalStorage`.

https://github.com/otiai10/jstorm

# Issues

- https://github.com/otiai10/chromite/issues/new
