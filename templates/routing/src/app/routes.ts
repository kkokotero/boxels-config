import type { RouterConfig } from 'boxels/core';

import { AboutPage } from './pages/about/about.page';

export const routes: RouterConfig = {
	routes: [
		{
			path: '/',
			redirect: '/home',
		},
		{
			path: '/home',
			loadComponent: () =>
				import('./pages/home/home.page').then((m) => m.HomePage),
		},
        {
            path: '/about',
            component: AboutPage
        }
	],
    useViewTransitions: true,
};
