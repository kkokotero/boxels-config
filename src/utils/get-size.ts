import { promises as fs } from 'node:fs';
import * as path from 'node:path';

/**
 * Formatea un tamaño en bytes a una cadena legible (e.g., "10.5 MB").
 *
 * @param bytes - Tamaño en bytes
 * @returns Tamaño formateado como cadena
 */
export function formatSize(bytesSize: number): string {
	let bytes = bytesSize;
	const units = ['B', 'KB', 'MB', 'GB', 'TB'];
	let index = 0;

	while (bytes >= 1024 && index < units.length - 1) {
		bytes /= 1024;
		index++;
	}

	return `${bytes.toFixed(2)} ${units[index]}`;
}

/**
 * Obtiene el tamaño total de un archivo o directorio como cadena legible.
 *
 * @param filePath - Ruta al archivo o directorio
 * @returns Tamaño formateado como cadena (ej. "12.34 MB")
 */
export async function getFileSize(filePath: string): Promise<string> {
	try {
		const stats = await fs.stat(filePath);
		const sizeInBytes = stats.isDirectory()
			? await getDirSize(filePath)
			: stats.size;

		return formatSize(sizeInBytes);
	} catch (err) {
		throw new Error(
			`No se pudo obtener el tamaño de "${filePath}": ${String(err)}`,
		);
	}
}

/**
 * Calcula recursivamente el tamaño total de un directorio en bytes.
 *
 * @param dir - Ruta al directorio
 * @returns Tamaño en bytes
 */
export async function getDirSize(dir: string): Promise<number> {
	let total = 0;

	try {
		const entries = await fs.readdir(dir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);

			if (entry.isDirectory()) {
				total += await getDirSize(fullPath);
			} else if (entry.isFile()) {
				const { size } = await fs.stat(fullPath);
				total += size;
			}
		}
	} catch (err) {
		throw new Error(
			`No se pudo calcular el tamaño del directorio "${dir}": ${String(err)}`,
		);
	}

	return total;
}
