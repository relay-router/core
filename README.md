# Relay Router Core For Single Page Applications

# Features

* Framework-agnostic
* Path-To-Regex conversion
* Middleware Support
* Nested Routing

## Basic Usage

```typescript
import { Router, BrowserHistory } from "@relayjs/core";

const router = new Router(new BrowserHistory());

// Routes are matched in the order they are defined

// Routes should always be defined with a leading slash

// Matches paths that starts with "/home"
router.route("/home", (_ctx, nav) => {
  // _ctx is a RouteContext object that contains the path, params, and query
  // and other information about the current route

  // nav is a NavigationContext object that has methods for
  // signaling the router how to proceed with the navigation

  console.log("We are at home!");

  nav.ok(); // signals that the route was handled successfully
  // not calling nav.ok() will make the router find the next matching route
  // if no matching route is found, the router will throw an error
});

// Matches paths that starts with "/contact"
router.route("/contact", () => {
  console.log("We are at contact!");
  nav.ok();
});

// Willcard route
// Matches everything else, routes that are registered after this will not be reached.
router.route("*", () => {
  console.log("No page found!");
  nav.ok();
});

// Unreachable route because it was registered after the wildcard route.
router.route("/unreachable", () => {
  // ...
  console.log("We are unreachable!");
});

// Start the router
router.start();

// Programmatically navigate to a route
router.navigateTo("/contact");
```

## Navigation using HTML Anchor Elements
```html
<!--
Click on an anchor element with an attribute of either data-relay-link or relay-link
and it will trigger a navigation to the route that matches the href attribute.
 -->
<a href="/home" data-relay-link>Home</a>
<a href="/contact" relay-link>Contact</a>

<!--
NOTE: Most of the time, paths should be absolute,
      you can use relative paths but will be resolved relative to the current
      location shown in the browser's address bar.

      Example: if the current location is: https://example.com/page/home
-->
<a href="path">Will be resolved to https://example.com/page/path</a>
<a href="./path">Will be resolved to https://example.com/page/path</a>
<a href="../path">Will be resolved to https://example.com/path</a>
```

## Nested Routing

```typescript
import { Router, BrowserHistory } from "@relayjs/core";

const router = new Router(new BrowserHistory());
const petsRouter = Router.createNested();

petsRouter.route("/george", () => {
  // ...
  console.log("Hello, I'm George the Dog! Woof!");
  nav.ok();
});

petsRouter.route("/pikachu", (_ctx, nav) => {
  // ...
  console.log("Pika pikaaaaa!");
  nav.ok();
});

// Root routes, just like wildcard routes, match everything so
// they should be registered after all other routes.
petsRouter.route("/", (_ctx, nav) => {
  // ...
  console.log("Root route, home of all pets :)");
  nav.ok();
});


// Register the nested router as a middleware to the main router
router.route("/pets", petsRouter);

router.start();

// Now we can navigate to "/pets/george",
// which will print "Hello, I'm George the Dog! Woof!"
router.navigateTo("/pets/george");

// Or to "/pets/pikachu", which will print "Pika pikaaaaa!"
router.navigateTo("/pets/pikachu");

// Or to jets "/pets", which will print "Root route, home of all pets :)"
router.navigateTo("/pets");

// just "/pikachu" or "/george" or "/" will not work
router.navigateTo("/pikachu");
router.navigateTo("/george");
router.navigateTo("/");
```

## Path Parameters
```typescript
import { Router, BrowserHistory } from "@relayjs/core";

const router = new Router(new BrowserHistory());

// We can define routes with path parameters
router.route("/user/:userId", (ctx, nav) => {
  // Path parameters are defined with a colon prefix
  // In this case, the path parameter is "userId"
  // We can pass values to this route via the ":userId" path parameter

  // To access the path parameter, the callback should
  // should accept a context argument as the first paramter

  // To access the path parameter value, we can use the context.param object
  const userId = ctx.param.getString("userId");

  console.log(`User ID: ${userId}`);
  nav.ok();
});

router.start();

// We pass the parameter value in place of the ":userId" path parameter
router.navigateTo("/user/123"); // Will print "User ID: 123"
```

## Middleware Support
```typescript
import { Router, BrowserHistory } from "@relayjs/core";

const router = new Router(new BrowserHistory());

// Sometimes we want to inspect the context before we navigate to a route
// We can define middleware to do this
// Handlers and middlewares are the same thing from the perspective of the Router
// The only difference is that middlewares
// middlewares should not call nav.ok() so other handlers can be called
router.route("/user/:userId", (ctx) => {
  // We can intercept the navigation

  // do some actions first
  const userId = context.param.getString("userId");
  const userInfo = userApi.fetchInfo(userId);

  // modify the context to pass some information to the next callback
  // context.state can be used for this.
  context.state = { userInfo }; // state is null by default

  // NOTE: Only serializable objects should be passed to context.state
  // such as primitives, arrays, and/or objects that contain serializable values

  // We don't call nav.ok() here yet so the next handler will be called
});

// NOTE: The same route can have multiple middlewares
// They are called in the order they are registered
router.route("/user/:userId", (ctx, nav) => {

  // We can access the information that was given by the middleware
  const userInfo = context.state.userInfo;

  console.log(`Name: ${userInfo.fullname}`);

  // Finish the navigation here
  nav.ok();
});

// Will not get called because the the previous handler already called nav.ok()
router.route("/user/:userId", () => {
  // unreachable
});

router.start();

// Will cause the first two middlewares to be called
router.navigateTo("/user/123");
```
