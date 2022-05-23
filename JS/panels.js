let uuids = [];
let shining = null;
let wall = document.createElement("div");
wall.id = "wall";

addEventListener("load", () => document.body.append(wall));

function get_panel(uuid) {
	return document.getElementById(`panel.${uuid}`);
}

let new_panel = () => {
	let uuid = Date.now();
	let panel = document.createElement("div");
	let title = document.createElement("div");
	let close = document.createElement("div");
	let grab = document.createElement("div");
	let resize = document.createElement("div");
	let alternate = document.createElement("div");
	let squish = document.createElement("div");
	let content = document.createElement("div");

	panel.classList.add("panel");
	title.classList.add("title");
	close.classList.add("close", "option");
	grab.classList.add("grab");
	resize.classList.add("resize", "option");
	alternate.classList.add("preserve", "option");
	squish.classList.add("squish", "option");
	content.classList.add("content");

	close.title = "Close";
	resize.title = "Resize";
	alternate.title = "Preserve";
	squish.title = "Squish";

	panel.id = `panel.${uuid}`;
	panel.min = { width: 180, height: 70 };
	panel.content = content;
	uuids.push(uuid);

	// TODO : Make all these functions into methods of the panel object
	panel.shine = () => {
		if (shining) {
			shining.classList.remove("focus");
			shining.style.zIndex = null;
		}
		shining = panel;
		shining.classList.add("focus");
		shining.style.zIndex = "1";
	};
	panel.preserve = () => {
		panel.preserved = {
			width: panel.clientWidth,
			height: panel.clientHeight,
			top: panel.offsetTop,
			left: panel.offsetLeft,
		};
		panel.dispatchEvent(new Event("preserve"));
	};
	panel.restore = () => {
		panel.resize(panel.preserved);
		panel.dispatchEvent(new Event("restore"));
	};
	panel.resize = (size) => {
		// TODO : Make sure the panel is not too small
		let { width, height, top, left } = size;
		if (typeof width == "string") {
			width = Math.floor(
				(parseInt(width.replace("%", "")) * wall.clientWidth) / 100
			);
		}
		if (typeof height == "string") {
			height = Math.floor(
				(parseInt(height.replace("%", "")) * wall.clientHeight) / 100
			);
		}
		if (typeof top == "string") {
			top = Math.floor(
				(parseInt(top.replace("%", "")) * wall.clientHeight) / 100
			);
		}
		if (typeof left == "string") {
			left = Math.floor(
				(parseInt(left.replace("%", "")) * wall.clientWidth) / 100
			);
		}
		panel.style.width = `${width}px`;
		panel.style.height = `${height}px`;
		panel.style.top = `${top}px`;
		panel.style.left = `${left}px`;
		panel.dispatchEvent(
			new CustomEvent("resize", { detail: { width, height, top, left } })
		);
	};
	panel.maximize = () => {
		panel.preserve();
		panel.resize({
			width: wall.clientWidth,
			height: wall.clientHeight,
			top: 0,
			left: 0,
		});
	};
	panel.squish = () => {
		// TODO : HOTFIX REQUIRED : Bug when the panel is resized
		// TODO : Change icon direction when active
		// TODO : disable preserve when squished
		panel.classList.toggle("squish");
	};
	panel.close = () => {
		panel.remove();
		uuids.splice(uuids.indexOf(uuid), 1);
		if (uuids.length > 0) get_panel(uuids[uuids.length - 1]).shine();
	};

	let alternate_click = () => {
		if (alternate.classList.contains("preserve")) return panel.preserve();
		panel.restore();
	};

	let grab_dblclick = () => {
		if (panel.maximized) return panel.restore();
		panel.maximize();
	};

	let grab_pointerdown = (ev) => {
		panel.classList.add("dragging");
		let offsetX = ev.offsetX + grab.offsetLeft;
		let offsetY = ev.offsetY + grab.offsetTop;
		let sizeX = panel.clientWidth;
		let sizeY = panel.clientHeight;
		let pointermove = (ev) => {
			let newPosX = ev.clientX - offsetX;
			let newPosY = ev.clientY - offsetY;
			if (newPosX < 0) newPosX = 0;
			if (newPosX + sizeX > wall.clientWidth) {
				newPosX = wall.clientWidth - sizeX;
			}
			if (newPosY < 0) newPosY = 0;
			if (newPosY + sizeY > wall.clientHeight) {
				newPosY = wall.clientHeight - sizeY;
			}
			panel.style.left = `${newPosX}px`;
			panel.style.top = `${newPosY}px`;
		};
		let pointerup = () => {
			panel.classList.remove("dragging");
			document.removeEventListener("pointermove", pointermove);
			document.removeEventListener("pointerup", pointerup);
		};
		document.addEventListener("pointermove", pointermove);
		document.addEventListener("pointerup", pointerup);
	};

	let resize_click = () => {
		panel.classList.add("resizing");
		let helper = document.createElement("canvas");
		helper.id = "helper";
		let helper_ctx = helper.getContext("2d");
		document.body.append(helper);
		let helper_resize = () => {
			helper.width = innerWidth;
			helper.height = innerHeight;
		};
		helper_resize();
		addEventListener("resize", helper_resize);
		let pos = {};
		let down = (ev) => {
			pos.start = {
				x: ev.clientX,
				y: ev.clientY,
			};
			document.addEventListener("pointermove", move);
			document.addEventListener("pointerup", up);
		};
		let move = (ev) => {
			pos.end = { x: ev.clientX - pos.start.x, y: ev.clientY - pos.start.y };
			helper_ctx.clearRect(0, 0, helper.width, helper.height);
			// TODO : Use css -- instead of hardcoded values (--panel-resizing) let root = document.querySelector(":root");
			helper_ctx.fillStyle = "#e6a6a3";
			helper_ctx.fillRect(pos.start.x, pos.start.y, pos.end.x, pos.end.y);
		};
		let up = (ev) => {
			// TODO : Negate the size of which is outside the wall boundaries
			let snapSize = 20;
			let left = pos.start.x < ev.clientX ? pos.start.x : ev.clientX;
			if (left < 0) left = 0;
			let top = pos.start.y < ev.clientY ? pos.start.y : ev.clientY;
			if (top < 0) top = 0;
			let width = Math.abs(ev.clientX - pos.start.x);
			let height = Math.abs(ev.clientY - pos.start.y);
			// TODO : Fix min sizes by supporting width lower than 200px
			if (width < panel.min.width) width = panel.min.width;
			if (height < panel.min.height) height = panel.min.height;
			if (left + width > wall.clientWidth) left = wall.clientWidth - width;
			if (top + height > wall.clientHeight) top = wall.clientHeight - height;
			if (top < snapSize) top = 0;
			if (left < snapSize) left = 0;
			if (top + height > wall.clientHeight - snapSize)
				height = wall.clientHeight - top;
			if (left + width > wall.clientWidth - snapSize)
				width = wall.clientWidth - left;
			helper.remove();
			panel.resize({ width, height, top, left });
			panel.classList.remove("resizing");
			document.removeEventListener("pointerdown", down);
			document.removeEventListener("pointermove", move);
			document.removeEventListener("pointerup", up);
			removeEventListener("resize", helper_resize);
		};
		document.addEventListener("pointerdown", down);
	};

	let preserve_event = () => {
		alternate.classList.add("restore");
		alternate.classList.remove("preserve");
		alternate.title = "Restore";
	};
	let restore_event = () => {
		alternate.classList.add("preserve");
		alternate.classList.remove("restore");
		alternate.title = "Preserve";
	};
	let resize_event = (ev) => {
		panel.maximized =
			ev.detail.width === wall.clientWidth &&
			ev.detail.height === wall.clientHeight &&
			ev.detail.top === 0 &&
			ev.detail.left === 0;
	};

	title.append(close, grab, resize, alternate, squish);
	panel.append(title, content);
	wall.append(panel);

	close.addEventListener("pointerdown", (ev) => {
		ev.stopPropagation();
		panel.close();
	});
	grab.addEventListener("pointerdown", grab_pointerdown);
	grab.addEventListener("dblclick", grab_dblclick);
	resize.addEventListener("click", resize_click);
	alternate.addEventListener("click", alternate_click);
	squish.addEventListener("click", panel.squish);
	panel.addEventListener("preserve", preserve_event);
	panel.addEventListener("restore", restore_event);
	panel.addEventListener("resize", resize_event);
	panel.addEventListener("pointerdown", panel.shine);
	panel.shine();
	return panel;
};

export { new_panel, shining };
