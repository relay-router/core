import { Router } from "./lib/router";

import {
  hasDocument,
  hasHistory,
  hasLocation,
  hasWindow,
  makeAbsolutePath,
} from "./lib/utils";
import { naviPrivateStateKey } from "./lib/state";

type NaviOptions = {
  /**
   * Flag to signal the router to bind a handler
   * ({@link popstateHandler}) to the popstate event.
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
export function start(options?: NaviOptions) {
  const combinedOptions = { ...defaultOptions, ...options };

  if (started) {
    throw new Error("Navi is already started");
  }

  globalRouter = new Router(history);

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

  if (combinedOptions.bindClick) {
    window.addEventListener("click", clickHandler);
  }

  if (combinedOptions.bindPopState) {
    window.addEventListener("popstate", popstateHandler);
  }

  started = true;

  return globalRouter;
}

/**
 * The default implementation for handling the click event.
 *
 * @param {MouseEvent} event
 */
export function clickHandler(event: MouseEvent) {
  if (event.target instanceof HTMLAnchorElement && globalRouter) {
    const href = event.target.href;
    const path = makeAbsolutePath(href);

    globalRouter.navigateTo(path);
  }
}

/**
 * The default implementation for handling the popstate event.
 *
 * @param {PopStateEvent} event
 */
export function popstateHandler(event: PopStateEvent) {
  const state = event.state;
  if (state && state[naviPrivateStateKey]) {
  }
}
