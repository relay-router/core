import { type IStateSaverCallback, RouteContext } from "./route-context";
import { Route } from "./route";
import type {
  ParseOptions,
  TokensToRegexpOptions,
  RegexpToFunctionOptions,
} from "path-to-regexp";
import { State } from "./state";
import { RouterError } from "./router-error";
import type { History } from "./history";

export type RouterOptions = {
  /**
   * Flag to signal the router to bind a handler
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

  /**
   * Flag to signal the router to handle the initial navigation when the page loads.
   *
   * @type {boolean}
   * @default false
   */
  useHash?: boolean;
};
//
// const defaultOptions: RouterOptions = {
//   bindPopState: true,
//   bindClick: true,
//   initialDispatch: true,
//   useHash: false,
// };

/**
 * A helper type for configuring path-to-regexp options.
 */
export type RouteMatchingOptions = ParseOptions &
  TokensToRegexpOptions &
  RegexpToFunctionOptions;

export interface RouteHandler {
  (context: RouteContext, next: () => void): void;
}

type RouterParams =
  | {
  nested: true;
  history?: never;
}
  | {
  nested: false;
  history: History;
};

interface INestedRouterMiddleware extends RouteHandler {
  route: Router["route"];
}

interface IRouteHandlerAdder {
  /**
   * Adds more handlers to the end of the chain.
   *
   * @param handlers
   */
  add(...handlers: RouteHandler[]): IRouteHandlerAdder;
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
  static #globalRouter?: Router;
  static #started = false;
  /**
   * Path-to-regexp configurations that are required for Router to work properly.
   */
  static #requiredOptions: RouteMatchingOptions = {
    end: false,
  };

  /**
   * The options that are passed to {@link Route} objects
   * that in turn pass it to path-to-regexp.
   */
  static #routeMatchingOptions: RouteMatchingOptions = this.#requiredOptions;

  /**
   * Configures the router with the given options.
   * These options are passed to function from path-to-regexp.
   * The router has reasonable defaults for all options.
   * Note that some options will not override Router's defaults as they are flags
   * that are needed to be set to specific value for the Router to work properly.
   *
   * @param options The options to configure the router with.
   */
  public static configureRouteMatching(options: RouteMatchingOptions): void {
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
  constructor({ nested = true, history }: RouterParams) {
    if (!nested && Router.#globalRouter) {
      throw new Error("A global Router already exists, you can only " +
                      "create nested routers after the global router " +
                      "has been created.");
    }

    this.#nested = nested;

    if (!nested) {
      if (!history) {
        throw new Error("A history object must be provided when creating " +
                        "a global router.");
      }

      this.#history = history;
      Router.#globalRouter = this;


      this.#history.on("pop", (event) => {
        this.navigateWithState(event.state);
      });
    }

    this.#routes = [];
  }

  /**
   * Adds a route to the router.
   *
   * @param pattern The route pattern.
   * @param handlers The route handlers.
   *
   * @returns A handler-adder for chaining calls.
   */
  public route(
    pattern: string,
    ...handlers: RouteHandler[]
  ): IRouteHandlerAdder {
    const route = new Route(
      Router.#transformPathPattern(pattern),
      handlers,
      Router.#routeMatchingOptions,
    );

    this.#routes.push(route);

    return {
      add(...handlers: RouteHandler[]) {
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
   * @param absolutePath should be an absolute path
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
    this.#history.push(absolutePath, state);

    this.navigateWithState(state);
  }

  /**
   * Creates a context for the router using passed state, then call handlers
   * for context.
   *
   * This is useful when you want to restore the context from the state
   * retrieved from the popstate event.
   *
   * @internal
   *
   * @param state The state to restore the context from.
   *
   * @throw {Error} If called on a nested router.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event
   */
  private navigateWithState(state: State) {
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
   * @internal
   *
   * @param context
   *
   * @throws {Error} If no {@link RouteContext.handled} is still false
   * after calling all the handlers.
   */
  private navigateWithContext(context: RouteContext) {
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
   * @param url
   */
  readonly #saveState: IStateSaverCallback = (
    url: string,
    state: State,
  ) => {
    if (!this.#history)
      throw new RouterError(
        "Tried a state to the history, but the router has no history object.",
      );

    this.#history.replace(url, state);
  };

  /**
   * Start the router with the given options.
   *
   * @return {Router} The router instance.
   *
   * @throws {Error} If Navi is already started or if environment is not supported
   * (e.g. no history API).
   */
  public start() {
    if (Router.#started) {
      throw new RouterError("Router is already started");
    }

    if (!window) {
      throw new RouterError("Environment has no window object");
    }

    if (!document) {
      throw new RouterError("Environment has no document object");
    }

    if (!history) {
      throw new RouterError("Environment has no history object");
    }

    if (!location) {
      throw new RouterError("Environment has no location object");
    }

    window.addEventListener("click", Router.clickHandler);

    Router.#started = true;
  }

  public stop() {
    if (!Router.#started) return;

    window.removeEventListener("click", Router.clickHandler);
    Router.#started = false;
  }

  /**
   * Create a middleware with a router instance to be used as a nested router.
   */
  public static createNested(): INestedRouterMiddleware {
    const router = new Router({ nested: true });

    const middleware = (context: RouteContext, next: () => void) => {
      router.navigateWithContext(context);
      if (!context.handled) next();
    };

    middleware.route = router.route.bind(router);

    return middleware;
  }

  /**
   * The default implementation for handling the click events.
   * It will look for {@link HTMLAnchorElement} with a `data-relay-link` or `relay-link` attribute.
   *
   * @internal
   *
   * @param {MouseEvent} event
   */
  public static clickHandler(event: MouseEvent) {
    if (!Router.#started || !Router.#globalRouter)
      throw new Error("Router has not started");

    if (
      event.target instanceof HTMLAnchorElement &&
      (event.target.hasAttribute("relay-link") ||
       event.target.hasAttribute("data-relay-link"))
    ) {
      Router.#globalRouter.navigateTo(event.target.href);
      event.preventDefault();
    }
  }
}
