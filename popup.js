const regen = () => {
	browser.storage.local.get(
		"redirects",
		({ redirects = {} }) => {
			const elem = document.getElementById("redirectList");

			const newChildren = Object
				.entries(redirects)
				.map(([href, count]) => {
					const url = new URL(href);

					const li = document.createElement("li");
					li.innerHTML = `
						<span>
							${count}
						</span>
						<pre style='display: inline'>
							${url.host}${url.pathname.substr(0, 20)}${url.pathname.length > 20 ? "..." : ""}
						</pre>
					`;
					return li;
				});

			for(const child of elem.children)
				elem.removeChild(child);

			for(const child of newChildren)
				elem.appendChild(child);
		},
	);
};

const reset = async () => {
	await browser.storage.local.clear();
	regen();
};

document.addEventListener("DOMContentLoaded", () => {
	regen();
	btnReset.onclick = e => reset();
});
