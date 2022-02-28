import { RouterError } from "./router-error";

/**
 * Key string for accessing Router's private state stored in history.state.
 * @example```typescript
 * const routerState = history.state[ROUTER_PRIVATE_STATE_KEY];
 * ```
 */
export const ROUTER_PRIVATE_STATE_KEY =
  "__RouterPrivateStateKey_DO_NOT_TAMPER__";

/**
 * The structure of the Router's private state
 * stored in `history.state[rutaPrivateStateKey]`.
 */
export interface RouterPrivateState {
  /**
   * The path during which the state was created.
   */
  path: string;
}

/**
 * A convenience type creating the state object to be stored in history.state.
 * Contains a {@link State.publicState} field where the public state is stored,
 * And a field where Router's private state is stored, which can be accessed
 * using the {@link ROUTER_PRIVATE_STATE_KEY} constant.
 *
 * This goes without saying, the private state is not meant to be tampered with.
 */
export class State {
  /**
   * The private state to be used internally by Router.
   */
  public [ROUTER_PRIVATE_STATE_KEY]: RouterPrivateState;

  /**
   * The public state for clients to access.
   */
  public publicState?: unknown;

  /**
   * @param {any} unknownState the object to create the state from.
   *
   * @throws {RouterError} if the object is not a valid state.
   */
  constructor(unknownState: any) {
    if (!State.isValid(unknownState)) {
      throw new RouterError("Invalid state object");
    }

    this[ROUTER_PRIVATE_STATE_KEY] = unknownState[ROUTER_PRIVATE_STATE_KEY];
    this.publicState = unknownState.publicState;
  }

  /**
   * A factory method that creates a new state object with the given private state.
   *
   * @param privateState
   */
  public static fromPrivateState(privateState: RouterPrivateState): State {
    return new State({
      [ROUTER_PRIVATE_STATE_KEY]: privateState,
    });
  }

  /**
   * Returns true if the given object is a valid state object.
   *
   * @param {any} unknownState the object to validate
   */
  public static isValid(unknownState: any): unknownState is State {
    return typeof unknownState?.[ROUTER_PRIVATE_STATE_KEY]?.path === "string";
  }

  public static [Symbol.hasInstance](unknownState: any): unknownState is State {
    return State.isValid(unknownState);
  }
}
