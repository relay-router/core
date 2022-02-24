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


export class State {
  public [naviPrivateStateKey]: INaviInternalState;

  constructor(internalState: INaviInternalState) {
    this[naviPrivateStateKey] = internalState;
  }

  public publicState: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isValidNaviState(unknownState: any): unknownState is State {
  return unknownState?.[naviPrivateStateKey]?.path
         && typeof unknownState?.[naviPrivateStateKey]?.path === "string";
}
