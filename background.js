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
	{ host: "mcas-proxyweb.mcas.ms", extract: mcas, },
	{ host: "mcas-proxyweb", extract: mcas, },
	{
		host: "safelinks.protection.outlook.com.mcas.ms",
		subdomains: true,
		extract: mcas,
	},
	{
		host: "safelinks.protection.outlook.com",
		subdomains: true,
		extract: mcas,
	},
	{
		host: "awstrack.me",
		subdomains: true,
		extract: aws,
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

	return found.extract(originalUrl)
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

function mcas(originalUrl) {
	if(originalUrl.pathname === "/certificate-checker") {
		const target = originalUrl.searchParams.get("originalUrl");
		if(!target) return;

		return extractOriginalUrl(target);
	}

	if (originalUrl.pathname === "/") {
		const target = originalUrl.searchParams.get("url");

		return target;
	}
}

function aws(originalUrl) {
	// https://<subdomain>.<another>.<region>.awstrack.me/L0/<real-url>/<tracking-a>/<tracking-b>/<tracking-c>
	//                                                       ^~~~~~~~~~

	const target = u.pathname.split('/')[2];

	return decodeURIComponent(target);
}
