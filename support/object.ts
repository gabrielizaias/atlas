/**
 * Determine the internal [object Class] of a Javascript object.
 * @example
 * const x = "test";
 * console.log(x.toString); // "[object String]"
 * console.log(getType(x); // "string"
 */
export function getType<T>(item: T) {
	return Object.prototype.toString
		.call(item)
		.replace(/(?:^\[object\s(.*?)\]$)/, "$1")
		.toLowerCase();
}
