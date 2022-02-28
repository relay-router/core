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

// Matches root path
router.route("/", () => {
  // ...
  console.log("We are at the root path");
});

// Matches paths that starts with "/home"
router.route("/home", () => {
  // ...
  console.log("We are at home!");
});

// Matches paths that starts with "/contact"
router.route("/contact", () => {
  // ...
  console.log("We are at contact!");
});

// Willcard route
// Matches everything else, routes that are registered after this will not be reached.
router.route("*", () => {
  // ...
  console.log("No page found!");
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
// ...
<!--
Click on an anchor element with an attribute of either data-relay-link or relay-link
and it will trigger a navigation to the route that matches the href attribute.
 -->
<a href="/home" data-relay-link>Home</a>
<a href="/contact" relay-link>Contact</a>

<!--
NOTE: Relative links are not supported.
 -->
<a href="bad-path">Bad Path</a>
// ...
```

## Nested Routing

```typescript
import { Router, BrowserHistory } from "@relayjs/core";

const router = new Router(new BrowserHistory());
const petsRouter = Router.createNested();

petsRouter.route("/", () => {
  // ...
  console.log("Root route, home of all pets :)");
});

petsRouter.route("/george", () => {
  // ...
  console.log("Hello, I'm George the Dog! Woof!");
});

petsRouter.route("/pikachu", () => {
  // ...
  console.log("Pika pikaaaaa!");
});

// Register the nested router as a middleware to the main router
router.route("/pets", petsRouter);

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
router.route("/user/:userId", (context) => {
  // Path parameters are defined with a colon prefix
  // In this case, the path parameter is "userId"
  // We can pass values to this route via the ":userId" path parameter

  // To access the path parameter, the callback should
  // should accept a context argument as the first paramter

  // To access the path parameter value, we can use the context.param object
  const userId = context.param.getString("userId");

  console.log(`User ID: ${userId}`);
});

// We pass the parameter value in place of the ":userId" path parameter
router.navigateTo("/user/123"); // Will print "User ID: 123"
```

## Middleware Support
```typescript
import { Router, BrowserHistory } from "@relayjs/core";

const router = new Router(new BrowserHistory());

// Sometimes we want to inspect the context before we navigate to a route
// We can define middleware to do this
// Every callback we pass to the route is a middleware
// The only difference is middlewares should accept a "next" callback
// as the second argument
router.route("/user/:userId", (context, next) => {
  // We can intercept the navigation

  // do some actions first
  const userId = context.param.getString("userId");
  const userInfo = userApi.fetchInfo(userId);

  // modify the context to pass some information to the next callback
  // context.state can be used for this.
  context.state = { userInfo };
  // NOTE: Only serializable objects should be passed to context.state
  // such as primitives, arrays, and/or objects that contain serializable values

  // signal to the router that we want to continue the navigation
  next();
});

// NOTE: The same route can have multiple middlewares
// They are called in the order they are registered
router.route("/user/:userId", (context) => {

  // We can access the information that was given by the middleware
  const userInfo = context.state.userInfo;

  console.log(`Name: ${userInfo.fullname}`);

  // We don't call next() here, so the router will not continue
});
```
