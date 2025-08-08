import { beforeAll, expect } from 'vitest';
import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';
import { setupTestingBoxels } from 'boxels-config';

expect.extend(matchers);

beforeAll(async () => {
	await setupTestingBoxels();
});
