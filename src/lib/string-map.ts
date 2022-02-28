import { RouterError } from "./router-error";

interface StringRecord {
  [key: string]: string | string[];
}

/**
 * A map for key-to-string or key-to-array-of-strings.
 * Exposes convenient methods for storing and retrieving values from the map.
 */
export class StringMap {
  private readonly _internalMap: StringRecord;

  /**
   * @constructor
   * @param record a JavaScript object with strings as property
   * names and strings or array of strings as values.
   */
  constructor(record?: Required<StringRecord>) {
    this._internalMap = record ?? {};
  }

  /**
   * Adds a string value to a key.
   *
   * If no string is associated with the key, assign the string.
   *
   * If the key is already associated with a string,
   * the value will be an array containing both
   * the previous string and the new string.
   *
   * If an array of strings is associated with the key, append the string.
   *
   * @param key the key to associate the new value with.
   * @param value the value to associate the key with.
   *
   * @throws {@link RouterError} if the value isn't a string
   */
  public addStringToKey(key: string, value: string) {
    const currentValue = this._internalMap[key];

    if (currentValue === undefined) {
      this._internalMap[key] = value;
      return;
    }

    if (typeof currentValue === "string") {
      this._internalMap[key] = [currentValue, value];
      return;
    }

    if (Array.isArray(currentValue)) {
      this._internalMap[key] = [...currentValue, value];
      return;
    }

    throw new RouterError("StringMap.addValueToKey only accepts a string");
  }

  /**
   * Adds an array to a key.
   *
   * If no array is associated with the key, assign the array.
   *
   * If the key is already associated with a string value,
   * the value will be an array containing both the previous string value
   * and the elements of the new array.
   *
   * If the key is already associated with an array of strings,
   * the value will be an array containing both the elements
   * of the previous and new arrays.
   *
   * Use {@link StringMap#set}, {@link StringMap#setString},
   * or {@link StringMap#setArray} to replace the value.
   *
   * @param {string} key the key to associate the new value with.
   * @param {string[]} array the array to associate the key with.
   *
   * @throws {@link RouterError} if the value isn't an array of string
   */
  public addArrayToKey(key: string, array: string[]) {
    const currentValue = this._internalMap[key];

    if (currentValue === undefined) {
      this._internalMap[key] = array;
      return;
    }

    if (typeof currentValue === "string") {
      this._internalMap[key] = [currentValue, ...array];
      return;
    }

    if (Array.isArray(currentValue)) {
      this._internalMap[key] = [...currentValue, ...array];
      return;
    }

    throw new RouterError(
      "StringMap.addArrayToKey only accepts an array of string",
    );
  }

  /**
   * Sets the value of a key in the map.
   *
   * NOTE: This will replace the previous value.
   * Use {@link StringMap#addStringToKey}` or {@link StringMap#addArrayToKey}
   * if you want to combine the previous and new values
   *
   * @param key the key to associate the new value with.
   * @param value the value to associate the key with.
   */
  public set(key: string, value: string | string[]) {
    this._internalMap[key] = value;
  }

  /**
   * Sets the value of a key in the map.
   *
   * NOTE: This will replace the previous value.
   * Use {@link StringMap#addStringToKey}` or {@link StringMap#addArrayToKey}
   * if you want to combine the previous and new values
   *
   * @param key the key to associate the new value with.
   * @param value the string to associate the key with.
   */
  public setString(key: string, value: string) {
    this._internalMap[key] = value;
  }

  /**
   * Sets an array as the value of a key in the map.
   *
   * NOTE: This will replace the previous value.
   * Use {@link StringMap#addStringToKey}` or {@link StringMap#addArrayToKey}
   * if you want to combine the previous and new values
   *
   * @param key the key to associate the new value with.
   * @param value the array to associate the key with.
   */
  public setArray(key: string, value: string[]) {
    this._internalMap[key] = value;
  }

  /**
   * Returns the value associated with the key.
   * If the key is not found, returns null.
   *
   * @param key the key to look up.
   *
   * The value associated with the key.
   */
  public get(key: string): string | string[] | null {
    const value = this._internalMap[key];

    if (value !== undefined) {
      return value;
    }

    return null;
  }

  /**
   * A function for retrieving a string value.
   *
   * @param key the key for the value.
   *
   * @return A `string` if the value exists. `null` if the key doesn't exist.
   */
  public getString(key: string): string | null {
    if (!this.hasKey(key)) {
      return null;
    }

    const value = this._internalMap[key];

    if (typeof value === "string") {
      return value;
    }

    return null;
  }

  /**
   * A function for retrieving an array of strings.
   *
   * @param key the key for the value.
   *
   * @return `string` if the value exists.
   * `null` if the key isn't an array or doesn't exist.
   */
  public getArray(key: string): string[] | null {
    if (!this.hasKey(key)) return null;

    const value = this._internalMap[key];

    if (Array.isArray(value)) {
      return value;
    }

    return null;
  }

  /**
   * Convenience function for getting a string
   * and converting to a number if possible.
   * It uses the unary plus operator to convert the value.
   *
   * @param key the key for the value.
   *
   * @return `number` if the value can be converted to a number.
   * `null` if the value can't be converted to a number
   * or if the key doesn't exist.
   */
  public getNumber(key: string): number | null {
    if (!this.hasKey(key)) return null;

    const value = this.getString(key);

    if (value) {
      const numberValue = +value;

      if (Number.isNaN(numberValue)) {
        return null;
      }

      return numberValue;
    }

    return null;
  }

  /**
   * Checks if the key exists in the map.
   *
   * @param key the key to check.
   *
   * @return `true` if the key exists. `false` otherwise.
   */
  public hasKey(key: string): boolean {
    return (
      this._internalMap[key] !== undefined && this._internalMap[key] !== null
    );
  }

  /**
   * Iterates over the map yielding the values.
   *
   * @yields {(string | string[])}
   */
  public *[Symbol.iterator]() {
    for (const [, value] of Object.entries(this._internalMap)) {
      yield value;
    }
  }

  /**
   * Iterates over the map, yielding a tuple of key and values.
   *
   * @yields {[string, string | string[]]}
   */
  public *entries() {
    for (const keyValue of Object.entries(this._internalMap)) {
      yield keyValue;
    }
  }

  /**
   * Removes the key, and it's value from the map.
   *
   * @param key the key to remove.
   */
  public remove(key: string) {
    delete this._internalMap[key];
  }
}
