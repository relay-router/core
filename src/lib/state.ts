import { RouterError } from "./router-error";

/**
 * Key string for accessing Router's private state stored in window.history.state.
 * @example
 * ```typescript
 * const routerState = window.history.state[ROUTER_PRIVATE_STATE_KEY];
 * ```
 */
export const ROUTER_PRIVATE_STATE_KEY =
  "__ROUTER_PRIVATE_STATE_KEY_DO_NOT_TAMPER__";

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
 * Contains a {@link State#publicState} field where the public state is stored,
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
   * The public state for clients to access. Only serializable
   * types (e.g. Numbers and Strings) are supported.
   * Can be accessed by {@link RouteContext#state}
   */
  public publicState?: unknown;

  /**
   * @param unknownState the object to create the state from.
   *
   * @throws {@link RouterError} if the object is not a valid state.
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
   * It is used by Router to create a new state object when a new path is entered
   * or when the popstate event is fired.
   *
   * @param privateState the private state to be stored in the state object.
   */
  public static fromPrivateState(privateState: RouterPrivateState): State {
    return new State({
                       [ROUTER_PRIVATE_STATE_KEY]: privateState,
                     });
  }

  /**
   * Returns true if the given object is a valid state object.
   *
   * @param unknownState the object to validate
   */
  public static isValid(unknownState: any): unknownState is State {
    return typeof unknownState?.[ROUTER_PRIVATE_STATE_KEY]?.path === "string";
  }

  /**
   * Returns true if the given object is a valid state object.
   * Uses the {@link State#isValid} method under the hood.
   *
   * @param unknownState the object to validate
   */
  public static [Symbol.hasInstance](unknownState: any): unknownState is State {
    return State.isValid(unknownState);
  }
}
