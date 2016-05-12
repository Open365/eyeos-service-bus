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

var Mapping = function(busMessage, busResponseMessage, restHttpMethod, restPath) {
	this.busMessage = busMessage;
	this.busResponseMessage = busResponseMessage;
	this.restHttpMethod = restHttpMethod;
	this.restPath = restPath;
};

Mapping.prototype = {
	busMessage: null,
	busResponseMessage: null,
	restHttpMethod: null,
	restPath: null,
	paramConverterFunction: null,
	paramConverterFunctionScope: null,
	doRequestFunction: null,
	doRequestFunctionScope: null,

	getBusMessage: function() {
		return this.busMessage;
	},

	getPath: function() {
		return this.restPath;
	},

	getHttpMethod: function() {
		return this.restHttpMethod;
	},

	getBusResponseMessage: function() {
		return this.busResponseMessage;
	},

	setParamConverterFunction: function(paramConverterFunction, scope) {
		this.paramConverterFunction = paramConverterFunction;
		this.paramConverterFunctionScope = scope || null;
	},

	executeParamConverterFunction: function(data) {
		if (typeof this.paramConverterFunction !== 'function') {
			return data;
		}

		return this.paramConverterFunction.call(this.paramConverterFunctionScope, data);
	},

	setDoRequestFunction: function(doRequestFunction, scope) {
		this.doRequestFunction = doRequestFunction;
		this.doRequestFunctionScope = scope || null;
	},

	doRequest: function(message) {
		if (typeof this.doRequestFunction !== 'function') {
			return true;
		}
		var result = this.doRequestFunction.call(this.doRequestFunctionScope, message);
		return result;
	}
};

module.exports = Mapping;