export type LocaleDict = Record<string, string>;

const en: LocaleDict = {
  // inspectServer
  "server.inspect.header": "Server: {name} v{version}",
  "server.inspect.protocol": "Protocol: {version}",
  "server.inspect.capabilities": "Capabilities:",
  "server.inspect.instructions": "Instructions: {text}",

  // generateSpec
  "server.generate.summary": "Generated spec \u2014 {count} tests",
  "server.generate.warnings": "Warnings:",
  "server.generate.noTests": "Generated spec \u2014 0 tests",

  // runSpec
  "server.run.completed": "Spec run completed.",
  "server.run.tests": "Tests:  {total}",
  "server.run.passed": "Passed: {passed}",
  "server.run.failed": "Failed: {failed}",
  "server.run.skipped": "Skipped: {skipped}",
  "server.run.errors": "Errors: {errors}",
  "server.run.duration": "Duration: {ms}ms",
  "server.run.failures": "Failures:",
  "server.run.noInput": "Provide specText or specPath",

  // explainFailure
  "server.explain.allPassed":
    "All tests passed \u2014 no failures to explain.",
  "server.explain.summary": "Test run analysis:",
  "server.explain.causes": "Likely causes:",
  "server.explain.recommendations": "Recommendations:",
  "server.explain.cause.auth": "Authentication issue ({count} test(s))",
  "server.explain.cause.placeholder":
    "Placeholder values not replaced ({count} test(s))",
  "server.explain.cause.discovery":
    "Capability not supported ({count} test(s))",
  "server.explain.cause.protocol":
    "Connection/protocol error ({count} test(s))",
  "server.explain.cause.assertion": "Assertion failure ({count} test(s))",
  "server.explain.cause.unknown": "Unknown cause ({count} test(s))",
  "server.explain.rec.auth":
    "Add authentication headers to the server config",
  "server.explain.rec.placeholder":
    "Replace TODO_ placeholder values in the spec with actual test data",
  "server.explain.rec.discovery":
    "Check inspect_server results \u2014 this capability may not be supported",
  "server.explain.rec.protocol":
    "Check that the server is running and accessible",
  "server.explain.rec.assertion":
    "Review the expected values in the spec assertions",
};

const ko: LocaleDict = {
  // inspectServer
  "server.inspect.header": "\uc11c\ubc84: {name} v{version}",
  "server.inspect.protocol": "\ud504\ub85c\ud1a0\ucf5c: {version}",
  "server.inspect.capabilities": "\uae30\ub2a5:",
  "server.inspect.instructions": "\uc9c0\uce68: {text}",

  // generateSpec
  "server.generate.summary":
    "\uc2a4\ud399 \uc0dd\uc131 \uc644\ub8cc \u2014 {count}\uac1c \ud14c\uc2a4\ud2b8",
  "server.generate.warnings": "\uacbd\uace0:",
  "server.generate.noTests":
    "\uc2a4\ud399 \uc0dd\uc131 \uc644\ub8cc \u2014 0\uac1c \ud14c\uc2a4\ud2b8",

  // runSpec
  "server.run.completed": "\uc2a4\ud399 \uc2e4\ud589 \uc644\ub8cc.",
  "server.run.tests":
    "\ud14c\uc2a4\ud2b8:  {total}",
  "server.run.passed":
    "\ud1b5\uacfc:   {passed}",
  "server.run.failed":
    "\uc2e4\ud328:   {failed}",
  "server.run.skipped":
    "\uac74\ub108\ub6f0: {skipped}",
  "server.run.errors":
    "\uc624\ub958:   {errors}",
  "server.run.duration":
    "\uc18c\uc694 \uc2dc\uac04: {ms}ms",
  "server.run.failures": "\uc2e4\ud328 \ubaa9\ub85d:",
  "server.run.noInput":
    "specText \ub610\ub294 specPath\ub97c \uc81c\uacf5\ud558\uc138\uc694",

  // explainFailure
  "server.explain.allPassed":
    "\ubaa8\ub4e0 \ud14c\uc2a4\ud2b8 \ud1b5\uacfc \u2014 \uc124\uba85\ud560 \uc2e4\ud328\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.",
  "server.explain.summary":
    "\ud14c\uc2a4\ud2b8 \uc2e4\ud589 \ubd84\uc11d:",
  "server.explain.causes": "\uc608\uc0c1 \uc6d0\uc778:",
  "server.explain.recommendations": "\uad8c\uc7a5 \uc870\uce58:",
  "server.explain.cause.auth":
    "\uc778\uc99d \ubb38\uc81c ({count}\uac1c \ud14c\uc2a4\ud2b8)",
  "server.explain.cause.placeholder":
    "placeholder \uac12 \ubbf8\uad50\uccb4 ({count}\uac1c \ud14c\uc2a4\ud2b8)",
  "server.explain.cause.discovery":
    "\uae30\ub2a5 \ubbf8\uc9c0\uc6d0 ({count}\uac1c \ud14c\uc2a4\ud2b8)",
  "server.explain.cause.protocol":
    "\uc5f0\uacb0/\ud504\ub85c\ud1a0\ucf5c \uc624\ub958 ({count}\uac1c \ud14c\uc2a4\ud2b8)",
  "server.explain.cause.assertion":
    "\uc5b4\uc11c\uc158 \uc2e4\ud328 ({count}\uac1c \ud14c\uc2a4\ud2b8)",
  "server.explain.cause.unknown":
    "\uc6d0\uc778 \ubd88\uba85 ({count}\uac1c \ud14c\uc2a4\ud2b8)",
  "server.explain.rec.auth":
    "\uc11c\ubc84 \uc124\uc815\uc5d0 \uc778\uc99d \ud5e4\ub354\ub97c \ucd94\uac00\ud558\uc138\uc694",
  "server.explain.rec.placeholder":
    "\uc2a4\ud399\uc758 TODO_ placeholder\ub97c \uc2e4\uc81c \uac12\uc73c\ub85c \uad50\uccb4\ud558\uc138\uc694",
  "server.explain.rec.discovery":
    "inspect_server \uacb0\uacfc\ub97c \ud655\uc778\ud558\uc138\uc694 \u2014 \ud574\ub2f9 \uae30\ub2a5\uc774 \ubbf8\uc9c0\uc6d0\uc77c \uc218 \uc788\uc2b5\ub2c8\ub2e4",
  "server.explain.rec.protocol":
    "\uc11c\ubc84\uac00 \uc2e4\ud589 \uc911\uc774\uace0 \uc811\uadfc \uac00\ub2a5\ud55c\uc9c0 \ud655\uc778\ud558\uc138\uc694",
  "server.explain.rec.assertion":
    "\uc2a4\ud399 \uc5b4\uc11c\uc158\uc758 \uae30\ub300\uac12\uc744 \uac80\ud1a0\ud558\uc138\uc694",
};

const LOCALES: Record<string, LocaleDict> = { en, ko };
const SUPPORTED = new Set(Object.keys(LOCALES));
const FALLBACK = "en";
let _lang = FALLBACK;

if (typeof process !== "undefined" && process.env) {
  const envLang = process.env["MCP_WORKBENCH_LANG"];
  if (envLang) _lang = SUPPORTED.has(envLang) ? envLang : FALLBACK;
}

export function setLang(lang: string): void {
  _lang = SUPPORTED.has(lang) ? lang : FALLBACK;
}

export function getLang(): string {
  return _lang;
}

export function getSupportedLocales(): readonly string[] {
  return [...SUPPORTED];
}

export function t(key: string, params?: Record<string, unknown>): string {
  const dict = LOCALES[_lang];
  const fallbackDict = LOCALES[FALLBACK];
  let str = dict?.[key] ?? fallbackDict?.[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replaceAll(`{${k}}`, String(v));
    }
  }
  return str;
}
