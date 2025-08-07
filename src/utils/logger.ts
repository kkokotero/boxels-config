import signale from 'signale';

const { Signale } = signale;

/**
 * A custom logger class that extends the `Signale` logger.
 * 
 * This class adds utility logging methods on top of Signale:
 * - `table()`: Logs tabular data using `console.table`.
 * - `blank()`: Prints an empty line to the console.
 * 
 * `Signale` provides advanced logging features with support for scopes,
 * timestamps, and colored output. `CustomLogger` enhances it for richer
 * developer experience during CLI tool or development library use.
 *
 * @example
 * ```ts
 * import { logger } from './logger';
 * 
 * logger.info('Starting application...');
 * logger.table([{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }]);
 * logger.blank();
 * logger.success('App started successfully!');
 * ```
 */
export class CustomLogger extends Signale {
    /**
     * Log data in a table format.
     * Useful for visualizing arrays of objects or key-value pairs.
     *
     * @param data - Any number of arguments to pass to `console.table`.
     *
     * @example
     * ```ts
     * logger.table([
     *   { name: 'Alice', score: 95 },
     *   { name: 'Bob', score: 82 },
     * ]);
     * ```
     */
    table(...data: unknown[]) {
        console.table(...data);
    }

    /**
     * Prints a blank line to the console.
     * Useful for spacing logs for better readability.
     *
     * @example
     * ```ts
     * logger.info('Step 1 completed.');
     * logger.blank();
     * logger.info('Proceeding to step 2...');
     * ```
     */
    blank() {
        console.log('');
    }
}

/**
 * A pre-configured logger instance scoped to "boxels".
 *
 * This instance includes:
 * - A scope name: `"boxels"`, for grouping related logs.
 * - Timestamp display enabled via Signale's config.
 *
 * @example
 * ```ts
 * import logger from './logger';
 * 
 * logger.pending('Initializing...');
 * logger.success('Initialization complete!');
 * logger.warn('This is a warning');
 * logger.error('Something went wrong');
 * ```
 */
export const logger = new CustomLogger({
    scope: 'boxels',
    // Uncomment the following line if you want interactivity only when in a TTY:
    // interactive: process.stdout.isTTY,
    config: {
        displayTimestamp: true, // Show timestamps in log output
    },
});