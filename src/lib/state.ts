/**
 * Key string for accessing Navi's private state stored in history.state.
 * @example ```
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
  public [naviPrivateStateKey]: INaviPrivateState;

  /**
   * @param {any} unknownState the object to create the state from.
   *
   * @throws {Error} if the object is not a valid state.
   */
  constructor(unknownState: any) {
    if (!State.isValid(unknownState)) {
      throw new Error("Invalid state object");
    }

    this[naviPrivateStateKey] = unknownState[naviPrivateStateKey];
    this.publicState = unknownState.publicState;
  }

  public publicState: unknown;

  /**
   * Returns true if the given object is a valid state object.
   *
   * @param {any} unknownState the object to validate
   */
  public static isValid(unknownState: any): unknownState is State {
    return (
      unknownState?.[naviPrivateStateKey]?.path &&
      typeof unknownState?.[naviPrivateStateKey]?.path === "string"
    );
  }
}
