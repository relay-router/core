import { Route } from "./route";
import { RouteContext } from "./route-context";
import { ROUTER_PRIVATE_STATE_KEY, State } from "./state";
import { NavigationContext } from "./navigation-context";

describe("Route", () => {
  const dummyPathWithQueryAndHash =
    "/path/idValue/1/lastValue?query=value#hash";
  const naviMatchingOptionsDefaults = { end: false };

  function createStateFromPath(path: string): State {
    return {
      [ROUTER_PRIVATE_STATE_KEY]: {
        path,
      },
    };
  }

  test("handle should return true for paths that it can handle", () => {
    const context = new RouteContext(
      createStateFromPath(dummyPathWithQueryAndHash),
      jest.fn(),
    );
    const route = new Route("/path",
                            [ jest.fn((_ctx, nav) => nav.ok()) ],
                            naviMatchingOptionsDefaults);
    const navigation = new NavigationContext();
    route.handle(context, navigation);

    expect(navigation.handled).toBeTruthy();
  });

  test(
    "if the last handler called by handle doesn't resolve the navigation context " +
    "it means the context isn't handled",
    () => {
      const context = new RouteContext(
        createStateFromPath(dummyPathWithQueryAndHash),
        jest.fn(),
      );
      const mockedHandler = jest.fn();

      const navigation = new NavigationContext();
      const route = new Route(
        "/path",
        [ mockedHandler ],
        naviMatchingOptionsDefaults,
      );

      route.handle(context, navigation);

      expect(navigation.handled).toBeFalsy();
    },
  );

  test(
    "if the previous handler called ok() the next handler should not be called",
    () => {
      const context = new RouteContext(
        createStateFromPath(dummyPathWithQueryAndHash),
        jest.fn(),
      );
      const navigation = new NavigationContext();
      const firstHandler = jest.fn((_ctx, nav) => nav.ok());
      const secondHandler = jest.fn();

      const route = new Route(
        "/path",
        [ firstHandler, secondHandler ],
        naviMatchingOptionsDefaults,
      );

      route.handle(context, navigation);

      expect(secondHandler).not.toHaveBeenCalled();
    });

  test(
    "if the last handler called ok(), it means the context is handled",
    () => {
      const context = new RouteContext(
        createStateFromPath(dummyPathWithQueryAndHash),
        jest.fn(),
      );
      const mockedMiddleware = jest.fn();
      const navigation = new NavigationContext();

      const route = new Route(
        "/path",
        [ mockedMiddleware, jest.fn((_ctx, nav) => nav.ok()) ],
        naviMatchingOptionsDefaults,
      );

      route.handle(context, navigation);

      expect(navigation).toBeTruthy();
    },
  );

  test(
    "navigation.handled should be false if a route can't resolve the navigation",
    () => {
      const context = new RouteContext(
        createStateFromPath(dummyPathWithQueryAndHash),
        jest.fn(),
      );
      const navigation = new NavigationContext();
      const route = new Route(
        "/otherPathThatWouldNotMatch",
        [ jest.fn((_ctx, nav) => nav.ok()) ],
        naviMatchingOptionsDefaults,
      );

      route.handle(context, navigation);

      expect(navigation.handled).toBeFalsy();
    });

  test("handle should parse params from path", () => {
    const context = new RouteContext(
      createStateFromPath(dummyPathWithQueryAndHash),
      jest.fn(),
    );
    const navigation = new NavigationContext();
    const route = new Route(
      "/path/:id",
      [ jest.fn((_ctx, nav) => nav.ok()) ],
      naviMatchingOptionsDefaults,
    );

    route.handle(context, navigation);

    expect(context.param.getString("id")).toBe("idValue");
  });

  test("handle should parse params from path with multiple params", () => {
    const context = new RouteContext(
      createStateFromPath(dummyPathWithQueryAndHash),
      jest.fn(),
    );
    const navigation = new NavigationContext();
    const route = new Route(
      "/path/:id/:id2",
      [ jest.fn((_ctx, nav) => nav.ok()) ],
      naviMatchingOptionsDefaults,
    );

    route.handle(context, navigation);

    expect(context.param.getString("id")).toBe("idValue");
    expect(context.param.getString("id2")).toBe("1");
  });

  test(
    "handle should be able to parse params that do not appear in sequence",
    () => {
      const context = new RouteContext(
        createStateFromPath(dummyPathWithQueryAndHash),
        jest.fn(),
      );
      const navigation = new NavigationContext();
      const route = new Route(
        "/path/:id/1/:lastParam",
        [ jest.fn((_ctx, nav) => nav.ok()) ],
        naviMatchingOptionsDefaults,
      );

      route.handle(context, navigation);

      expect(context.param.getString("id")).toBe("idValue");
      expect(context.param.getString("lastParam")).toBe("lastValue");
    },
  );

  test(
    "handle should put the portion it matched with in the context", () => {
      const context = new RouteContext(
        createStateFromPath(dummyPathWithQueryAndHash),
        jest.fn(),
      );
      const navigation = new NavigationContext();
      const route = new Route(
        "/path/:id/1/:lastParam",
        [ jest.fn((_ctx, nav) => nav.ok()) ],
        naviMatchingOptionsDefaults,
      );

      route.handle(context, navigation);

      expect(context.matched).toBe("/path/idValue/1/lastValue");
    },
  );

  test(
    "handle should put the portion it matched with " +
    "in the context even if it has query and hash",
    () => {
      const context = new RouteContext(
        createStateFromPath(dummyPathWithQueryAndHash),
        jest.fn(),
      );
      const navigation = new NavigationContext();
      const route = new Route(
        "/path/:id/1/:lastParam",
        [ jest.fn((_ctx, nav) => nav.ok()) ],
        naviMatchingOptionsDefaults,
      );

      route.handle(context, navigation);

      expect(context.matched).toBe("/path/idValue/1/lastValue");
    },
  );

  test(
    "Route should be able to handle context that are partially handled" +
    " by other routes if it can match the remainder of the unmatched path",
    () => {
      const context = new RouteContext(
        createStateFromPath(dummyPathWithQueryAndHash),
        jest.fn(),
      );
      const mockedMiddleware = jest.fn();
      const navigation = new NavigationContext();

      const route1 = new Route(
        "/path",
        [ mockedMiddleware ],
        naviMatchingOptionsDefaults,
      );

      const route2 = new Route(
        "/:id",
        [ mockedMiddleware ],
        naviMatchingOptionsDefaults,
      );

      const route3 = new Route(
        "/:number",
        [ mockedMiddleware ],
        naviMatchingOptionsDefaults,
      );

      const route4 = new Route(
        "/:lastKey",
        [ jest.fn((_ctx, nav) => nav.ok()) ],
        naviMatchingOptionsDefaults,
      );

      route1.handle(context, navigation);
      route2.handle(context, navigation);
      route3.handle(context, navigation);
      route4.handle(context, navigation);

      expect(context.matched).toBe("/path/idValue/1/lastValue");
      expect(navigation.handled).toBeTruthy();
      expect(context.param.getString("id")).toBe("idValue");
      expect(context.param.getString("number")).toBe("1");
      expect(context.param.getString("lastKey")).toBe("lastValue");
    },
  );

  test(
    "in a long chain of callbacks, if the last route handler called ok(), " +
    "it means the the context has been handled",
    () => {
      const mockMiddleware1 = jest.fn();
      mockMiddleware1.mockImplementation();

      const mockMiddleware2 = jest.fn();
      mockMiddleware2.mockImplementation();

      const mockMiddleware3 = jest.fn();
      mockMiddleware3.mockImplementation();

      const navigation = new NavigationContext();

      const mockHandler = jest.fn((_ctx, nav)=>nav.ok());

      const route = new Route(
        "/path",
        [ mockMiddleware1, mockMiddleware2, mockMiddleware3, mockHandler ],
        naviMatchingOptionsDefaults,
      );

      const context = new RouteContext(
        createStateFromPath(dummyPathWithQueryAndHash),
        jest.fn(),
      );

      route.handle(context, navigation);

      expect(mockMiddleware1).toHaveBeenCalled();
      expect(mockMiddleware2).toHaveBeenCalled();
      expect(mockMiddleware3).toHaveBeenCalled();
      expect(mockHandler).toHaveBeenCalled();

      expect(navigation.handled).toBeTruthy();
    },
  );

  test(
    "a route handler should not be called if the preceding " +
    "handler called ok()",
    () => {
      const context = new RouteContext(
        createStateFromPath(dummyPathWithQueryAndHash),
        jest.fn(),
      );

      const navigation = new NavigationContext();

      const handler1 = jest.fn((_context, navigation) => navigation.ok());

      const handler2 = jest.fn((_context, navigation) => navigation.ok());

      const route1 = new Route(
        "/path",
        [ handler1, handler2 ],
        naviMatchingOptionsDefaults,
      );

      route1.handle(context, navigation);

      expect(handler2).not.toHaveBeenCalled();
    },
  );

  test(
    "a route handler should be called " +
    "if the preceding handler called didn't resolve the navigation",
    () => {
      const context = new RouteContext(
        createStateFromPath(dummyPathWithQueryAndHash),
        jest.fn(),
      );

      const handler1 = jest.fn();

      const navigation = new NavigationContext();

      const handler2 = jest.fn((_context, navigation) => navigation.ok());

      const route1 = new Route(
        "/path",
        [ handler1, handler2 ],
        naviMatchingOptionsDefaults,
      );

      route1.handle(context, navigation);

      expect(handler2).toHaveBeenCalled();
    },
  );

  test("handle will throw an error if the context is already handled", () => {
    const context = new RouteContext(
      createStateFromPath(dummyPathWithQueryAndHash),
      jest.fn(),
    );
    const navigation = new NavigationContext();

    const mockedHandler = jest.fn((_context,
                                   navigation) => navigation.ok());
    const route = new Route("/path",
                            [ mockedHandler ],
                            naviMatchingOptionsDefaults);

    route.handle(context, navigation);

    expect(() => route.handle(context, navigation)).toThrowError();
  });
});
