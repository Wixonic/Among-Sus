import { io } from "https://cdn.socket.io/4.5.4/socket.io.esm.min.js";
import { makeServerUrl, storage, validateServerUrl } from "./utils.js";
import { loadSounds } from "./sounds.js";

//window.actx = new (window.webkitAudioContext || AudioContext)();
const actx = new AudioContext();
actx.createPanner = () => new PannerNode(actx,{
	coneInnerAngle: 360,
	coneOuterAngle: 0,
	coneOuterGain: 0,
	distanceModel: "linear",
	maxDistance: 20,
	panningModel: "HRTF",
	refDistance: 2,
	rolloffFactor: 1
});

window.ping = "xx ms";
window.Users = {};

let s;
try {
	s = decodeURIComponent(location.search.replace("?","").split("server=")[1].split("&")[0]);
} catch {}
window.server = s || storage.getItem("server") || "http://localhost:3000";
document.getElementById("url").innerText = server;

document.getElementById("url").addEventListener("keydown",(e) => {
	if (e.key === "Enter") {
		document.getElementById("connect").click();
		e.preventDefault();
	}
});

document.getElementById("url").addEventListener("keyup",() => history.pushState(null,"",`${location.protocol}//${location.host}${location.pathname}?server=${encodeURIComponent(document.getElementById("url").innerText)}`));

document.getElementById("connect").addEventListener("click",() => {
	let url = document.getElementById("url").innerText;

	if (actx.state === "suspended") {
		actx.resume();
	}

	if (validateServerUrl(url)) {
		url = makeServerUrl(url);

		document.querySelector("loader#connecting").style.display = "flex";
		document.querySelector("loader#connecting").innerHTML = `Connecting to ${url}...`;
		history.pushState(null,"",`${location.protocol}//${location.host}${location.pathname}?server=${encodeURIComponent(url)}`);

		navigator.mediaDevices.getUserMedia({
			audio: {
				autoGainControl: false,
				channelCount: 1,
				echoCancellation: false,
				noiseSuppression: false
			}
		})
		.then((stream) => window.stream = stream)
		.finally(() => {
			window.socket = io(url,{
				path: "/ws",
				rememberUpgrade: true,
				timeout: 10000,
				transports: ["polling","websocket"]
			});

			socket.once("connect",() => {
				storage.setItem("server",url);
				setInterval(() => socket.volatile.emit("ping",(time) => ping = `${Date.now() - time} ms`),1000);
				start();
			});
		});
	}
});

const start = () => {
	if (window.stream) {
		let chunks = [];

		const recorder = new MediaRecorder(window.stream);
		recorder.addEventListener("dataavailable",(e) => chunks.push(e.data));
		recorder.addEventListener("stop",async () => {
			socket.emit("voice",new Blob(chunks));

			chunks = [];
		});

		const record = () => {
			if (recorder.state === "recording") {
				recorder.stop();
			}
			
			recorder.start();

			requestAnimationFrame(record);
		};

		record();
	}


	socket.on("list",(list) => {
		window.users = list;
	});

	socket.on("voice",async (id,data) => {
		const user = (window.users || {})[id];

		if (typeof user === "object" && data instanceof ArrayBuffer) {
			const panner = actx.createPanner();
			panner.positionX.setValueAtTime(user.position.x,actx.currentTime);
			panner.positionY.setValueAtTime(user.position.y,actx.currentTime);
			panner.positionZ.setValueAtTime(user.position.z,actx.currentTime);
			panner.connect(actx.destination);

			const buffer = await actx.decodeAudioData(data);
			
			const source = actx.createBufferSource();
			source.buffer = buffer;
			source.connect(panner);
			source.start();
		}
	});

	document.body.innerHTML = "<canvas></canvas>";
};

const loader = {
	count: 0,
	max: 83
};

document.querySelector("loader#loading max").innerHTML = loader.max;

loadSounds((id) => {
	/* document.querySelector("loader#loading count").innerHTML = loader.count++;
	document.querySelector("loader#loading bar").innerHTML = ((loader.count / loader.max) * 100).toFixed(1) + "%";
	document.querySelector("loader#loading bar").style.width = `max(${(loader.count / loader.max) * 100}%,1rem)`; */
})
//.then(() => {
	document.querySelector("loader#loading").remove();
//});