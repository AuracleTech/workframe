const s = document.body.style;
const c = getComputedStyle(document.documentElement);

const get = (name) => c.getPropertyValue(name).trim();
const set = (name, value) => s.setProperty(name, value);
const OPTIONS = {
	GENERAL: {
		name: "Options",
	},
	LAYER_NAMES: {
		name: "Layer names",
		default: get("--layer-name") == "block",
		change: (value) => set("--layer-name", value ? "block" : "none"),
	},
	FOCUS_COLOR: {
		name: "Focus color",
		default: get("--focus-color"),
		change: (value) => set("--focus-color", value),
	},
	MARGIN: {
		name: "Art margin",
		default: parseInt(get("--art-margin")),
		range: [0, 64],
		change: (value) => set("--art-margin", `${value}px`),
	},
};

const init_modal = () => {
	const option_edit = (option, value) => {
		localStorage.setItem(option.name, value);
		option.change(value);
	};
	const modal = document.getElementById("options");
	for (const option in OPTIONS) {
		const row = document.createElement("div");
		const text = document.createElement("div");
		row.classList = "row";
		text.classList = "text";
		text.innerText = OPTIONS[option].name;
		row.append(text);
		modal.append(row);

		if (OPTIONS[option].default == null) {
			row.classList.add("category");
			continue;
		}

		// Load option from localStorage
		let value = localStorage.getItem(OPTIONS[option].name);
		if (!value) value = OPTIONS[option].default;
		switch (typeof OPTIONS[option].default) {
			case "number":
				value = parseInt(value);
				break;
			case "boolean":
				value = value == "true" || value === true;
				break;
		}
		OPTIONS[option].change(value);

		// Add reset button
		// TODO : Hide 'set default' on option value change if value matches default value
		const reset = document.createElement("div");
		const element = document.createElement("input");
		reset.classList = "reset";
		reset.innerText = "↪";
		if (value != OPTIONS[option].default) reset.classList.add("visible");
		row.append(reset, element);

		// Boolean -> Checkbox
		if (typeof value == "boolean") {
			element.type = "checkbox";
			element.checked = value;
			element.addEventListener("change", () => {
				option_edit(OPTIONS[option], element.checked);
				if (element.checked == OPTIONS[option].default)
					reset.classList.remove("visible");
				else reset.classList.add("visible");
			});
			reset.addEventListener("click", () => {
				option_edit(OPTIONS[option], OPTIONS[option].default);
				element.checked = OPTIONS[option].default;
				reset.classList.toggle("visible");
			});
		}
		// 6 char hex -> Colorpicker
		else if (typeof value == "string" && value.match(/^#[0-9A-F]{6}$/i)) {
			element.type = "color";
			element.value = value;
			element.addEventListener("input", () => {
				option_edit(OPTIONS[option], element.value);
				reset.classList.add("visible");
			});
			reset.addEventListener("click", () => {
				option_edit(OPTIONS[option], OPTIONS[option].default);
				element.value = OPTIONS[option].default;
				reset.classList.toggle("visible");
			});
		}
		// Number -> Slider
		else if (typeof value == "number") {
			const display = document.createElement("div");
			display.classList.add("display");
			display.innerText = value;
			element.type = "range";
			element.min = OPTIONS[option].range[0];
			element.max = OPTIONS[option].range[1];
			element.value = value;
			element.addEventListener("input", () => {
				option_edit(OPTIONS[option], element.value);
				display.innerText = element.value;
				reset.classList.add("visible");
			});
			reset.addEventListener("click", () => {
				option_edit(OPTIONS[option], OPTIONS[option].default);
				element.value = OPTIONS[option].default;
				display.innerText = OPTIONS[option].default;
				reset.classList.toggle("visible");
			});
			row.append(display);
		}
	}
};

addEventListener("load", init_modal);
export default OPTIONS;
