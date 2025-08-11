import type { AliasOptions, Plugin } from 'vite';

/**
 * Enumeración de los modos de ejecución soportados por Boxels.
 * Incluye `test` para facilitar entornos de prueba.
 */
export enum ModeEnum {
	development = 'development',
	production = 'production',
	test = 'test',
}

/**
 * Tipo literal union de los modos de ejecución (`"development" | "production" | "test"`).
 */
export type Mode = `${ModeEnum}`;

/**
 * Interfaz principal de configuración para Boxels.
 *
 * Esta configuración de más alto nivel será transformada en la configuración
 * compatible con Vite.
 */
export interface BoxelsConfig {
	/**
	 * Alias de rutas (igual a `resolve.alias` de Vite).
	 */
	alias?: AliasOptions;

	/**
	 * Constantes globales definidas en tiempo de compilación (`define` de Vite).
	 */
	define?: Record<string, unknown>;

	exclude?: string[];
	include?: string[];

	/**
	 * Ruta al archivo de estilos globales del proyecto.
	 */
	globalStyles?: string;

	/**
	 * Lista de plugins adicionales a aplicar (Vite o personalizados).
	 */
	plugins?: Array<Plugin>;

	/**
	 * Ruta al directorio público para archivos estáticos.
	 */
	publicDir?: string;

	/**
	 * Ruta raíz del proyecto (como `root` en Vite).
	 */
	root?: string;

	/**
	 * Configuración del servidor de desarrollo.
	 */
	server?: {
		host?: string | boolean;
		open?: boolean;
		port?: number;
		strictPort?: boolean;
	};

	/**
	 * Configuración de la construcción (`build` de Vite).
	 */
	build?: {
		chunkSizeErrorLimit?: number;
		chunkSizeWarningLimit?: number;
		emptyOutDir?: boolean;
		input?: string;
		manifest?: boolean;
		outDir?: string;
		target?: string;
	};
}

// Re-exporta el tipo Plugin para facilitar extensibilidad
export type { Plugin };

/**
 * Metadatos del CLI y del sistema interno de Boxels.
 */
export const metadata = {
	name: 'box',
	version: '1.0.0',
};
