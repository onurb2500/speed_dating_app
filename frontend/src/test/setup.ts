import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// jsdom lacks matchMedia / IntersectionObserver — stub the bits our hooks use.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
