import { mergeBoxelsConfig } from './transform-config';
import type { BoxelsConfig } from './config-schema';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const defineConfig = (config: BoxelsConfig) => config;

export { mergeBoxelsConfig as mergeConfig };
export type { BoxelsConfig, Plugin } from './config-schema';
export const setupTestingBoxels = resolve(__dirname, '../dom.js');
