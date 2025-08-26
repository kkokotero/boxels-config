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
	appendFileSync,
} from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { execSync } from 'node:child_process';
import { bold, cyan, red, green } from 'kolorist';
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

const __dirname = dirname(fileURLToPath(import.meta.url));

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

	outro(green(`✔ Proyecto ${bold(opciones.nombre)} creado con éxito`));
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
	if (!/^[a-zA-Z0-9-_]+$/.test(opciones.nombre))
		errores.push('El nombre solo puede contener letras, números, guiones y guiones bajos.');
	if (!ESTILOS_VALIDOS.includes(opciones.estilos as any))
		errores.push(
			`Estilo inválido: "${opciones.estilos}". Opciones válidas: ${ESTILOS_VALIDOS.join(', ')}`,
		);

	return errores;
}

// ==========================
// Generar estructura del proyecto
// ==========================

function encontrarDirectorioTemplates(): string | null {
	let actual = __dirname;

	while (true) {
		const posible = join(actual, 'templates');
		if (existsSync(posible)) return posible;

		const padre = dirname(actual);
		if (padre === actual) break;
		actual = padre;
	}

	return null;
}

async function generarProyecto(opciones: OpcionesUsuarioProyecto, destino: string) {
	const s = spinner();
	s.start('Generando proyecto...');

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

	cpSync(directorioPlantilla, destino, { recursive: true });

	// ✅ Ajustar gitignore
	ajustarGitignore(destino);

	// ✅ Transformar extensiones de estilos
	const extension = obtenerExtensionEstilo(opciones.estilos);
	transformarExtensionesEstilo(destino, '.css', extension);

	// ✅ Reemplazar placeholders
	reemplazarEnArchivos(destino, {
		__PROJECT_NAME__: opciones.nombre,
		__PROJECT_SLUG__: opciones.nombre.toLowerCase().replace(/\s+/g, '-'),
	});

	s.stop('Proyecto generado.');
}

// ==========================
// Ajuste de gitignore
// ==========================

function ajustarGitignore(destino: string) {
	const gitignorePath = join(destino, '.gitignore');
	const plantillaGitignore = join(destino, 'gitignore');

	if (existsSync(plantillaGitignore)) {
		if (!existsSync(gitignorePath)) {
			renameSync(plantillaGitignore, gitignorePath);
		} else {
			// Merge en caso de que exista uno
			const nuevoContenido = readFileSync(plantillaGitignore, 'utf8');
			appendFileSync(gitignorePath, `\n# Desde plantilla\n${nuevoContenido}`);
			// Elimina el archivo temporal
			writeFileSync(plantillaGitignore, '', 'utf8');
		}
	}
}

// ==========================
// Utilidades de transformación
// ==========================

function obtenerExtensionEstilo(ext: string): string {
	if (ext === 'scss' || ext === 'sass') return `.module.${ext}`;
	return `.${ext}`;
}

function reemplazarEnArchivos(dir: string, reemplazos: Record<string, string>) {
	for (const entrada of readdirSync(dir, { withFileTypes: true })) {
		const ruta = join(dir, entrada.name);
		if (entrada.isDirectory()) {
			reemplazarEnArchivos(ruta, reemplazos);
		} else {
			let contenido = readFileSync(ruta, 'utf8');
			for (const [clave, valor] of Object.entries(reemplazos)) {
				contenido = contenido.replaceAll(clave, valor);
			}
			writeFileSync(ruta, contenido, 'utf8');
		}
	}
}

function transformarExtensionesEstilo(dir: string, desdeExt: string, hastaExt: string) {
	for (const entrada of readdirSync(dir, { withFileTypes: true })) {
		const ruta = join(dir, entrada.name);

		if (entrada.isDirectory()) {
			transformarExtensionesEstilo(ruta, desdeExt, hastaExt);
		} else if (entrada.name.endsWith(desdeExt)) {
			const nuevaRuta = ruta.replace(desdeExt, hastaExt);
			renameSync(ruta, nuevaRuta);

			// Actualiza referencias en TSX/JSX
			if (/\.(ts|tsx|js|jsx)$/.test(entrada.name)) {
				let contenido = readFileSync(nuevaRuta, 'utf8');
				const regex = new RegExp(`(['"\`])([^'"\`]+)\\${desdeExt}\\1`, 'g');
				contenido = contenido.replace(regex, (_m, q, p) => `${q}${p}${hastaExt}${q}`);
				writeFileSync(nuevaRuta, contenido, 'utf8');
			}
		}
	}
}

// ==========================
// Instalación de dependencias
// ==========================

async function instalarDependencias(destino: string) {
	const s = spinner();
	s.start('Instalando dependencias...');
	try {
		execSync('npm install', { cwd: destino, stdio: 'ignore' });
		s.stop('Dependencias instaladas.');
	} catch {
		s.stop(red('Falló la instalación automática.'));
	}
}

// ==========================
// Inicializar repositorio Git
// ==========================

async function inicializarRepositorioGit(destino: string) {
	try {
		execSync('git --version', { stdio: 'ignore' });
		if (!existsSync(join(destino, '.git'))) {
			execSync('git init', { cwd: destino, stdio: 'ignore' });
			execSync('git add .', { cwd: destino, stdio: 'ignore' });
			execSync('git commit -m "Initial commit"', { cwd: destino, stdio: 'ignore' });
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
