import DESIRES from "./desires.js";
import HOTKEYS from "./hotkeys.js";

const loading = () => {
	const loading = document.getElementById("loading");
	loading.classList.add("done");
	loading.addEventListener(
		"animationend",
		(ev) => ev.target.parentElement == loading && loading.remove()
	);
};
const hotkeys = (ev) => {
	const shift = ev.shiftKey;
	const ctrl = ev.ctrlKey;
	const alt = ev.altKey;

	hotkeys: for (const HOTKEY in HOTKEYS) {
		const SPECIALS = HOTKEYS[HOTKEY].specials || [];
		for (const SPECIAL of SPECIALS) {
			if (SPECIAL === "shift" && !shift) continue hotkeys;
			if (SPECIAL === "ctrl" && !ctrl) continue hotkeys;
			if (SPECIAL === "alt" && !alt) continue hotkeys;
		}
		if (HOTKEYS[HOTKEY].key != ev.key) continue;
		HOTKEYS[HOTKEY].func();
		return ev.preventDefault();
	}
};
const models = () => {
	// const hotkeys = document.getElementById("hotkeys");
	// for (const action in ACTIONS) {
	// 	if (ACTIONS[action].keys.length < 1) continue;
	// 	const row = document.createElement("div");
	// 	const text = document.createElement("div");
	// 	const keys = document.createElement("div");
	// 	row.className = "row";
	// 	text.classList = "text";
	// 	keys.className = "keys";
	// 	row.title = ACTIONS[action].long;
	// 	text.innerText = ACTIONS[action].short;
	// 	for (const key of ACTIONS[action].keys) {
	// 		const hotkey = document.createElement("div");
	// 		hotkey.className = "key";
	// 		hotkey.innerText = key;
	// 		keys.append(hotkey);
	// 	}
	// 	row.append(text, keys);
	// 	hotkeys.append(row);
	// }

	const change_desire = (desire, value) => {
		localStorage.setItem(desire.name, value);
		desire.change(value);
	};
	const desires = document.getElementById("desires");
	for (const desire in DESIRES) {
		const row = document.createElement("div");
		const text = document.createElement("div");
		row.classList = "row";
		text.classList = "text";
		text.innerText = DESIRES[desire].name;
		row.append(text);
		desires.append(row);

		if (DESIRES[desire].default == null) {
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
		const reset = document.createElement("div");
		const element = document.createElement("input");
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
			const display = document.createElement("div");
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
};

addEventListener("load", () => {
	addEventListener("keydown", hotkeys);
	models();
	loading();
});

// TODO : TEMPORARY
import ACTIONS from "./actions.js";
const temporary = () => {
	const img = document.createElement("img");
	img.src = "IMG/cornflower.png";
	img.onload = () => {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		canvas.width = img.width;
		canvas.height = img.height;
		ctx.drawImage(img, 0, 0);
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const data = imageData.data;
		const panel = ACTIONS.ART_NEW(16, 16, data);
		ACTIONS.ZOOM(panel, 16);
	};
};
addEventListener("load", () => temporary());
