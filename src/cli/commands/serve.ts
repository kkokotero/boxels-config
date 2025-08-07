import { createServer, mergeConfig, type UserConfig } from 'vite';
import { Validator } from 'boxels/data';

import { program, userDefinedConfig } from '@cli/program';
import { getFileSize, logger } from '@utils/index';
import { existsSync } from 'node:fs';

const parseFilePath = (path: string) => path.replace(process.cwd(), '.');

interface ServeCommand {
	port?: number;
	host?: string;
	base?: string;
	mode?: 'development' | 'production';
	root?: string;
	open?: boolean | string;
	publicDir?: string;
}

const MODES = ['development', 'production'] as const;
type Mode = (typeof MODES)[number];

const validateOpts = Validator.shape({
	port: Validator.number().integer().min(1).max(65535).optional(),
	host: Validator.string().optional(),
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
	open: Validator.any().optional(),
	publicDir: Validator.string()
		.optional()
		.custom((path) => existsSync(path), 'El directorio no existe'),
});

program
	.command(
		'serve',
		'Inicia el servidor de desarrollo con recarga en caliente (HMR).',
	)
	.option('--port <port>', 'Puerto para el servidor de desarrollo (ej: 3000)')
	.option('--host <host>', 'Host/IP para enlazar el servidor (ej: 127.0.0.1)')
	.option('--base <base>', 'Ruta base pública (ej: /subpath/)')
	.option('--mode <mode>', 'Modo de entorno (ej: development)')
	.option('--root <path>', 'Directorio raíz del proyecto')
	.option(
		'--open <open>',
		'Abrir navegador automáticamente (true, false o nombre del navegador)',
	)
	.option('--public-dir <path>', 'Directorio de archivos estáticos')
	.action(async (options: ServeCommand) => {
		const errors = validateOpts.validateDetailed(options, { fastFail: false });

		if (errors.length > 0) {
			logger.error('Error en las opciones del comando `serve`:');
			logger.blank();
			const showedCommands: string[] = [];

			for (const error of errors) {
				const flag = error.path ? `--${error.path}` : '(opción desconocida)';
				if (!showedCommands.includes(flag)) {
					logger.error(`${flag} → ${error.message}`);
					showedCommands.push(flag);
				}
			}

			process.exit(1);
		}

		const commandConfig: UserConfig = {
			root: options.root,
			publicDir: options.publicDir,
			mode: options.mode,
			base: options.base,
			server: {
				port: options.port,
				host: options.host,
				open: options.open,
			},
		};

		const finalConfig = mergeConfig(await userDefinedConfig, commandConfig);

		const server = await createServer(finalConfig);

		server.httpServer?.on('error', (err) => {
			logger.error(`Error del servidor HTTP: ${err}`);
		});

		server.ws?.on('error', (err) => {
			logger.error(`Error de WebSocket: ${err}`);
		});

		server.watcher.on('error', (err) => {
			logger.error(`Error del watcher: ${err}`);
		});

		server.watcher.on('add', async (file) => {
			logger.info(
				`Archivo añadido: ${parseFilePath(file)} (${await getFileSize(file)})`,
			);
		});

		server.watcher.on('change', async (file) => {
			logger.info(
				`Archivo modificado: ${parseFilePath(file)} (${await getFileSize(file)})`,
			);
		});

		server.watcher.on('unlink', (file) => {
			logger.info(`Archivo eliminado: ${parseFilePath(file)}`);
		});

		server.watcher.on('addDir', (dir) => {
			logger.info(`Directorio añadido: ${parseFilePath(dir)}`);
		});

		server.watcher.on('unlinkDir', (dir) => {
			logger.info(`Directorio eliminado: ${parseFilePath(dir)}`);
		});

		server.watcher.on('restart', (file) => {
			logger.warn(`Reinicio provocado por cambio en: ${parseFilePath(file)}`);
		});

		try {
			await server.listen();

			const info = server.config.server;
			const port = info.port ?? 5173;
			const host = info.host ?? 'localhost';
			const protocol = info.https ? 'https' : 'http';

			logger.watch(`Servidor en ejecución: ${protocol}://${host}:${port}/`);
			logger.blank();
			logger.note('Presiona Ctrl + C para salir.');
		} catch (e) {
			logger.error(
				`❌ Error fatal al iniciar servidor: ${(e as Error).message}`,
			);
			process.exit(1);
		}
	});
