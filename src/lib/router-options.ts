import type {
  ParseOptions,
  TokensToRegexpOptions,
  RegexpToFunctionOptions,
} from "path-to-regexp";

type PathToRegexOptions = ParseOptions &
  TokensToRegexpOptions &
  RegexpToFunctionOptions;

export type MatchingOptions = Omit<
  PathToRegexOptions,
  "end" | "strict" | "start" | "delimiter" | "prefixes"
>;

export class RouterOptions {
  public bindPopState = true;
  public bindClick = true;
  public initialDispatch = true;
  public matchingOptions: PathToRegexOptions = {
    end: true,
    strict: false,
    start: true,
    sensitive: false,
  };
}
