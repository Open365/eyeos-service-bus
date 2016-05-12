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

var sinon = require('sinon');
var assert = require('chai').assert;
var HostProvider = require('../lib/HostProvider');

suite('HostProvider', function(){
	var sut;

	var hosts = [
		{host: "192.168.1.1", port: 2009},
		{host: "192.168.1.2", port: 2010},
		{host: "192.168.1.3", port: 2011},
		{host: "192.168.1.4", port: 2012}
	];

	setup(function(){
		sut = new HostProvider(hosts.slice(0));
	});

	suite('#getHost', function(){
		test('Should return a different host everytime', function(){
			var host = sut.getHost();
			var host2 = sut.getHost();

			assert.notEqual(host, host2);
		});
	});

	var checkArrayOrder = function(array, compareArray) {
		for(var x = 0; x < sut.hostArray.length; x++) {
			if (sut.hostArray[x].host != compareArray[x].host) {
				return false;
			}
		}

		return true;
	};
});
