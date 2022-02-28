import { Router } from "./router";
import { ROUTER_PRIVATE_STATE_KEY } from "./state";
import { BrowserHistory } from "./history";

describe("Router", () => {
  const dummyPathWithQueryAndHash = "/path?query=value#hash";
  const history = new BrowserHistory();
  const router = new Router(history);

  beforeAll(() => {
    jest.spyOn(history, "push");
    jest.spyOn(history, "replace");
  });

  beforeEach(() => {
    router.start();
  });

  afterEach(() => {
    router.reset();
    jest.clearAllMocks();
  });

  test("navigateTo will cause the router to call the matching route handler", () => {
    const mockedHandler = jest.fn();
    router.route("/path", mockedHandler);

    router.navigateTo(dummyPathWithQueryAndHash);

    expect(mockedHandler).toHaveBeenCalled();
  });

  test("navigateTo will cause the router to call pushState  on the history object", () => {
    router.route("/path", jest.fn());

    router.navigateTo(dummyPathWithQueryAndHash);

    expect(history.push).toHaveBeenCalledTimes(1);
  });

  test(
    "navigateTo will cause the router to call pushState " +
      "on the history object with the correct path",
    () => {
      router.route("/path", jest.fn());

      router.navigateTo("/path");

      expect(history.push).toHaveBeenCalledWith("/path", {
        [ROUTER_PRIVATE_STATE_KEY]: { path: "/path" },
        publicState: undefined,
      });
    },
  );

  test("calling route should return an object to add more handlers", () => {
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
    const mockedHandler = jest.fn();

    router.route("*", mockedHandler);

    router.navigateTo("/parent/child");
    router.navigateTo("");
    router.navigateTo("/");
    router.navigateTo("/other");

    expect(mockedHandler).toHaveBeenCalledTimes(4);
  });

  test("a router will delegate to a nested router", () => {
    const nestedRouter = Router.createNested();
    const mockedHandler = jest.fn();

    nestedRouter.route("/child", mockedHandler);
    router.route("*", nestedRouter);

    router.navigateTo("/child");

    expect(mockedHandler).toHaveBeenCalled();
  });

  test("a nested router will delegate to another nested router", () => {
    const nestedRouter = Router.createNested();
    const nestedRouter2 = Router.createNested();
    const mockedHandler = jest.fn();

    router.route("/parent", nestedRouter);
    nestedRouter.route("/child", nestedRouter2);
    nestedRouter2.route("/anotherChild", mockedHandler);

    router.navigateTo("/parent/child/anotherChild");

    expect(mockedHandler).toHaveBeenCalled();
  });

  test(
    "creating a new router and starting it while a started router " +
      "already exists will throw",
    () => {
      const router2 = new Router(history);
      expect(() => router2.start()).toThrow();
    },
  );
});
