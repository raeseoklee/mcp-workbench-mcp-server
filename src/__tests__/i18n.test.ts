import { describe, it, expect, beforeEach } from "vitest";
import { t, setLang, getLang, getSupportedLocales } from "../i18n.js";

describe("i18n", () => {
  beforeEach(() => {
    setLang("en");
  });

  it("returns English by default", () => {
    expect(t("server.run.completed")).toBe("Spec run completed.");
  });

  it("switches to Korean with setLang('ko')", () => {
    setLang("ko");
    expect(t("server.run.completed")).toBe("스펙 실행 완료.");
  });

  it("falls back to English for unknown locale", () => {
    setLang("unknown");
    expect(getLang()).toBe("en");
    expect(t("server.run.completed")).toBe("Spec run completed.");
  });

  it("falls back to English dict then to key itself for missing key", () => {
    setLang("ko");
    expect(t("server.nonexistent.key")).toBe("server.nonexistent.key");
  });

  it("interpolates {param} placeholders", () => {
    expect(t("server.inspect.header", { name: "demo", version: "2.0" })).toBe(
      "Server: demo v2.0",
    );
  });

  it("returns current locale with getLang()", () => {
    expect(getLang()).toBe("en");
    setLang("ko");
    expect(getLang()).toBe("ko");
  });

  it("returns supported locales", () => {
    const locales = getSupportedLocales();
    expect(locales).toContain("en");
    expect(locales).toContain("ko");
    expect(locales).toHaveLength(2);
  });

  it("resets to English after Korean", () => {
    setLang("ko");
    expect(t("server.run.completed")).toBe("스펙 실행 완료.");
    setLang("en");
    expect(t("server.run.completed")).toBe("Spec run completed.");
  });
});
