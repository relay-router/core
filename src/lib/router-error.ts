import type { RouteContext } from "./route-context";

/**
 * Errors thrown by Navi library.
 */
export class RouterError extends Error {
  public readonly context?: RouteContext;

  constructor(message: string, context?: RouteContext) {
    super(message);
    this.context = context;
  }
}
