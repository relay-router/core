import { RouteContext, type StateSaverCallback } from "./route-context";
import { Route } from "./route";
import type {
  ParseOptions,
  RegexpToFunctionOptions,
  TokensToRegexpOptions,
} from "path-to-regexp";
import { State } from "./state";
import { RouterError } from "./router-error";
import type { History } from "./history";
import { NavigationContext } from "./navigation-context";

/**
 * Describes the shape of the options passed to the second argument of the
 * {@link Router#constructor}.
 *
 * @internal
 */
export type RouterOptions = {
  /**
   * Flag to signal the router to handle the initial navigation when the page loads.
   *
   * @default true
   */
  navigateOnLoad?: boolean;

  /**
   * An option to override the attribute which be used as a tag
   * to identify which anchor elements to navigate to.
   *
   * If unspecified, the router will look for the `data-relay-link` or `relay-link`
   * attribute.
   */
  anchorAttribute?: string;
};

/**
 * A helper type for configuring path-to-regexp options.
 *
 * @internal
 */
export type RouteMatchingOptions = ParseOptions &
  TokensToRegexpOptions &
  RegexpToFunctionOptions;

/**
 * A helper type that describes the shape of the handlers passed to the
 * {@link Router#route} method.
 */
export interface RouteHandler {
  (context: RouteContext, controller: NavigationContext): void;
}

export interface ErrorHandler {
  (error?: any): void;
}

/**
 * A helper type that describes the object returned by
 * {@link Router#createNested} static method.
 */
interface NestedRouterMiddleware extends RouteHandler {
  route: Router["route"];
}

/**
 * A helper type that describes the object returned by
 * {@link Router#route} method.
 */
interface RouteHandlerAdder {
  /**
   * Adds more handlers to the end of the chain.
   *
   * @param handlers the handlers to be added.
   */
  add(...handlers: RouteHandler[]): RouteHandlerAdder;
}

/**
 * The class responsible for routing and finding match to the correct handler.
 */
export class Router {
  /**
   * @internal
   */
  private static _globalRouter?: Router;

  /**
   * @internal
   */
  private _started: boolean;

  /**
   * Path-to-regexp configurations that are required for Router to work properly.
   *
   * @internal
   */
  private static _requiredOptions: RouteMatchingOptions = {
    end: false,
  };

  /**
   * The options that are passed to {@link Route} objects
   * that in turn pass it to path-to-regexp.
   *
   * @internal
   */
  private static _routeMatchingOptions: RouteMatchingOptions =
    this._requiredOptions;

  /**
   * Configures the router with the given options.
   * These options are passed to function from path-to-regexp.
   * The router has reasonable defaults for all options.
   * Note that some options will not override Router's defaults as they are flags
   * that are needed to be set to specific value for the Router to work properly.
   *
   * @internal
   *
   * @param options The options to configure the router with.
   */
  public static configureRouteMatching(options: RouteMatchingOptions): void {
    this._routeMatchingOptions = { ...options, ...this._requiredOptions };
  }

  /**
   * The routes to called when entering a path.
   *
   * @internal
   */
  private readonly _routes: Route[];

  private readonly _errorHandlers: Set<ErrorHandler>;

  /**
   * The current context that is created by the router
   */
  private _context?: RouteContext;

  /**
   * Indicates how to proceed with the navigation.
   */
  private _navigation?: NavigationContext;

  /**
   * The history API to use for the router.
   * This will be undefined if the router is a nested router.
   *
   * @private
   */
  private readonly _history: History;

  /**
   * @param history The history API to use for the router.
   */
  constructor(history: History) {
    this._started = false;

    this._history = history;

    this._history.subscribe("pop", (event) => {
      this.navigateWithState(event.state);
    });

    this._routes = [];
    this._errorHandlers = new Set<ErrorHandler>();
  }

  /**
   * Adds a route to the router.
   *
   * @param pattern The route pattern.
   * @param handlers The route handlers.
   *
   * @returns A handler-adder object for chaining calls.
   */
  public route(
    pattern: string,
    ...handlers: RouteHandler[]
  ): RouteHandlerAdder {
    const route = new Route(
      Router.transformPathPattern(pattern),
      handlers,
      Router._routeMatchingOptions,
    );

    this._routes.push(route);

    return {
      add(...handlers: RouteHandler[]) {
        route.addHandler(...handlers);
        return this;
      },
    };
  }

  /**
   * Converts special paths to path-to-regexp compatible patterns.
   *
   * @internal
   */
  private static transformPathPattern(pattern: string) {
    if (pattern === "*" || pattern === "/") return "";

    return pattern;
  }

  /**
   * Navigates to the given path, it will create a new {@link State} instance with the given path.
   * It will then call `pushState` on the history object with the state and path.
   * Lastly, it will delegate the next steps to {@link Router#navigateWithState}
   * by calling it with the state instance.
   *
   * @param absolutePath should be an absolute path
   *
   * @throws {@link RouterError} If the router is not started or the path is not absolute.
   */
  public navigateTo(absolutePath: string) {
    if (!this._started)
      throw new RouterError("Router has not been started yet.");

    if (!absolutePath.startsWith("/"))
      throw new RouterError(
        "Path must be absolute. Relative paths are not supported.",
      );

    const state = State.fromPrivateState({ path: absolutePath });
    this._history.push(absolutePath, state);

    this.navigateWithState(state);
  }

  /**
   * Redirects navigation to a path to another path.
   * @param absolutePath The path to redirect.
   * @param redirectTo The path to redirect to when the absolute path is matched.
   */
  public redirect(absolutePath: string, redirectTo: string) {
    this.route(absolutePath, (_context, nav) => {
      nav.redirect(redirectTo);
    });
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
   * @throw {@link RouterError} If called on a nested router.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event
   */
  private navigateWithState(state: State) {
    this._context = new RouteContext(state, this._saveState);
    this._navigation = new NavigationContext();
    this.navigateWithContext(this._context, this._navigation);
  }

  /**
   * Calls the handlers for the given context.
   *
   * @internal
   *
   * @param context
   *
   * @param navigation
   * @throws {@link RouterError} If {@link RouteContext#handled} is still false
   * after calling all the handlers.
   */
  private navigateWithContext(context: RouteContext,
                              navigation: NavigationContext) {
    for (const route of this._routes) {
      route.handle(context, navigation);

      if (navigation.resolved) break;
    }

    if (navigation.handled) return;

    if (navigation.aborted) this.callErrorHandlers(navigation.error);

    if (navigation.redirected)
      this.navigateTo(navigation.redirectPath);

    if (!navigation.resolved)
      throw new RouterError(`Navigation was unresolved: ${context.path}`,
                            context);
  }

  /**
   * Registers a handler that will be called when an error occurs.
   */
  public error(...handlers: ErrorHandler[]) {
    handlers.forEach((handler) => this._errorHandlers.add(handler));
  }

  private callErrorHandlers(error?: any) {
    if (this._errorHandlers.size === 0) {
      throw new RouterError(
        "Router aborted because no error handlers were registered.");
    }

    for (const errorHandler of this._errorHandlers) {
      errorHandler(error);
    }
  }

  /**
   * The callback that is passed to the {@link RouteContext} object.
   * Arrow function, so it's permanently bound to the router even when passed
   * as an argument.
   *
   * It is used by the current context to save
   * the state of the router to the history.
   *
   * @internal
   *
   * @param state
   * @param url
   */
  private readonly _saveState: StateSaverCallback = (
    url: string,
    state: State,
  ) => {
    this._history.replace(url, state);
  };

  /**
   * Returns the global router instance.
   */
  public static get global() {
    if (!Router._globalRouter)
      throw new RouterError("Global router has not been initialized. " +
                            "Did you call start() on the router instance?");

    return Router._globalRouter;
  }

  /**
   * Start the router with the given options and sets itself as the global router,
   * binds its event listeners to the environment.
   *
   * @throws {@link RouterError} If Navi is already started or if environment is not supported
   * (e.g. no history API).
   */
  public start() {
    if (Router._globalRouter)
      throw new RouterError(
        "A Global Router has already been started. " +
        "Use Router.global to access it.",
      );

    if (this._started) {
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

    Router._globalRouter = this;

    this._started = true;
  }

  /**
   * Will call stop on the global router and remove all event listeners.
   * Will do nothing if the router has not started.
   */
  public static stop(): void {
    Router._globalRouter?.stop();
  }

  /**
   * Will stop the router and remove all event listeners and removes itself as the global router,
   * does nothing if the router has not started.
   */
  public stop(): void {
    if (!this._started) return;

    window.removeEventListener("click", Router.clickHandler);
    this._started = false;

    if (Router._globalRouter === this) Router._globalRouter = undefined;
  }

  /**
   * Will stop the router and remove all routes and handlers registered.
   */
  public reset(): void {
    this.stop();
    this._routes.length = 0;
  }

  /**
   * Create a middleware with a router instance to be used as a nested router.
   */
  public static createNested(): NestedRouterMiddleware {
    const miniRouter = { _routes: [] as Route[] };

    const middleware = (context: RouteContext,
                        navigation: NavigationContext) => {
      Router.prototype.navigateWithContext.call(
        miniRouter,
        context,
        navigation,
      );
    };

    middleware.route = Router.prototype.route.bind(miniRouter);

    return middleware;
  }

  /**
   * The default implementation for handling the click events.
   * It will look for an anchor element with a `data-relay-link` or `relay-link` attribute.
   *
   * @param event
   */
  private static clickHandler(event: MouseEvent) {
    if (!Router._globalRouter?._started)
      throw new Error("A global router has not _started");

    if (
      event.target instanceof HTMLAnchorElement &&
      (event.target.hasAttribute("relay-link") ||
       event.target.hasAttribute("data-relay-link"))
    ) {
      Router._globalRouter.navigateTo(event.target.href);
      event.preventDefault();
    }
  }
}
