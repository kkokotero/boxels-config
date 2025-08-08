import { program } from '@cli/program';
import { logger } from '@utils/logger';
import { execa } from 'execa';

program
	.command('test', 'Ejecuta las pruebas del proyecto con Vitest.')
	.option('--watch', 'Modo watch (espera cambios)')
	.option('--coverage', 'Genera reporte de cobertura')
	.option('--ui', 'Abre la interfaz gráfica de Vitest')
	.action(async (options) => {

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
