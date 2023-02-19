const makeServerUrl = (url) => {
	url = new URL(url);
	return (["https:","wss:"].includes(url.protocol) ? "wss://" : "ws://") + url.host + url.pathname + (url.search.length > 0 ? url.search : "");
};

const storage = window.localStorage || window.sessionStorage || {
	length: 0,

	clear: () => null,
	getItem: () => null,
	key: () => null,
	removeItem: () => null,
	setItem: () => null
};

const validateServerUrl = (url) => {
	try {
		url = new URL(url);
		return ["http:","https:","ws:","wss:"].includes(url.protocol) && url.hostname.length > 0;
	} catch {
		return false;
	}
};

export {
	makeServerUrl,
	storage,
	validateServerUrl
};