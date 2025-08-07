import { program } from '@cli/program';
import { logger } from '@utils/logger';

program.command('new', 'Crea un nuevo proyecto de Boxels').action(() => {
	logger.warn('El comando "new" aún no está implementado. ¡Próximamente!');
});
