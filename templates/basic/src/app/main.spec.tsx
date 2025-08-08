import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/dom';
import { mount } from 'boxels/core';
import { flushNow } from 'boxels/testing';

import { App } from './main.tsx';

describe('App', () => {
	beforeEach(() => {
        flushNow();
		document.body.innerHTML = ''; 
		mount(document.body, <App />);
	});

	it('muestra el título del proyecto', () => {
		expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
			'sermental',
		);
	});

	it('inicializa el contador en 0', () => {
		expect(screen.getByText('0')).toBeInTheDocument();
	});

	it('aumenta el contador al hacer clic en "Aumentar"', async () => {
		const btn = screen.getByRole('button', { name: /aumentar/i });
		await fireEvent.click(btn);
		expect(screen.getByText('1')).toBeInTheDocument();
	});

	it('disminuye el contador al hacer clic en "Disminuir"', async () => {
		const btn = screen.getByRole('button', { name: /disminuir/i });
		await fireEvent.click(btn);
		expect(screen.getByText('-1')).toBeInTheDocument();
	});

	it('cambia el valor del contador al ingresar un número', async () => {
		const input = screen.getByRole('spinbutton') as HTMLInputElement;
		await fireEvent.input(input, { target: { value: '42' } });
		expect(screen.getByText('42')).toBeInTheDocument();
	});
});
