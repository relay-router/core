import { StringMap } from "./string-map";

describe("StringMap", () => {
  function createPopulatedMap(): StringMap {
    return new StringMap({
      keyForString: "string value",
      keyForNumberConvertibleString: "1",
      keyForArray: ["array value"],
    });
  }

  test("getString for key that exists will return it's value", () => {
    const map = createPopulatedMap();

    expect(map.getString("keyForString")).toBe("string value");
  });

  test("getString for key that doesn't exist will be null", () => {
    const map = createPopulatedMap();

    expect(map.getString("key that does not exist")).toBeNull();
  });

  test(
    "getNumber for key with value that is" +
      " number-convertible will be a number",
    () => {
      const map = createPopulatedMap();

      expect(map.getNumber("keyForNumberConvertibleString")).toEqual(
        expect.any(Number),
      );
    },
  );

  test(
    "getNumber for key with value that " +
      "isn't number-convertible will be null",
    () => {
      const map = createPopulatedMap();

      expect(map.getNumber("keyForString")).toBeNull();
    },
  );

  test("getNumber for key that doesn't exist will be null", () => {
    const map = createPopulatedMap();

    expect(map.getNumber("key that doesn't exist")).toBeNull();
  });

  test("getArray for key with value that is an array", () => {
    const map = createPopulatedMap();

    expect(map.getArray("keyForArray")).toEqual(
      expect.arrayContaining(["array value"]),
    );
  });

  test("getArray for key that doesn't exist will be null", () => {
    const map = createPopulatedMap();

    expect(map.getArray("key that doesn't exist")).toBeNull();
  });

  test("get for key that exists will return it's value", () => {
    const map = createPopulatedMap();

    expect(map.get("keyForString")).toBe("string value");
  });

  test("get for key that doesn't exist will be null", () => {
    const map = createPopulatedMap();

    expect(map.get("key that doesn't exist")).toBeNull();
  });

  test("set for key that doesn't exist will add it", () => {
    const map = createPopulatedMap();

    map.set("new key", "new value");

    expect(map.get("new key")).toBe("new value");
  });

  test("set for key that exists will replace it", () => {
    const map = createPopulatedMap();

    map.set("keyForString", "new value");

    expect(map.get("keyForString")).toBe("new value");
  });

  test("setString for key that doesn't exist will add it", () => {
    const map = createPopulatedMap();

    map.setString("new key", "new value");

    expect(map.getString("new key")).toBe("new value");
  });

  test("setArray for key that doesn't exist will add it", () => {
    const map = createPopulatedMap();

    map.setArray("new key", ["new value"]);

    expect(map.getArray("new key")).toEqual(
      expect.arrayContaining(["new value"]),
    );
  });

  test("addStringToKey for key that doesn't exist will assign it", () => {
    const map = createPopulatedMap();

    map.addStringToKey("new key", "new value");

    expect(map.getString("new key")).toBe("new value");
  });

  test(
    "addStringToKey for key that exists with a" +
      " string value will return a new array with " +
      "both the current and previous value",
    () => {
      const map = createPopulatedMap();

      map.addStringToKey("keyForString", "new value");

      expect(map.get("keyForString")).toEqual(
        expect.arrayContaining(["string value", "new value"]),
      );
    },
  );

  test(
    "addStringToKey for key with an array value " +
      "will append the new string value",
    () => {
      const map = createPopulatedMap();

      map.addStringToKey("keyForArray", "new value");

      expect(map.getArray("keyForArray")).toEqual(
        expect.arrayContaining(["array value", "new value"]),
      );
    },
  );

  test("addArrayToKey for key that doesn't exist will assign it", () => {
    const map = createPopulatedMap();

    map.addArrayToKey("new key", ["new value"]);

    expect(map.getArray("new key")).toEqual(
      expect.arrayContaining(["new value"]),
    );
  });

  test(
    "addArrayToKey for key that exists with a string value will " +
      "return a new array with both the current and previous value",
    () => {
      const map = createPopulatedMap();

      map.addArrayToKey("keyForString", ["new value"]);

      expect(map.get("keyForString")).toEqual(
        expect.arrayContaining(["string value", "new value"]),
      );
    },
  );

  test(
    "addArrayToKey for key with an array value " +
      "will append the new array value",
    () => {
      const map = createPopulatedMap();

      map.addArrayToKey("keyForArray", ["new value"]);

      expect(map.getArray("keyForArray")).toEqual(
        expect.arrayContaining(["array value", "new value"]),
      );
    },
  );

  test("remove for key that exists will delete it", () => {
    const map = createPopulatedMap();

    map.remove("keyForString");

    expect(map.get("keyForString")).toBeNull();
  });

  test("remove for key that doesn't exist will do nothing", () => {
    const map = createPopulatedMap();

    map.remove("key that doesn't exist");

    expect(map.get("keyForString")).toBe("string value");
  });

  test("has for key that exists will return true", () => {
    const map = createPopulatedMap();

    expect(map.hasKey("keyForString")).toBe(true);
  });

  test("hasKey for key that doesn't exist will return false", () => {
    const map = createPopulatedMap();

    expect(map.hasKey("key that doesn't exist")).toBe(false);
  });
});
