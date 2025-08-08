#!/usr/bin/env node

import { program } from '@cli/index';
import { logger } from '@utils/index';

program.help();

// Intenta parsear los argumentos de la CLI
try {
	program.parse(process.argv);
} catch (err) {
	// Si ocurre un error al parsear, lo muestra con el logger
	logger.error(err);
}

// Si no se pasó ningún comando, muestra mensaje de ayuda
if (process.argv.length <= 2) {
	logger.info(
		`No se proporcionó ningún comando. Usa '--help' para ver la lista de comandos disponibles.`,
	);
}
