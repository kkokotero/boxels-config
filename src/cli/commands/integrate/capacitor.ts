import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { program, userDefinedConfig } from '@cli/program';
import { logger } from '@utils/index';

const CAPACITOR_PLATFORMS = ['android', 'ios'] as const;
type CapacitorPlatform = (typeof CAPACITOR_PLATFORMS)[number];

interface IntegrateCapacitorCommand {
	appName?: string;
	appId?: string;
	platforms?: string;
}

function updatePackageJson(commands: Record<string, string>) {
	try {
		const pkgPath = './package.json';
		const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

		pkg.scripts = {
			...pkg.scripts,
			...commands,
		};

		writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
		logger.success('Comandos añadidos al package.json.');
	} catch (err) {
		logger.error('No se pudo actualizar el package.json');
		logger.error(err);
	}
}

program
	.command('integrate:capacitor', 'Integra Capacitor al proyecto actual.')
	.option('--app-name <name>', 'Nombre de la aplicación')
	.option('--app-id <id>', 'ID de la aplicación (ej: com.ejemplo.app)')
	.option('--platforms <list>', 'Plataformas separadas por coma (android, ios)', { default: 'android' })
	.action(async (options: IntegrateCapacitorCommand) => {
		try {
			// Cargar config aquí para evitar await de alto nivel
			const config = await userDefinedConfig;

			const appName = options.appName || config.root;
			const appId = options.appId || config.root;

			logger.info('Instalando dependencias de Capacitor...');
			execSync('npm install @capacitor/core @capacitor/cli', { stdio: 'inherit' });

			logger.info('Inicializando Capacitor...');
			execSync(`npx cap init "${appName}" "${appId}"`, { stdio: 'inherit' });

			const platforms = options.platforms?.split(',') as CapacitorPlatform[];
			for (const platform of platforms) {
				if (CAPACITOR_PLATFORMS.includes(platform)) {
					logger.info(`Agregando plataforma: ${platform}...`);
					execSync(`npm install @capacitor/${platform}`, { stdio: 'inherit' });
					execSync(`npx cap add ${platform}`, { stdio: 'inherit' });
				} else {
					logger.warn(`Plataforma no soportada: ${platform}`);
				}
			}

			logger.info('Sincronizando proyecto con Capacitor...');
			execSync('npx cap sync', { stdio: 'inherit' });

			updatePackageJson({
				'cap:sync': 'npx cap sync',
				'cap:android': 'npx cap run android',
				'cap:ios': 'npx cap run ios'
			});

			logger.success('Integración con Capacitor completada.');
		} catch (e) {
			logger.error('Error durante la integración con Capacitor.');
			logger.error(e);
			process.exit(1);
		}
	});
