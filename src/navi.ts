import { RouterOptions } from "./lib/router-options";
import { Router } from "./lib/router";

import {
  hasDocument,
  hasHistory,
  hasLocation,
  hasWindow,
  makeAbsolutePath,
} from "./lib/utils";
import { naviPrivateStateKey } from "./lib/route-context";

let globalOptions = new RouterOptions();
let globalRouter: Router | undefined;

export function start(options?: Partial<RouterOptions>) {
  globalOptions = { ...options, ...globalOptions };
  globalRouter = new Router(globalOptions);

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

  if (globalOptions.bindClick) {
    window.addEventListener("click", clickHandler);
  }

  if (globalOptions.bindPopState) {
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
