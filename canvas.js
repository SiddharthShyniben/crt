class Image {
	constructor(w, h) {
		this.w = w;
		this.h = h;

		this.canvas = this._createCanvas();
	}

	_createCanvas() {
		const canvas = document.querySelector('canvas');
		canvas.setAttribute('width', this.w);
		canvas.setAttribute('height', this.h);

		const context = canvas.getContext('2d');
		const imageData = context.getImageData(0, 0, this.w, this.h);
		const pixels = imageData.data;

		return {
			canvas,
			context,
			imageData,
			pixels
		};
	}

	putPixel(x, y, color) {
		const offset = (y * this.w + x) * 4;
		this.canvas.pixels[offset    ] = color.r | 0;
		this.canvas.pixels[offset + 1] = color.g | 0;
		this.canvas.pixels[offset + 2] = color.b | 0;
		this.canvas.pixels[offset + 3] = 255;
	}

	render() {
		this.canvas.context.putImageData(
			this.canvas.imageData,
			0,
			0
		);
	}
}
