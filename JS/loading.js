let loading = document.createElement("div");
loading.id = "loading";
let logo = document.createElement("div");
logo.classList.add("logo");
let half1 = document.createElement("div");
half1.classList.add("half", "first");
let half2 = document.createElement("div");
half2.classList.add("half", "second");
logo.append(half1, half2);
loading.append(logo);
document.body.append(loading);

addEventListener("load", () => {
	loading.classList.add("done");
	setTimeout(() => {
		loading.remove();
	}, 1500);
});
