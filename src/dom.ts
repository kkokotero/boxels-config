import { expect } from 'vitest';
import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';

import { parseHTML } from 'linkedom';

expect.extend(matchers);

const { window } = parseHTML('<!doctype html><html><body></body></html>');

globalThis.window = window;
globalThis.document = window.document;
globalThis.HTMLElement = window.HTMLElement;
globalThis.customElements = window.customElements;
globalThis.Node = window.Node;
globalThis.SVGElement = window.SVGElement;
globalThis.localStorage = window.localStorage;
globalThis.sessionStorage = window.sessionStorage;
globalThis.DocumentFragment = window.DocumentFragment;
globalThis.Comment = window.Comment;

// ✅ Mock IntersectionObserver
globalThis.IntersectionObserver = class IntersectionObserver {
	root: Element | null = null;
	rootMargin = '';
	thresholds: ReadonlyArray<number> = [];

	constructor(public callback: IntersectionObserverCallback, public options?: IntersectionObserverInit) {}

	observe(_target: Element) {}
	unobserve(_target: Element) {}
	disconnect() {}
	takeRecords(): IntersectionObserverEntry[] {
		return [];
	}
};

// ✅ Mock window.location como URL con métodos
Object.defineProperty(window, 'location', {
	value: {
		...new URL('http://localhost/'),
		assign: () => {},
		reload: () => {},
		replace: () => {},
		toString: () => 'http://localhost/',
	},
	writable: true,
});
