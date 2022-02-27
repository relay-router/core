/** @format */

import { Router } from "./router";
import { routerPrivateStateKey } from "./state";

describe("Router", () => {
  const dummyPathWithQueryAndHash = "/path?query=value#hash";

  beforeEach(() => {
    jest.spyOn(history, "pushState");
    jest.spyOn(history, "replaceState");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("navigateTo will cause the router to call the matching route handler",
       () => {
         const router = new Router({ nested: false, history });
         const mockedHandler = jest.fn();
         router.route("/path", mockedHandler);

         router.navigateTo(dummyPathWithQueryAndHash);

         expect(mockedHandler).toHaveBeenCalled();
       });

  test(
    "navigateTo will cause the router to call pushState  on the history object",
    () => {
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
          [routerPrivateStateKey]: { path: "/path" },
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

  test("calling route should return an object to add more handlers", () => {
    const router = new Router({ nested: false, history });
    const mockedMiddleware = jest.fn((_context, next) => {
      next();
    });
    const mockedHandler = jest.fn();

    router
      .route("/path", mockedMiddleware)
      .add(mockedMiddleware)
      .add(mockedMiddleware)
      .add(mockedHandler);

    router.navigateTo("/path");

    expect(mockedHandler).toHaveBeenCalledTimes(1);
    expect(mockedMiddleware).toHaveBeenCalledTimes(3);
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
  });

  test("a router will delegate to a nested router", () => {
    const router = new Router({ nested: false, history });
    const nestedRouter = Router.createNested();
    const mockedHandler = jest.fn();

    nestedRouter.route("/child", mockedHandler);
    router.route("*", nestedRouter);

    router.navigateTo("/child");

    expect(mockedHandler).toHaveBeenCalled();
  });

  test("a nested router will delegate to another nested router", () => {
    const router = new Router({ nested: false, history });
    const nestedRouter = Router.createNested();
    const nestedRouter2 = Router.createNested();
    const mockedHandler = jest.fn();

    router.route("/parent", nestedRouter);
    nestedRouter.route("/child", nestedRouter2);
    nestedRouter2.route("/anotherChild", mockedHandler);

    router.navigateTo("/parent/child/anotherChild");

    expect(mockedHandler).toHaveBeenCalled();
  });
});
