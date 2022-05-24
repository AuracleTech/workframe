class Pixelator {
	constructor() {}

	noise(width, height) {
		let data = new Uint8ClampedArray(width * height * 4);
		for (let i = data.length / 2; i < data.length; i++) {
			data[i] = Math.floor(Math.random() * 256);
		}
		return data;
	}

	mandelbrot(width, height) {
		let data = new Uint8ClampedArray(width * height * 4);
		let data_len = data.length / 4;
		let max_iterations = 256;
		let x_min = -2;
		let x_max = 1;
		let y_min = -1;
		let y_max = 1;
		let x_step = (x_max - x_min) / width;
		let y_step = (y_max - y_min) / height;
		let x_offset = x_min;
		let y_offset = y_min;
		for (let i = 0; i < data_len; i++) {
			let x = x_offset + (i % width) * x_step;
			let y = y_offset + Math.floor(i / width) * y_step;
			let a = x;
			let b = y;
			let iterations = 0;
			while (iterations < max_iterations) {
				let a_squared = a * a;
				let b_squared = b * b;
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
