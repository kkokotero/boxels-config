import {
	intro,
	outro,
	text,
	select,
	confirm,
	spinner,
	isCancel,
} from '@clack/prompts';
import {
	existsSync,
	cpSync,
	readdirSync,
	readFileSync,
	writeFileSync,
	renameSync,
} from 'node:fs';
import { resolve,dirname, join } from 'node:path';
import { execSync } from 'node:child_process';
import { bold, cyan, red } from 'kolorist';
import { program } from '@cli/program';
import { fileURLToPath } from 'node:url';

// ==========================
// Constantes y tipos
// ==========================

const ESTILOS_VALIDOS = ['css', 'scss', 'sass'] as const;

interface OpcionesUsuarioProyecto {
	nombre: string;
	plantilla: string;
	estilos: string;
	instalar: boolean;
}

// ==========================
// Función principal
// ==========================

export async function crearNuevoProyecto(inicial: Partial<OpcionesUsuarioProyecto>) {
	intro(`${cyan('Boxels')} - Crear nuevo proyecto`);

	const opciones = await pedirDetallesProyecto(inicial);
	if (!opciones) return outro('Operación cancelada.');

	const errores = validarOpciones(opciones);
	if (errores.length > 0) {
		outro(red(`Error: \n${errores.join('\n')}`));
		process.exit(1);
	}

	const directorioDestino = resolve(process.cwd(), opciones.nombre);
	if (existsSync(directorioDestino)) {
		outro(red('Error: El directorio ya existe.'));
		process.exit(1);
	}

	await generarProyecto(opciones, directorioDestino);

	if (opciones.instalar) {
		await instalarDependencias(directorioDestino);
	}

	await inicializarRepositorioGit(directorioDestino);

	outro(`Proyecto ${bold(opciones.nombre)} creado con éxito`);
}

// ==========================
// Prompts interactivos
// ==========================

async function pedirDetallesProyecto(
	inicial: Partial<OpcionesUsuarioProyecto>,
): Promise<OpcionesUsuarioProyecto | null> {
	let nombre = inicial.nombre;
	if (!nombre) {
		nombre = String(await text({
			message: 'Nombre del proyecto:',
			placeholder: 'mi-app',
			validate: (v) => (!v ? 'El nombre es requerido' : undefined),
		}));
		if (isCancel(nombre)) return null;
	}

	let plantilla = inicial.plantilla;
	if (!plantilla) {
		plantilla = String(await select({
			message: 'Selecciona una plantilla:',
			options: [
				{ value: 'basic', label: 'Proyecto básico' },
				{ value: 'routing', label: 'Proyecto con rutas (SPA)' },
			],
		}));
		if (isCancel(plantilla)) return null;
	}

	let estilos = inicial.estilos;
	if (!estilos || !ESTILOS_VALIDOS.includes(estilos as any)) {
		estilos = String(await select({
			message: 'Formato de estilos:',
			options: ESTILOS_VALIDOS.map((s) => ({
				value: s,
				label:
					s === 'scss' ? 'SCSS (module)' :
					s === 'sass' ? 'SASS (module)' :
					s.toUpperCase(),
			})),
		}));
		if (isCancel(estilos)) return null;
	}

	let instalar = inicial.instalar;
	if (instalar === undefined) {
		instalar = Boolean(await confirm({
			message: '¿Instalar dependencias?',
			initialValue: true,
		}));
		if (isCancel(instalar)) return null;
	}

	return {
		nombre: String(nombre),
		plantilla: String(plantilla),
		estilos: String(estilos),
		instalar: Boolean(instalar),
	};
}

// ==========================
// Validación
// ==========================

function validarOpciones(opciones: OpcionesUsuarioProyecto): string[] {
	const errores: string[] = [];

	if (!opciones.nombre.trim()) errores.push('El nombre no puede estar vacío.');
	if (!ESTILOS_VALIDOS.includes(opciones.estilos as any))
		errores.push(
			`Estilo inválido: "${opciones.estilos}". Opciones válidas: ${ESTILOS_VALIDOS.join(', ')}`,
		);

	return errores;
}

// ==========================
// Generar estructura del proyecto
// ==========================

const __dirname = dirname(fileURLToPath(import.meta.url));

function encontrarDirectorioTemplates(): string | null {
	let actual = __dirname;

	while (true) {
		const posible = join(actual, 'templates');
		if (existsSync(posible)) {
			return posible;
		}

		const padre = dirname(actual);
		if (padre === actual) break; // llegó a la raíz
		actual = padre;
	}

	return null;
}

export async function generarProyecto(opciones: OpcionesUsuarioProyecto, directorioDestino: string) {
	const raizTemplates = encontrarDirectorioTemplates();

	if (!raizTemplates) {
		outro('No se encontró el directorio "templates".');
		process.exit(1);
	}

	const directorioPlantilla = join(raizTemplates, opciones.plantilla);

	if (!existsSync(directorioPlantilla)) {
		outro(red(`Plantilla no encontrada: ${opciones.plantilla}`));
		process.exit(1);
	}

	cpSync(directorioPlantilla, directorioDestino, { recursive: true });

	const extension = obtenerExtensionEstilo(opciones.estilos);
	transformarExtensionesEstilo(directorioDestino, '.css', extension);

	reemplazarEnArchivos(directorioDestino, {
		__PROJECT_NAME__: opciones.nombre,
		__PROJECT_SLUG__: opciones.nombre.toLowerCase().replace(/\s+/g, '-'),
	});
}
// ==========================
// Utilidades de transformación
// ==========================

function obtenerExtensionEstilo(ext: string): string {
	if (ext === 'scss' || ext === 'sass') return `.module.${ext}`;
	return `.${ext}`;
}

function reemplazarEnArchivos(dir: string, reemplazos: Record<string, string>) {
	const entradas = readdirSync(dir, { withFileTypes: true });

	for (const entrada of entradas) {
		const rutaCompleta = join(dir, entrada.name);

		if (entrada.isDirectory()) {
			reemplazarEnArchivos(rutaCompleta, reemplazos);
		} else if (entrada.isFile()) {
			let contenido = readFileSync(rutaCompleta, 'utf8');
			for (const [clave, valor] of Object.entries(reemplazos)) {
				contenido = contenido.replaceAll(clave, valor);
			}
			writeFileSync(rutaCompleta, contenido, 'utf8');
		}
	}
}

function transformarExtensionesEstilo(dir: string, desdeExt: string, hastaExt: string) {
	const entradas = readdirSync(dir, { withFileTypes: true });

	for (const entrada of entradas) {
		const rutaCompleta = join(dir, entrada.name);

		if (entrada.isDirectory()) {
			transformarExtensionesEstilo(rutaCompleta, desdeExt, hastaExt);
		} else if (entrada.isFile()) {
			if (entrada.name.endsWith(desdeExt)) {
				const nuevaRuta = rutaCompleta.replace(desdeExt, hastaExt);
				renameSync(rutaCompleta, nuevaRuta);
			}

			if (/\.(ts|tsx|js|jsx)$/.test(entrada.name)) {
				let contenido = readFileSync(rutaCompleta, 'utf8');
				const regex = new RegExp(`(['"\`])([^'"\`]+)\\${desdeExt}\\1`, 'g');
				const actualizado = contenido.replace(regex, (_m, q, p) => `${q}${p}${hastaExt}${q}`);
				if (contenido !== actualizado) writeFileSync(rutaCompleta, actualizado, 'utf8');
			}
		}
	}
}

// ==========================
// Instalación de dependencias
// ==========================

async function instalarDependencias(directorioDestino: string) {
	const s = spinner();
	s.start('Instalando dependencias...');
	try {
		execSync('npm install', { cwd: directorioDestino, stdio: 'ignore' });
		s.stop('Dependencias instaladas.');
	} catch {
		s.stop('Falló la instalación automática.');
	}
}

// ==========================
// Inicializar repositorio Git
// ==========================

async function inicializarRepositorioGit(directorioDestino: string) {
	try {
		execSync('git --version', { stdio: 'ignore' });

		const dirGit = resolve(directorioDestino, '.git');
		if (!existsSync(dirGit)) {
			execSync('git init', { cwd: directorioDestino, stdio: 'ignore' });
			execSync('git add .', { cwd: directorioDestino, stdio: 'ignore' });
			execSync('git commit -m "Initial commit"', {
				cwd: directorioDestino,
				stdio: 'ignore',
			});
		}
	} catch {}
}

// ==========================
// Registro del comando CLI
// ==========================

program
	.command('new', 'Crea un nuevo proyecto de Boxels')
	.option('--name <name>', 'Nombre del proyecto')
	.option('--template <name>', 'Plantilla (basic, router...)')
	.option('--styles <name>', 'Estilos (css, scss...)')
	.option('--install', 'Instala las dependencias')
	.action(async (opciones) => {
		await crearNuevoProyecto(opciones);
	});