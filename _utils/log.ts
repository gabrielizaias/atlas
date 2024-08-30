import { ConsoleHandler, getLogger, setup } from "@std/log";

setup({
	handlers: {
		console: new ConsoleHandler("DEBUG"),
	},
	loggers: {
		"atlas": {
			level: "DEBUG",
			handlers: ["console"],
		},
	},
});

export const logger = getLogger("atlas");
