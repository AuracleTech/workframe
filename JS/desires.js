const s = document.body.style;

// TODO : Hide 'set default' on desires value change if value matches default value
const DESIRES = {
	GENERAL: {
		name: "Options",
	},
	LAYER_NAMES: {
		name: "Layer names",
		default: true,
		change: (value) => s.setProperty("--layer-name", value ? "block" : "none"),
	},
	FOCUS_COLOR: {
		name: "Focus color",
		default: "#0e75a4",
		change: (value) => s.setProperty("--focus-color", value),
	},
	MARGIN: {
		name: "Art margin",
		default: 0,
		range: [0, 64],
		change: (value) => s.setProperty("--art-margin", `${value}px`),
	},
};

const init_modal = () => {
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

addEventListener("load", init_modal);
export default DESIRES;
