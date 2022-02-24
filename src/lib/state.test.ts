import { isValidNaviState, naviPrivateStateKey } from "./state";

describe("isValidNaviState", () => {
  test("will return false for null", () => {
    expect(isValidNaviState(null)).toBeFalsy();
  });

  test("will return false for empty object", () => {
    expect(isValidNaviState({})).toBeFalsy();
  });

  test(`will return false for objects with falsy ${naviPrivateStateKey} property`,
       () => {
         expect(isValidNaviState({ [naviPrivateStateKey]: undefined }))
           .toBeFalsy();
       });

  test(`will return false for objects with a ${naviPrivateStateKey} property but no path property`,
       () => {
         expect(isValidNaviState({ [naviPrivateStateKey]: {} }))
           .toBeFalsy();
       });

  test(`will return true for objects with a ${naviPrivateStateKey} property with path property but not a string type`,
       () => {
         expect(isValidNaviState({ [naviPrivateStateKey]: { path: 1 } }))
           .toBeFalsy();
       });

  test(`will return true for valid object`,
       () => {
         expect(isValidNaviState({ [naviPrivateStateKey]: { path: "/path" } }))
           .toBeTruthy();
       });
});
