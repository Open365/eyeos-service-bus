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

"use strict";

function parseHostsList (hostsString) {
	// parseHostsList parses a list of hosts (eg. from env variables) for
	// 			constructing eyeos-service-bus objects.
	// :param: hostsString is in the form: "host1:port1,host2:port2"
	// :returns: an the objects structure required by ManagementBus, BusToHttp, Bus, StompClient:
	// 				objects array in the form:
	//			   [{host: host1, port: port1}, {host: host2, port: port2}]
	var hostsPorts = hostsString.split(',');
	var parsedHosts = [];
	hostsPorts.forEach(function (hostPort) {
		hostPort = hostPort.trim().split(':');
		if (hostPort.length === 2){
			parsedHosts.push({host: hostPort[0].trim(), port: parseInt(hostPort[1].trim(), 10)});
		} else {
			throw new Error('Wrongly formatted Hosts List:', hostsString);
		}
	});

	return parsedHosts;
}

module.exports.parseHostsList = parseHostsList;
