import { State, routerPrivateStateKey } from "./state";

describe("isValidNaviState", () => {
  test("will return false for null", () => {
    expect(State.isValid(null)).toBeFalsy();
  });

  test("will return false for empty object", () => {
    expect(State.isValid({})).toBeFalsy();
  });

  test(`will return false for objects with falsy ${routerPrivateStateKey}
  property`, () => {
    expect(State.isValid({ [routerPrivateStateKey]: undefined })).toBeFalsy();
  });

  test(`will return false for objects with a ${routerPrivateStateKey}
  property but no path property`, () => {
    expect(State.isValid({ [routerPrivateStateKey]: {} })).toBeFalsy();
  });

  test(`will return true for objects with a ${routerPrivateStateKey}
  property with path property but not a string type`, () => {
    expect(State.isValid({ [routerPrivateStateKey]: { path: 1 } })).toBeFalsy();
  });

  test(`will return true for valid object`, () => {
    expect(
      State.isValid({ [routerPrivateStateKey]: { path: "/path" } }),
    ).toBeTruthy();
  });
});

describe("State", () => {
  test("will throw if not initialized with a valid state", () => {
    expect(() => {
      new State({});
    }).toThrow();
  });

  test("will return the path", () => {
    const state = new State({ [routerPrivateStateKey]: { path: "/path" } });
    expect(state[routerPrivateStateKey].path).toBe("/path");
  });
});
