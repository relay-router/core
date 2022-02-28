import { Route } from "./route";
import { RouteContext } from "./route-context";
import { ROUTER_PRIVATE_STATE_KEY, State } from "./state";

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
    const route = new Route("/path", [jest.fn()], naviMatchingOptionsDefaults);

    const handled = route.handle(context);

    expect(handled).toBeTruthy();
  });

  test(
    "if the last handler called by handle function calls next, " +
      "it means the context isn't handled",
    () => {
      const context = new RouteContext(
        createStateFromPath(dummyPathWithQueryAndHash),
        jest.fn(),
      );
      const mockedHandler = jest.fn();
      mockedHandler.mockImplementation((_context, next) => next());

      const route = new Route(
        "/path",
        [mockedHandler],
        naviMatchingOptionsDefaults,
      );

      const handled = route.handle(context);

      expect(handled).toBeFalsy();
    },
  );

  test("if the previous handler didn't call next, the next handler should not be called", () => {
    const context = new RouteContext(
      createStateFromPath(dummyPathWithQueryAndHash),
      jest.fn(),
    );

    const firstHandler = jest.fn();
    const secondHandler = jest.fn();

    const route = new Route(
      "/path",
      [firstHandler, secondHandler],
      naviMatchingOptionsDefaults,
    );

    route.handle(context);

    expect(secondHandler).not.toHaveBeenCalled();
  });

  test(
    "if the last handler doesn't call next, " +
      "it means the context is handled",
    () => {
      const context = new RouteContext(
        createStateFromPath(dummyPathWithQueryAndHash),
        jest.fn(),
      );
      const mockedMiddleware = jest.fn();

      mockedMiddleware.mockImplementation((_ctx, next) => next());

      const route = new Route(
        "/path",
        [mockedMiddleware, jest.fn()],
        naviMatchingOptionsDefaults,
      );

      const handled = route.handle(context);

      expect(handled).toBeTruthy();
    },
  );

  test("handle should return false for paths that it cannot handle", () => {
    const context = new RouteContext(
      createStateFromPath(dummyPathWithQueryAndHash),
      jest.fn(),
    );
    const route = new Route(
      "/otherPathThatWouldNotMatch",
      [jest.fn()],
      naviMatchingOptionsDefaults,
    );

    const handled = route.handle(context);

    expect(handled).toBeFalsy();
  });

  test("handle should parse params from path", () => {
    const context = new RouteContext(
      createStateFromPath(dummyPathWithQueryAndHash),
      jest.fn(),
    );
    const route = new Route(
      "/path/:id",
      [jest.fn()],
      naviMatchingOptionsDefaults,
    );

    route.handle(context);

    expect(context.param.getString("id")).toBe("idValue");
  });

  test("handle should parse params from path with multiple params", () => {
    const context = new RouteContext(
      createStateFromPath(dummyPathWithQueryAndHash),
      jest.fn(),
    );
    const route = new Route(
      "/path/:id/:id2",
      [jest.fn()],
      naviMatchingOptionsDefaults,
    );

    route.handle(context);

    expect(context.param.getString("id")).toBe("idValue");
    expect(context.param.getString("id2")).toBe("1");
  });

  test(
    "handle should be able to parse params that do not " + "appear in sequence",
    () => {
      const context = new RouteContext(
        createStateFromPath(dummyPathWithQueryAndHash),
        jest.fn(),
      );
      const route = new Route(
        "/path/:id/1/:lastParam",
        [jest.fn()],
        naviMatchingOptionsDefaults,
      );

      route.handle(context);

      expect(context.param.getString("id")).toBe("idValue");
      expect(context.param.getString("lastParam")).toBe("lastValue");
    },
  );

  test(
    "handle should put the portion it matched with " + "in the context",
    () => {
      const context = new RouteContext(
        createStateFromPath(dummyPathWithQueryAndHash),
        jest.fn(),
      );
      const route = new Route(
        "/path/:id/1/:lastParam",
        [jest.fn()],
        naviMatchingOptionsDefaults,
      );

      route.handle(context);

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
      const route = new Route(
        "/path/:id/1/:lastParam",
        [jest.fn()],
        naviMatchingOptionsDefaults,
      );

      route.handle(context);

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
      mockedMiddleware.mockImplementation((_context, next) => next());

      const route1 = new Route(
        "/path",
        [mockedMiddleware],
        naviMatchingOptionsDefaults,
      );

      const route2 = new Route(
        "/:id",
        [mockedMiddleware],
        naviMatchingOptionsDefaults,
      );

      const route3 = new Route(
        "/:number",
        [mockedMiddleware],
        naviMatchingOptionsDefaults,
      );

      const route4 = new Route(
        "/:lastKey",
        [jest.fn()],
        naviMatchingOptionsDefaults,
      );

      route1.handle(context);
      route2.handle(context);
      route3.handle(context);
      route4.handle(context);

      expect(context.matched).toBe("/path/idValue/1/lastValue");
      expect(context.handled).toBeTruthy();
      expect(context.param.getString("id")).toBe("idValue");
      expect(context.param.getString("number")).toBe("1");
      expect(context.param.getString("lastKey")).toBe("lastValue");
    },
  );

  test(
    "in a long chain of callbacks, if the last route handler didn't call next, " +
      "it means the the context has been handled",
    () => {
      const mockMiddleware1 = jest.fn();
      mockMiddleware1.mockImplementation((_context, next) => next());

      const mockMiddleware2 = jest.fn();
      mockMiddleware2.mockImplementation((_context, next) => next());

      const mockMiddleware3 = jest.fn();
      mockMiddleware3.mockImplementation((_context, next) => next());

      const mockHandler = jest.fn();

      const route = new Route(
        "/path",
        [mockMiddleware1, mockMiddleware2, mockMiddleware3, mockHandler],
        naviMatchingOptionsDefaults,
      );

      const context = new RouteContext(
        createStateFromPath(dummyPathWithQueryAndHash),
        jest.fn(),
      );

      route.handle(context);

      expect(mockMiddleware1).toHaveBeenCalled();
      expect(mockMiddleware2).toHaveBeenCalled();
      expect(mockMiddleware3).toHaveBeenCalled();
      expect(mockHandler).toHaveBeenCalled();

      expect(context.handled).toBeTruthy();
    },
  );

  test(
    "a route handler should not be called if the preceding " +
      "handler didn't call next",
    () => {
      const context = new RouteContext(
        createStateFromPath(dummyPathWithQueryAndHash),
        jest.fn(),
      );

      const handler1 = jest.fn();

      const handler2 = jest.fn();

      const route1 = new Route(
        "/path",
        [handler1, handler2],
        naviMatchingOptionsDefaults,
      );

      route1.handle(context);

      expect(handler2).not.toHaveBeenCalled();
    },
  );

  test(
    "a route handler should be called " +
      "if the preceding handler called next",
    () => {
      const context = new RouteContext(
        createStateFromPath(dummyPathWithQueryAndHash),
        jest.fn(),
      );

      const handler1 = jest.fn((_context, next) => {
        next();
      });

      const handler2 = jest.fn();

      const route1 = new Route(
        "/path",
        [handler1, handler2],
        naviMatchingOptionsDefaults,
      );

      route1.handle(context);

      expect(handler2).toHaveBeenCalled();
    },
  );

  test("handle will throw an error if the context is already handled", () => {
    const context = new RouteContext(
      createStateFromPath(dummyPathWithQueryAndHash),
      jest.fn(),
    );
    const route = new Route("/path", [jest.fn()], naviMatchingOptionsDefaults);

    route.handle(context);

    expect(() => route.handle(context)).toThrowError();
  });
});
