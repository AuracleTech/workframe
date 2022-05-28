import "./desires.js";
import "./hotkeys.js";
import "./loading.js";

// TODO : TEMPORARY
// TODO : Remove IMG/cornflower.png when done testing
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
