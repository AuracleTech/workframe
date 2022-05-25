import DESIRES from "./desires.js";
import ACTIONS from "./actions.js";

/* Hotkeys */
// TODO : Assign hotkeys to the desired actions only (not on windows.addEventListener)
// TODO : Make sure to focus the focused panel, nothing else
// TODO : Support multiple keys simultaneously
addEventListener("keydown", (e) => {
	for (let action in ACTIONS)
		for (let key of ACTIONS[action].keys)
			if (e.key == key) {
				e.preventDefault();
				ACTIONS[action].func();
			}
});

addEventListener("load", () => {
	ACTIONS.ART_NEW.func();

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
	const change_desire = (desire, value) => {
		localStorage.setItem(desire.name, value);
		desire.change(value);
	};
	const desires_menu = document.getElementById("desires_menu");
	for (let desire in DESIRES) {
		const row = document.createElement("div");
		const text = document.createElement("div");
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

	const loading = document.getElementById("loading");
	loading.classList.add("done");
	setTimeout(() => {
		loading.remove();
	}, 1500);
});
