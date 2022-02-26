import { Router } from "./lib/router";

import {
  hasDocument,
  hasHistory,
  hasLocation,
  hasWindow,
} from "./lib/utils";
import { State } from "./lib/state";

type NaviOptions = {
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

const defaultOptions: NaviOptions = {
  bindPopState: true,
  bindClick: true,
  initialDispatch: true,
};

let globalRouter: Router | undefined;
let started = false;

/**
 * Start navi with the given options.
 *
 * @param {NaviOptions} options The options to start navi with.
 *
 * @return {Router} The router instance.
 *
 * @throws {Error} If navi is already started or if environment is not supported
 * (e.g. no history API).
 */
function start(options?: NaviOptions) {
  const combinedOptions = { ...defaultOptions, ...options };

  if (started) {
    throw new Error("Navi is already started");
  }

  if (!hasWindow) {
    throw new Error("Environment has no window object");
  }

  if (!hasDocument) {
    throw new Error("Environment has no document object");
  }

  if (!hasHistory) {
    throw new Error("Environment has no history object");
  }

  if (!hasLocation) {
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
 * It will look for {@link HTMLAnchorElement} and their `href` property
 * as the path to navigate to.
 *
 * Using the {@link HTMLAnchorElement.href} property ensures that the
 * path is resolved to an absolute path because Navi doesn't support
 * relative paths out of the box.
 *
 * @param {MouseEvent} event
 */
function clickHandler(event: MouseEvent) {
  if (!started || !globalRouter) throw new Error("Navi has not started");

  if (event.target instanceof HTMLAnchorElement) {
    const href = event.target.href;

    navigateTo(href);
  }
}

/**
 * The default implementation for handling the popstate events.
 *
 * @param {PopStateEvent} event
 */
function popStateHandler(event: PopStateEvent) {
  const state = event.state;

  if (!started || !globalRouter) throw new Error("Navi has not started");

  if (!State.isValid(state)) throw new Error("Invalid state object");

  globalRouter.navigateWithState(state);
}

/**
 * Navigate to the given path. It can only handle absolute paths.
 * If the path is relative, it will be resolved to an absolute path.
 *
 * @param {string} absolutePath The path to navigate to.
 *
 * @throws {Error} If Navi has not started.
 */
function navigateTo(absolutePath: string) {
  if (!started || !globalRouter) throw new Error("Navi has not started");

  globalRouter.navigateTo(absolutePath);
}

export { type NaviOptions, start, clickHandler, popStateHandler, navigateTo };
