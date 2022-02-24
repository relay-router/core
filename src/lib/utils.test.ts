import {  makeAbsolutePath } from "./utils";

describe("makeAbsolutePath", () => {
  test("will make ../path into /path", () => {
    const relativePath = "../path";

    const absolutePath = makeAbsolutePath(relativePath);

    expect(absolutePath).toBe("/path");
  });

  test("will make ./path into /path", () => {
    const relativePath = "./path";

    const absolutePath = makeAbsolutePath(relativePath);

    expect(absolutePath).toBe("/path");
  });

  test("will make path into /path", () => {
    const relativePath = "path";

    const absolutePath = makeAbsolutePath(relativePath);

    expect(absolutePath).toBe("/path");
  });

  test("will make /path into /path", () => {
    const alreadyAbsolutePath = "/path";

    const absolutePath = makeAbsolutePath(alreadyAbsolutePath);

    expect(absolutePath).toBe("/path");
  });
});
