import { NaviError } from "./navi-error";

/**
 * Key string for accessing Navi's private state stored in history.state.
 * @example```typescript
 * const naviState = history.state[naviPrivateStateKey];
 * ```
 */
export const naviPrivateStateKey = "__NaviPrivateStateKey_DO_NOT_TAMPER__";

/**
 * The structure of the `Navi's` private state
 * stored in `history.state[naviPrivateStateKey]`.
 */
export interface INaviPrivateState {
  /**
   * The path during which the state was created.
   */
  path: string;
}

/**
 * A convenience type creating the state object to be stored in history.state.
 * Contains a {@link State.publicState} field where the public state is stored,
 * And a field where Navi's private state is stored, which can be accessed
 * using the {@link naviPrivateStateKey} constant.
 *
 * This goes without saying, the private state is not meant to be tampered with.
 */
export class State {
  /**
   * The private state to be used internally by Navi.
   */
  public [naviPrivateStateKey]: INaviPrivateState;

  /**
   * The public state for clients to access.
   */
  public publicState?: unknown;

  /**
   * @param {any} unknownState the object to create the state from.
   *
   * @throws {NaviError} if the object is not a valid state.
   */
  constructor(unknownState: any) {
    if (!State.isValid(unknownState)) {
      throw new NaviError("Invalid state object");
    }

    this[naviPrivateStateKey] = unknownState[naviPrivateStateKey];
    this.publicState = unknownState.publicState;
  }

  /**
   * A factory method that creates a new state object with the given private state.
   *
   * @param privateState
   */
  public static fromPrivateState(privateState: INaviPrivateState): State {
    return new State({
      [naviPrivateStateKey]: privateState,
    });
  }

  /**
   * Returns true if the given object is a valid state object.
   *
   * @param {any} unknownState the object to validate
   */
  public static isValid(unknownState: any): unknownState is State {
    return typeof unknownState?.[naviPrivateStateKey]?.path === "string";
  }
}
