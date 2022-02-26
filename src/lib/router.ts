import { type IStateSaverCallback, RouteContext } from "./route-context";
import { Route } from "./route";
import type {
  ParseOptions,
  TokensToRegexpOptions,
  RegexpToFunctionOptions,
} from "path-to-regexp";
import { State } from "./state";
import { RouterError } from "./router-error";

/**
 * The final handler for a route.
 *
 * @param {RouteContext} context The route context.
 */
export interface IRouteCallback {
  (context: RouteContext): void;
}

/**
 * A helper type for configuring path-to-regexp options.
 */
export type IRouteMatchingOptions = ParseOptions &
  TokensToRegexpOptions &
  RegexpToFunctionOptions;

/**
 * A convenient data structure containing flags for configuring the router.
 * It is pre-configured with reasonable defaults out of the box.
 */

/**
 * The handlers called before the final handler of a route.
 * Useful for creating plugin-type handlers.
 *
 * @param {RouteContext} context The route context.
 * @param {() => void} next The next handler in the chain.
 */
export interface IRouteMiddleware {
  (context: RouteContext, next: () => void): void;
}

/**
 * The container for storing the chain of handlers for a route.
 */
export type IRouteHandlerCollection =
  | [ IRouteCallback ]
  | IRouteMiddleware[]
  | [ ...IRouteMiddleware[], IRouteCallback ];

type RouterParams =
  | {
  nested: true;
  history?: History;
}
  | {
  nested: false;
  history: History;
};

interface INestedRouterMiddleware extends IRouteMiddleware {
  route: Router["route"];
}

interface IRouteHandlerAdder {
  /**
   * Adds more handlers to the end of the chain.
   *
   * @param handlers
   */
  add(...handlers: IRouteHandlerCollection): IRouteHandlerAdder;
}

/**
 * The class responsible for in-browser routing to the correct handler.
 *
 * The navigation is done using a series of steps:
 * 1. The {@link Router.navigateTo} method is called with an absolute path,
 *    which creates a {@link State} instance with the path.
 *    `navigateTo` will call `pushState` on the history object
 *    with the state instance and absolute path. Next, it will call
 *    {@link Router.navigateWithState} passed with the state instance.
 * 2. {@link Router.navigateWithState} will create a {@link RouteContext}
 *    instance from the state instance.
 *    It will call {@link Route.navigateWithContext} with the context instance.
 * 3. {@link Route.navigateWithContext} will find a matching route and call
 *    its handler with the context instance.
 */
export class Router {
  /**
   * Path-to-regexp configurations that are required for Router to work properly.
   */
  static #requiredOptions: IRouteMatchingOptions = {
    end: false,
  };

  /**
   * The options that are passed to {@link Route} objects
   * that in turn pass it to path-to-regexp.
   */
  static #routeMatchingOptions: IRouteMatchingOptions = this.#requiredOptions;

  /**
   * Configures the router with the given options.
   * These options are passed to function from path-to-regexp.
   * The router has reasonable defaults for all options.
   * Note that some options will not override Router's defaults as they are flags
   * that are needed to be set to specific value for the Router to work properly.
   *
   * @param {IRouteMatchingOptions} options The options to configure the router with.
   */
  public static configureRouteMatching(options: IRouteMatchingOptions): void {
    this.#routeMatchingOptions = { ...options, ...this.#requiredOptions };
  }

  /**
   * The routes to called when entering a path.
   * @private
   */
  readonly #routes: Route[];

  /**
   * The current context that is created by the router
   * @private
   */
  #context?: RouteContext;

  /**
   * The history API to use for the router.
   * This will be undefined if the router is a nested router.
   *
   * @private
   */
  readonly #history?: History;

  /**
   * Indicates whether the router is nested or not.
   *
   * @private
   */
  readonly #nested: boolean;

  /**
   * @param {RouterParams} params The parameter object for the router.
   * If `nested` is true, the router will be nested and
   * the history object can be omitted.
   * If `nested` is false, the router will not be nested and
   * the history object must be provided.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/History
   */
  constructor({ nested, history }: RouterParams) {
    this.#nested = nested;

    if (!nested) {
      this.#history = history;
    }

    this.#routes = [];
  }

  /**
   * Adds a route to the router.
   *
   * @param {string} pattern The route pattern.
   * @param {...IRouteHandlerCollection} handlers The route handlers.
   *
   * @returns {IRouteHandlerAdder} A handler-adder for chaining calls.
   */
  public route(
    pattern: string,
    ...handlers: IRouteHandlerCollection): IRouteHandlerAdder {

    const route = new Route(
      Router.#transformPathPattern(pattern),
      handlers,
      Router.#routeMatchingOptions,
    );

    this.#routes.push(
      route,
    );

    return {
      add(...handlers: IRouteHandlerCollection) {
        route.addHandler(...handlers);
        return this;
      },
    };
  }

  /**
   * Converts special paths to path-to-regexp compatible patterns.
   */
  static #transformPathPattern(pattern: string) {
    if (pattern === "*") return "";

    return pattern;
  }

  /**
   * Navigates to the given path, it will create a new {@link State} instance with the given path.
   * It will then call `pushState` on the history object with the state and path.
   * Lastly, it will delegate the next steps to {@link Router.navigateWithState}
   * by calling it with the state instance.
   *
   * @param {string} absolutePath should be an absolute path
   *
   * @throws {RouterError} If called on a nested router.
   */
  public navigateTo(absolutePath: string) {
    if (this.#nested)
      throw new RouterError(
        "Navigation using absolute paths is not supported on nested routers. " +
        "Use the parent router to navigate with absolute paths.",
      );

    if (!this.#history)
      throw new RouterError("No history object was provided to the router");

    const state = State.fromPrivateState({ path: absolutePath });
    this.#history.pushState(state, "", absolutePath);

    this.navigateWithState(state);
  }

  /**
   * Creates a context for the router using passed state, then call handlers
   * for context.
   *
   * This is useful when you want to restore the context from the state
   * retrieved from the popstate event.
   *
   * This is used by {@link popStateHandler}.
   *
   * @param {State} state The state to restore the context from.
   *
   * @throw {Error} If called on a nested router.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event
   */
  public navigateWithState(state: State) {
    if (this.#nested)
      throw new RouterError(
        "Navigation using states is not supported on nested routers. " +
        "Use the parent router to navigate with states.",
      );

    if (!this.#history)
      throw new RouterError(
        "Navigation using states is not supported on routers without a history object. " +
        "Use the parent router to navigate with states.",
      );

    this.#context = new RouteContext(state, this.#saveState);
    this.navigateWithContext(this.#context);
  }

  /**
   * Calls the handlers for the given context.
   *
   * @param context
   *
   * @throws {Error} If no {@link RouteContext.handled} is still false
   * after calling all the handlers.
   */
  public navigateWithContext(context: RouteContext) {
    for (const route of this.#routes) {
      if (route.handle(context)) return;
    }

    if (!context.handled)
      throw new RouterError(`No route matched: ${context.path}`, context);
  }

  /**
   * The callback that is passed to the {@link RouteContext} object.
   * Arrow function, so it's permanently bound to the router even when passed
   * as an argument.
   *
   * It is used by the current context to save
   * the state of the router to the history.
   *
   * @param state
   * @param title
   * @param url
   */
  readonly #saveState: IStateSaverCallback = (
    state: State,
    title: string,
    url: string,
  ) => {
    if (!this.#history)
      throw new RouterError(
        "Saved a state to the history, but the router has no history object.",
      );

    this.#history?.replaceState(state, title, url);
  };

  /**
   * Create a middleware with a router instance to be used as a nested router.
   */
  public static createRouterMiddleware(): INestedRouterMiddleware {
    const router = new Router({ nested: true });

    const middleware = (context: RouteContext, next: () => void) => {
      router.navigateWithContext(context);
      if (!context.handled) next();
    };

    middleware.route = router.route.bind(router);

    return middleware;
  }
}
