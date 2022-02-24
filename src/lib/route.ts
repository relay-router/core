import { MatchFunction, match, pathToRegexp } from "path-to-regexp";
import { RouteContext } from "./route-context";
import { IRouteHandler } from "./router";
import { MatchingOptions } from "./router-options";

export class Route {
  readonly #handlers: IRouteHandler[];
  readonly #stringPattern: string;
  readonly #matcher: MatchFunction;
  readonly #regex: RegExp;

  constructor(pattern: string, handlers: IRouteHandler[], matchingOptions: MatchingOptions) {
    this.#matcher = match(pattern, matchingOptions);
    this.#stringPattern = pattern;
    this.#handlers = handlers;
    this.#regex = pathToRegexp(pattern, [], matchingOptions)
  }

  public test(path: string): boolean {
    return this.#regex.test(path);
  }

  public handle(context: RouteContext) {
    let callNextHandler = false;

    for (const handler of this.#handlers) {
      handler(context, () => {
        callNextHandler = true;
      });

      if (!callNextHandler) {
        break;
      }
    }
  }
}
