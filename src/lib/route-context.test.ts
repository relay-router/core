/** @format */

import { RouteContext } from "./route-context";
import { routerPrivateStateKey, State } from "./state";

describe("RouteContext", () => {
  const dummyPath = "/path/to/nothing";
  const dummyQuery = "?key=value&keyWithEmptyValue";
  const dummyHash = "#hash";
  const dummyPathWithQuery = dummyPath + dummyQuery;
  const dummyPathWithHash = dummyPath + dummyHash;
  const dummyPathWithQueryAndHash = dummyPath + dummyQuery + dummyHash;

  function createStateFromPath(path: string): State {
    return {
      [routerPrivateStateKey]: {
        path,
      },
    };
  }

  test("queryString should be parsed", () => {
    const routeContext = new RouteContext(
      createStateFromPath(dummyPathWithQuery),
      jest.fn(),
    );

    expect(routeContext.queryString).toBe(dummyQuery);
  });

  test("queryString should be empty if not present", () => {
    const routeContext = new RouteContext(
      createStateFromPath(dummyPath),
      jest.fn(),
    );

    expect(routeContext.queryString).toBe("");
  });

  test("query should be parsed", () => {
    const routeContext = new RouteContext(
      createStateFromPath(dummyPathWithQuery),
      jest.fn(),
    );

    expect(routeContext.query.get("key")).toBe("value");
  });

  test("hash should be parsed", () => {
    const routeContext = new RouteContext(
      createStateFromPath(dummyPathWithHash),
      jest.fn(),
    );

    expect(routeContext.hash).toBe(dummyHash);
  });

  test("hash should be empty if not present", () => {
    const routeContext = new RouteContext(
      createStateFromPath(dummyPath),
      jest.fn(),
    );

    expect(routeContext.hash).toBe("");
  });

  test("pathname should be parsed", () => {
    const routeContext = new RouteContext(
      createStateFromPath(dummyPathWithQueryAndHash),
      jest.fn(),
    );

    expect(routeContext.pathname).toBe(dummyPath);
  });

  test("pathname should be root if empty", () => {
    const routeContext = new RouteContext(createStateFromPath(""), jest.fn());

    expect(routeContext.pathname).toBe("/");
  });

  test("path should be parsed", () => {
    const routeContext = new RouteContext(
      createStateFromPath(dummyPathWithQueryAndHash),
      jest.fn(),
    );

    expect(routeContext.path).toBe(dummyPathWithQueryAndHash);
  });

  test("handled should be false by default", () => {
    const routeContext = new RouteContext(
      createStateFromPath(dummyPath),
      jest.fn(),
    );

    expect(routeContext.handled).toBe(false);
  });

  test("state should be empty by default", () => {
    const routeContext = new RouteContext(
      createStateFromPath(dummyPath),
      jest.fn(),
    );

    expect(routeContext.state).not.toEqual(expect.anything());
  });

  test("should be able to set state", () => {
    const routeContext = new RouteContext(
      createStateFromPath(dummyPath),
      jest.fn(),
    );
    const state = { key: "value" };

    routeContext.state = state;

    expect(routeContext.state).toBe(state);
  });

  test("setting the state should save it to the publicState", () => {
    let historyState: any;
    const saveStateFn = jest.fn((state) => (historyState = state));
    const routeContext = new RouteContext(
      createStateFromPath(dummyPathWithQueryAndHash),
      saveStateFn,
    );

    const newState = { key: "value" };
    routeContext.state = newState;

    expect((historyState as any)?.publicState).toBe(newState);
  });

  test("setting the state should also save the privateState", () => {
    let historyState: any;
    const saveStateFn = jest.fn((state) => (historyState = state));
    const routeContext = new RouteContext(
      createStateFromPath(dummyPathWithQueryAndHash),
      saveStateFn,
    );

    routeContext.state = { key: "value" };

    expect(historyState?.[routerPrivateStateKey]?.path).toBe(
      dummyPathWithQueryAndHash,
    );
  });

  test(
    "constructing the RouteContext with an empty string as a path " +
      "should set the path and pathname to '/'",
    () => {
      const routeContext = new RouteContext(createStateFromPath(""), jest.fn());

      expect(routeContext.path).toBe("/");
      expect(routeContext.pathname).toBe("/");
    },
  );
});
