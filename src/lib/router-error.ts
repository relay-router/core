import type { RouteContext } from "./route-context";

/**
 * Errors thrown by Navi library.
 */
export class RouterError {
  public readonly context?: RouteContext;
  public readonly message: string;

  constructor(message: string, context?: RouteContext) {
    this.message = message;
    this.context = context;
  }
}
