import { type Key, pathToRegexp } from "path-to-regexp";
import type { RouteContext } from "./route-context";
import type { RouteMatchingOptions, RouteHandler } from "./router";
import { RouterError } from "./router-error";
import type { NavigationContext } from "./navigation-context";

/**
 * Represents a route. Internally, it stores a chain of handlers.
 *
 * The route can be matched against a path and the handlers
 * will be called in order they appear in the constructor.
 *
 * It also parses the path and stores the parameters in the param
 * ({@link RouteContext#param}) field of a {@link RouteContext} instance.
 */
export class Route {
  /**
   * The handlers to call when the route matches.
   */
  private readonly _handlers: RouteHandler[];

  /**
   * The pattern to match against.
   */
  private readonly _regex: RegExp;

  /**
   * The keys of the parameters in the pattern.
   */
  private readonly _keys: Key[];

  constructor(
    pattern: string,
    handlers: RouteHandler[],
    matchingOptions?: RouteMatchingOptions,
  ) {
    this._keys = [];
    this._regex = pathToRegexp(pattern, this._keys, matchingOptions);
    this._handlers = handlers;
  }

  /**
   * Parses the params from the path and stores the
   * results in the {@link RouteContext#param}.
   *
   * @param path The path to match against.
   * @param context The context to use for the matching.
   */
  private parseParamsAndStoreToContext(
    path: string,
    context: RouteContext,
  ): void {
    const matches = this._regex.exec(path);

    if (matches) {
      context.matched += matches[0];

      for (let i = 1; i < matches.length; i++) {
        const key = this._keys[i - 1];
        const value = matches[i];
        if (key !== undefined && value !== undefined) {
          context.param.addStringToKey(key.name.toString(), value);
        }
      }
    }
  }

  /**
   * Adds additional handlers to the route.
   *
   * @param handlers
   */
  public addHandler(...handlers: RouteHandler[]): void {
    this._handlers.push(...handlers);
  }

  /**
   * Finds a handler.
   *
   * If the navigation is handled already, it will throw an error.
   *
   * Some properties of the context may be modified
   * by the route handlers in this route.
   *
   * @param routeContext provides the context for the matching.
   * @param navigationContext to control the flow of navigation
   *
   * @returns true if the route was able to handle the context, false otherwise.
   *
   * @throws {@link RouterError} If the context is already handled.
   */
  public handle(routeContext: RouteContext,
                navigationContext: NavigationContext) {
    if (navigationContext.handled)
      throw new RouterError("Navigation was already handled", routeContext);

    let pathToHandle = routeContext.unmatched;

    if (pathToHandle === "") pathToHandle = "/";

    if (!this._regex.test(pathToHandle)) return false;

    this.parseParamsAndStoreToContext(pathToHandle, routeContext);

    for (const handler of this._handlers) {
      handler(routeContext, navigationContext);

      if (navigationContext.resolved) return;
    }
  }
}
