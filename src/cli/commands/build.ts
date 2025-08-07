import { build as viteBuild, mergeConfig, type UserConfig } from 'vite';
import { Validator } from 'boxels/data';
import { program, userDefinedConfig } from '@cli/program';
import { logger } from '@utils/index';
import { existsSync } from 'node:fs';

const MODES = ['production', 'staging'] as const;
type Mode = (typeof MODES)[number];

const SOURCEMAPS = ['true', 'false', 'inline', 'hidden'] as const;
const MINIFIERS = ['esbuild', 'terser', 'false'] as const;

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

const validateOpts = Validator.shape({
	base: Validator.string().optional(),
	mode: Validator.string()
		.optional()
		.custom(
			(v): v is Mode => MODES.includes(v as Mode),
			`Modo inválido. Debe ser uno de: ${MODES.join(', ')}`,
		),
	root: Validator.string()
		.optional()
		.custom((path) => existsSync(path), 'El directorio no existe'),
	entry: Validator.string()
		.optional()
		.custom(
			(path) => existsSync(path),
			'El archivo/directorio de entrada no existe',
		),
	publicDir: Validator.string()
		.optional()
		.custom((path) => existsSync(path), 'El directorio no existe'),
	outDir: Validator.string().optional(),
	sourcemap: Validator.string()
		.optional()
		.custom(
			(v): v is string => SOURCEMAPS.includes(v as any),
			`Valor inválido para sourcemap. Debe ser uno de: ${SOURCEMAPS.join(', ')}`,
		),
	minify: Validator.string()
		.optional()
		.custom(
			(v): v is string => MINIFIERS.includes(v as any),
			`Valor inválido para minify. Debe ser uno de: ${MINIFIERS.join(', ')}`,
		),
	emptyOutDir: Validator.boolean().optional(),
});

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
		const errors = validateOpts.validateDetailed(options, { fastFail: false });

		if (errors.length > 0) {
			logger.error('Error en las opciones del comando `build`:');
			logger.blank();
			const showed: string[] = [];

			for (const error of errors) {
				const flag = error.path ? `--${error.path}` : '(opción desconocida)';
				if (!showed.includes(flag)) {
					logger.error(`${flag} → ${error.message}`);
					showed.push(flag);
				}
			}

			process.exit(1);
		}

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
