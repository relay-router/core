import { RouteContext } from "./route-context";
import { RouterOptions } from "./router-options";
import { Route } from "./route";
import { StringMap } from "./string-map";

// Convenience types
interface IRouteCallback {
  (context: RouteContext): unknown;
}

interface IRouteMiddleware {
  (context: RouteContext, next: IRouteHandler): unknown;
}

export interface IRouteHandler extends IRouteCallback, IRouteMiddleware {
}


export class Router {
  readonly #enterRoutes: Route[];
  readonly #exitRoutes: Route[];
  #options: RouterOptions;
  #previousContext?: RouteContext;
  #currentContext?: RouteContext;

  constructor(options: RouterOptions) {
    this.#enterRoutes = [];
    this.#exitRoutes = [];
    this.#options = options;
  }

  public route(
    pattern: string,
    handler: IRouteHandler,
    ...rest: IRouteHandler[]
  ) {
    const handlers = [ handler, ...rest ];

    this.#enterRoutes.push(new Route(pattern,
                                     handlers,
                                     this.#options.matchingOptions));

    return this;
  }

  public routeExit(
    pattern: string,
    handler: IRouteHandler,
    ...rest: IRouteHandler[]
  ) {
    const handlers = [ handler, ...rest ];

    this.#exitRoutes.push(new Route(pattern,
                                    handlers,
                                    this.#options.matchingOptions));

    return this;
  }

  public useMiddleware(middleware: IRouteHandler) {
    this.route("*", middleware);

    return this;
  }

  public navigateTo(path: string) {
    if (this.#currentContext) {
      this.#previousContext = this.#currentContext;
    }


    this.#currentContext = new RouteContext(path,  history.pushState);

    for (const enterRoute of this.#enterRoutes) {
      if (enterRoute.test(path)) {
        enterRoute.handle(this.#currentContext);
      }
    }
  }

  public exitFrom(path: string) {

  }

  //
  // public createMiddleware(): IRouteMiddleware {
  //   return (context: RouteContext, next: IRouteHandler) => {
  //   };
  // }
}
