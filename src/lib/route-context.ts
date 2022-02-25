import { StringMap } from "./string-map";
import { naviPrivateStateKey, State } from "./state";

export interface IStateSaverCallback {
  (state: unknown, title: string, url: string): unknown;
}

/**
 * Exposes properties and methods of the current route
 */
export class RouteContext {
  /**
   * The current route state
   */
  readonly #state: State;

  /**
   * The callback to save the current route state.
   */
  readonly #stateSaverCb: IStateSaverCallback;

  /**
   * Exposes methods for retrieving information about the pathname segment
   *
   * @type {StringMap}
   * @readonly
   */
  public readonly param: StringMap;

  /**
   * The URL.searchParams object parsed from the url
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/searchParams
   * @type {URLSearchParams}
   * @readonly
   */
  public readonly query: URLSearchParams;

  /**
   * The full path (pathname + query string + hash)
   *
   * @readonly
   * @type {string}
   */
  public readonly path: string;

  /**
   * The pathname segment (includes the leading forward slash ('/'))
   *
   * @readonly
   * @type {string}
   */
  public readonly pathname: string;

  /**
   * The query string segment (includes the leading question mark ('?'))
   *
   * @readonly
   * @type {string}
   */
  public readonly queryString: string;

  /**
   * @description The hash segment (includes the leading hash symbol ('#'))
   *
   * @readonly
   * @type {string}
   */
  public readonly hash: string;

  /**
   * Flag that indicates if the context is completely handled by a route
   * and the router should not call the next route handlers in the chain.
   *
   * You normally should not set this flag manually.
   * It is automatically set to false by the router when a handler calls
   * `next` function passed as the second argument.
   *
   * @type {boolean}
   */
  public handled: boolean;

  /**
   * The part of the pathname which is matched by the route path pattern.
   * Empty string if the pathname hasn't been matched yet.
   * You should not set this property manually.
   * It is populated by the router.
   *
   * @type {(string | undefined)}
   */
  public matched: string;

  /**
   * @param {string} path
   * The full path (pathname + query string + hash)
   * @param {IStateSaverCallback} saveStateFn
   * The function to call when saving state
   * @param {State?} state The state object retrieved from the history, if any.
   */
  constructor(path: string, saveStateFn: IStateSaverCallback, state?: State) {
    const base = window?.location?.href ?? "https://example.com";
    const url = new URL(path, base);

    this.#stateSaverCb = saveStateFn;
    this.param = new StringMap();
    this.path = url.pathname + url.search + url.hash;
    this.pathname = url.pathname;
    this.queryString = url.search;
    this.hash = url.hash;
    this.query = url.searchParams;
    this.handled = false;
    this.matched = "";

    this.#state =
      state ?? new State({ [naviPrivateStateKey]: { path: this.path } });
    this.saveState();
  }

  /**
   * Saves the state object as the public state
   * @param {unknown} state The state object to save
   */
  public set state(state: unknown) {
    this.#state.publicState = state;
    this.saveState();
  }

  /**
   * Retrieve the public state object
   *
   * @return {unknown} The public state object
   */
  public get state(): unknown {
    return this.#state.publicState;
  }

  /**
   * Getter property for unmatched portions of the path.
   *
   * @return {string} the unmatched portion of the path
   */
  public get unmatched(): string {
    return this.path.replace(this.matched, "");
  }

  /**
   * Saves the state to the history object. This method is called automatically
   * when the state is changed.
   *
   * @return {void} void
   */
  public saveState() {
    this.#stateSaverCb(this.#state, "", this.path);
  }
}
