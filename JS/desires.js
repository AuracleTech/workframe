const root = document.querySelector(":root");

const DESIRES = {
	GENERAL: {
		name: "Options",
	},
	LAYER_NAMES: {
		name: "Layer names",
		default: true,
		change: (value) =>
			root.style.setProperty("--layer-name", value ? "block" : "none"),
	},
	FOCUS_COLOR: {
		name: "Focus color",
		default: "#0e75a4",
		change: (value) => {
			root.style.setProperty("--focus-color", value);
			root.style.setProperty("--panel-focus-color", value);
		},
	},
	MARGIN: {
		name: "Art margin",
		default: 16,
		range: [8, 64],
		change: (value) => root.style.setProperty("--art-margin", `${value}px`),
	},
};

export default DESIRES;
