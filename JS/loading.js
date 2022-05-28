const loaded = () => {
	const loading = document.getElementById("loading");
	loading.classList.add("done");
	loading.addEventListener(
		"animationend",
		(ev) => ev.target.parentElement == loading && loading.remove()
	);
};
addEventListener("load", loaded);
