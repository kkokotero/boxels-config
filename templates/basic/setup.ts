import { expect } from 'vitest';
import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extiende expect con los matchers de jest-dom
expect.extend(matchers);
