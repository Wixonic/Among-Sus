import { io } from "https://cdn.socket.io/4.5.4/socket.io.esm.min.js";
import { loadSounds } from "./sounds.js";
import { makeServerUrl, storage, validateServerUrl } from "./utils.js";

window.actx = new (window.webkitAudioContext || AudioContext)();
actx.createPanner = () => new PannerNode(actx,{coneInnerAngle:360,coneOuterAngle:0,coneOuterGain:0,distanceModel:"linear",maxDistance:20,panningModel:"HRTF",refDistance:2,rolloffFactor:1});
window.gain = actx.createGain();
gain.connect(actx.destination);

window.connections = {};
window.ping = "xx ms";
window.users = {};

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
		.catch((e) => console.warn("Failed to get user's microphone stream",e))
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
		socket.on("signal",async (id,state,...args) => {
			const setup = () => {
				if (connections[id]) {
					delete connections[id];
				}

				connections[id] = new RTCPeerConnection({
					iceServers: [
						{
							urls: "stun:relay.metered.ca:80"
						},{
							urls: "turn:relay.metered.ca:80",
							username: "3b6ed9a89108eb16e9e86857",
							credential: "eOOCe7fIBw+uDV8C"
						},{
							urls: "turn:relay.metered.ca:443",
							username: "3b6ed9a89108eb16e9e86857",
							credential: "eOOCe7fIBw+uDV8C"
						},{
							urls: "turn:relay.metered.ca:443?transport=tcp",
							username: "3b6ed9a89108eb16e9e86857",
							credential: "eOOCe7fIBw+uDV8C"
						}
					]
				});

				connections[id].stream = new MediaStream();

				connections[id].addEventListener("icecandidate",(e) => {
					if (e.candidate) {
						socket.emit("signal",id,3);
					}
				});

				connections[id].addEventListener("track",(e) => {
					connections[id].stream.addTrack(e.track);

					if (!connections[id].source) {
						connections[id].source = actx.createMediaStreamSource(connections[id].stream);
						connections[id].source.connect(connections[id].gain);
					}
				});

				for (let track of stream.getAudioTracks()) {
					connections[id].addTrack(track);
				}

				connections[id].gain = actx.createGain();
				connections[id].panner = actx.createPanner();

				connections[id].gain.connect(connections[id].panner);
				connections[id].panner.connect(gain);
			};

			switch (state) {
				case 0:
					setup();

					const offer = await connections[id].createOffer();
					connections[id].setLocalDescription(offer);

					socket.emit("signal",id,1,offer);
					break;

				case 1:
					setup();

					connections[id].setRemoteDescription(args[0]);

					const answer = await connections[id].createAnswer();
					connections[id].setLocalDescription(answer);

					socket.emit("signal",id,2,answer);
					break;

				case 2:
					connections[id].setRemoteDescription(args[0]);
					break;

				case 3:
					connections[id].addIceCandidate(args[0]).catch((e) => console.warn("Failed to add ICE candidate:",e));
					break;
			}
		});
	}


	socket.on("list",(list) => {
		window.users = list;
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