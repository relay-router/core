import { State, naviPrivateStateKey } from "./state";

describe("isValidNaviState", () => {
  test("will return false for null", () => {
    expect(State.isValid(null)).toBeFalsy();
  });

  test("will return false for empty object", () => {
    expect(State.isValid({})).toBeFalsy();
  });

  test(`will return false for objects with falsy ${naviPrivateStateKey}
  property`, () => {
    expect(State.isValid({ [naviPrivateStateKey]: undefined })).toBeFalsy();
  });

  test(`will return false for objects with a ${naviPrivateStateKey}
  property but no path property`, () => {
    expect(State.isValid({ [naviPrivateStateKey]: {} })).toBeFalsy();
  });

  test(`will return true for objects with a ${naviPrivateStateKey}
  property with path property but not a string type`, () => {
    expect(
      State.isValid({ [naviPrivateStateKey]: { path: 1 } }),
    ).toBeFalsy();
  });

  test(`will return true for valid object`, () => {
    expect(
      State.isValid({ [naviPrivateStateKey]: { path: "/path" } }),
    ).toBeTruthy();
  });
});

describe("State", ()=>{
  test("will throw if not initialized with a valid state", ()=>{
    expect(()=>{
      new State({});
    }).toThrow();
  });

  test("will return the path", ()=>{
    const state = new State({ [naviPrivateStateKey]: { path: "/path" } });
    expect(state[naviPrivateStateKey].path).toBe("/path");
  });
})
