import { RouterOutlet } from 'boxels/components';
import { mount } from 'boxels/core';

import { routes } from './routes';

const App = () => {
	return (
		<>
			<a href="/home">Home</a><br />
			<a href="/about">About</a>
			<RouterOutlet config={routes} />
		</>
	);
};

mount(document.body, <App />);
