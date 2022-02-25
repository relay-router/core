import { Router } from "./lib/router";

import {
  hasDocument,
  hasHistory,
  hasLocation,
  hasWindow,
  makeAbsolutePath,
} from "./lib/utils";
import { naviPrivateStateKey } from "./lib/state";

type NaviOptions = {
  bindPopState: boolean;
  bindClick: boolean;
  initialDispatch: boolean;
};

const defaultOptions: NaviOptions = {
  bindPopState: true,
  bindClick: true,
  initialDispatch: true,
};

let globalRouter: Router | undefined;

export function start(options?: Partial<NaviOptions>) {
  const combinedOptions = { ...defaultOptions, ...options };

  globalRouter = new Router(history);

  if (!hasWindow) {
    throw new Error("Environment has no window object");
  }

  if (!hasDocument) {
    throw new Error("Environment has no document object");
  }

  if (!hasHistory) {
    throw new Error("Environment has no history object");
  }

  if (!hasLocation) {
    throw new Error("Environment has no location object");
  }

  if (combinedOptions.bindClick) {
    window.addEventListener("click", clickHandler);
  }

  if (combinedOptions.bindPopState) {
    window.addEventListener("popstate", popstateHandler);
  }
}

export function clickHandler(event: MouseEvent) {
  if (event.target instanceof HTMLAnchorElement && globalRouter) {
    const href = event.target.href;
    const path = makeAbsolutePath(href);

    globalRouter.navigateTo(path);
  }
}

export function popstateHandler(event: PopStateEvent) {
  const state = event.state;
  if (state && state[naviPrivateStateKey]) {
  }
}

export default {
  start,
};
