/**
 * @description Key string for accessing Navi's private state stored in history.state.
 * @example ```
 * const naviState = history.state[naviPrivateStateKey];
 * ```
 */
export const naviPrivateStateKey = "__NaviPrivateState__";

interface INaviInternalState {
  path: string;
}

/**
 * A convenience type creating the state object to be stored in history.state.
 * It exposes a publicState that clients can read or write to be stored in history.state.
 *
 */
export class State {
  public [naviPrivateStateKey]: INaviInternalState;

  constructor(unknownState: any) {
    if (!State.isValid(unknownState)) {
      throw new Error("Invalid state object");
    }

    this[naviPrivateStateKey] = unknownState[naviPrivateStateKey];
    this.publicState = unknownState.publicState;
  }

  public publicState: unknown;

  public static isValid(unknownState: any): unknownState is State {
    return (
      unknownState?.[naviPrivateStateKey]?.path &&
      typeof unknownState?.[naviPrivateStateKey]?.path === "string"
    );
  }
}
