import { io } from "https://cdn.socket.io/4.5.4/socket.io.esm.min.js";
import { makeServerUrl, storage, validateServerUrl } from "./utils.js";

// window.actx = new (window.webkitAudioContext || AudioContext)();
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

window.User = {
	listener: actx.listener,
	ping: "xxx",
	position: {
		x: 0,
		y: 0
	},
	socket: null
};
User.listener.positionZ = 0;

document.getElementById("url").innerText = storage.getItem("server") || "http://localhost:3000";

document.getElementById("connect").addEventListener("click",() => {
	let url = document.getElementById("url").innerText;

	if (actx.state === "suspended") {
		actx.resume();
	}

	if (validateServerUrl(url)) {
		url = makeServerUrl(url);

		document.querySelector("loader#connecting").style.display = "flex";
		document.querySelector("loader#connecting").innerHTML = `Connecting to <code>${url}</code>...`;

		User.socket = io(url,{
			path: "/ws",
			rememberUpgrade: true,
			timeout: 10000,
			transports: ["polling","websocket"]
		});

		User.socket.once("connect",() => {
			storage.setItem("server",url);
			setInterval(() => User.socket.volatile.emit("ping",(time) => User.ping = `${Date.now() - time} ms`),1000);
			start();
		});
	}
});

const start = () => {
	document.body.innerHTML = "<canvas></canvas>";
};

document.querySelector("loader#loading").remove();