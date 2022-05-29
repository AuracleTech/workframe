import ACTIONS from "./actions.js";

const HOTKEYS = {
	// TODO : Work In Progress Tools
	COLOR_PICKER: {
		WIP: true,
		tip: "Color picker",
		key: "a",
		func: () => ACTIONS.COLOR_PICKER(),
	},
	COLOR_SELECT: {
		WIP: true,
		tip: "Color select",
		key: "c",
		func: () => ACTIONS.COLOR_SELECT(),
	},
	CRAYON: {
		WIP: true,
		tip: "Crayon",
		key: "q",
		func: () => ACTIONS.CRAYON(),
	},
	SAVE_ART: {
		WIP: true,
		tip: "Save art",
		key: "s",
		// TODO : Make specials function on the keyboard modal display
		specials: ["ctrl"],
		func: () => ACTIONS.SAVE_ART(),
	},

	OPEN_FILES: {
		tip: "Open files",
		key: "o",
		func: () => ACTIONS.OPEN_FILES(),
	},
	NEW_ART: {
		tip: "New art",
		key: "n",
		func: () => ACTIONS.ART_NEW(),
	},
	HOTKEYS_MODAL: {
		tip: "Hotkeys help",
		key: "h",
		func: () => ACTIONS.OPEN_MODAL("hotkeys"),
	},
	OPTIONS_MODAL: {
		tip: "Options",
		key: "d",
		func: () => ACTIONS.OPEN_MODAL("options"),
	},
	NEW_LAYER: {
		tip: "New layer",
		key: "l",
		func: () => ACTIONS.NEW_LAYER(),
	},
	DELETE_LAYER: {
		tip: "Delete layer",
		key: "s",
		func: () => ACTIONS.DELETE_LAYER(),
	},
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

const keyboard_keys = [
	[
		"esc",
		"f1",
		"f2",
		"f3",
		"f4",
		"f5",
		"f6",
		"f7",
		"f8",
		"f9",
		"f10",
		"f11",
		"f12",
	],
	["~", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "back"],
	["tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
	["caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "enter"],
	["shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "shift"],
	["ctrl", "win", "alt", "space", "alt", "ctrl"],
];

const init_modal = () => {
	const modal = document.getElementById("keyboard");
	for (const row of keyboard_keys) {
		const rowDiv = document.createElement("div");
		rowDiv.classList.add("row");
		for (const key of row) {
			const keyDiv = document.createElement("div");
			keyDiv.classList.add("key");
			keyDiv.textContent = key;
			for (const HOTKEY in HOTKEYS) {
				if (HOTKEYS[HOTKEY].specials) continue;
				if (HOTKEYS[HOTKEY].key == key) {
					const tip = document.createElement("div");
					keyDiv.classList.add("used");
					tip.classList.add("tip");
					if (HOTKEYS[HOTKEY].WIP) {
						tip.textContent = `WIP ⚡ ${HOTKEYS[HOTKEY].tip}`;
						keyDiv.classList.add("wip");
					} else tip.textContent = HOTKEYS[HOTKEY].tip;
					keyDiv.append(tip);
				}
			}
			if (key == ("back" || "tab" || "enter" || "caps" || "shift" || "ctrl"))
				keyDiv.classList.add("large");
			else if (key == "space") keyDiv.classList.add("space");
			rowDiv.append(keyDiv);
		}
		modal.append(rowDiv);
	}
};

addEventListener("load", init_modal);
addEventListener("keydown", hotkeys);
addEventListener("paste", ACTIONS.CLIPBOARD_PASTE);
export default HOTKEYS;
