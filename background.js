// https://mcas-proxyweb.mcas.ms/certificate-checker
//   login=false
//   originalUrl=<...>
//   McasCSRF=<...>
//
// https://eur02.safelinks.protection.outlook.com.mcas.ms/
// https://eur02.safelinks.protection.outlook.com/
//   url=<...>
//   data=<...>
//   sdata=<...>
//   reserved=0
//   McasTsid=<...>

const hosts = [
	{ host: "mcas-proxyweb.mcas.ms" },
	{ host: "mcas-proxyweb" },
	{
		host: "safelinks.protection.outlook.com.mcas.ms",
		subdomains: true,
	},
	{
		host: "safelinks.protection.outlook.com",
		subdomains: true,
	},
];

browser.webRequest.onBeforeRequest.addListener(
	details => {
		const { url: from } = details;
		const resolved = extractOriginalUrl(from);
		if (!resolved) return;

		countRedirect(from);
		return { redirectUrl: resolved };
	},
	{
		urls: hosts.map(h => `*://${h.subdomains ? "*." : ""}${h.host}/*`),
		types: [
			"main_frame",
			"sub_frame",
			"stylesheet",
			"script",
			"image",
			"object",
			"xmlhttprequest",
			"other",
		],
	},
	["blocking"]
);

const extractOriginalUrl = s => {
	const originalUrl = new URL(s);

	const found = hosts.find(({ host }) => originalUrl.hostname.endsWith(host));
	if(!found) return;

	if(originalUrl.pathname === "/certificate-checker") {
		const target = originalUrl.searchParams.get("originalUrl");
		if(!target) return;

		return extractOriginalUrl(target);
	}

	if (originalUrl.pathname === "/") {
		const target = originalUrl.searchParams.get("url");

		return target;
	}
};

const countRedirect = url => {
	browser.storage.local.get(
		"redirects",
		({ redirects = [] }) => {

			browser.storage.local.set({
				redirects: [
					...redirects,
					{
						url,
						time: Date.now(),
					},
				]
			});
		},
	);
};
