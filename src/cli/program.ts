import { metadata } from '@config/config-schema';
import { resolveBoxelsConfig } from '@config/resolve-boxels-config';
import cac from 'cac';

export const userDefinedConfig = resolveBoxelsConfig();

export const program = cac(metadata.name);
program.version(metadata.version);
