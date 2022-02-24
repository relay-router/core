interface StringRecord {
  [key: string]: string | string[] | undefined;
}

/**
 * A map for key-to-string or key-to-array-of-string.
 */
export class StringMap {
  readonly #internalMap: StringRecord;

  /**
   * @constructor
   * @param record a JavaScript object with strings as property
   * names and strings or array of strings as values.
   */
  constructor(record?: Required<StringRecord>) {
    this.#internalMap = record ?? {};
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
   * @param {string} key the key to associate the new value with.
   * @param {string} value the value to associate the key with.
   * @return {void} void
   * @throws {Error} if the value isn't a string
   */
  public addStringToKey(key: string, value: string) {
    const currentValue = this.#internalMap[key];

    if (currentValue === undefined) {
      this.#internalMap[key] = value;
      return;
    }

    if (typeof currentValue === "string") {
      this.#internalMap[key] = [currentValue, value];
      return;
    }

    if (Array.isArray(currentValue)) {
      this.#internalMap[key] = [...currentValue, value];
      return;
    }

    throw new Error("StringMap.addValueToKey only accepts a string");
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
   * Use {@link StringMap.set}, {@link StringMap.setString},
   * or {@link StringMap.setArray} to replace the value.
   *
   * @param {string} key the key to associate the new value with.
   * @param {string[]} array the array to associate the key with.
   *
   * @return {void} void
   *
   * @throws {Error} if the value isn't an array of string
   */
  public addArrayToKey(key: string, array: string[]) {
    const currentValue = this.#internalMap[key];

    if (currentValue === undefined) {
      this.#internalMap[key] = array;
      return;
    }

    if (typeof currentValue === "string") {
      this.#internalMap[key] = [currentValue, ...array];
      return;
    }

    if (Array.isArray(currentValue)) {
      this.#internalMap[key] = [...currentValue, ...array];
      return;
    }

    throw new Error("StringMap.addArrayToKey only accepts an array of string");
  }

  /**
   * Sets the value of a key in the map.
   *
   * NOTE: This will replace the previous value.
   * Use {@link StringMap.addStringToKey}` or {@link StringMap.addArrayToKey}
   * if you want to combine the previous and new values
   *
   * @param key {string} the key to associate the new value with.
   * @param value {string | string[]} the value to associate the key with.
   *
   * @return {void} void
   */
  public set(key: string, value: string | string[]) {
    this.#internalMap[key] = value;
  }

  /**
   * Sets the value of a key in the map.
   *
   * NOTE: This will replace the previous value.
   * Use {@link StringMap.addStringToKey}` or {@link StringMap.addArrayToKey}
   * if you want to combine the previous and new values
   *
   * @param {string} key the key to associate the new value with.
   * @param {string} value the string to associate the key with.
   *
   * @return {void} void
   */
  public setString(key: string, value: string) {
    this.#internalMap[key] = value;
  }

  /**
   * Sets an array as the value of a key in the map.
   *
   * NOTE: This will replace the previous value.
   * Use {@link StringMap.addStringToKey}` or {@link StringMap.addArrayToKey}
   * if you want to combine the previous and new values
   *
   * @param {string} key the key to associate the new value with.
   * @param {string[]} value the array to associate the key with.
   *
   * @return {void} void
   */
  public setArray(key: string, value: string[]) {
    this.#internalMap[key] = value;
  }

  /**
   * Returns the value associated with the key.
   * If the key is not found, returns null.
   *
   * @param {string} key the key to look up.
   * @return {(string | string[] | null)}
   * The value associated with the key.
   */
  public get(key: string): string | string[] | null {
    const value = this.#internalMap[key];

    if (value !== undefined) {
      return value;
    }

    return null;
  }

  /**
   * A function for retrieving a string value.
   *
   * @param {string} key the key for the value.
   *
   * @return {(string | null)}
   * `string` if the value exists.
   * `null` if the key doesn't exist.
   */
  public getString(key: string): string | null {
    if (!this.hasKey(key)) {
      return null;
    }

    const value = this.#internalMap[key];

    if (typeof value === "string") {
      return value;
    }

    return null;
  }

  /**
   * A function for retrieving an array of strings.
   *
   * @param {string} key the key for the value.
   *
   * @return {(string[] | null)}
   * `string` if the value exists.
   * `null` if the key isn't an array or doesn't exist.
   */
  public getArray(key: string): string[] | null {
    if (!this.hasKey(key))
      return null;

    const value = this.#internalMap[key];

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
   * @param {string} key the key for the value.
   *
   * @return {(number | null)}
   * `number` if the value can be converted to a number.
   * `null` if the value can't be converted to a number
   * or if the key doesn't exist.
   */
  public getNumber(key: string): number | null {
    if (!this.hasKey(key))
      return null;

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
   * @param {string} key the key to check.
   *
   * @return {boolean} `true` if the key exists. `false` otherwise.
   */
  public hasKey(key: string): boolean {
    return this.#internalMap[key] !== undefined && this.#internalMap[key] !== null;
  }

  /**
   * Removes the key from the map.
   *
   * @param {string} key the key to remove.
   *
   * @return {void} void
   */
  public remove(key: string) {
    delete this.#internalMap[key];
  }
}
