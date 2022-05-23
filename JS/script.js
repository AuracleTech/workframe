import pixelator from "./pixelator.js";
import { shining, new_panel } from "./panels.js";
import DESIRES from "./desires.js";
const root = document.querySelector(":root");

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

	// TODO : Turn every function into event listeners (context, resize etc etc)
	panel.art.addEventListener("contextmenu", (ev) => {
		ev.preventDefault();
		// TODO : context_generate(ev.clientX, ev.clientY);
	});

	// TODO : Temporary
	layer_new(panel, pixelator.mandelbrot(width, height));
	// layer_new(panel, pixelator.noise(width, height));

	layer_new(panel, data);

	zoom_set(panel, 1);

	panel.workbench.addEventListener("pointerdown", (ev) =>
		highlight_init(panel, ev)
	);
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

	card.addEventListener("contextmenu", (ev) => {
		ev.preventDefault();
		// TODO : generate_context_menu(ev.clientX, ev.clientY);
	});

	layer_rename(panel, id, "Untitled");

	block.addEventListener("click", () => layer_focus(panel, id));
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
function generate_context_menu(x, y) {
	let context_menu = document.createElement("div");

	let close_context = () => {
		root.style.setProperty("--context-menu", "none");
		context_menu.remove();
	};
	let display_context = () => {
		root.style.setProperty("--context-menu", "block");
	};

	context_menu.id = "context_menu";
	for (let action in ACTIONS) {
		let row = document.createElement("div");
		row.className = "row";
		row.innerText = ACTIONS[action].short;
		row.addEventListener("click", ACTIONS[action].func);
		row.addEventListener("click", close_context);
		context_menu.append(row);
		// TODO : Display the hotkey key for each item or even call the func of it from here
	}
	context_menu.addEventListener("pointerleave", close_context);
	context_menu.addEventListener("contextmenu", (ev) => ev.preventDefault());

	root.style.setProperty("--context-menu-left", `${x}px`);
	root.style.setProperty("--context-menu-top", `${y}px`);
	document.body.append(context_menu);
	display_context();
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
function change_desire(desire, value) {
	localStorage.setItem(desire.name, value);
	desire.change(value);
}
function toggle_modal(id) {
	let active_modal = document.querySelector(".modal.active");

	let fade_screen = document.getElementById("fade_screen");
	for (let child of fade_screen.children) child.classList.remove("active");

	if (active_modal && active_modal.id === id) {
		close_modal();
		return;
	}

	let element = document.getElementById(id);
	element.classList.add("active");
	root.style.setProperty("--fade-screen", "visible");
}
function close_modal() {
	let fade_screen = document.getElementById("fade_screen");
	for (let child of fade_screen.children) child.classList.remove("active");
	root.style.setProperty("--fade-screen", "hidden");
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
				// TODO : Set panel.selection as an array of indexes instead of a uint8 array
				panel.selection[(y * panel.width + x) * 4] = 255;
				panel.selection[(y * panel.width + x) * 4 + 1] = 255;
				panel.selection[(y * panel.width + x) * 4 + 2] = 255;
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

/* Hotkeys */
// TODO : Assign hotkeys to the desired actions only (not on windows.addEventListener)
// TODO : Make sure to focus the shining panel, nothing else
// TODO : Support multiple keys simultaneously
addEventListener("keydown", (e) => {
	for (let action in ACTIONS)
		for (let key of ACTIONS[action].keys)
			if (e.key == key) {
				e.preventDefault();
				ACTIONS[action].func();
			}
});

/* Initialization */
addEventListener("load", () => {
	// TODO : Remove, temporary
	art_new(512, 128);

	// Fade Screen
	let fade_screen = document.getElementById("fade_screen");
	fade_screen.addEventListener("click", (e) => {
		if (e.target !== e.currentTarget) return;
		close_modal();
	});

	// Hotkeys
	let hotkeys_menu = document.getElementById("hotkeys_menu");
	for (let action in ACTIONS) {
		if (ACTIONS[action].keys.length < 1) continue;
		let row = document.createElement("div");
		let text = document.createElement("div");
		let keys = document.createElement("div");

		row.className = "row";
		text.classList = "text";
		keys.className = "keys";

		row.title = ACTIONS[action].long;
		text.innerText = ACTIONS[action].short;
		for (let key of ACTIONS[action].keys) {
			let hotkey = document.createElement("div");
			hotkey.className = "key";
			hotkey.innerText = key;
			keys.append(hotkey);
		}

		row.append(text, keys);
		hotkeys_menu.append(row);
	}

	// Desires
	let desires_menu = document.getElementById("desires_menu");
	for (let desire in DESIRES) {
		let row = document.createElement("div");
		let text = document.createElement("div");

		row.classList = "row";
		text.classList = "text";
		text.innerText = DESIRES[desire].name;

		row.append(text);
		desires_menu.append(row);

		if (!DESIRES[desire].default) {
			row.classList.add("category");
			continue;
		}

		// Load desires from localStorage
		let value = localStorage.getItem(DESIRES[desire].name);
		if (!value) value = DESIRES[desire].default;
		switch (typeof DESIRES[desire].default) {
			case "number":
				value = parseInt(value);
				break;
			case "boolean":
				value = value === "true";
				break;
		}
		DESIRES[desire].change(value);

		// Add reset button
		let reset = document.createElement("div");
		let element = document.createElement("input");
		reset.classList = "reset";
		reset.innerText = "↪";
		if (value != DESIRES[desire].default) reset.classList.add("visible");
		row.append(reset, element);

		// Boolean -> Checkbox
		if (typeof value == "boolean") {
			element.type = "checkbox";
			element.checked = value;
			element.addEventListener("change", () => {
				change_desire(DESIRES[desire], element.checked);
				if (element.checked == DESIRES[desire].default)
					reset.classList.remove("visible");
				else reset.classList.add("visible");
			});
			reset.addEventListener("click", () => {
				change_desire(DESIRES[desire], DESIRES[desire].default);
				element.checked = DESIRES[desire].default;
				reset.classList.toggle("visible");
			});
		}
		// 6 char hex -> Colorpicker
		else if (typeof value == "string" && value.match(/^#[0-9A-F]{6}$/i)) {
			element.type = "color";
			element.value = value;
			element.addEventListener("input", () => {
				change_desire(DESIRES[desire], element.value);
				reset.classList.add("visible");
			});
			reset.addEventListener("click", () => {
				change_desire(DESIRES[desire], DESIRES[desire].default);
				element.value = DESIRES[desire].default;
				reset.classList.toggle("visible");
			});
		}
		// Number -> Slider
		else if (typeof value == "number") {
			let display = document.createElement("div");
			display.classList.add("display");
			display.innerText = value;
			element.type = "range";
			element.min = DESIRES[desire].range[0];
			element.max = DESIRES[desire].range[1];
			element.value = value;
			element.addEventListener("input", () => {
				change_desire(DESIRES[desire], element.value);
				display.innerText = element.value;
				reset.classList.add("visible");
			});
			reset.addEventListener("click", () => {
				change_desire(DESIRES[desire], DESIRES[desire].default);
				element.value = DESIRES[desire].default;
				display.innerText = DESIRES[desire].default;
				reset.classList.toggle("visible");
			});
			row.append(display);
		}
	}
});

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
	NEW_ART: {
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
			if (shining) layer_new(shining);
		},
	},
	REMOVE_LAYER: {
		keys: ["s"],
		short: "Remove Layer",
		long: "Remove the current layer",
		func: () => {
			if (shining) layer_remove(shining);
		},
	},
	// TODO : fusion_layer, exude_alpha
};
