import { describe, it, expect } from "vitest";
import {
  truncateAddress,
  formatBalance,
  formatRelativeTime,
  getExplorerLink,
} from "@/lib/utils";

describe("Utility Functions", () => {
  describe("truncateAddress", () => {
    it("truncates a long address", () => {
      const result = truncateAddress(
        "GABCDEFGHIJKLMNOPQRSTUVWXYZ123456789012345678"
      );
      expect(result).toBe("GABC...5678");
    });

    it("returns empty string for empty input", () => {
      expect(truncateAddress("")).toBe("");
    });

    it("returns full address if shorter than truncation", () => {
      expect(truncateAddress("SHORT", 4)).toBe("SHORT");
    });
  });

  describe("formatBalance", () => {
    it("formats large numbers with K suffix", () => {
      expect(formatBalance(5000)).toBe("5.00K");
    });

    it("formats million values with M suffix", () => {
      expect(formatBalance(2500000)).toBe("2.50M");
    });

    it("formats small numbers normally", () => {
      expect(formatBalance(42)).toBe("42");
    });
  });

  describe("formatRelativeTime", () => {
    it('returns "just now" for very recent timestamps', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(formatRelativeTime(now - 10)).toBe("just now");
    });

    it("returns minutes for timestamps within an hour", () => {
      const now = Math.floor(Date.now() / 1000);
      expect(formatRelativeTime(now - 300)).toBe("5m ago");
    });

    it("returns hours for timestamps within a day", () => {
      const now = Math.floor(Date.now() / 1000);
      expect(formatRelativeTime(now - 7200)).toBe("2h ago");
    });
  });

  describe("getExplorerLink", () => {
    it("generates tx explorer link", () => {
      const link = getExplorerLink("tx", "abc123");
      expect(link).toContain("/tx/abc123");
    });

    it("generates contract explorer link", () => {
      const link = getExplorerLink("contract", "CDEF456");
      expect(link).toContain("/contract/CDEF456");
    });

    it("generates account explorer link", () => {
      const link = getExplorerLink("account", "GABC789");
      expect(link).toContain("/account/GABC789");
    });
  });
});
