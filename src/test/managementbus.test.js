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
var ManagementBus = require('../lib/managementbus.js');
var Bus = require('../lib/bus.js');
var settings = require('../lib/settings.management.js');

suite("ManagementBus suite", function () {
	var sut,
		name,
		bus,
		hosts = [{host: 'fakeHost', port: 'fakePort'}],
		connectCallback = function () {};

	setup(function () {
		name = 'fakeBusName';
		bus = new Bus(name, hosts, settings.user, settings.password, settings.destination, connectCallback);
		sut = new ManagementBus(name, hosts, connectCallback, bus);
	});

	teardown(function () {
	});

	test("on calls bus on", sinon.test(function () {
		var ev = 'fakeEvent', callback = function () {
		};

		this.mock(bus).expects('on').once().withExactArgs(ev, callback);
		sut.on(ev, callback);
	}));

	test("onAny calls bus onAny", sinon.test(function () {
		var ev = 'fakeEvent', callback = function () {
		};

		this.mock(bus).expects('onAny').once().withExactArgs(callback);
		sut.onAny(callback);
	}));

	test("send calls bus.send", sinon.test(function () {
		var message = 'fakeMessage';
		this.mock(bus).expects('send').once().withExactArgs(message);
		sut.send(message);
	}));

	test("connect calls bus connect", sinon.test(function () {


		this.mock(bus)
			.expects('connect')
			.once()
			.withExactArgs(undefined);

		sut.connect();
	}));

	test('should call bus.connect forwarding the argument (callback)', function () {
		var callback = function(){};
		this.mock(bus)
			.expects('connect')
			.once()
			.withExactArgs(callback);

		sut.connect(callback)
	});
});
