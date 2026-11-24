import { afterEach, describe, expect, it, vi } from "vitest";
import { dataISO, diaRelativo, diasAte, formatarNumero } from "./format";

describe("format", () => {
  afterEach(() => vi.useRealTimers());

  it("F01 formata números no padrão pt-BR com até 3 casas", () => {
    expect(formatarNumero(1234.5)).toBe("1.234,5");
    expect(formatarNumero(0.12345)).toBe("0,123");
    expect(formatarNumero(70)).toBe("70");
  });

  it("F02 gera data ISO local AAAA-MM-DD com zeros à esquerda", () => {
    expect(dataISO(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("F03 calcula dias até a validade (futuro, hoje, vencido)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 24, 15, 30));
    expect(dataISO(diaRelativo(0))).toBe("2026-11-24");
    expect(diasAte("2026-12-04")).toBe(10);
    expect(diasAte("2026-11-24")).toBe(0);
    expect(diasAte("2026-11-20")).toBe(-4);
  });
});
