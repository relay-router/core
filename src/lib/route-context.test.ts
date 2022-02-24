import { RouteContext } from "./route-context";
import { naviPrivateStateKey } from "./state";

describe("RouteContext", () => {
  const dummyPath = "/path/to/nothing";
  const dummyQuery = "?key=value&keyWithEmptyValue";
  const dummyHash = "#hash";
  const dummyPathWithQuery = dummyPath + dummyQuery;
  const dummyPathWithHash = dummyPath + dummyHash;
  const dummyPathWithQueryAndHash = dummyPath + dummyQuery + dummyHash;

  test("queryString should be parsed", () => {
    const routeContext = new RouteContext(dummyPathWithQuery, jest.fn());

    expect(routeContext.queryString).toBe(dummyQuery);
  });

  test("queryString should be empty if not present", () => {
    const routeContext = new RouteContext(dummyPath, jest.fn());

    expect(routeContext.queryString).toBe("");
  });

  test("query should be parsed", () => {
    const routeContext = new RouteContext(dummyPathWithQuery, jest.fn());

    expect(routeContext.query.get("key")).toBe("value");
  });

  test("hash should be parsed", () => {
    const routeContext = new RouteContext(dummyPathWithHash, jest.fn());

    expect(routeContext.hash).toBe(dummyHash);
  });

  test("hash should be empty if not present", () => {
    const routeContext = new RouteContext(dummyPath, jest.fn());

    expect(routeContext.hash).toBe("");
  });

  test("pathname should be parsed", () => {
    const routeContext = new RouteContext(dummyPathWithQueryAndHash, jest.fn());

    expect(routeContext.pathname).toBe(dummyPath);
  });

  test("pathname should be root if empty", () => {
    const routeContext = new RouteContext("", jest.fn());

    expect(routeContext.pathname).toBe("/");
  });

  test("path should be parsed", () => {
    const routeContext = new RouteContext(dummyPathWithQueryAndHash, jest.fn());

    expect(routeContext.path).toBe(dummyPathWithQueryAndHash);
  });

  test("path should be root if empty", () => {
    const routeContext = new RouteContext("", jest.fn());

    expect(routeContext.path).toBe("/");
  });

  test("handled should be false by default", () => {
    const routeContext = new RouteContext(dummyPath, jest.fn());

    expect(routeContext.handled).toBe(false);
  });

  test("state should be empty by default", () => {
    const routeContext = new RouteContext(dummyPath, jest.fn());

    expect(routeContext.state).not.toEqual(expect.anything());
  });

  test("should be able to set state", () => {
    const routeContext = new RouteContext(dummyPath, jest.fn());
    const state = { key: "value" };

    routeContext.state = state;

    expect(routeContext.state).toBe(state);
  });

  test(
    "creating the RouteContext object " +
      "should call the saveStateFn callback",
    () => {
      const saveStateFn = jest.fn();
      new RouteContext(dummyPathWithQueryAndHash, saveStateFn);

      expect(saveStateFn).toHaveBeenCalledTimes(1);
    },
  );

  test("setting the state should call the saveStateFn again", () => {
    const saveStateFn = jest.fn();
    const routeContext = new RouteContext(
      dummyPathWithQueryAndHash,
      saveStateFn,
    );

    routeContext.state = { key: "value" };

    expect(saveStateFn).toHaveBeenCalledTimes(2);
  });

  test("setting the state should save it to the publicState", () => {
    let historyState: any;
    const saveStateFn = jest.fn((state) => (historyState = state));
    const routeContext = new RouteContext(
      dummyPathWithQueryAndHash,
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
      dummyPathWithQueryAndHash,
      saveStateFn,
    );

    routeContext.state = { key: "value" };

    expect(historyState?.[naviPrivateStateKey]?.path).toBe(
      dummyPathWithQueryAndHash,
    );
  });
});
