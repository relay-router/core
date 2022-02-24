import { StringMap } from "./string-map";
import { State } from "./state";

export interface IStateSaverCallback {
  (state: unknown, url: string, title: string): unknown;
}

/**
 * @description Exposes properties and methods of the current route
 */
export class RouteContext {
  readonly #state: State;
  readonly #stateSaverCb: IStateSaverCallback;

  /**
   * @description Exposes methods for retrieving information about the pathname segment
   * @type {StringMap}
   * @readonly
   */
  public readonly param?: StringMap;

  /**
   * @description Stores the URL.searchParams object parsed from the url
   * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/searchParams
   * @type {URLSearchParams}
   * @readonly
   */
  public readonly query: URLSearchParams;


  /**
   * @description The full path (pathname + query string + hash)
   * @readonly
   * @type {string}
   */
  public readonly path: string;

  /**
   * @description The pathname segment (includes the leading forward slash ('/'))
   * @readonly
   * @type {string}
   */
  public readonly pathname: string;

  /**
   * @description The query string segment (includes the leading question mark ('?'))
   * @readonly
   * @type {string}
   */
  public readonly queryString: string;

  /**
   * @description The hash segment (includes the leading hash symbol ('#'))
   * @readonly
   * @type {string}
   */
  public readonly hash: string;

  /**
   * @description
   * @type {boolean}
   */
  public handled: boolean;

  constructor(path: string, saveStateFn: IStateSaverCallback) {
    const base = window?.location?.host ?? "https://example.com";
    const url = new URL(path, base);

    this.#state = new State({ path });
    this.#stateSaverCb = saveStateFn;
    this.path = path;
    this.pathname = url.pathname;
    this.queryString = url.search;
    this.hash = url.hash;
    this.query = url.searchParams;
    this.handled = false;
  }

  public set state(state: unknown) {
    this.#state.publicState = state;
    this.saveState();
  }

  public get state(): unknown {
    return this.#state.publicState;
  }

  private saveState() {
    this.#stateSaverCb(this.#state, this.path, "");
  }
}
