const wall = document.getElementById("wall");
let focused = null;

wall.addEventListener("contextmenu", (ev) => {
	if (ev.target === ev.currentTarget) {
		ev.preventDefault();
		focus(null);
	}
});

const focus = (panel) => {
	if (focused) {
		focused.classList.remove("focus");
		focused.style.zIndex = null;
	}
	focused = panel;
	if (!panel) return;
	focused.classList.add("focus");
	focused.style.zIndex = "1";
};
const preserve = (panel) => {
	// TODO : Do not force width and height like we used to do, no no no
	panel.preserved = {
		width: panel.clientWidth,
		height: panel.clientHeight,
		top: panel.offsetTop,
		left: panel.offsetLeft,
	};
	panel.alternate.classList.add("restore");
	panel.alternate.title = "Restore";
};
const restore = (panel) => {
	resize(panel, panel.preserved);
	panel.alternate.classList.remove("restore");
	panel.alternate.title = "Preserve";
};
const maximize = (panel) => {
	// TODO : Do not force width and height like we used to do, no no no
	if (panel.maximize) return restore(panel);
	preserve(panel);
	resize(panel, {
		width: wall.clientWidth,
		height: wall.clientHeight,
	});
};
const squish = (panel) => {
	// TODO : HOTFIX REQUIRED : Bug when the panel is resized
	// TODO : Change icon direction when active
	// TODO : disable preserve when squished
	panel.classList.toggle("squish");
};
const close = (panel, ev) => {
	ev.stopPropagation();
	panel.remove();
	const next = wall.querySelector(".panel");
	if (next) focus(next);
};
const alternate = (panel) => {
	if (panel.alternate.classList.contains("restore")) return restore(panel);
	preserve(panel);
};
const reposition = (panel, positions) => {
	if (!positions) positions = { top: panel.offsetTop, left: panel.offsetLeft };
	let { top, left } = positions;
	top = Math.max(0, Math.min(top, wall.clientHeight - panel.clientHeight));
	left = Math.max(0, Math.min(left, wall.clientWidth - panel.clientWidth));
	panel.style.top = `${top}px`;
	panel.style.left = `${left}px`;
	panel.dispatchEvent(new CustomEvent("reposition", { detail: { top, left } }));
};
const resize = (panel, size) => {
	const { width, height } = size;
	panel.style.width = `${width}px`;
	panel.style.height = `${height}px`;
	panel.maximize = width === wall.clientWidth && height === wall.clientHeight;
	panel.dispatchEvent(new CustomEvent("resize", { detail: { width, height } }));
};
const resize_click = (panel) => {
	document.body.classList.add("resizing");
	const down = (ev) => {
		const limit = (ev) => {
			return {
				x: Math.max(0, Math.min(ev.clientX, wall.clientWidth)),
				y: Math.max(0, Math.min(ev.clientY, wall.clientHeight)),
			};
		};
		const move = (ev) => {
			const snap = 16;
			const move_pos = limit(ev);
			let top = Math.min(move_pos.y, down_pos.y);
			let left = Math.min(move_pos.x, down_pos.x);
			let right = Math.max(move_pos.x, down_pos.x);
			let bottom = Math.max(move_pos.y, down_pos.y);
			top = top < snap ? 0 : top;
			left = left < snap ? 0 : left;
			right = right > wall.clientWidth - snap ? wall.clientWidth : right;
			bottom = bottom > wall.clientHeight - snap ? wall.clientHeight : bottom;
			const width = right - left;
			const height = bottom - top;
			resize(panel, { width, height });
			reposition(panel, { top, left });
		};
		const up = () => {
			document.body.classList.remove("resizing");
			removeEventListener("pointerdown", down);
			removeEventListener("pointermove", move);
			removeEventListener("pointerup", up);
		};
		const down_pos = limit(ev);
		addEventListener("pointermove", move);
		addEventListener("pointerup", up);
	};
	addEventListener("pointerdown", down);
};
const grab = (panel, ev) => {
	panel.classList.add("dragging");
	const start = {
		x: ev.clientX - panel.offsetLeft,
		y: ev.clientY - panel.offsetTop,
	};
	const pointermove = (ev) =>
		reposition(panel, {
			top: ev.clientY - start.y,
			left: ev.clientX - start.x,
		});
	const pointerup = () => {
		panel.classList.remove("dragging");
		document.removeEventListener("pointermove", pointermove);
		document.removeEventListener("pointerup", pointerup);
	};
	document.addEventListener("pointermove", pointermove);
	document.addEventListener("pointerup", pointerup);
};

/**
 * @param {options} options
 * options.resizable : boolean
 * options.preservable : boolean
 */
const new_panel = (options = { resizable: false, preservable: false }) => {
	const { resizable, preservable } = options;
	const panel = document.createElement("div");
	panel.classList.add("panel");
	panel.addEventListener("pointerdown", () => focus(panel));
	const resizeObserver = new ResizeObserver((entries) =>
		entries.forEach((entry) => reposition(entry.target))
	);
	resizeObserver.observe(panel);

	panel.bar = document.createElement("div");
	panel.bar.classList.add("bar");
	panel.append(panel.bar);

	panel.close = document.createElement("div");
	panel.close.classList.add("close", "option");
	panel.close.title = "Close";
	panel.close.addEventListener("pointerup", (ev) => close(panel, ev));
	panel.bar.append(panel.close);

	panel.grab = document.createElement("div");
	panel.grab.classList.add("grab");
	panel.grab.addEventListener("pointerdown", (ev) => grab(panel, ev));
	if (resizable) panel.grab.addEventListener("dblclick", () => maximize(panel));
	else panel.grab.addEventListener("dblclick", () => squish(panel));
	panel.bar.append(panel.grab);

	panel.resize = document.createElement("div");
	panel.resize.classList.add("resize", "option");
	panel.resize.title = "Resize";
	panel.resize.addEventListener("click", (ev) => resize_click(panel, ev));
	if (resizable) panel.bar.append(panel.resize);

	panel.alternate = document.createElement("div");
	panel.alternate.classList.add("preserve", "option");
	panel.alternate.title = "Preserve";
	panel.alternate.addEventListener("click", () => alternate(panel));
	if (preservable) panel.bar.append(panel.alternate);

	panel.squish = document.createElement("div");
	panel.squish.classList.add("squish", "option");
	panel.squish.title = "Squish";
	panel.squish.addEventListener("click", () => squish(panel));
	panel.bar.append(panel.squish);

	panel.content = document.createElement("div");
	panel.content.classList.add("content");
	panel.append(panel.content);

	wall.append(panel);

	focus(panel);
	return panel;
};

export { new_panel, focused };
