import { Router } from "./router";
import { naviPrivateStateKey } from "./state";

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
    const router = new Router(history);
    const mockedHandler = jest.fn();
    router.route("/path", mockedHandler);

    router.navigateTo(dummyPathWithQueryAndHash);

    expect(mockedHandler).toHaveBeenCalled();
  });

  test("navigateTo will cause the router to call pushState and replaceState on the history object", () => {
    const router = new Router(history);

    router.route("/path", jest.fn());

    router.navigateTo(dummyPathWithQueryAndHash);

    expect(history.pushState).toHaveBeenCalledTimes(1);
    expect(history.replaceState).toHaveBeenCalledTimes(1);
  });

  test("navigateTo will cause the router to call pushState and replaceState" +
       " on the history object with the correct path", () => {
    const router = new Router(history);

    router.route("/path", jest.fn());

    router.navigateTo("/path");

    expect(history.pushState).toHaveBeenCalledWith(null, "", "/path");
    expect(history.replaceState).toHaveBeenCalledWith(
      {
        [naviPrivateStateKey]: { path: "/path" },
        publicState: undefined,
      },
      expect.any(String),
      "/path",
    );
  });
});
