import { BrowserHistory, HashHistory } from "./history";
import { State } from "./state";

beforeAll(() => {
  jest.spyOn(history, "pushState");
  jest.spyOn(history, "replaceState");
  jest.spyOn(history, "go");
  jest.spyOn(history, "back");
  jest.spyOn(history, "forward");
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("BrowserHistory", () => {
  test("push should call pushState on history object", () => {
    const path = "/";
    const browserHistory = new BrowserHistory();
    const state = State.fromPrivateState({ path });

    browserHistory.push(path, state);

    expect(history.pushState).toHaveBeenCalledWith(state, "", path);
  });

  test("replace should call replaceState on history object", () => {
    const browserHistory = new BrowserHistory();
    const path = "/";
    const state = State.fromPrivateState({ path });

    browserHistory.replace(path, state);

    expect(history.replaceState).toHaveBeenCalledWith(state, "", path);
  });

  test("back should call history.back", () => {
    const browserHistory = new HashHistory();

    browserHistory.back();

    expect(history.back).toHaveBeenCalled();
  });

  test("forward should call history.forward", () => {
    const browserHistory = new BrowserHistory();

    browserHistory.forward();

    expect(history.forward).toHaveBeenCalled();
  });

  test("go should call history.go", () => {
    const browserHistory = new BrowserHistory();

    browserHistory.go(1);

    expect(history.go).toHaveBeenCalledWith(1);
  });

  test("pushing a state should be assigned to history.state", () => {
    const browserHistory = new BrowserHistory();
    const path = "/";
    const state = State.fromPrivateState({ path });

    browserHistory.push(path, state);

    expect(history.state).toEqual(state);
  });
});

describe("HashHistory", () => {
  test("push should call history.pushState with a path prefixed with /#", () => {
    const path = "/";
    const hashHistory = new HashHistory();
    const state = State.fromPrivateState({ path });

    hashHistory.push(path, state);

    expect(history.pushState).toHaveBeenCalledWith(state, "", `/#${path}`);
  });

  test("replace should call history.replaceState with a path prefixed with /#", () => {
    const path = "/";
    const hashHistory = new HashHistory();
    const state = State.fromPrivateState({ path });

    hashHistory.replace(path, state);

    expect(history.replaceState).toHaveBeenCalledWith(state, "", `/#${path}`);
  });
});
