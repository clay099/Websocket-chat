/** Functionality related to chatting. */

// Room is an abstraction of a chat channel
const Room = require("./Room");

/** ChatUser is a individual connection from client -> server to chat. */

class ChatUser {
	/** make chat: store connection-device, rooom */

	constructor(send, roomName) {
		this._send = send; // "send" function for this user
		this.room = Room.get(roomName); // room user will be in
		this.name = null; // becomes the username of the visitor

		console.log(`created chat in ${this.room.name}`);
	}

	/** send msgs to this client using underlying connection-send-function */

	send(data) {
		try {
			this._send(data);
		} catch {
			// If trying to send to a user fails, ignore it
		}
	}

	/** handle joining: add to room members, announce join */

	handleJoin(name) {
		this.name = name;
		this.room.join(this);
		this.room.broadcast({
			type: "note",
			text: `${this.name} joined "${this.room.name}".`,
		});
	}

	/** handle a chat: broadcast to room. */

	handleChat(text) {
		this.room.broadcast({
			name: this.name,
			type: "chat",
			text: text,
		});
	}

	/** handle a joke request */
	handleJoke() {
		this.send(
			JSON.stringify({
				type: "chat",
				text: "What do you call eight hobbits? A hob-byte!",
				name: "Server",
			})
		);
	}

	/** handle a member request */
	handleMembers() {
		let members = this.room.members;
		let mList = [];
		// console.log(members);
		for (let member of members) {
			mList.push(member.name);
		}
		this.send(
			JSON.stringify({
				type: "chat",
				text: `In room: ${mList}`,
				name: "Server",
			})
		);
	}

	/** Handle messages from client:
	 *
	 * - {type: "join", name: username} : join
	 * - {type: "chat", text: msg }     : chat
	 */

	handleMessage(jsonData) {
		let msg = JSON.parse(jsonData);

		if (msg.type === "join") this.handleJoin(msg.name);
		else if (msg.type === "chat") this.handleChat(msg.text);
		else if (msg.type === "joke") this.handleJoke();
		else if (msg.type === "members") this.handleMembers();
		else throw new Error(`bad message: ${msg.type}`);
	}

	/** Connection was closed: leave room, announce exit to others */

	handleClose() {
		this.room.leave(this);
		this.room.broadcast({
			type: "note",
			text: `${this.name} left ${this.room.name}.`,
		});
	}
}

module.exports = ChatUser;
