#!/usr/bin/env node

import './dom';
import { program, userDefinedConfig } from '@cli/index';
import { logger } from '@utils/index';

const load = async () => {
	console.log(await userDefinedConfig);
};

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
	load();
	logger.info(
		`No se proporcionó ningún comando. Usa '--help' para ver la lista de comandos disponibles.`,
	);
}
