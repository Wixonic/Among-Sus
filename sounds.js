import { request, wait } from "./utils.js";

const loadSounds = (progress) => {
	if (typeof progress !== "function") {
		progress = () => null;
	}

	const loadPath = async (object={},path="/") => {		
		if (object instanceof Array) {
			for (let id in object) {
				const el = object[id];

				if (typeof el === "object") {
					await loadPath(el,`${path}${id}/`);
				} else if (!soundsList[`${path}${el}`]) {
					try {
						soundsList[`${path}${el}`] = await request(`assets/sounds${path}${el}.mp3`,"audiobuffer");
						progress(`${path}${el}`);
					} catch {
						await wait(750);
						await loadPath(object,path);
						break;
					}
				}
			}
		} else {
			for (let id in object) {
				const el = object[id];

				if (typeof el === "object") {
					await loadPath(el,`${path}${id}/`);
				} else if (!soundsList[`${path}${el}`]) {
					try {
						soundsList[`${path}${el}`] = await request(`assets/sounds${path}${el}.mp3`,"audiobuffer");
						progress(`${path}${el}`);
					} catch {
						await wait(750);
						await loadPath(object,path);
						break;
					}
				}
			}
		}
	};

	return loadPath(soundsListUrl);
};

class Sound {
	
};

const soundsList = {};
const soundsListUrl = {
	crewmate: [
		"reveal","win"
	],
	impostor: [
		"reveal","win"
	],
	kill: [
		"gun","kill","knife","laser","neck","tongue","victime"
	],
	map: {
		lobby: [
			"ambience","join","leave"
		],
		skeld: {
			"0": "ambience",
			"1": "hallways",
			"room": {
				"engine": [
					"ambience","shock","steam"
				]
			}
		},
		mira: {
			"room": {
				
			}
		},
		polus: {
			"0": "ambience",
			"room": {
				
			}
		},
		airship: {
			"0": "ambience",
			"room": {
				
			}
		}
	},
	other: [
		"too-much-disconnections"
	],
	sabotage: [
		"alarm","avert-crash-course"
	],
	step: {
		carpet: [
			"step_1"
		],
		dirt: [
			"step_1","step_2","step_3","step_4"
		],
		glass: [
			"step_1","step_2","step_3","step_4","step_5","step_6","step_7"
		],
		metal: [
			"step_1","step_2","step_3","step_4","step_5","step_6","step_7","step_8","step_9","step_10","step_11"
		],
		plastic: [
			"step_1","step_2","step_3","step_4","step_5"
		],
		snow: [
			"step_1","step_2","step_3","step_4","step_5","step_6","step_7"
		],
		tile: [
			"step_1","step_2","step_3","step_4","step_5","step_6","step_7","step_8","step_9","step_10"
		],
		wood: [
			"step_1","step_2","step_3","step_4","step_5","step_6","step_7","step_8","step_9","step_10"
		]
	},
	task: [
		"close","complete","open","partial-complete"
	]
};

export {
	loadSounds,
	Sound,
	soundsList,
	soundsListUrl
};