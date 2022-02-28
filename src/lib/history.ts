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
 */
export type UnsubscribeCallback = {
  (): void;
  unsubscribe: UnsubscribeCallback;
};

export interface History {
  push(path: string, state?: unknown): void;

  replace(path: string, state?: unknown): void;

  back(): void;

  forward(): void;

  go(delta: number): void;

  subscribe(subscriber: HistoryEventListener): UnsubscribeCallback;
  subscribe(
    type: HistoryEventType,
    subscriber: HistoryEventListener,
  ): UnsubscribeCallback;
}

export class BrowserHistory implements History {
  readonly #listeners: ListenerMap<HistoryEventType | "all">;

  constructor() {
    this.#listeners = {};
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
    const listeners = this.#listeners[type];
    if (listeners) {
      for (const listener of listeners) {
        listener(event);
      }
    }

    const allListeners = this.#listeners["all"];

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
    let listeners = this.#listeners[eventType];

    if (listeners === undefined)
      listeners = this.#listeners[eventType] = new Set<HistoryEventListener>();

    listeners.add(cb);

    return this.createUnsubscribeCallback(cb, listeners);
  }

  private subscribeToAllEvents(cb: HistoryEventListener): UnsubscribeCallback {
    let listeners = this.#listeners["all"];

    if (listeners === undefined)
      listeners = this.#listeners["all"] = new Set<HistoryEventListener>();

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
