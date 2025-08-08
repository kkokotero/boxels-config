import { build as viteBuild, mergeConfig, type UserConfig } from 'vite';
import { program, userDefinedConfig } from '@cli/program';
import { logger } from '@utils/index';

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
				minify: options.minify !=='false',
				emptyOutDir: options.emptyOutDir,
				rollupOptions: {
					input: options.entry,
				},
			},
		};

		const finalConfig = mergeConfig(await userDefinedConfig, commandConfig);

		try {
			await viteBuild(finalConfig);
			logger.success('Compilación completada exitosamente.');
		} catch (e) {
			logger.error(e);
			process.exit(1);
		}
	});
