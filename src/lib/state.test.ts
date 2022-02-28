import { State, ROUTER_PRIVATE_STATE_KEY } from "./state";

describe("isValidNaviState", () => {
  test("will return false for null", () => {
    expect(State.isValid(null)).toBeFalsy();
  });

  test("will return false for empty object", () => {
    expect(State.isValid({})).toBeFalsy();
  });

  test(`will return false for objects with falsy ${ROUTER_PRIVATE_STATE_KEY}
  property`, () => {
    expect(
      State.isValid({ [ROUTER_PRIVATE_STATE_KEY]: undefined }),
    ).toBeFalsy();
  });

  test(`will return false for objects with a ${ROUTER_PRIVATE_STATE_KEY}
  property but no path property`, () => {
    expect(State.isValid({ [ROUTER_PRIVATE_STATE_KEY]: {} })).toBeFalsy();
  });

  test(`will return true for objects with a ${ROUTER_PRIVATE_STATE_KEY}
  property with path property but not a string type`, () => {
    expect(
      State.isValid({ [ROUTER_PRIVATE_STATE_KEY]: { path: 1 } }),
    ).toBeFalsy();
  });

  test(`will return true for valid object`, () => {
    expect(
      State.isValid({ [ROUTER_PRIVATE_STATE_KEY]: { path: "/path" } }),
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
    const state = new State({ [ROUTER_PRIVATE_STATE_KEY]: { path: "/path" } });
    expect(state[ROUTER_PRIVATE_STATE_KEY].path).toBe("/path");
  });
});
