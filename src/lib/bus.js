/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

var StompClient = require('./stompclient.js');
var EventHandler = require('./eventhandler.js');

//Constructor
function Bus (name, hosts, user, password, destination, connectCallback, eventHandler, stompClient) {
	this.eventHandler = eventHandler || new EventHandler();
	this.stompClient = stompClient || new StompClient(hosts, user, password, destination, connectCallback, this.eventHandler);
	this.name = name;
};

Bus.prototype = {
	connect: function (connectCallback) {
		if (connectCallback) {
			this.stompClient.setConnectCallback(connectCallback);
		}
		this.stompClient.connect();
	},

	send: function (message) {
		message.setFrom(this.name);
		var relateds = message.getRelated();
		var i;
		for (i = 0; i < relateds.length; i++) {
			var related = relateds[i];
			if (related) {
				if (related.type) {
					this.eventHandler.on(related.type, this.generateEventHandlerCallback(message, related.callback));
				} else {
					this.eventHandler.onAny(this.generateEventHandlerCallback(message, related.callback));
				}
			}
		}
		this.stompClient.send(message);
	},

	generateEventHandlerCallback: function (message, callback) {
		return function (messageData) {
			if (message.getId() === messageData.getCorrelationId()) {
				callback(messageData);
			}
		};
	},

	setUseEnhancedMessages: function (useEnhancedMessages) {
		this.stompClient.setUseEnhancedMessages(useEnhancedMessages);
	},

	on: function (type, callback) {
		this.eventHandler.on(type, callback);
		return this;
	},

	onAny: function (callback) {
		this.eventHandler.onAny(callback);
		return this;
	}
};

module.exports = Bus;
