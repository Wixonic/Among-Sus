const makeServerUrl = (url) => {
	url = new URL(url);
	return (["https:","wss:"].includes(url.protocol) ? "wss://" : "ws://") + url.host + url.pathname + (url.search.length > 0 ? url.search : "");
};

const request = (url="",opts={},body) => {
	if (typeof opts === "string") {
		opts = {
			type: opts
		};
	}

	return new Promise((resolve,reject) => {
		const xhr = new XMLHttpRequest();

		if (opts.header instanceof Array) {
			opts.headers = [opts.header];
			delete opts.header;
		}

		if (opts.headers instanceof Array) {
			for (let header of opts.headers) {
				if (header instanceof Array) {
					xhr.setRequestHeader(header[0],header[1]);
				}
			}
		}

		xhr.open(opts.method || "GET",url,true);

		xhr.onabort = () => reject(0,"Abort error");
		xhr.onerror = () => reject(0,"Network error");
		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				resolve(xhr.response);
			} else {
				reject(xhr.status,xhr.response);
			}
		};
		xhr.onprogress = opts.onprogress;
		xhr.ontimeout = () => reject(0,"Timeout error");

		xhr.send(body);
	});
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

const wait = (ms=0) => {
	if (typeof ms !== "number") {
		ms = 0;
	}

	return new Promise((resolve) => {
		if (ms <= 1000 / 60) {
			requestAnimationFrame(resolve);
		} else {
			setTimeout(resolve,ms);
		}
	});
};

export {
	makeServerUrl,
	request,
	storage,
	validateServerUrl,
	wait
};