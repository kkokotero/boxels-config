import { program } from '@cli/program';
import { logger } from '@utils/logger';
import { Validator } from 'boxels/data';
import { execa } from 'execa';

const validateTestOpts = Validator.shape({
	watch: Validator.boolean().optional(),
	coverage: Validator.boolean().optional(),
	ui: Validator.boolean().optional(),
});

program
	.command('test', 'Ejecuta las pruebas del proyecto con Vitest.')
	.option('--watch', 'Modo watch (espera cambios)')
	.option('--coverage', 'Genera reporte de cobertura')
	.option('--ui', 'Abre la interfaz gráfica de Vitest')
	.action(async (options) => {
		const errors = validateTestOpts.validateDetailed(options);

		if (errors.length) {
			logger.error('Error en las opciones del comando `test`:\n');
			const mostrados = new Set<string>();

			for (const { path, message } of errors) {
				const flag = path ? `--${path}` : '(opción desconocida)';
				if (!mostrados.has(flag)) {
					logger.error(`${flag} → ${message}`);
					mostrados.add(flag);
				}
			}

			process.exit(1);
		}

		const args = ['vitest'];
		if (options.watch) args.push('--watch');
		if (options.coverage) args.push('--coverage');
		if (options.ui) args.push('--ui');

		try {
			await execa('npx', args, { stdio: 'inherit' });
		} catch (error) {
			logger.error('Ocurrió un error al ejecutar las pruebas.');
			if (error instanceof Error) logger.error(error.message);
			process.exit(1);
		}
	});
