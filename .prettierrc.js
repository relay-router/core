module.exports = {
  trailingComma: "all",
  tabWidth: 2,
  semi: true,
  singleQuote: false,
  useTabs: false,
  quoteProps: "as-needed", // quote properties
  jsxSingleQuote: false,
  arrowParens: "always",
  vueIndentScriptAndStyle: false,
  embeddedLanguageFormatting: "auto", // prettier will format code written in languages that it recognizes in template tagged strings such as html``
  requirePragma: false, // prettier will only format files with @format or @prettier as it's first comment
  insertPragma: false, // prettier will insert @prettier pragma on files that it formats
  endOfLine: "lf",
};
