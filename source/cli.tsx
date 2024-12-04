#!/usr/bin/env node
import Pastel from 'pastel';

process.removeAllListeners('warning');
process.on('warning', warning => {
	if (
		warning.name === 'ExperimentalWarning' ||
		warning.name === 'DeprecationWarning'
	) {
		// Ignore these warnings
	} else {
		// Print other warnings
		console.warn(warning);
	}
});

const app = new Pastel({
	importMeta: import.meta,
});

await app.run();
