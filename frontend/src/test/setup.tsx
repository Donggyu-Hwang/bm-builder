import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import React from 'react';
import { store } from '../store/index';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

// Mock FocusTrap to avoid tabbable node issues in tests
vi.mock('focus-trap-react', () => ({
  FocusTrap: ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
  },
}));

// Helper function to render components with Redux Provider
export function renderWithRedux(ui: React.ReactElement, options = {}) {
  return render(<Provider store={store}>{ui}</Provider>, options);
}
