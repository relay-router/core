import { routerPrivateStateKey, State } from "./state";

export type HistoryEventType = "push" | "replace" | "pop";
export type HistoryEvent = {
  type: HistoryEventType;
  path: string;
  state: State;
}

export type HistoryEventListener
  = { (event: HistoryEvent): void; };

type Unsubscribe = () => void;

export interface History {
  push(path: string, state?: unknown): void;

  replace(path: string, state?: unknown): void;

  back(): void;

  forward(): void;

  go(delta: number): void;

  on(eventType: HistoryEventType, cb: HistoryEventListener): Unsubscribe;
}

export class BrowserHistory implements History {
  readonly #listeners: {
    push?: Set<HistoryEventListener>;
    replace?: Set<HistoryEventListener>;
    pop?: Set<HistoryEventListener>;
  };

  constructor() {
    this.#listeners = {};
    window.addEventListener("popstate", (event) => {
      const state = event.state;
      if (State.isValid(state)) {
        const event: HistoryEvent = {
          type: "pop",
          path: state[routerPrivateStateKey].path,
          state,
        };
        this.#notify(event);
      }
    });
  }

  push(path: string, state: State) {
    window.history.pushState(state, "", path);
    this.#notify({ type: "push", path, state });
  }

  replace(path: string, state: State) {
    window.history.replaceState(state, "", path);
    this.#notify({ type: "replace", path, state });
  }

  back() {
    window.history.back();
  }

  forward() {
    window.history.forward();
  }

  go(delta: number) {
    window.history.go(delta);
  }

  #notify(event: HistoryEvent) {
    const listeners = this.#listeners[event.type];
    if (listeners) {
      for (const listener of listeners) {
        listener(event);
      }
    }
  }

  on(eventType: HistoryEventType, cb: HistoryEventListener): Unsubscribe {
    let listeners = this.#listeners[eventType];

    if (listeners === undefined)
      listeners = this.#listeners[eventType] = new Set<HistoryEventListener>();


    listeners.add(cb);

    return () => {
      listeners?.delete(cb);
    };
  }
}
