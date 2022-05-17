const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);

const Vector = Symbol('Vector');
const vector = (x = 0, y = x, z = x) => {
	if (x[Vector]) return x;

	return {
		x, y, z,
		[Vector]: true,
	}
}
const vectorFn = fn => (...args) => fn(...args.map(x => vector(x)));

// core
const add = vectorFn((a, b) => vector(a.x + b.x, a.y + b.y, a.z + b.z));
const sub = vectorFn((a, b) => vector(a.x - b.x, a.y - b.y, a.z - b.z));
const mul = vectorFn((a, b) => vector(a.x * b.x, a.y * b.y, a.z * b.z));
const div = vectorFn((a, b) => vector(a.x / b.x, a.y / b.y, a.z / b.z));

const neg = vectorFn(a => vector(-a.x, -a.y, -a.z));
const dot = vectorFn((a, b) => a.x * b.x + a.y * b.y + a.z * b.z);
const cross = vectorFn((a, b) => vector(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x));
const unit = vectorFn(a => div(a, length(a)));

const lerp = vectorFn((start, end, t) => add(mul(start, sub(1, t)), mul(end, t)));
const floor = vectorFn(a => vector(Math.floor(a.x), Math.floor(a.y), Math.floor(a.z)));
const lengthSquared = vectorFn(a => dot(a, a));
const length = vectorFn(a => Math.sqrt(lengthSquared(a)));
const clamp = vectorFn((vec, min, max) => vector(clampValue(vec.x, min.x, max.x), clampValue(vec.y, min.y, max.y), clampValue(vec.z, min.z, max.z)));

// util
const toColor = vectorFn(a => ({r: a.x, g: a.y, b: a.z}));
const colorify = vectorFn(a => toColor(floor(mul(a, 255))));
