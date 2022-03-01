import { RouterError } from "./router-error";

const enum NavigationState {
  PENDING,
  HANDLED,
  REDIRECTED,
  ABORTED,
}

/**
 * A helper type for describing the shape of the object passed
 * to the argument of a {@link RouteHandler}.
 *
 * This class has is a state machine for that is used by the {@link Router}
 * class to determine the next step in the navigation process.
 */
export class NavigationContext {
  private _state: NavigationState;
  private _path: string;
  private _error: any;

  constructor() {
    this._state = NavigationState.PENDING;
    this._path = "";
  }

  /**
   * Returns true if the navigation has been handled.
   *
   * @internal
   */
  get handled(): boolean {
    return this._state === NavigationState.HANDLED;
  }

  /**
   * Returns true if the navigation has been redirected.
   *
   * @internal
   */
  get redirected(): boolean {
    return this._state === NavigationState.REDIRECTED;
  }

  /**
   * Returns true if the navigation has been aborted.
   *
   * @internal
   */
  get aborted(): boolean {
    return this._state === NavigationState.ABORTED;
  }

  /**
   * Returns true if the navigation has been resolved.
   *
   * @internal
   */
  get resolved(): boolean {
    return this._state !== NavigationState.PENDING;
  }

  /**
   * The latest error that occurred during the navigation.
   *
   * @internal
   */
  get error(): any {
    return this._error;
  }

  /**
   * The path to redirect to.
   *
   * @internal
   */
  public get redirectPath(): string {
    return this._path;
  }

  /**
   * Signals the router to stop the navigation and that an error has occurred.
   * Accepts an optional error object. The router will any error handlers
   * registered with the {@link Router} method
   */
  public abort(error?: any): void {
    if (this.resolved) throw new RouterError(
      "Can't call abort() after the navigation has been resolved.");

    this._state = NavigationState.ABORTED;
    this._error = error;
  }

  /**
   * Signals the router that the route handler has handled the navigation
   * and stop finding the next route handler.
   */
  public ok() {
    if (this.resolved) throw new RouterError(
      "Can't call ok() after the navigation has been resolved.");

    this._state = NavigationState.HANDLED;
  }

  /**
   * Signals the router that the route handlers wants to redirect to a new path.
   *
   * @param path The path to redirect to.
   */
  public redirect(path: string): void {
    if (this.resolved) throw new RouterError(
      "Can't call redirect() after the navigation has been resolved.");

    this._path = path;
    this._state = NavigationState.REDIRECTED;
  }
}
