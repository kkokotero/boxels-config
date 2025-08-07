import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';
import type { BoxelsConfig } from './config-schema';
import { resolveFinalViteConfig } from './transform-config';
import type { UserConfig } from 'vite';
import { standardConfig } from './standar-config';

/**
 * Lista de posibles extensiones para archivos de configuración Boxels.
 */
const CONFIG_FILENAMES = [
	'boxels.config.js',
	'boxels.config.mjs',
	'boxels.config.cjs',
];

/**
 * Busca y carga automáticamente un archivo de configuración Boxels.
 * Soporta `ts`, `js`, `mjs`, `cjs` con exportación por defecto.
 *
 * @param cwd - Directorio base (por defecto el actual)
 * @returns Configuración Boxels cargada
 */
export async function resolveBoxelsConfig(
	cwd: string = process.cwd(),
): Promise<UserConfig> {
	for (const fileName of CONFIG_FILENAMES) {
		const filePath = resolve(cwd, fileName);

		if (!existsSync(filePath)) continue;

		try {
			const module = await import(pathToFileURL(filePath).href);

			if (typeof module.default === 'object' && module.default !== null) {
				return resolveFinalViteConfig(module.default as BoxelsConfig);
			}
			throw new Error(
				`El archivo "${fileName}" no tiene una exportación por defecto válida.`,
			);
		} catch (err) {
			throw new Error(
				`Error al cargar la configuración desde "${fileName}": ${String(err)}`,
			);
		}
	}

	return standardConfig;
}
