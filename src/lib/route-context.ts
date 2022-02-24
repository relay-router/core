import { StringMap } from "./string-map";
import { State } from "./state";

export interface IStateSaverCallback {
  (state: unknown, url: string, title: string): unknown;
}

/**
 * Exposes properties and methods of the current route
 */
export class RouteContext {
  readonly #state: State;
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
   * Flag that indicates if the context is handled by a route
   *
   * @type {boolean}
   */
  public handled: boolean;

  /**
   * @param {string} path
   * The full path (pathname + query string + hash)
   * @param {IStateSaverCallback} saveStateFn
   * The function to call when saving state
   */
  constructor(path: string, saveStateFn: IStateSaverCallback) {
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

    this.#state = new State({ path: this.path });
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
   * @return {unknown} The public state object
   */
  public get state(): unknown {
    return this.#state.publicState;
  }

  private saveState() {
    this.#stateSaverCb(this.#state, this.path, "");
  }
}
