import type { RouteContext } from "./route-context";

/**
 * Errors thrown by Navi library.
 */
export class RutaError extends Error {
  public readonly context?: RouteContext;

  constructor(message: string, context?: RouteContext) {
    super(message);
    this.name = "RutaError";
    this.context = context;
  }
}
