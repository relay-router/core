import { Router } from "./router";
import { routerPrivateStateKey } from "./state";
import { BrowserHistory } from "./history";


describe("Router", () => {
  const dummyPathWithQueryAndHash = "/path?query=value#hash";
  const history = new BrowserHistory();

  beforeAll(() => {
    jest.spyOn(history, "push");
    jest.spyOn(history, "replace");
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

      expect(history.push).toHaveBeenCalledTimes(1);
    });

  test(
    "navigateTo will cause the router to call pushState " +
    "on the history object with the correct path",
    () => {
      const router = new Router({ nested: false, history });

      router.route("/path", jest.fn());

      router.navigateTo("/path");

      expect(history.push).toHaveBeenCalledWith(
        "/path",
        {
          [routerPrivateStateKey]: { path: "/path" },
          publicState: undefined,
        },
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

  test("creating another global router will throw", () => {
    new Router({ nested: false, history });

    expect(() => new Router({ nested: false, history })).toThrow();
  });
  //
  // test.only("a hash router should save the path prefixed with a hash", () => {
  //   // const browserHistory = createBrowserHistory();
  //   const memoryHistory = createMemoryHistory();
  //
  //   const router = new Router({ nested: false, history: memoryHistory });
  //   const mockedHandler = jest.fn();
  //
  //   memoryHistory.listen(update => {
  //     console.log("update: ", update);
  //   });
  //
  //   router.route("/path", mockedHandler);
  //   router.route("/", mockedHandler);
  //
  //   router.navigateTo("/path?key=value#hash");
  //   router.navigateTo("/");
  //   router.navigateTo("/path#hash");
  //
  //   memoryHistory.back();
  //   memoryHistory.back();
  //
  //   expect(true).toBe(true);
  // });
});
