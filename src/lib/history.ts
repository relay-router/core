import { ROUTER_PRIVATE_STATE_KEY, State } from "./state";

/**
 * Strings representing the different types of history events.
 */
export type HistoryEventType = "push" | "replace" | "pop";

/**
 * A history event. Passed to listeners
 */
export type HistoryEvent = {
  type: HistoryEventType;
  path: string;
  state: State;
};

/**
 * A history event listener.
 */
export type HistoryEventListener = { (event: HistoryEvent): void };

type ListenerMap<Types extends string> = {
  [Key in Types]?: Set<HistoryEventListener>;
};

/**
 * A callback used to unsubscribe from history events returned by
 * {@link History#subscribe}.
 */
export type UnsubscribeCallback = {
  (): void;
  unsubscribe: UnsubscribeCallback;
};

/**
 * A common interface for history implementations.
 */
export interface History {

  /**
   * Push a new entry to the history stack with the given path and state.
   *
   * @param path
   * @param state
   */
  push(path: string, state?: unknown): void;

  /**
   * Replace the path and the state of the current entry in the history stack.
   *
   * @param path
   * @param state
   */
  replace(path: string, state?: unknown): void;

  /**
   * Go back to the previous entry in the history stack.
   * Does nothing if there is no previous entry.
   * Equivalent to calling `history.go(-1)`.
   */
  back(): void;

  /**
   * Go forward to the next entry in the history stack.
   * Does nothing if there is no next entry.
   * Equivalent to calling `history.go(1)`.
   */
  forward(): void;

  /**
   * The position in the history to which you want to move, relative to the current page.
   * A negative value moves backwards, a positive value moves forwards.
   * So, for example,`history.go(2)` moves forward two pages and `history.go(-2)` moves back two pages.
   * If no value is passed or if delta equals 0, it has the same result as calling `location.reload()`.
   * @param delta
   */
  go(delta: number): void;

  /**
   * Subscribe to all history events.
   * @param subscriber
   */
  subscribe(subscriber: HistoryEventListener): UnsubscribeCallback;

  /**
   * Subscribe to history events of the given type.
   * @param type
   * @param subscriber
   */
  subscribe(
    type: HistoryEventType,
    subscriber: HistoryEventListener,
  ): UnsubscribeCallback;
}

/**
 * A history implementation that uses the browser's history API.
 * This class is essentially a wrapper around the browser's history API
 * that conforms to the {@link History} interface used by the router.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/History HTML5 History API
 */
export class BrowserHistory implements History {
  /**
   * Stores all the history event listeners.
   *
   */
  private readonly _listeners: ListenerMap<HistoryEventType | "all">;

  constructor() {
    this._listeners = {};

    window.addEventListener("popstate", (event) => {
      const state = event.state;
      if (State.isValid(state)) {
        const type = "pop";
        const event: HistoryEvent = {
          type,
          path: state[ROUTER_PRIVATE_STATE_KEY].path,
          state,
        };
        this.notifyListeners(type, event);
      }
    });
  }

  public push(path: string, state: State) {
    window.history.pushState(state, "", path);
    const type = "push";
    this.notifyListeners(type, { type, path, state });
  }

  public replace(path: string, state: State) {
    window.history.replaceState(state, "", path);
    const type = "replace";
    this.notifyListeners(type, { type, path, state });
  }

  public back() {
    window.history.back();
  }

  public forward() {
    window.history.forward();
  }

  public go(delta: number) {
    window.history.go(delta);
  }

  protected notifyListeners(type: HistoryEventType, event: HistoryEvent) {
    const listeners = this._listeners[type];
    if (listeners) {
      for (const listener of listeners) {
        listener(event);
      }
    }

    const allListeners = this._listeners["all"];

    if (allListeners) {
      for (const listener of allListeners) {
        listener(event);
      }
    }
  }

  public subscribe(
    typeOrListener: HistoryEventType | HistoryEventListener,
    cb?: HistoryEventListener,
  ): UnsubscribeCallback {
    if (typeOrListener instanceof Function)
      return this.subscribeToAllEvents(typeOrListener);

    if (cb instanceof Function)
      return this.subscribeToEvent(typeOrListener, cb);

    throw new Error("Invalid arguments");
  }

  private subscribeToEvent(
    eventType: HistoryEventType,
    cb: HistoryEventListener,
  ): UnsubscribeCallback {
    let listeners = this._listeners[eventType];

    if (listeners === undefined)
      listeners = this._listeners[eventType] = new Set<HistoryEventListener>();

    listeners.add(cb);

    return this.createUnsubscribeCallback(cb, listeners);
  }

  private subscribeToAllEvents(cb: HistoryEventListener): UnsubscribeCallback {
    let listeners = this._listeners["all"];

    if (listeners === undefined)
      listeners = this._listeners["all"] = new Set<HistoryEventListener>();

    listeners.add(cb);

    return this.createUnsubscribeCallback(cb, listeners);
  }

  private createUnsubscribeCallback(
    subToRemove: HistoryEventListener,
    listeners: Set<HistoryEventListener>,
  ): UnsubscribeCallback {
    const unsub = () => {
      listeners.delete(subToRemove);
    };
    unsub.unsubscribe = unsub;
    return unsub;
  }
}

/**
 * A history implementation that extends the {@link BrowserHistory} class.
 * It transforms current path and state to use hash-based history.
 *
 * @see BrowserHistory
 */
export class HashHistory extends BrowserHistory {
  public override push(path: string, state: State) {
    path = "/#" + path;
    super.push(path, state);
  }

  public override replace(path: string, state: State) {
    path = "/#" + path;
    super.replace(path, state);
  }

  protected override notifyListeners(
    type: HistoryEventType,
    event: HistoryEvent,
  ) {
    const newPath = event.path.replace(/^\/#/, "");
    event.state[ROUTER_PRIVATE_STATE_KEY].path = newPath;
    event.path = newPath;
    super.notifyListeners(type, event);
  }
}
