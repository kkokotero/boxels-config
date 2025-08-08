import { preview as vitePreview, mergeConfig, type PreviewServer, type UserConfig } from 'vite';
import { program, userDefinedConfig } from '@cli/program';
import { logger } from '@utils/index';

interface PreviewCommand {
	port?: number;
	host?: string;
	open?: boolean;
	base?: string;
	mode?: string;
	root?: string;
	publicDir?: string;
}

program
	.command('preview', 'Sirve localmente la build de producción para pruebas.')
	.option('--port <port>', 'Puerto para la previsualización (ej: 5000)')
	.option('--host <host>', 'Host/IP para enlazar el servidor de previsualización')
	.option('--open', 'Abrir navegador automáticamente')
	.option('--base <base>', 'Ruta base pública')
	.option('--mode <mode>', 'Modo de entorno')
	.option('--root <path>', 'Directorio raíz del proyecto')
	.option('--public-dir <path>', 'Directorio de archivos estáticos')
	.action(async (options: PreviewCommand) => {
		const commandConfig: UserConfig = {
			base: options.base,
			mode: options.mode,
			root: options.root,
			publicDir: options.publicDir,
			preview: {
				port: options.port,
				host: options.host,
				open: options.open,
			},
		};

		const finalConfig = mergeConfig(await userDefinedConfig, commandConfig);

		try {
			const server: PreviewServer = await vitePreview(finalConfig);
			logger.success(
				`Servidor de previsualización iniciado en: ${server.resolvedUrls?.local?.[0]}`,
			);
		} catch (e) {
			if (e instanceof Error) {
				logger.error(e.message);
			} else {
				logger.error('Error desconocido durante la previsualización.');
			}
			process.exit(1);
		}
	});
