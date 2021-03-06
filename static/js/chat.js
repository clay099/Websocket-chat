/** Client-side of groupchat. */

const urlParts = document.URL.split("/");
const roomName = urlParts[urlParts.length - 1];
const ws = new WebSocket(`ws://localhost:3000/chat/${roomName}`);

const name = prompt("Username?");

/** called when connection opens, sends join info to server. */

ws.onopen = function (evt) {
	console.log("open", evt);

	let data = { type: "join", name: name };
	ws.send(JSON.stringify(data));
};

/** called when msg received from server; displays it. */

ws.onmessage = function (evt) {
	console.log("message", evt);

	let msg = JSON.parse(evt.data);
	let item;

	if (msg.type === "note") {
		item = $(`<li><i>${msg.text}</i></li>`);
	} else if (msg.type === "chat") {
		item = $(`<li><b>${msg.name}: </b>${msg.text}</li>`);
	} else if (msg.type === "private") {
		item = $(`<li><b>Private Message from${msg.name}: </b>${msg.text}</li>`);
	} else {
		return console.error(`bad message: ${msg}`);
	}

	$("#messages").append(item);
};

/** called on error; logs it. */

ws.onerror = function (evt) {
	console.error(`err ${evt}`);
};

/** called on connection-closed; logs it. */

ws.onclose = function (evt) {
	console.log("close", evt);
};

/** send message when button pushed. */

$("form").submit(function (evt) {
	evt.preventDefault();

	let data = { type: "chat", text: $("#m").val() };
	if ($("#m").val() === "/joke") {
		data = { type: "joke" };
	}
	if ($("#m").val() === "/members") {
		data = { type: "members" };
	}
	/**  expects three a string with at least 3 words. 1. /priv 2. <username> 3. any string
	 * e.g. "/priv 2 can you see this"
	 * the above text will send "can you see this" to someone with username "2"
	 */
	if ($("#m").val().includes("/priv")) {
		data = { type: "private", text: $("#m").val() };
	}
	ws.send(JSON.stringify(data));

	$("#m").val("");
});
