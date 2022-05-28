import { new_panel, wall } from "./panels.js";
import pixelator from "./pixelator.js";
const style = getComputedStyle(document.body);

function art_new(width = 256, height = 64, data) {
	const panel = new_panel();

	panel.previews = document.createElement("div");
	panel.desk = document.createElement("div");
	panel.art = document.createElement("div");
	panel.light = document.createElement("canvas");
	panel.light_ctx = panel.light.getContext("2d");
	panel.light_ctx.imageSmoothingEnabled = false;
	panel.pairs = [];

	panel.previews.classList.add("previews");
	panel.desk.classList.add("desk");
	panel.art.classList.add("art");
	panel.light.classList.add("light");

	panel.desk.append(panel.art, panel.light);
	panel.content.append(panel.previews, panel.desk);

	resize_art(panel, width, height);

	// TODO : Temporary
	layer_new(pixelator.mandelbrot(width, height, 69));
	layer_new(pixelator.noise(width, height));

	layer_new(data);

	zoom_set(panel, 1);

	panel.previews.addEventListener("contextmenu", (ev) => {
		ev.preventDefault();
		if (ev.target === ev.currentTarget) layer_focus(panel);
	});

	panel.light.addEventListener("pointerdown", (one) => {
		if (
			one.button !== 0 ||
			one.target.clientWidth < one.offsetX ||
			one.target.clientHeight < one.offsetY
		)
			return;

		const limit = ({ x, y }, floor) => {
			const rect = panel.light.getBoundingClientRect();
			x = (x - rect.left) / panel.zoom;
			y = (y - rect.top) / panel.zoom;
			if (floor) {
				x = Math.floor(x);
				y = Math.floor(y);
			} else {
				x = Math.ceil(x);
				y = Math.ceil(y);
			}
			x = Math.max(0, Math.min(panel.width, x));
			y = Math.max(0, Math.min(panel.height, y));
			return { x, y };
		};
		const pointermove_action = (two) => {
			const start = limit(
				{
					x: Math.min(one.clientX, two.clientX),
					y: Math.min(one.clientY, two.clientY),
				},
				true
			);
			const end = limit(
				{
					x: Math.max(one.clientX, two.clientX),
					y: Math.max(one.clientY, two.clientY),
				},
				false
			);
			panel.selection.fill(0);
			for (let x = start.x; x < end.x; x++) {
				for (let y = start.y; y < end.y; y++) {
					panel.selection[(y * panel.width + x) * 4] = 191;
					panel.selection[(y * panel.width + x) * 4 + 1] = 127;
					panel.selection[(y * panel.width + x) * 4 + 2] = 31;
					panel.selection[(x + y * panel.width) * 4 + 3] = 127;
				}
			}
			light_draw(panel);
		};
		const pointerup_action = () => {
			removeEventListener("pointermove", pointermove_action);
			removeEventListener("pointerup", pointerup_action);
		};
		addEventListener("pointermove", pointermove_action);
		addEventListener("pointerup", pointerup_action);
		// TODO : Better animation and system overall
		panel.selection.fill(0);
		light_draw(panel);
	});

	panel.desk.addEventListener(
		"wheel",
		(ev) => {
			// TODO : Zoom where cursor is located
			// TODO : Zoom out (under 1x zoom)
			ev.cancelable && ev.preventDefault();
			zoom_set(panel, panel.zoom + ev.deltaY / 100);
		},
		{ passive: false }
	);
	// TODO : Turn every function into event listeners (context, resize etc etc)
	panel.desk.addEventListener("contextmenu", (ev) => {
		ev.preventDefault();
		// TODO : context_generate(ev.clientX, ev.clientY);
	});
	return panel;
}
const block_new = (panel, data) => {
	// TODO : Unfocus a layer by clicking on the same layer actively focused
	// TODO : Low priority -> Display only the canvas layer when hovering layers to see that layer only
	const block = document.createElement("div");
	block.card = document.createElement("canvas");
	block.card_ctx = block.card.getContext("2d");
	block.card_ctx.imageSmoothingEnabled = false;
	block.name = document.createElement("div");

	block.classList.add("block");
	block.name.classList.add("name");
	block.card.classList.add("card");

	block.append(block.card, block.name);

	block.card.width = panel.width;
	block.card.height = panel.height;
	const max_card_size = parseInt(style.getPropertyValue("--max-card-size"));
	let width, height;
	if (panel.width > panel.height) {
		panel.content.classList.add("horizontal");
		width = max_card_size;
		height = max_card_size * (panel.height / panel.width);
	} else {
		panel.content.classList.remove("horizontal");
		height = max_card_size;
		width = max_card_size * (panel.width / panel.height);
	}
	block.card.style.width = `${width}px`;
	block.card.style.height = `${height}px`;
	if (data)
		block.card_ctx.putImageData(
			new ImageData(data, panel.width, panel.height),
			0,
			0
		);

	// TODO : When panel is squished every value using clientHeight/Width will be wrong
	// TODO : Stop hotkeys working when squished
	block.addEventListener("click", () => layer_focus(panel, block));
	// TODO : Context menu
	block.addEventListener("contextmenu", generate_context);

	return block;
};

const layer_rename = (panel, text, index) => {
	if (!index) index = panel.pairs.length - 1;
	const pair = panel.pairs[index];
	pair.block.name.innerText = text;
	pair.block.title = text;
};
const layer_focus = (panel, block) => {
	for (const pair of panel.pairs) pair.block.classList.remove("focus");
	if (!block) return (panel.focus_pair = null);
	panel.focus_pair = panel.pairs.find((pair) => pair.block === block);
	block.classList.add("focus");
};
const layer_delete = () => {
	const panel = wall.panels[wall.panels.length - 1];
	if (!panel) return;
	const pair = panel.focus_pair;
	if (!pair) return;
	pair.block.remove();
	pair.layer.remove();
	panel.pairs.filter((pair) => pair.block !== pair.block);
	panel.focus_pair = null;
};
const layer_new = (data) => {
	const panel = wall.panels[wall.panels.length - 1];
	if (!panel) return;

	const layer = document.createElement("canvas");
	const layer_ctx = layer.getContext("2d");
	layer_ctx.imageSmoothingEnabled = false;

	layer.width = panel.width;
	layer.height = panel.height;
	layer.classList = "layer";

	if (data)
		layer_ctx.putImageData(
			new ImageData(data, panel.width, panel.height),
			0,
			0
		);

	const block = block_new(panel, data);

	panel.previews.prepend(block);
	panel.art.append(layer);
	panel.pairs.push({ block, layer });

	layer_rename(panel, "Untitled");
};

// TODO : Support custom context menu with actions names as arguments
function generate_context(ev) {
	// TODO : Maybe the context could be generated using hotkeys.js, that way no custom values are needed
	ev.preventDefault();
	const x = ev.clientX;
	const y = ev.clientY;
	const context = document.createElement("div");
	context.id = "context";
	context.style.left = `${x}px`;
	context.style.top = `${y}px`;
	//TODO : Remove this make it like hotkeys or sum idk
	for (const action in ACTIONS) {
		const row = document.createElement("div");
		row.className = "row";
		row.innerText = ACTIONS[action].short;
		row.addEventListener("click", () => {
			context.remove();
			ACTIONS[action]();
		});
		context.append(row);
		// TODO : Display the hotkey key for each item or even call the func of it from here
	}
	context.addEventListener("pointerleave", () => context.remove());
	context.addEventListener("contextmenu", (ev) => ev.preventDefault());
	document.body.append(context);
}
function zoom_set(panel, level) {
	panel.zoom = Math.min(32, Math.max(1, level));
	resize_light(panel);
}
function resize_light(panel) {
	panel.art.style.width = `${panel.width * panel.zoom}px`;
	panel.art.style.height = `${panel.height * panel.zoom}px`;
	panel.light.width = panel.width;
	panel.light.height = panel.height;
	panel.light.style.width = `${panel.width * panel.zoom}px`;
	panel.light.style.height = `${panel.height * panel.zoom}px`;
	light_draw(panel);
}
// TODO : Multiple resize functions and algorithms
function resize_art(panel, width, height) {
	panel.width = width;
	panel.height = height;
	panel.selection = new Uint8ClampedArray(width * height * 4);
	resize_light(panel);
}
function light_draw(panel) {
	panel.light_ctx.putImageData(
		new ImageData(panel.selection, panel.width, panel.height),
		0,
		0
	);
}

function modal(id) {
	const fade = document.getElementById("fade");
	const modal = document.getElementById(id);
	const clean = () => {
		for (const child of fade.children) child.classList.remove("active");
		fade.classList.remove("active");
	};
	if (modal.classList.contains("active")) return clean();
	else clean();
	fade.classList.add("active");
	modal.classList.add("active");
	const end = (ev) => {
		if (ev.target === ev.currentTarget && clean())
			removeEventListener("click", end);
	};
	fade.addEventListener("click", end);
}

const paste_clipboard = (ev) => {
	const load = (file) => {
		const image = new Image();
		image.onload = () => {
			const canvas = document.createElement("canvas");
			const context = canvas.getContext("2d");
			context.drawImage(image, 0, 0);
			const imageData = context.getImageData(0, 0, image.width, image.height);
			art_new(image.width, image.height, imageData.data);
		};
		image.src = URL.createObjectURL(file);
	};
	for (const item of ev.clipboardData.items)
		if (item.type.indexOf("image") !== -1) load(item.getAsFile());
};

const ACTIONS = {
	CRAYON: () => wall.classList.toggle("crayon"),
	CLIPBOARD_PASTE: paste_clipboard,
	OPEN_MODAL: (name) => modal(name),
	ART_NEW: (width, height, data) => art_new(width, height, data),
	OPEN_FILES: () => {
		const input = document.createElement("input");
		input.type = "file";
		input.multiple = true;
		const change = (ev) => {
			for (const file of ev.target.files) {
				const reader = new FileReader();
				reader.onload = (ev) => {
					const image = new Image();
					image.src = ev.target.result;
					image.onload = () => {
						const canvas = document.createElement("canvas");
						const ctx = canvas.getContext("2d");
						canvas.width = image.width;
						canvas.height = image.height;
						canvas.getContext("2d").drawImage(image, 0, 0);
						const imageData = ctx.getImageData(
							0,
							0,
							canvas.width,
							canvas.height
						);
						art_new(image.width, image.height, imageData.data);
					};
				};
				reader.readAsDataURL(file);
			}
		};
		input.addEventListener("change", change);
		input.click();
	},
	NEW_LAYER: () => layer_new(),
	DELETE_LAYER: () => layer_delete(),
	ZOOM: (panel, level) => zoom_set(panel, level),
	// TODO : fusion_layer, exude_alpha
};

export default ACTIONS;
