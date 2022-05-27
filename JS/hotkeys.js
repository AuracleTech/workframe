import ACTIONS from "./actions.js";
// TODO : Support multiple keys simultaneously

export default {
	PASTE_FROM_CLIPBOARD: {
		key: "v",
		specials: ["ctrl"],
		// TODO : Implement
		func: () => console.log("NON IMPLEMENTED"),
	},
	OPEN_FILES: {
		key: "o",
		func: () => ACTIONS.OPEN_FILES(),
	},
	NEW_ART: {
		key: "n",
		func: () => ACTIONS.ART_NEW(),
	},
	KEYS_MENU: {
		key: ["h"],
		// TODO : Fix the menu
		func: () => ACTIONS.OPEN_MODAL("hotkeys"),
	},
	DESIRES_MENU: {
		key: ["d"],
		func: () => ACTIONS.OPEN_MODAL("desires"),
	},
	NEW_LAYER: {
		key: "l",
		func: () => ACTIONS.NEW_LAYER(),
	},
	DELETE_LAYER: {
		key: "s",
		func: () => ACTIONS.DELETE_LAYER(),
	},
};
