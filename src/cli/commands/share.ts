import { program, userDefinedConfig } from '@cli/program';
import { logger } from '@utils/index';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import fs from 'node:fs';

program
	.command('share', 'Sirve públicamente la build de producción.')
	.allowUnknownOptions()
	.action(async () => {
		try {
			// Cargamos la config de Vite definida por el usuario
			const config = await userDefinedConfig;

			// Determinar raíz del proyecto
			const projectRoot = resolve(process.cwd());

			// Detectar carpeta de build (outDir) o usar 'dist'
			const outDir = resolve(projectRoot, config?.build?.outDir ?? 'dist');

			// Validar que la carpeta exista
			if (!fs.existsSync(outDir)) {
				logger.error(`No se encontró la carpeta de build: ${outDir}`);
				logger.error(`Ejecuta "box build" antes de usar "share".`);
				process.exit(1);
			}

			// Ruta al binario local de vite
			const viteBin = resolve('node_modules', '.bin', 'vite');

			// Capturar todos los argumentos después de 'share'
			const shareIndex = process.argv.indexOf('share');
			const userArgs =
				shareIndex >= 0 ? process.argv.slice(shareIndex + 1) : [];

			// Armamos los argumentos para vite preview
			const args = [
				'preview',
				'--host', // host público
				'--port',
				String(config.preview?.port || '4321'),
				...userArgs,
			];

			logger.info(outDir);

			// Ejecutar vite preview en la raíz del proyecto
			const child = spawn(viteBin, args, {
				stdio: 'inherit',
				cwd: projectRoot,
				shell: process.platform === 'win32',
			});

			child.on('close', (code) => {
				process.exit(code ?? 0);
			});
		} catch (e) {
			if (e instanceof Error) {
				logger.error(e.message);
			} else {
				logger.error('Error desconocido al intentar compartir.');
			}
			process.exit(1);
		}
	});
