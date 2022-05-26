class Pixelator {
	constructor() {}

	noise(width, height) {
		let data = new Uint8ClampedArray(width * height * 4);
		for (let i = data.length / 2; i < data.length; i++) {
			data[i] = Math.floor(Math.random() * 256);
		}
		return data;
	}

	mandelbrot(width, height, max_iterations) {
		const data = new Uint8ClampedArray(width * height * 4);
		const data_len = data.length / 4;
		const x_min = -2;
		const x_max = 1;
		const y_min = -1;
		const y_max = 1;
		const x_step = (x_max - x_min) / width;
		const y_step = (y_max - y_min) / height;
		const x_offset = x_min;
		const y_offset = y_min;
		for (let i = 0; i < data_len; i++) {
			const x = x_offset + (i % width) * x_step;
			const y = y_offset + Math.floor(i / width) * y_step;
			let a = x;
			let b = y;
			let iterations = 0;
			while (iterations < max_iterations) {
				const a_squared = a * a;
				const b_squared = b * b;
				if (a_squared + b_squared > 4) {
					break;
				}
				b = 2 * a * b + y;
				a = a_squared - b_squared + x;
				iterations++;
			}
			data[i * 4 + 0] = (iterations * 255) / max_iterations;
			data[i * 4 + 1] = (iterations * 255) / max_iterations;
			data[i * 4 + 2] = (iterations * 255) / max_iterations;
			data[i * 4 + 3] = 127;
		}
		return data;
	}
}

export default new Pixelator();
