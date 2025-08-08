import { mount, signal } from 'boxels/core';

import styles from './main.module.css';

export const App = () => {
	const count = signal(0);

	return (
		<main class={styles.container}>
			<h1>__PROJECT_NAME__</h1>

			<section class={styles.counter}>
				<h2>Contador</h2>
				<p aria-live="polite" class="count-display">
					{count}
				</p>

				<div class="actions">
					<button
						type="button"
						aria-label="Disminuir contador"
						$on:click={() => count.update((c) => c - 1)}
					>
						Disminuir
					</button>
					<input
						type="number"
						$on:input={(e) => {
							const value = (e.target as HTMLInputElement).value;
							count.set(Number.parseInt(value !== '' ? value : '0'));
						}}
						value={count}
					/>
					<button
						type="button"
						aria-label="Aumentar contador"
						$on:click={() => count.update((c) => c + 1)}
					>
						Aumentar
					</button>
				</div>
			</section>
		</main>
	);
};

mount(document.body, <App />);
