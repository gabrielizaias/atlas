import { notFound, redirect, Router, start } from "@atlasland/http";

const router = new Router();

router.get("/", () => {
	return {
		message: "A GET handler",
	};
});

router.post("/", () => {
	return {
		message: "A POST handler",
	};
});

router.get("/:id", (_request, { params }) => {
	return {
		id: params?.id,
	};
});

router.get("/:category/:subcategory", (_request, { params }) => {
	return {
		category: params?.category,
		subcategory: params?.subcategory,
	};
});

router.get("/404", () => {
	return notFound();
});

router.get("/search", () => {
	return redirect("https://www.google.com");
});

router.get("/redirect", () => {
	return redirect("/computers/laptops", 308);
});

router.get("/fail", () => {
	throw new Error("Failed to do something!");
});

await start(router);
