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

var MappingsCollection = require('./mappingscollection.js'),
	ManagementBus = require('../lib/managementbus.js'),
	http = require('http'),
	HttpWrapper = require('eyeos-http-wrapper'),
	logger = require('log2out').getLogger('bustohttp');

//Constructor
var BusToHttp = function(appName, busHosts, restHost, restPort, headers, ssl, mappingsCollection, managementBus, httpWrapper) {
	function _brokerConnectedCallback () {
		logger.info('Connected to ManagementBus with host settings: ', JSON.stringify(busHosts));
	}
	this.mappingsCollection = mappingsCollection || new MappingsCollection();
	this.ssl = ssl || false;
	this.httpWrapper = httpWrapper || new HttpWrapper(this.ssl);
	// this.busHosts is an array of host objects in the form [{host: 'x', port: p}]
	this.busHosts = busHosts;
	this.managementBus = managementBus || new ManagementBus(appName, busHosts, _brokerConnectedCallback);
	this.restHost = restHost;
	this.restPort = restPort;
	this.headers = headers || {'Content-Type': 'application/json'};
};

BusToHttp.prototype = {

	connectToBus: function() {
		this.managementBus.connect();
	},

	addMapping: function(mapping){
		this.mappingsCollection.add(mapping);
		var self = this;
		this.managementBus.on(mapping.getBusMessage(), function(message) {
            self.send(message);
		});
	},

	send: function(message) {
		var mapping = this.mappingsCollection.get(message.getType());

		if (mapping.doRequest(message)) {

			var data = message.getData();
			var dataString = mapping.executeParamConverterFunction(data);
			this.headers['Content-Length'] = dataString.length;
			var httpOptions = {
				host: this.restHost,
				port: this.restPort,
				path: mapping.getPath(),
				method: mapping.getHttpMethod(),
				headers: this.headers
			};
			if (this.ssl) {
				httpOptions.rejectUnauthorized = false;
			}

			var self = this;
			this.httpWrapper.request(dataString, httpOptions, function(response) {
				if (mapping.getBusResponseMessage()) {
					if (response) {
						var responseBody = JSON.parse(response);
						var replyBusMessage = message.reply(mapping.getBusResponseMessage());
						replyBusMessage.setData(responseBody);
						self.managementBus.send(replyBusMessage);
					}
				}

			}, function(error) {
				logger.error('Error in the request to Rest service: ', error);
			});

		}
	}

};

module.exports = BusToHttp;
