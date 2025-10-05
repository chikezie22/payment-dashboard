/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// ✅ Add jest-dom matchers
expect.extend(matchers);

// ✅ Clean up after each test
afterEach(() => {
  cleanup();
});

// ✅ Mock ResizeObserver (used by Recharts in Dashboard)
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(global as any).ResizeObserver = ResizeObserver;

// ✅ Mock window.alert to avoid "Not implemented: alert" error
vi.stubGlobal('alert', vi.fn());

// ✅ (Optional) silence console warnings during tests
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});
