// TODO : Stop using canvas and use imageData
// TODO : Export all functions under pixelator namespace
let new_canvas = (width, height, image) => {
	let canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	if (image) {
		let ctx = canvas.getContext("2d");
		ctx.drawImage(image, 0, 0);
	}
	return canvas;
};

let gen_blank = (width, height) => {
	// generate a alpha transparent canvas
	let canvas = new_canvas(width, height);
	let ctx = canvas.getContext("2d");

	let imgData = ctx.getImageData(0, 0, width, height);
	let noise_ctx = imgData.data;
	let noise_ctx_len = noise_ctx.length / 4;

	for (let i = 0; i < noise_ctx_len; i++) {
		noise_ctx[i * 4 + 3] = 0;
	}
	ctx.putImageData(imgData, 0, 0);
	return canvas;
};

let gen_noise = (width, height) => {
	let canvas = new_canvas(width, height);
	let ctx = canvas.getContext("2d");
	let imgData = ctx.getImageData(0, 0, width, height);
	let noise_ctx = imgData.data;
	for (let i = noise_ctx.length / 2; i < noise_ctx.length; i++) {
		noise_ctx[i] = Math.floor(Math.random() * 256);
	}
	ctx.putImageData(imgData, 0, 0);
	return canvas;
};

let mandelbrot_set = (width, height) => {
	let canvas = new_canvas(width, height);
	let ctx = canvas.getContext("2d");
	let imgData = ctx.getImageData(0, 0, width, height);
	let noise_ctx = imgData.data;
	let noise_ctx_len = noise_ctx.length / 4;
	let max_iterations = 256;
	let x_min = -2;
	let x_max = 1;
	let y_min = -1;
	let y_max = 1;
	let x_step = (x_max - x_min) / width;
	let y_step = (y_max - y_min) / height;
	let x_offset = x_min;
	let y_offset = y_min;
	for (let i = 0; i < noise_ctx_len; i++) {
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
		noise_ctx[i * 4 + 0] = (iterations * 255) / max_iterations;
		noise_ctx[i * 4 + 1] = (iterations * 255) / max_iterations;
		noise_ctx[i * 4 + 2] = (iterations * 255) / max_iterations;
		noise_ctx[i * 4 + 3] = 127;
	}
	ctx.putImageData(imgData, 0, 0);
	return canvas;
};

export { gen_noise, new_canvas, gen_blank, mandelbrot_set };
