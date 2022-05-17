class Sphere {
	constructor(center, radius, material) {
		this.center = center;
		this.radius = radius;
		this.material = material;
	}

	intersect(ray) {
		const cp = sub(ray.origin, this.center);

		const a = dot(ray.direction, ray.direction);
		const b = 2 * dot(cp, ray.direction);
		const c = dot(cp, cp) - this.radius * this.radius;

		const discriminant = b * b - 4 * a * c;
		if (discriminant < 0) {
			return null;
		}

		const sqrt = Math.sqrt(discriminant);
		const ts = [];

		const subbed = (-b - sqrt) / (2 * a);
		if (subbed >= 0) {
			ts.push(subbed);
		}

		const added = (-b + sqrt) / (2 * a);
		if (added >= 0) {
			ts.push(added);
		}

		if (ts.length === 0) {
			return null;
		}

		return Math.min(...ts);
	}

	normalAt(point) {
		return unit(sub(point, this.center));
	}
}
