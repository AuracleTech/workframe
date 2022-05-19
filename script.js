import {
	gen_noise,
	gen_blank,
	new_canvas,
	mandelbrot_set,
} from "./pixelator.js";
import { shining, new_panel } from "../../rsc/panels.js";
var root = document.querySelector(":root");

const DESIRES = {
	LAYER_NAME: {
		name: "Layer names",
		default: true,
		change: (value) =>
			root.style.setProperty("--layer-name", value ? "block" : "none"),
	},
	BACKGROUND_COLOR: {
		name: "Background",
		default: "#151520",
		change: (value) => root.style.setProperty("--background-color", value),
	},
	FOCUS_COLOR: {
		name: "Focus",
		default: "#0C73A0",
		change: (value) => root.style.setProperty("--focus-color", value),
	},
	ART_PADDING: {
		name: "Art Padding",
		default: 16,
		range: [0, 64],
		change: (value) => root.style.setProperty("--art-padding", `${value}px`),
	},
};

function new_art(width, height, image) {
	let panel = new_panel();

	panel.stack = document.createElement("div");
	panel.workbench = document.createElement("div");
	panel.art = document.createElement("div");
	panel.background = document.createElement("div");
	panel.highlight = document.createElement("canvas");
	panel.highlight_ctx = panel.highlight.getContext("2d");

	panel.stack.classList.add("stack");
	panel.workbench.classList.add("workbench");
	panel.art.classList.add("art");
	panel.background.classList.add("background");
	panel.highlight.classList.add("highlight");

	panel.art.append(panel.background, panel.highlight);
	panel.workbench.append(panel.art);
	panel.content.append(panel.stack, panel.workbench);

	panel.art.addEventListener("wheel", art_wheel_action, { passive: false });

	set_context_menu(panel.art);
	resize_art(panel, width, height);
	zoom(panel, 1);
	new_layer(panel, gen_blank(width, height));
	// TODO : Temporary, remove later
	new_layer(panel, mandelbrot_set(width, height));
	// TODO : Temporary, remove later
	new_layer(panel, gen_noise(width, height));

	if (image) new_layer(panel, new_canvas(width, height, image));

	focus_layer(panel, 0);

	init_highlight(panel);

	return panel;
}
function init_highlight(panel) {
	panel.art.addEventListener("pointerdown", (ev) => {
		const { width, height } = panel.dimensions;
		const rect = panel.highlight.getBoundingClientRect();
		let zoom = panel.zoomLevel; // TODO : TEST ZOOM IN/OUT DURING DRAWING

		let selection_format = (x, y) => {
			x = Math.floor(x - rect.left / zoom); // This is to prevent rounding errors TODO : Test
			y = Math.floor(y - rect.top / zoom); // This is to prevent rounding errors TODO : Test
			x = Math.max(0, Math.min(x, width - 1)); // This is to limit the selection to the art
			y = Math.max(0, Math.min(y, height - 1)); // This is to limit the selection to the art
			return { x, y };
		};

		panel.selection = {
			start: selection_format(ev.clientX, ev.clientY),
		};
		panel.selection.end = panel.selection.start;

		highlight_draw(panel);
		let pointermove_action = (ev) => {
			// TODO : Set start and end depending on zoom / panel position
			panel.selection.end = selection_format(ev.clientX, ev.clientY);
		};
		let pointerup_action = () => {
			if (panel.selection.start === panel.selection.end) panel.selection = null;
			removeEventListener("pointermove", pointermove_action);
			removeEventListener("pointerup", pointerup_action);
		};
		addEventListener("pointermove", pointermove_action);
		addEventListener("pointerup", pointerup_action);
	});
}
function highlight_clear(panel) {
	panel.highlight_ctx.clearRect(
		0,
		0,
		panel.highlight.width,
		panel.highlight.height
	);
}
const highlight_draw = (panel) => {
	highlight_clear(panel);
	if (!panel.selection) return;

	let ctx = panel.highlight_ctx;
	const { start, end } = panel.selection;

	// TODO : Replace ctx path by image data selection

	ctx.beginPath();
	ctx.setLineDash([]);
	ctx.strokeStyle = "#ffffff";
	ctx.lineWidth = 1;
	ctx.moveTo(start.x + 0.5, start.y + 0.5);
	ctx.lineTo(end.x + 0.5, start.y + 0.5);
	ctx.lineTo(end.x + 0.5, end.y + 0.5);
	ctx.lineTo(start.x + 0.5, end.y + 0.5);
	ctx.lineTo(start.x + 0.5, start.y + 0.5);
	ctx.stroke();

	ctx.beginPath();
	ctx.setLineDash([10, 10]);
	ctx.strokeStyle = "#000000";
	ctx.lineWidth = 1;
	ctx.moveTo(start.x + 0.5, start.y + 0.5);
	ctx.lineTo(end.x + 0.5, start.y + 0.5);
	ctx.lineTo(end.x + 0.5, end.y + 0.5);
	ctx.lineTo(start.x + 0.5, end.y + 0.5);
	ctx.lineTo(start.x + 0.5, start.y + 0.5);
	ctx.stroke();
	ctx.closePath();

	setTimeout(() => {
		requestAnimationFrame(() => highlight_draw(panel));
	}, 100);
};

function get_all_blocks(panel) {
	return panel.stack.querySelectorAll(".block");
}
function new_block(panel, layer) {
	let block = document.createElement("div");
	let card = document.createElement("canvas");
	let card_ctx = card.getContext("2d");
	let title = document.createElement("div");

	block.classList.add("block");
	title.classList.add("title");
	card.classList.add("card");

	let layer_name =
		panel.background.children.length < 1
			? "Background"
			: `Layer ${panel.background.children.length}`;
	block.title = layer_name;
	title.innerText = layer_name;

	block.append(card, title);
	panel.stack.insertBefore(block, panel.stack.firstChild);

	let max_allowed_size = Math.max(card.clientWidth, card.clientHeight);
	if (layer.width > layer.height) {
		card.width = max_allowed_size;
		card.height = Math.floor((card.width * layer.height) / layer.width);
	} else {
		card.height = max_allowed_size;
		card.width = Math.floor((card.height * layer.width) / layer.height);
	}

	card.style.width = `${card.width}px`;
	card.style.height = `${card.height}px`;

	card_ctx.drawImage(layer, 0, 0, card.width, card.height);

	// TODO : Replace the card by the whole block
	set_context_menu(card);

	let index = panel.background.children.length;
	block.addEventListener("click", () => focus_layer(panel, index));
}
// TODO : Create function get_block to get a block from the stack
function focus_layer(panel, index) {
	let blocks = get_all_blocks(panel);
	for (let block of blocks) block.classList.remove("focus");
	blocks[blocks.length - 1 - index].classList.add("focus");
}
// TODO : Support custom context menu with actions names as arguments
function generate_context_menu(x, y) {
	let context_menu = document.createElement("div");

	let close_context = () => {
		context_menu.remove();
		root.style.setProperty("--context-menu", "none");
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
function set_context_menu(element) {
	element.addEventListener("contextmenu", (ev) => {
		ev.preventDefault();
		generate_context_menu(ev.clientX, ev.clientY);
	});
}
function zoom(panel, level) {
	panel.zoomLevel = level;
	console.log(panel.zoomLevel); // TODO : REMOVEME
	const { width, height } = panel.dimensions;
	panel.background.style.width = `${width * level}px`;
	panel.background.style.height = `${height * level}px`;
	resize_highlight(panel);
}
function resize_highlight(panel) {
	let { width, height } = panel.dimensions;
	width = width * panel.zoomLevel;
	height = height * panel.zoomLevel;
	panel.art.style.width = `${width}px`;
	panel.art.style.height = `${height}px`;
	panel.highlight.width = width;
	panel.highlight.height = height;
}
// TODO : Multiple resize functions and algorithms
function resize_art(panel, width, height) {
	panel.dimensions = { width, height };
	resize_highlight(panel);
}
function new_layer(panel, layer = null) {
	if (!layer) {
		const { width, height } = panel.dimensions;
		layer = gen_blank(width, height);
	}
	// TODO : Replace layer (canvas) with data (image)
	new_block(panel, layer);
	panel.background.append(layer);
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
let art_wheel_action = (ev) => {
	ev.cancelable && ev.preventDefault();
	if (shining) {
		let inc = ev.deltaY / 100;
		let level = Math.min(10, Math.max(1, shining.zoomLevel + inc));
		zoom(shining, level);
	}
};
function close_modal() {
	let fade_screen = document.getElementById("fade_screen");
	for (let child of fade_screen.children) child.classList.remove("active");
	root.style.setProperty("--fade-screen", "hidden");
}

/* Hotkeys */
// TODO : Assign hotkeys to the desired actions only (not global)
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
	new_art(256, 256);

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
		let keys = document.createElement("div");

		row.className = "row";
		keys.className = "keys";

		row.title = ACTIONS[action].long;
		row.innerText = ACTIONS[action].short;
		for (let key of ACTIONS[action].keys) {
			let hotkey = document.createElement("div");
			hotkey.className = "key";
			hotkey.innerText = key;
			keys.append(hotkey);
		}

		row.append(keys);
		hotkeys_menu.append(row);
	}

	// Desires
	let desires_menu = document.getElementById("desires_menu");
	for (let desire in DESIRES) {
		// Load desires
		let value = localStorage.getItem(DESIRES[desire].name);
		if (!value) value = DESIRES[desire].default;
		if (typeof DESIRES[desire].default === "boolean") value = value == "true";
		if (typeof DESIRES[desire].default === "number") value = parseInt(value);
		DESIRES[desire].change(value);

		// Desires Menu
		let row = document.createElement("div");
		let text = document.createElement("div");
		let reset = document.createElement("div");
		let element = document.createElement("input");

		row.classList.add("row");
		text.classList.add("text");
		text.innerText = DESIRES[desire].name;
		reset.classList.add("reset");
		reset.innerText = "↪";
		if (value != DESIRES[desire].default) reset.classList.add("visible");

		row.append(text, reset, element);

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

		desires_menu.append(row);
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
		func: () => new_art(256, 256),
		// TODO : Custom sizes etc
	},
	FILES: {
		keys: ["f"],
		short: "Files",
		long: "Open files",
		func: () => {
			var input = document.createElement("input");
			input.type = "file";
			input.multiple = true;
			input.click();
			input.addEventListener("change", (ev) => {
				for (let file of ev.target.files) {
					let reader = new FileReader();
					reader.onload = (ev) => {
						let image = new Image();
						image.src = ev.target.result;
						image.onload = () => new_art(image.width, image.height, image);
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
			if (shining) new_layer(shining);
		},
	},
	// delete_layer: { keys: [], short: "", long: "", func: () => {} },
	// fusion_layer: { keys: [], short: "", long: "", func: () => {} },
	// exude_alpha: { keys: [], short: "", long: "", func: () => {} },
};
