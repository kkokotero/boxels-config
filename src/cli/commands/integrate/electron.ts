import { execSync } from 'node:child_process';
import { program } from '@cli/program';
import { logger } from '@utils/index';
import fs from 'node:fs';
import path from 'node:path';

program
	.command('integrate:electron', 'Integra Electron al proyecto actual.')
	.action(() => {
		try {
			logger.info('Instalando dependencias de Electron...');
			execSync('npm install --save-dev electron electron-builder', {
				stdio: 'inherit',
			});

			logger.info('Creando estructura base de Electron...');

			// Carpeta electron
			const electronDir = path.resolve(process.cwd(), 'electron');
			if (!fs.existsSync(electronDir)) {
				fs.mkdirSync(electronDir);
			}

			// main.js
			const mainFile = path.join(electronDir, 'main.js');
			if (!fs.existsSync(mainFile)) {
				fs.writeFileSync(
					mainFile,
					`
impoort { app, BrowserWindow } from 'electron';

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: 'preload.js'
    }
  });

  win.loadFile('../dist/index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});`,
				);
			}

			// preload.js
			const preloadFile = path.join(electronDir, 'preload.js');
			if (!fs.existsSync(preloadFile)) {
				fs.writeFileSync(
					preloadFile,
					`
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(\`\${dependency}-version\`, process.versions[dependency]);
  }
});`,
				);
			}

			// Modificar package.json
			const pkgPath = path.resolve(process.cwd(), 'package.json');
			const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

			pkg.main = 'electron/main.js';
			pkg.scripts = {
				...pkg.scripts,
				'electron:dev': 'electron .',
				'electron:build': 'electron-builder',
			};
			pkg.build = {
				appId: 'com.example.app',
				productName: pkg.name || 'MyApp',
				directories: {
					output: 'release',
				},
				files: ['dist/**/*', 'electron/**/*'],
			};

			fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

			logger.success('Integración con Electron completada.');
			logger.info(
				'Ejecuta "npm run electron:dev" para iniciar la app en modo escritorio.',
			);
		} catch (e) {
			logger.error('Error durante la integración con Electron.');
			logger.error(e);
			process.exit(1);
		}
	});
