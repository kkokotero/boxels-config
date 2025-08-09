import { build as viteBuild, mergeConfig, type UserConfig } from 'vite';
import { program, userDefinedConfig } from '@cli/program';
import { logger, getDirSize } from '@utils/index';

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { gzip } from 'node:zlib';
import { promisify } from 'node:util';

const gzipAsync = promisify(gzip);

const MODES = ['production', 'staging'] as const;
type Mode = (typeof MODES)[number];

interface BuildCommand {
	base?: string;
	mode?: Mode;
	root?: string;
	publicDir?: string;
	entry?: string;
	outDir?: string;
	sourcemap?: string;
	minify?: string;
	emptyOutDir?: boolean;
	watch?: boolean;
}

// Función para formatear bytes a KB, MB, etc.
function formatSize(bytes: number, decimals = 2): string {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

// Función para calcular tamaño gzip sumando archivos comprimidos
async function getCompressedSize(dir: string): Promise<number> {
	let totalSize = 0;

	async function walk(dirPath: string) {
		const entries = await fs.readdir(dirPath, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = path.join(dirPath, entry.name);
			if (entry.isDirectory()) {
				await walk(fullPath);
			} else {
				const content = await fs.readFile(fullPath);
				const compressed = await gzipAsync(content);
				totalSize += compressed.length;
			}
		}
	}

	await walk(dir);
	return totalSize;
}

program
	.command('build', 'Compila la aplicación para despliegue en producción.')
	.option('--base <base>', 'Ruta base para los assets generados (ej: /assets/)')
	.option('--mode <mode>', 'Modo de construcción (ej: production, staging)', {
		default: 'production',
	})
	.option('--root <path>', 'Directorio raíz del proyecto')
	.option('--entry <path>', 'Archivo o directorio de entrada')
	.option(
		'--public-dir <path>',
		'Directorio de archivos estáticos para incluir',
	)
	.option('--out-dir <path>', 'Directorio de salida de la compilación')
	.option(
		'--sourcemap <option>',
		'Generar sourcemaps: true, false, inline, hidden',
	)
	.option('--minify <option>', 'Método de minificación: esbuild, terser, false')
	.option('--empty-out-dir', 'Vaciar el directorio de salida antes de compilar')
	.action(async (options: BuildCommand) => {
		const commandConfig: UserConfig = {
			base: options.base,
			mode: options.mode,
			root: options.root,
			publicDir: options.publicDir,
			build: {
				outDir: options.outDir,
				sourcemap: options.sourcemap === 'true',
				minify: options.minify !== 'false',
				emptyOutDir: options.emptyOutDir,
				rollupOptions: {
					input: options.entry,
				},
			},
			css: {
				modules: {
					generateScopedName: '__[hash:base64:10]',
				},
			},
		};

		const finalConfig = mergeConfig(await userDefinedConfig, commandConfig);

		const startTime = Date.now();

		try {
			await viteBuild(finalConfig);
			const endTime = Date.now();
			const durationSeconds = ((endTime - startTime) / 1000).toFixed(2);

			const outDir = finalConfig.build?.outDir || 'dist';
			const buildSize = await getDirSize(outDir);
			const compressedSize = await getCompressedSize(outDir);

			logger.success('¡Compilación completada exitosamente!');
			logger.blank();
			logger.info(`Tiempo de build:      	 ${durationSeconds} segundos`);
			logger.info(`Tamaño final:           ${formatSize(buildSize)}`);
			logger.info(`Tamaño comprimido gzip: ${formatSize(compressedSize)}`);
		} catch (e) {
			logger.error(e);
			process.exit(1);
		}
	});
