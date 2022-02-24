import { StringMap } from "./string-map";

describe("StringMap", () => {
  function createPopulatedMap(): StringMap {
    return new StringMap({
                           "key1": "value1",
                           "key2": "2",
                           "array": [ "array value" ],
                         });
  }

  test("getString for key that exists will return it's value", () => {
    const map = createPopulatedMap();

    expect(map.getString("key1")).toBe("value1");
  });

  test("getString for key that doesn't exist will be null", () => {
    const map = createPopulatedMap();

    expect(map.getString("key that does not exist")).toBeNull();
  });

  test(
    "getNumber for key with value that is number-convertible will be a number",
    () => {
      const map = createPopulatedMap();

      expect(map.getNumber("key2")).toBe(2);
    });

  test("getNumber for key with value that isn't number-convertible will be null",
       () => {
         const map = createPopulatedMap();

         expect(map.getNumber("key1")).toBeNull();
       });

  test("getNumber for key that doesn't exist will be null", () => {
    const map = createPopulatedMap();

    expect(map.getNumber("key that doesn't exist")).toBeNull();
  });

  test(
    "getArray for key with value that is an array",
    () => {
      const map = createPopulatedMap();

      expect(map.getArray("array"))
        .toEqual(expect.arrayContaining([ "array value" ]));
    });

  test("getArray for key that doesn't exist will be null", () => {
    const map = createPopulatedMap();

    expect(map.getArray("key that doesn't exist")).toBeNull();
  });
});
