import { Router } from "./router";
import { naviPrivateStateKey, State } from "./state";
import { RouteContext } from "./route-context";

describe("Router", () => {
  const dummyPathWithQueryAndHash = "/path?query=value#hash";

  beforeEach(() => {
    jest.spyOn(history, "pushState");
    jest.spyOn(history, "replaceState");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("navigateTo will cause the router to call the matching route handler", () => {
    const router = new Router({ nested: false, history });
    const mockedHandler = jest.fn();
    router.route("/path", mockedHandler);

    router.navigateTo(dummyPathWithQueryAndHash);

    expect(mockedHandler).toHaveBeenCalled();
  });

  test("navigateTo will cause the router to call pushState  on the history object", () => {
    const router = new Router({ nested: false, history });

    router.route("/path", jest.fn());

    router.navigateTo(dummyPathWithQueryAndHash);

    expect(history.pushState).toHaveBeenCalledTimes(1);
  });

  test(
    "navigateTo will cause the router to call pushState " +
      "on the history object with the correct path",
    () => {
      const router = new Router({ nested: false, history });

      router.route("/path", jest.fn());

      router.navigateTo("/path");

      expect(history.pushState).toHaveBeenCalledWith(
        {
          [naviPrivateStateKey]: { path: "/path" },
          publicState: undefined,
        },
        expect.any(String),
        "/path",
      );
    },
  );

  test("navigateTo will throw when called on a nested router", () => {
    const router = new Router({ nested: true });

    router.route("/path", jest.fn());

    expect(() => router.navigateTo(dummyPathWithQueryAndHash)).toThrow();
  });

  test("navigateWithState will cause a handler to be called", () => {
    const router = new Router({ nested: false, history });
    const mockedHandler = jest.fn();
    router.route("/path", mockedHandler);

    router.navigateWithState(State.fromPrivateState({ path: "/path" }));

    expect(mockedHandler).toHaveBeenCalled();
  });

  test("navigateWithState will not call pushState on the history object", () => {
    const router = new Router({ nested: false, history });

    router.route("/path", jest.fn());

    router.navigateWithState(State.fromPrivateState({ path: "/path" }));

    expect(history.pushState).not.toHaveBeenCalled();
  });

  test("navigateWithContext will cause a handler to be called", () => {
    const router = new Router({ nested: false, history });
    const mockedHandler = jest.fn();
    const context = new RouteContext(
      State.fromPrivateState({ path: "/path" }),
      jest.fn(),
    );

    router.route("/path", mockedHandler);


    router.navigateWithContext(context);

    expect(mockedHandler).toHaveBeenCalled();
  });

  test("navigateWithContext will not call pushState on the history object", () => {
    const router = new Router({ nested: false, history });
    const context = new RouteContext(
      State.fromPrivateState({ path: "/path" }),
      jest.fn(),
    );

    router.route("/path", jest.fn());


    router.navigateWithContext(context);

    expect(history.pushState).not.toHaveBeenCalled();
  });

  test("navigateWithContext will throw when a handler is not found", () => {
    const router = new Router({ nested: false, history });
    const context = new RouteContext(
      State.fromPrivateState({ path: "/path" }),
      jest.fn(),
    );

    expect(() => router.navigateWithContext(context)).toThrowError();
  });

  test("wildcard paths will match everything", () => {
    const router = new Router({ nested: false, history });
    const mockedHandler = jest.fn();

    router.route("*", mockedHandler);

    router.navigateTo("/parent/child");
    router.navigateTo("");
    router.navigateTo("/");
    router.navigateTo("/other");

    expect(mockedHandler).toHaveBeenCalledTimes(4);
  })

  test("a router will delegate to a nested router", () => {
    const router = new Router({ nested: false, history });
    const nestedRouter = Router.createRouterMiddleware();
    const mockedHandler = jest.fn();

    nestedRouter.route("/child", mockedHandler);
    router.route("*", nestedRouter);

    router.navigateTo("/child");

    expect(mockedHandler).toHaveBeenCalled();
  })

  test("a nested router will delegate to another nested router", () => {
    const router = new Router({ nested: false, history });
    const nestedRouter = Router.createRouterMiddleware();
    const nestedRouter2 = Router.createRouterMiddleware();
    const mockedHandler = jest.fn();

    router.route("/parent", nestedRouter);
    nestedRouter.route("/child", nestedRouter2);
    nestedRouter2.route("/anotherChild", mockedHandler);

    router.navigateTo("/parent/child/anotherChild");

    expect(mockedHandler).toHaveBeenCalled();
  })
});
