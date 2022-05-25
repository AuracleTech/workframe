import { focused, new_panel } from "./panels.js";
import pixelator from "./pixelator.js";

function art_new(width, height, data) {
	let panel = new_panel();

	panel.stack = document.createElement("div");
	panel.workbench = document.createElement("div");
	panel.art = document.createElement("div");
	panel.highlight = document.createElement("canvas");
	panel.highlight_ctx = panel.highlight.getContext("2d");

	panel.stack.classList.add("stack");
	panel.workbench.classList.add("workbench");
	panel.art.classList.add("art");
	panel.highlight.classList.add("highlight");

	panel.art.append(panel.highlight);
	panel.workbench.append(panel.art);
	panel.content.append(panel.stack, panel.workbench);

	panel.content.classList.add("draw"); // TODO : ADD THIS ONLY WHEN IN DRAWING MODE

	resize_art(panel, width, height);

	panel.workbench.addEventListener(
		"wheel",
		(ev) => {
			// TODO : Zoom where cursor is located
			// TODO : Zoom out
			ev.cancelable && ev.preventDefault();
			let step_size = ev.deltaY / 100;
			zoom_set(panel, Math.min(10, Math.max(1, panel.zoom + step_size)));
		},
		{ passive: false }
	);

	// TODO : Temporary
	layer_new(panel, pixelator.mandelbrot(width, height));
	layer_new(panel, pixelator.noise(width, height));

	layer_new(panel, data);

	zoom_set(panel, 1);

	panel.workbench.addEventListener("pointerdown", (ev) => {
		if (ev.button !== 0) return;
		if (
			ev.target.clientWidth < ev.offsetX ||
			ev.target.clientHeight < ev.offsetY
		)
			return;
		highlight_init(panel, ev);
	});
	// TODO : Turn every function into event listeners (context, resize etc etc)
	panel.art.addEventListener("contextmenu", (ev) => {
		ev.preventDefault();
		// TODO : context_generate(ev.clientX, ev.clientY);
	});
	return panel;
}
function new_block(panel, data, id) {
	let block = document.createElement("div");
	let card = document.createElement("canvas");
	let card_ctx = card.getContext("2d");
	let name = document.createElement("div");

	block.classList.add("block");
	name.classList.add("name");
	card.classList.add("card");

	block.id = `block.${id}`;
	block.name = name;

	block.append(card, name);
	panel.stack.prepend(block);

	let max_allowed_size = Math.max(card.clientWidth, card.clientHeight);
	if (panel.width > panel.height) {
		// TODO : Make the stack display horizontally if the preview has more width than height
		card.width = max_allowed_size;
		card.height = Math.floor((card.width * panel.height) / panel.width);
	} else {
		card.height = max_allowed_size;
		card.width = Math.floor((card.height * panel.width) / panel.height);
	}

	card.style.width = `${card.width}px`;
	card.style.height = `${card.height}px`;

	card_ctx.drawImage(data, 0, 0, card.width, card.height);

	layer_rename(panel, id, "Untitled");

	block.addEventListener("click", () => layer_focus(panel, id));
	block.addEventListener("contextmenu", generate_context);
}

/* STACK */
function block_get(panel, id) {
	for (const block of panel.stack.children) {
		if (block.id === `block.${id}`) return block;
	}
	console.error(`Block ${id} not found line`);
}
/* LAYERS */
function layer_rename(panel, id, name) {
	const block = block_get(panel, id);
	block.name.innerText = name;
	block.title = name;
}
function layer_focus(panel, id) {
	for (const block of panel.stack.children) {
		block.classList.remove("focus");
		if (block.id === `block.${id}`) block.classList.add("focus");
	}
	for (const layer of panel.art.children) {
		layer.classList.remove("focus");
		if (layer.id === `layer.${id}`) layer.classList.add("focus");
	}
	panel.focus_layer = id;
}
function layer_new(panel, data) {
	if (!panel.id_increment) panel.id_increment = 0;
	const id = panel.id_increment++;

	let canvas = document.createElement("canvas");
	canvas.width = panel.width;
	canvas.height = panel.height;
	canvas.id = `layer.${id}`;
	canvas.classList = "layer";
	let ctx = canvas.getContext("2d");
	if (data)
		ctx.putImageData(new ImageData(data, panel.width, panel.height), 0, 0);
	new_block(panel, canvas, id);
	panel.art.insertBefore(canvas, panel.highlight);
}
function layer_remove(panel, id) {
	let block = panel.stack.querySelector(`.focus`);
	if (block) block.remove();
	let layer = panel.art.querySelector(`.focus`);
	if (layer) layer.remove();
}

// TODO : Support custom context menu with actions names as arguments
function generate_context(ev) {
	ev.preventDefault();
	const x = ev.clientX;
	const y = ev.clientY;
	let context = document.createElement("div");
	context.id = "context";
	context.style.left = `${x}px`;
	context.style.top = `${y}px`;
	for (let action in ACTIONS) {
		let row = document.createElement("div");
		row.className = "row";
		row.innerText = ACTIONS[action].short;
		row.addEventListener("click", () => {
			context.remove();
			ACTIONS[action].func();
		});
		context.append(row);
		// TODO : Display the hotkey key for each item or even call the func of it from here
	}
	context.addEventListener("pointerleave", () => context.remove());
	context.addEventListener("contextmenu", (ev) => ev.preventDefault());
	document.body.append(context);
}
function zoom_set(panel, level) {
	panel.zoom = level;
	resize_highlight(panel);
}
function resize_highlight(panel) {
	panel.art.style.width = `${panel.width * panel.zoom}px`;
	panel.art.style.height = `${panel.height * panel.zoom}px`;
	panel.highlight.width = panel.width;
	panel.highlight.height = panel.height;
	panel.highlight.style.width = `${panel.width * panel.zoom}px`;
	panel.highlight.style.height = `${panel.height * panel.zoom}px`;
	highlight_draw(panel);
}
// TODO : Multiple resize functions and algorithms
function resize_art(panel, width, height) {
	panel.width = width;
	panel.height = height;
	panel.selection = new Uint8ClampedArray(width * height * 4);
	resize_highlight(panel);
}
function selection_clear(panel) {
	panel.selection.fill(0);
}
function highlight_draw(panel) {
	panel.highlight_ctx.putImageData(
		new ImageData(panel.selection, panel.width, panel.height),
		0,
		0
	);
}

function highlight_init(panel, ev) {
	// TODO : Make sure the clicked pixels are selected (Inclusive not exclusive)
	const selection_limits = (ev) => {
		const rect = panel.highlight.getBoundingClientRect();
		let x = Math.floor((ev.clientX - rect.left) / panel.zoom);
		let y = Math.floor((ev.clientY - rect.top) / panel.zoom);
		x = Math.max(0, Math.min(panel.width, x));
		y = Math.max(0, Math.min(panel.height, y));
		return { x, y };
	};
	const pointermove_action = (ev) => {
		const end = selection_limits(ev);
		selection_clear(panel);
		for (let x = Math.min(start.x, end.x); x < Math.max(start.x, end.x); x++) {
			for (
				let y = Math.min(start.y, end.y);
				y < Math.max(start.y, end.y);
				y++
			) {
				panel.selection[(y * panel.width + x) * 4 + 3] = 127;
			}
		}
		highlight_draw(panel);
	};
	const pointerup_action = () => {
		removeEventListener("pointermove", pointermove_action);
		removeEventListener("pointerup", pointerup_action);
	};
	addEventListener("pointermove", pointermove_action);
	addEventListener("pointerup", pointerup_action);
	const start = selection_limits(ev);
	selection_clear(panel);
	highlight_draw(panel);
}

function toggle_modal(id) {
	const active_modal = document.querySelector(".modal.active");
	const fade_screen = document.getElementById("fade_screen");
	for (let child of fade_screen.children) child.classList.remove("active");
	if (active_modal && active_modal.id === id) {
		close_modal();
		return;
	}
	const element = document.getElementById(id);
	element.classList.add("active");
	fade_screen.classList.add("active");
}
function close_modal() {
	const fade_screen = document.getElementById("fade_screen");
	for (let child of fade_screen.children) child.classList.remove("active");
	fade_screen.classList.remove("active");
}

const ACTIONS = {
	KEYS_MENU: {
		keys: ["h"],
		short: "Hotkeys Menu",
		long: "Toggle the hotkeys menu",
		func: () => toggle_modal("hotkeys_menu"),
	},
	DESIRES_MENU: {
		keys: ["o"],
		short: "Desires Menu",
		long: "Toggle the preferences menu",
		func: () => toggle_modal("desires_menu"),
	},
	ART_NEW: {
		keys: ["n"],
		short: "New Art",
		long: "Create a new panel",
		func: () => art_new(256, 256),
		// TODO : Custom sizes etc
	},
	FILES: {
		keys: ["f"],
		short: "Files",
		long: "Open files",
		func: () => {
			let input = document.createElement("input");
			input.type = "file";
			input.multiple = true;
			input.click();
			input.addEventListener("change", (ev) => {
				for (let file of ev.target.files) {
					let reader = new FileReader();
					reader.onload = (ev) => {
						let image = new Image();
						image.src = ev.target.result;
						image.onload = () => {
							let canvas = document.createElement("canvas");
							let ctx = canvas.getContext("2d");
							canvas.width = image.width;
							canvas.height = image.height;
							canvas.getContext("2d").drawImage(image, 0, 0);
							let imageData = ctx.getImageData(
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
			});
		},
	},
	NEW_LAYER: {
		keys: ["l"],
		short: "New Layer",
		long: "Create a new layer",
		func: () => {
			if (focused) layer_new(focused);
		},
	},
	REMOVE_LAYER: {
		keys: ["s"],
		short: "Remove Layer",
		long: "Remove the current layer",
		func: () => {
			if (focused) layer_remove(focused);
		},
	},
	// TODO : fusion_layer, exude_alpha
};

export default ACTIONS;