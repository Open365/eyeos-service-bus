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

var Message = require('./lib/busmessage.js');
var BusMessageFactory = require('./lib/busmessagefactory.js');
var Bus = require('./lib/bus.js');
var ManagementBus = require('./lib/managementbus.js');
var BusToHttp = require('./bustohttp/bustohttp.js');
var Mapping = require('./bustohttp/mapping.js');
var HostProvider = require('./lib/HostProvider');
var parseHostsList = require('./lib/broker-utils.js').parseHostsList;
var StompFireAndForgetClient = require('./lib/StompFireAndForgetClient.js');

module.exports = {
	BusMessage: Message,
	BusMessageFactory: BusMessageFactory,
	Bus: Bus,
	ManagementBus: ManagementBus,
	BusToHttp: BusToHttp,
	Mapping: Mapping,
	parseHostsList: parseHostsList,
	HostProvider: HostProvider,
	StompFireAndForgetClient: StompFireAndForgetClient
};
