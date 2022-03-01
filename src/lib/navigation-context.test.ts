import { NavigationContext } from "./navigation-context";

describe("NavigationContext", () => {
  test("should be unresolved by default", () => {
    const context = new NavigationContext();
    expect(context.resolved).toBe(false);
  });

  test("should be flagged as handled if called ok()", () => {
    const context = new NavigationContext();
    context.ok();
    expect(context.handled).toBe(true);
  });

  test("should be resolved if called ok()", () => {
    const context = new NavigationContext();
    context.ok();
    expect(context.resolved).toBe(true);
  });

  test("should be flagged as aborted if called abort()", () => {
    const context = new NavigationContext();
    context.abort();
    expect(context.aborted).toBe(true);
  });

  test("should be resolved if called abort()", () => {
    const context = new NavigationContext();
    context.abort();
    expect(context.resolved).toBe(true);
  });

  test("should be flagged as redirected if called redirect()", () => {
    const context = new NavigationContext();
    context.redirect("/path");
    expect(context.redirected).toBe(true);
  });

  test("should be resolved if called redirect()", () => {
    const context = new NavigationContext();
    context.redirect("/path");
    expect(context.resolved).toBe(true);
  });

  test("calling ok() twice will throw an error", () => {
    const context = new NavigationContext();
    context.ok();
    expect(context.ok).toThrowError();
  });
});
