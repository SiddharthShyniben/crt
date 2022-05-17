const min = (f, xs) => xs.length ? xs.reduce((a, x) => f(x) < f(a) ? x : a) : null;

const WIDTH = 1024;
const HEIGHT = 768;

const NUM_SAMPLES_PER_DIRECTION = 2;
const NUM_SAMPLES_PER_PIXEL = NUM_SAMPLES_PER_DIRECTION * NUM_SAMPLES_PER_DIRECTION;
const MAX_BOUNCES = 3;

class Ray {
	constructor(origin, direction) {
		this.origin = origin;
		this.direction = direction;
	}

	at(t) {
		return add(this.origin, mul(t, this.direction));
	}
}

class RayTracer {
	constructor(scene, w, h) {
		this.scene = scene;
		this.w = w;
		this.h = h;
	}

	tracedValueAtPixel(x, y) {
		let color = vector(0);

		for (let dx = 0; dx < NUM_SAMPLES_PER_DIRECTION; dx++) {
			for (let dy = 0; dy < NUM_SAMPLES_PER_DIRECTION; dy++) {
				const ray = this._rayFor(x + dx / NUM_SAMPLES_PER_DIRECTION, y + dy / NUM_SAMPLES_PER_DIRECTION);
				const tracedValue = this._tracedValueForRay(ray, 0);
				color = add(color, mul(tracedValue, 1 / NUM_SAMPLES_PER_PIXEL));
			}
		}

		return color;
	}

	_tracedValueForRay(ray, depth) {
		const f = ({t}) => t;
		const xs = this.scene.objects
			.map(object => {
				const t = object.intersect(ray);
				if (t === null) return null;

				const point = ray.at(t);

				return {
					object,
					t,
					point,
					normal: object.normalAt(point)
				}
			})
			.filter(t => t);

		const intersection = min(f, xs);
		if (!intersection) return vector(0);

		let color = this._colorAt(intersection);

		if (depth < MAX_BOUNCES) {
			const v = unit(neg(ray.direction));
			const r = sub(mul(mul(intersection.normal, 2), dot(v, intersection.normal)), v);

			const reflectedRay = new Ray(add(intersection.point, mul(0.01, intersection.normal)), r);

			const reflected = this._tracedValueForRay(reflectedRay, depth + 1);
			color = add(color, mul(reflected, intersection.object.material.kr));
		}

		return color;
	}

	_colorAt(intersection) {
		let color = vector(0);
		const material = intersection.object.material;

		const v = unit(sub(this.scene.camera, intersection.point));

		this.scene.lights.forEach(light => {
			const l = unit(sub(light.position, intersection.point));
			const lightInNormalDirection = dot(l, intersection.normal);

			if (lightInNormalDirection < 0) {
				return;
			}

			const isShadowed = this._isPointInShadowFromLight(
				intersection.point,
				intersection.object,
				light
			);
			if (isShadowed) {
				return;
			}

			const diffuse = mul(mul(material.kd, light.id), lightInNormalDirection);
			color = add(color, diffuse);

			const r = sub(mul(mul(intersection.normal, 2), lightInNormalDirection), l);

			const amountReflectedAtViewer = dot(r, v);
			const specular = mul(material.ks, mul(light.is, Math.pow(amountReflectedAtViewer, material.alpha)));
			color = add(color, specular);
		});

		const ambient = mul(material.ka, this.scene.ia);
		color = add(color, ambient);
		color = clamp(color, 0, 1);
		return color;
	}

	_isPointInShadowFromLight(point, objectToExclude, light) {
		const shadowRay = new Ray(
			point,
			sub(light.position, point)
		);

		for (const obj of this.scene.objects) {
			if (obj === objectToExclude) {
				continue;
			}

			const t = obj.intersect(shadowRay);
			if (t && t <= 1) {
				return true;
			}
		}

		return false;
	}


	_rayFor(x, y) {
		const {scene, w, h} = this;
		const xt = x / w;
		const yt = (h - y - 1) / h;

		const top = lerp(scene.imagePlane.topLeft, scene.imagePlane.topRight, xt);
		const bottom = lerp(scene.imagePlane.bottomLeft, scene.imagePlane.bottomRight, xt);

		const point = lerp(top, bottom, yt);
		return new Ray(point, sub(point, scene.camera))
	}
}

const scene = {
	camera: vector(0, 0, 2),
	imagePlane: {
		topLeft: vector(-1.28, 0.86, -0.5),
		topRight: vector(1.28, 0.86, -0.5),
		bottomLeft: vector(-1.28, -0.86, -0.5),
		bottomRight: vector(1.28, -0.86, -0.5),
	},
	ia: 0.5,
	objects: [
		new Sphere(
			vector(-1.1, 0.6, -1),
			0.2,
			{
				ka: vector(0.1, 0.1, 0.1),
				kd: vector(0.5, 0.5, 0.9),
				ks: vector(0.7, 0.7, 0.7),
				alpha: 20,
				kr: vector(0.1, 0.1, 0.2)
			}
		),
		new Sphere(
			vector(0.2, -0.1, -1),
			0.5,
			{
				ka: vector(0.1, 0.1, 0.1),
				kd: vector(0.9, 0.5, 0.5),
				ks: vector(0.7, 0.7, 0.7),
				alpha: 20,
				kr: vector(0.2, 0.1, 0.1)
			}
		),
		new Sphere(
			vector(1.2, -0.5, -1.75),
			0.4,
			{
				ka: vector(0.1, 0.1, 0.1),
				kd: vector(0.1, 0.5, 0.1),
				ks: vector(0.7, 0.7, 0.7),
				alpha: 20,
				kr: vector(0.8, 0.9, 0.8)
			}
		)
	],
	lights: [
		{
			position: vector(-3, -0.5, 1),
			id: vector(0.8, 0.3, 0.3),
			is: vector(0.8, 0.8, 0.8)
		},
		{
			position: vector(3, 2, 1),
			id: vector(0.4, 0.4, 0.9),
			is: vector(0.8, 0.8, 0.8)
		}
	]
}

const image = new Image(WIDTH, HEIGHT);
document.image = image;

const tracer = new RayTracer(scene, WIDTH, HEIGHT);

for (let y = 0; y < HEIGHT; y++) {
	for (let x = 0; x < WIDTH; x++) {
		const color = tracer.tracedValueAtPixel(x, y);
		image.putPixel(
			x,
			y,
			colorify(color)
		);
	}
	image.render();
}

