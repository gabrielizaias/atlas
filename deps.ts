export { parseArgs } from "https://deno.land/std@0.212.0/cli/parse_args.ts";

import {
	ConsoleHandler,
	formatters,
	getLogger,
	setup,
} from "https://deno.land/std@0.212.0/log/mod.ts";
setup({
	handlers: {
		default: new ConsoleHandler("DEBUG", {
			formatter: formatters.jsonFormatter,
		}),
	},
});
export const logger = getLogger();
