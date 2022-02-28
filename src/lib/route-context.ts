import { StringMap } from "./string-map";
import type { State } from "./state";
import { ROUTER_PRIVATE_STATE_KEY } from "./state";

/**
 * An interface that describes the second parameter of the RouteContext constructor.
 */
export interface StateSaverCallback {
  (url: string, state: State): void;
}

/**
 * Exposes properties and methods for retrieving and modifying the current route context.
 * This is passed as the first argument of the callbacks registered using {@link Router#route}.
 *
 * @example
 * ```typescript
 * const router = new Router(new BrowserHistory());
 *
 * router.route("/", (context) => {
 *
 *   // the first argument in this callback is the RouteContext instance
 *   // retrieve information about the current route
 *
 *   const userId = context.params.getString("userId");
 * });
 *
 * ```
 */
export class RouteContext {
  /**
   * The current route state
   */
  private readonly _state: State;

  /**
   * The callback to save the current route state.
   */
  private readonly _stateSaverCb: StateSaverCallback;

  /**
   * Exposes methods for retrieving information about the pathname segment.
   * It is an instance of {@link StringMap}
   */
  public readonly param: StringMap;

  /**
   * The URL.searchParams object parsed from the url
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/searchParams
   */
  public readonly query: URLSearchParams;

  /**
   * The full path (pathname + query string + hash)
   */
  public readonly path: string;

  /**
   * The pathname segment (includes the leading forward slash ('/'))
   */
  public readonly pathname: string;

  /**
   * The query string segment (includes the leading question mark ('?'))
   */
  public readonly queryString: string;

  /**
   * The hash segment (includes the leading hash symbol ('#'))
   */
  public readonly hash: string;

  /**
   * Flag that indicates if the context is completely handled by a route
   * and the router should not call the next route handlers in the chain.
   *
   * You normally should not set this flag manually.
   * It is automatically set to false by the router when a handler calls
   * `next` function passed as the second argument.
   */
  public handled: boolean;

  /**
   * The part of the pathname which is matched by the route path pattern.
   * Empty string if the pathname hasn't been matched yet.
   * You should not set this property manually.
   * It is populated by the router.
   */
  public matched: string;

  /**
   * Constructs a new RouteContext instance from the given state
   * and a callback when saving the state.
   */
  constructor(state: State, saveStateFn: StateSaverCallback) {
    const base = window?.location?.href ?? "https://example.com";
    const url = new URL(state[ROUTER_PRIVATE_STATE_KEY].path, base);

    this._stateSaverCb = saveStateFn;
    this.param = new StringMap();
    this.path = url.pathname + url.search + url.hash;
    this.pathname = url.pathname;
    this.queryString = url.search;
    this.hash = url.hash;
    this.query = url.searchParams;
    this.handled = false;
    this.matched = "";
    this._state = state;
  }

  /**
   * Saves the state object as the public state of the context.
   */
  public set state(state: unknown) {
    this._state.publicState = state;
    this.saveState();
  }

  /**
   * Retrieve the public state object
   */
  public get state(): unknown {
    return this._state.publicState;
  }

  /**
   * Getter property for unmatched portions of the path.
   */
  public get unmatched(): string {
    let unmatched = this.path.replace(this.matched, "");

    if (unmatched === "" && !unmatched.startsWith("/")) {
      unmatched = "/" + unmatched;
    }

    return unmatched;
  }

  /**
   * Saves the state to the history object. This method is called automatically
   * when the state is changed.
   */
  public saveState(): void {
    this._stateSaverCb(this.path, this._state);
  }
}
