import { mergeBoxelsConfig } from './transform-config';
import type { BoxelsConfig } from './config-schema';

export const defineConfig = (config: BoxelsConfig) => config;

export { mergeBoxelsConfig as mergeConfig };
export type { BoxelsConfig, Plugin } from './config-schema';
export const setupTestingBoxels = () => import('../dom');
