const regen = () => {
	browser.storage.local.get(
		"redirects",
		({ redirects = [] }) => {
			const elem = document.getElementById("redirectList");

			const newChildren = redirects
				.map(({ url: href, time }) => {
					const url = new URL(href);

					const li = document.createElement("li");
					li.innerHTML = `
						<span>
							${date2str(new Date(time))}
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

const date2str = d =>
	`${d.getYear() + 1900}/${pad((d.getMonth() + 1))}/${pad(d.getDate())} ` +
	`${pad(d.getHours())}:${pad(d.getMinutes())}`;

const pad = n => n < 10 ? `0${n}` : `${n}`;

const reset = async () => {
	await browser.storage.local.clear();
	regen();
};

document.addEventListener("DOMContentLoaded", () => {
	regen();
	btnReset.onclick = e => reset();
});
