import { mergeConfig, type UserConfig } from 'vite';
import type { BoxelsConfig } from './config-schema';
import { standardConfig } from './standar-config'; // Vite config

/**
 * Une dos configuraciones de Boxels, dando prioridad a la segunda.
 */
export function mergeBoxelsConfig(
	baseConfig: BoxelsConfig,
	userConfig: BoxelsConfig,
): BoxelsConfig {
	return {
		...baseConfig,
		...userConfig,
		alias: {
			...(baseConfig.alias ?? {}),
			...(userConfig.alias ?? {}),
		},
		define: {
			...(baseConfig.define ?? {}),
			...(userConfig.define ?? {}),
		},
		plugins: [...(baseConfig.plugins ?? []), ...(userConfig.plugins ?? [])],
		server: {
			...(baseConfig.server ?? {}),
			...(userConfig.server ?? {}),
		},
		build: {
			...(baseConfig.build ?? {}),
			...(userConfig.build ?? {}),
		},
	};
}

/**
 * Transforma una configuración de Boxels en una configuración de Vite + extras.
 */
export function transformBoxelsConfig(config: BoxelsConfig): {
	viteConfig: UserConfig;
	boxelsExtra: Record<string, unknown>;
} {
	const {
		alias,
		define,
		globalStyles,
		plugins,
		publicDir,
		root,
		server,
		build,
		exclude,
		include,
		...rest
	} = config;

	const viteBuild: UserConfig['build'] | undefined = build
		? {
				...build,
				rollupOptions: {
					input: build.input ?? '',
					external: exclude,
				},
			}
		: undefined;

	const viteConfig: UserConfig = {
		resolve: alias ? { alias } : {},
		define,
		plugins,
		publicDir,
		root,
		server,
		build: viteBuild,
		optimizeDeps: {
			exclude,
			include,
		},
	};

	const boxelsExtra: Record<string, unknown> = {
		globalStyles,
		...rest,
	};

	return { viteConfig, boxelsExtra };
}

/**
 * Une la configuración base de Boxels con la del usuario,
 * la transforma, y la combina con la configuración estándar de Vite.
 */
export function resolveFinalViteConfig(userConfig: BoxelsConfig): UserConfig {
	// 2. Transformar a configuración Vite + extras
	const { viteConfig, boxelsExtra } = transformBoxelsConfig(userConfig);

	// 3. Fusionar con config base de Vite (standardConfig)
	const finalViteConfig: UserConfig = mergeConfig(standardConfig, viteConfig);

	// 4. Insertar estilos globales si aplica
	if (
		boxelsExtra.globalStyles &&
		typeof boxelsExtra.globalStyles === 'string'
	) {
		finalViteConfig.css ??= {};
		finalViteConfig.css.preprocessorOptions ??= {};
		finalViteConfig.css.preprocessorOptions.scss ??= {};

		const scss = finalViteConfig.css.preprocessorOptions.scss;
		const importLine = `@use "${boxelsExtra.globalStyles}" as *;`;
		scss.additionalData = `${scss.additionalData ?? ''}\n${importLine}`;
	}

	return finalViteConfig;
}
