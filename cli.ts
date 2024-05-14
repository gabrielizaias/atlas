import { logger, parseArgs } from "./deps.ts";
import { type Command } from "./console/mod.ts";

/**
 * Initializes an Atlas application
 */
const init: Command = {
	name: "init",
	description: "Initializes an Atlas application",
	handler: () => {
		// TBD
		logger.info("`atlas init` command not implemented yet");
	},
};

/**
 * Starts an Atlas application
 */
const start: Command = {
	name: "start",
	description: "Starts an Atlas application",
	help: `
  --port  The port where to start the application listener
  `,
	handler: () => {
		// TBD
		logger.info("`atlas start` command not implemented yet");
	},
};

if (import.meta.main) {
	const commands = new Map<Command["name"], Command>([
		[init.name, init],
		[start.name, start],
	]);

	const command = Deno.args[0] ?? "";
	const args = parseArgs(Deno.args.slice(1));

	if (commands.has(command)) {
		try {
			await commands.get(command)?.handler(args);
		} catch (err: unknown) {
			logger.error(`command '${command}' failed with message: ${(err as Error).message}`, {
				err,
				command,
			});
		}
	} else {
		logger.error(`command '${command}' not found`, { command });
	}
}
