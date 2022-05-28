import ACTIONS from "./actions.js";

const HOTKEYS = {
	// TODO : IMPLEMENT
	COLOR_SNAPPER: {
		WIP: true,
		name: "Color snapper",
		key: "s",
		func: () => ACTIONS.COLOR_SNAPPER(),
	},
	// TODO : IMPLEMENT
	COLOR_SELECT: {
		WIP: true,
		name: "Color select",
		key: "c",
		func: () => ACTIONS.COLOR_SELECT(),
	},
	// TODO : IMPLEMENT
	PEN_MODE: {
		WIP: true,
		name: "Pen Mode",
		key: "p",
		func: () => ACTIONS.PEN_MODE(),
	},
	// TODO : IMPLEMENT
	SAVE_ART: {
		WIP: true,
		name: "Save art",
		key: "s",
		specials: ["ctrl"],
		func: () => ACTIONS.SAVE_ART(),
	},
	OPEN_FILES: {
		name: "Open files",
		key: "o",
		func: () => ACTIONS.OPEN_FILES(),
	},
	NEW_ART: {
		name: "New art",
		key: "n",
		func: () => ACTIONS.ART_NEW(),
	},
	HOTKEYS_MODAL: {
		name: "Hotkeys",
		key: ["h"],
		func: () => ACTIONS.OPEN_MODAL("hotkeys"),
	},
	DESIRES_MODAL: {
		name: "Desires",
		key: ["d"],
		func: () => ACTIONS.OPEN_MODAL("desires"),
	},
	NEW_LAYER: {
		name: "New layer",
		key: "l",
		func: () => ACTIONS.NEW_LAYER(),
	},
	DELETE_LAYER: {
		name: "Delete layer",
		key: "s",
		func: () => ACTIONS.DELETE_LAYER(),
	},
};

const init_modal = () => {
	const modal = document.getElementById("hotkeys");
	for (const HOTKEY in HOTKEYS) {
		const row = document.createElement("div");
		const text = document.createElement("div");
		const keys = document.createElement("div");
		row.className = "row";
		text.classList = "text";
		keys.className = "keys";
		text.innerHTML = HOTKEYS[HOTKEY].name;
		if (HOTKEYS[HOTKEY].WIP) text.innerHTML += " ⚡ UNDER CREATION";
		const LIST = (HOTKEYS[HOTKEY].specials || []).concat(HOTKEYS[HOTKEY].key);
		for (const KEY of LIST) {
			const hotkey = document.createElement("div");
			hotkey.className = "key";
			hotkey.innerText = KEY;
			keys.append(hotkey);
		}
		row.append(text, keys);
		modal.append(row);
	}
};

addEventListener("load", init_modal);
addEventListener("paste", ACTIONS.CLIPBOARD_PASTE);
export default HOTKEYS;
