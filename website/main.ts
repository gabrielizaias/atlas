import { logger } from "../_utils/log.ts";
import { serveFile } from "@std/http/file-server";

// set cwd for deno deploy
const cwd = Deno.cwd().includes("website") ? Deno.cwd() : `${Deno.cwd()}/website`;

const config = {
	pages: {
		dir: `${cwd}/pages`,
		layout: "_layout.html",
		"404": "_404.html",
		"500": "_500.html",
		// global props and regexes to parse them from a page's content
		props: {
			title: /<!-- title: (.*) -->/,
			meta_description: /<!-- meta_description: (.*) -->/,
			canonical: /<!-- canonical: (.*) -->/,
			og_type: /<!-- og_type: (.*) -->/,
			og_image: /<!-- og_image: (.*) -->/,
		},
	},
};

async function handler(request: Request): Promise<Response> {
	const { pathname, search } = new URL(request.url);

	// response status
	let status = 200;

	// response headers
	let headers: Record<string, string> = {
		"content-type": "text/html",
	};

	let content: string | null = null;

	// TODO: enable nested layouts
	const layout = await Deno.readTextFile(
		`${config.pages.dir}/${config.pages.layout}`,
	);

	try {
		// static assets
		if (pathname.startsWith("/public/")) {
			const response = await serveFile(request, `${cwd}/${pathname}`);
			// TODO: fingerprint assets for longer cache TTL + immutable
			response.headers.set(
				"cache-control",
				"public, max-age=900, stale-while-revalidate=900",
			);
			return response;
		} // api (deno doc)
		else if (pathname.startsWith("/api")) {
			// parse module path from URL
			const mod = pathname.replace("/api", "");
			status = 307;
			headers = {
				...headers,
				"location": `https://jsr.io/@atlasland/atlas/doc${mod}/~`,
			};
		} // docs
		else if (pathname === "/docs") {
			const versions = [];
			for await (
				const entry of Deno.readDir(`${config.pages.dir}${pathname}`)
			) {
				if (entry.isDirectory) {
					// TODO: expose all versions to frontend for a dropdown selector
					versions.push(entry);
				}
			}

			status = 307;
			headers = {
				...headers,
				// redirect to latest version
				"location": `/docs/${versions.at(-1)?.name}`,
			};
		} // other routes
		else {
			// try /[route].html first
			try {
				content = await Deno.readTextFile(
					`${config.pages.dir}${pathname}.html`,
				);
			} // fallback to `/[route]/index.html`
			catch (error: unknown) {
				if ((error as Error).name === "NotFound") {
					content = await Deno.readTextFile(
						`${config.pages.dir}${pathname}/index.html`,
					);
				}
			}

			headers = {
				...headers,
				"cache-control": "public, max-age=900, stale-while-revalidate=900",
			};
		}

		const payload = render(layout, {
			// "props" data from child pages
			...parseProps(content ?? "", config.pages.props),
			content,
		});

		return new Response(payload, {
			status,
			headers,
		});
	} catch (error: unknown) {
		logger.error(error);

		// 404
		if ((error as Error).name === "NotFound") {
			status = 404;
			content = await Deno.readTextFile(
				`${config.pages.dir}/${config.pages["404"]}`,
			);
		} // 500
		else {
			status = 500;
			content = await Deno.readTextFile(
				`${config.pages.dir}/${config.pages["500"]}`,
			);
		}

		const payload = render(layout, {
			...parseProps(content ?? "", config.pages.props),
			content,
		});

		return new Response(payload, {
			status,
			headers,
		});
	} finally {
		logger.info(`${status} ${request.method} ${pathname}${search}`);
	}
}

/**
 * Renders a template into a string to be sent as response
 * @param template The template string
 * @param props The properties to inject into the template
 */
function render(
	template: string | null,
	props: Record<string, string | number | null | undefined> = {},
): string | null {
	let rendered = template;

	if (rendered) {
		for (const key in props) {
			const value = props[key];

			if (!value) {
				continue;
			}

			if (Object.hasOwn(props, key)) {
				rendered = (rendered ?? "").replaceAll(`{{ ${key} }}`, value.toString());
			}
		}
	}

	return rendered;
}

function parseProps<T>(
	content: string,
	props: Record<keyof T, RegExp>,
): Record<keyof T, string> {
	// @ts-ignore: not sure how to type this tbh
	let parsed: Record<keyof T, string> = {};

	for (const key in props) {
		if (Object.hasOwn(props, key)) {
			// parse the actual value using the RegExp provided
			const value = content?.match(props[key])?.at(1);

			if (!value) {
				continue;
			}

			parsed = {
				...parsed,
				[key]: value,
			};
		}
	}

	return parsed;
}

Deno.serve(handler);
