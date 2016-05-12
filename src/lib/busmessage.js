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

var nodeUuid = require('node-uuid');

function BusMessage (type, uuidGenerator) {
	this.type = type;
	this.uuidGenerator = uuidGenerator || nodeUuid;
	this.related = [];

	this.generateId();
};

BusMessage.fromJsonString = function (jsonString) {
	var messageBodyPojo = JSON.parse(jsonString);
	var busMessage = new BusMessage(messageBodyPojo.type);
	busMessage.setId(messageBodyPojo.id)
		.setCorrelationId(messageBodyPojo.correlationId)
		.setFrom(messageBodyPojo.from)
		.setData(messageBodyPojo.data);
	return busMessage;
};

BusMessage.prototype = {
	onRelated: function (type, callback) {
		if (arguments.length == 1) {
			callback = type;
			type = null;
		}
		this.related.push({
			callback: callback,
			type: type
		});
		return this;
	},

	reply: function (type) {
		var returnedMessage = new BusMessage(type);
		returnedMessage.setCorrelationId(this.getId());
		return returnedMessage;
	},

	getRelated: function () {
		return this.related;
	},

	setData: function (data) {
		this.data = data;
		return this;
	},

	getData: function () {
		return this.data;
	},

	getType: function () {
		return this.type;
	},

	setFrom: function (from) {
		this.from = from;
		return this;
	},

	getFrom: function () {
		return this.from;
	},

	setId: function (id) {
		this.id = id;
		return this;
	},

	getId: function () {
		return this.id;
	},

	generateId: function () {
		this.setId(this.uuidGenerator.v4());
		return this;
	},

	setCorrelationId: function (corr) {
		this.correlationId = corr;
		return this;
	},

	getCorrelationId: function () {
		return this.correlationId;
	},

	toJsonString: function () {
		return JSON.stringify(this);
	}
};

module.exports = BusMessage;
