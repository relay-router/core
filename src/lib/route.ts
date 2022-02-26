import { type Key, pathToRegexp } from "path-to-regexp";
import type { RouteContext } from "./route-context";
import type { IRouteMatchingOptions, IRouteHandlerCollection } from "./router";
import { NaviError } from "./navi-error";

/**
 * Represents a route. Internally, it stores a chain of handlers.
 *
 * The route can be matched against a path and the handlers
 * will be called in order they appear in the constructor.
 *
 * It also parses the path and stores the parameters in the param
 * ({@link RouteContext.param})field of a {@link RouteContext} instance.
 */
export class Route {
  /**
   * The handlers to call when the route matches.
   * @private
   */
  readonly #handlers: IRouteHandlerCollection;

  /**
   * The pattern to match against.
   * @private
   */
  readonly #regex: RegExp;

  /**
   * The keys of the parameters in the pattern.
   * @private
   */
  readonly #keys: Key[];

  constructor(
    pattern: string,
    handlers: IRouteHandlerCollection,
    matchingOptions?: IRouteMatchingOptions,
  ) {
    this.#keys = [];
    this.#regex = pathToRegexp(pattern, this.#keys, matchingOptions);
    this.#handlers = handlers;
  }

  /**
   * Parses the params from the path and stores the
   * results in the {@link RouteContext.param}.
   *
   * @param path The path to match against.
   * @param context The context to use for the matching.
   */
  private parseParamsAndStoreToContext(
    path: string,
    context: RouteContext,
  ): void {
    const matches = this.#regex.exec(path);

    if (matches) {
      context.matched += matches[0];

      for (let i = 1; i < matches.length; i++) {
        const key = this.#keys[i - 1];
        const value = matches[i];
        if (key) {
          context.param.addStringToKey(key.name.toString(), value);
        }
      }
    }
  }

  /**
   * Handles the route context.
   *
   * If the context is handled already, it will throw an error.
   *
   * Some properties of the context may be modified
   * by the route handlers in this route.
   *
   * @param {RouteContext} context the context to use for the matching
   *
   * @returns true if the route was able to handle the context, false otherwise.
   *
   * @throws {NaviError} If the context is already handled.
   */
  public handle(context: RouteContext): boolean {
    if (context.handled)
      throw new NaviError("Context was already handled", context);

    let pathToHandle = context.unmatched;

    if (!pathToHandle) pathToHandle = "/";

    if (!this.#regex.test(pathToHandle)) return false;

    this.parseParamsAndStoreToContext(pathToHandle, context);

    let callNextHandler = false;

    const next = () => {
      callNextHandler = true;
    };

    for (const handler of this.#handlers) {
      handler(context, next);

      if (!callNextHandler) {
        context.handled = true;
        break;
      }
    }

    return context.handled;
  }
}
