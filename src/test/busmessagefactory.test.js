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
var BusMessageFactory = require('../lib/busmessagefactory.js');

suite('BusMessageFactory -', function () {
	var sut;

	setup(function () {
		sut = new BusMessageFactory();
	});

	test("createMessage returns a message of the desired type", sinon.test(function () {
		var type = 'the desired type';
		var message = sut.createMessage(type);
		var actual = message.getType();
		assert.equal(actual, type, "The message type is not the correct one");
	}));
});
