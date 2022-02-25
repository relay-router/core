import { RouteContext } from "./route-context";
import { Route } from "./route";
import type {
  ParseOptions,
  TokensToRegexpOptions,
  RegexpToFunctionOptions,
} from "path-to-regexp";

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
  | [IRouteCallback]
  | IRouteMiddleware[]
  | [...IRouteMiddleware[], IRouteCallback];

/**
 * The class responsible for in-browser routing to the correct handler.
 */
export class Router {

  /**
   * Path-to-regexp configurations that are required for Navi to work properly.
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
   * Note that some options will not override Navi's defaults as they are flags
   * that are needed to be set to specific value for Navi to work properly.
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
  readonly #enterRoutes: Route[];

  /**
   * The routes to called when exiting a path.
   * @private
   */
  // readonly #exitRoutes: Route[];

  /**
   * The previous context that was created by the router.
   * @private
   */
  #previousContext?: RouteContext;

  /**
   * The current context that is created by the router
   * @private
   */
  #currentContext?: RouteContext;

  /**
   * The history API to use for the router.
   * @private
   */
  readonly #history: History;

  /**
   * @param {History} history The history object to use for routing.
   * You normally pass the history object that from the DOM.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/History}
   */
  constructor(history: History) {
    this.#enterRoutes = [];
    this.#history = history;
    // this.#exitRoutes = [];
  }

  /**
   * Adds a middleware to the route.
   *
   * @param {string} pattern The route pattern.
   * @param {IRouteMiddleware} middleware The middleware to add.
   *
   * @returns {this} The router, to allow chaining method calls.
   */
  public route(pattern: string, middleware: IRouteMiddleware): this;

  /**
   * Add a middlewares to the route.
   *
   * @param {string} pattern The route pattern.
   * @param {...IRouteMiddleware} middlewares The middlewares to add.
   *
   * @returns {this} The router, to allow chaining method calls.
   */
  public route(pattern: string, ...middlewares: IRouteMiddleware[]): this;

  /**
   * Adds a callback to the route.
   *
   * @param {string} pattern The route pattern
   * @param {IRouteCallback} callback the route callback
   *
   * @returns {this} The router, to allow chaining method calls.
   */
  public route(pattern: string, callback: IRouteCallback): this;

  /**
   * Adds a route to the router.
   *
   * @param {string} pattern The route pattern.
   * @param {[...IRouteMiddleware[], IRouteCallback]} handlers The route handlers.
   *
   * @returns {this} The router, to allow chaining method calls.
   */
  public route(
    pattern: string,
    ...handlers: [...IRouteMiddleware[], IRouteCallback]
  ): this;

  /**
   * Adds a route to the router.
   *
   * @param {string} pattern The route pattern.
   * @param {...IRouteHandlerCollection} handlers The route handlers.
   *
   * @returns {this} The router, to allow chaining method calls.
   */
  public route(pattern: string, ...handlers: IRouteHandlerCollection) {
    this.#enterRoutes.push(
      new Route(pattern, handlers, Router.#routeMatchingOptions),
    );

    return this;
  }

  // public routeExit(
  //   pattern: string,
  //   ...handlers: IRouteHandlerCollection
  // ) {
  //
  //   this.#exitRoutes.push(
  //     new Route(pattern, handlers, this.#options.matchingOptions),
  //   );
  //
  //   return this;
  // }

  /**
   * Navigates to the given path, finding the any route with a pattern that
   * can match the given path. If a route is found, it will call its handler(s).
   *
   * If the route didn't fully handle the path (e.g. the last handler of the
   * route called next(), or a handler manually
   * set the {@link RouteContext.handled} to false),
   * it will find another route that can match the path.
   *
   * If all the routes have been tried, and none of them handled the path,
   * it will throw an error.
   *
   * @param {string} absolutePath should be an absolute path
   *
   * @throws {Error} If no route can handle the path.
   */
  public navigateTo(absolutePath: string) {
    this.#history.pushState(null, "", absolutePath);

    if (this.#currentContext) {
      this.#previousContext = this.#currentContext;
    }

    this.#currentContext = new RouteContext(absolutePath, this.saveState);

    for (const route of this.#enterRoutes) {
      if (route.handle(this.#currentContext)) {
        return;
      }
    }

    if (!this.#currentContext.handled) {
      throw new Error(`No was able to handle the path: ${absolutePath}`);
    }
  }

  /**
   * The callback that is passed to the {@link RouteContext} object.
   * It is used by the current context to save
   * the state of the router to the history.
   *
   * @param state
   * @param title
   * @param url
   */
  private saveState = (state: unknown, title: string, url: string) => {
    this.#history.replaceState(state, title, url);
  };

  // public exitFrom(path: string) {}

  //
  // public createMiddleware(): IRouteMiddleware {
  //   return (context: RouteContext, next: IRouteHandler) => {
  //   };
  // }
}
