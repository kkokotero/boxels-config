import { signal } from 'boxels/core';

import styles from './main.module.css';
import { mount } from 'boxels/dom';

import Button from "./Button.box"

export const App = () => {
	const count = signal(0);

	return (
		<main class={styles.container}>
			<h1>__PROJECT_NAME__</h1>

			<section class={styles.counter}>
				<p class={styles.countDisplay}>
					{count}
				</p>

				<div class={styles.actions}>
					<button
						type="button"
						aria-label="Disminuir contador"
						$on:click={() => count.update((c) => c - 1)}
					>
						Disminuir
					</button>
					<Button>
						Saludos
					</Button>
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
