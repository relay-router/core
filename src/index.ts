import { Router } from "./lib/router";
import { State } from "./lib/state";

type RouterOptions = {
  /**
   * Flag to signal the router to bind a handler
   * ({@link popStateHandler}) to the popstate event.
   * This will allow the router to react when the user clicks the back button.
   *
   * @type {boolean}
   *
   * @default true
   */
  bindPopState?: boolean;

  /**
   * Flag to signal the router to bind a handler
   * ({@link clickHandler}) to the click events on the `window` object.
   * This will allow the router to react when the user clicks
   * an anchor (`<a></a>`) element.
   *
   * @type {boolean}
   * @default true
   */
  bindClick?: boolean;

  /**
   * Flag to signal the router to handle the initial navigation when the page loads.
   *
   * @type {boolean}
   * @default true
   */
  initialDispatch?: boolean;
};

const defaultOptions: RouterOptions = {
  bindPopState: true,
  bindClick: true,
  initialDispatch: true,
};

let globalRouter: Router | undefined;
let started = false;

/**
 * Start Navi with the given options.
 *
 * @param {RouterOptions} options The options to start Navi with.
 *
 * @return {Router} The router instance.
 *
 * @throws {Error} If Navi is already started or if environment is not supported
 * (e.g. no history API).
 */
function start(options?: RouterOptions) {
  const combinedOptions = { ...defaultOptions, ...options };

  if (started) {
    throw new Error("Router is already started");
  }

  if (!window) {
    throw new Error("Environment has no window object");
  }

  if (!document) {
    throw new Error("Environment has no document object");
  }

  if (!history) {
    throw new Error("Environment has no history object");
  }

  if (!location) {
    throw new Error("Environment has no location object");
  }

  globalRouter = new Router({ nested: false, history });

  if (combinedOptions.bindClick) {
    window.addEventListener("click", clickHandler);
  }

  if (combinedOptions.bindPopState) {
    window.addEventListener("popstate", popStateHandler);
  }

  started = true;
}

/**
 * The default implementation for handling the click events.
 * It will look for {@link HTMLAnchorElement} with a `data-relay-link` or `relay-link` attribute.
 *
 * @param {MouseEvent} event
 */
function clickHandler(event: MouseEvent) {
  if (!started || !globalRouter) throw new Error("Router has not started");

  if (event.target instanceof HTMLAnchorElement &&
      (event.target.hasAttribute("data-relay-link") ||
       event.target.hasAttribute("relay-link"))) {
    navigateTo(event.target.href);
  }
}

/**
 * The default implementation for handling the popstate events.
 *
 * @param {PopStateEvent} event
 */
function popStateHandler(event: PopStateEvent) {
  const state = event.state;

  if (!started || !globalRouter) throw new Error("Router has not started");

  if (!State.isValid(state)) throw new Error("Invalid state object");

  globalRouter.navigateWithState(state);
}

/**
 * Navigate to the given path. It can only handle absolute paths.
 *
 * @param {string} absolutePath The path to navigate to.
 *
 * @throws {Error} If Router has not started.
 */
function navigateTo(absolutePath: string) {
  if (!started || !globalRouter) throw new Error("Router has not started");

  globalRouter.navigateTo(absolutePath);
}

/**
 * Registers a route for the global router.
 *
 * @param {string} path The path to register the route for.
 *
 * @param {...IRoute} handlers The handler to register.
 */
const route: Router["route"] = (path, ...handlers) => {
  if (!started || !globalRouter) throw new Error("Router has not started");

  return globalRouter.route(path, ...handlers);
};

const createNestedRouter = Router.createRouterMiddleware;

export {
  type RouterOptions,
  start,
  clickHandler,
  popStateHandler,
  navigateTo,
  createNestedRouter,
  route,
};
