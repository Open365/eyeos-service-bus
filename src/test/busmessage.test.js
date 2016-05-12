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

var assert = require('chai').assert;
var sinon = require('sinon');
var uuid = require('node-uuid');
var BusMessage = require('../lib/busmessage.js');

suite('BusMessage suite:', function () {
	var sut, type;

	setup(function () {
		type = 'foobar';
		sut = new BusMessage(type);
	});

	teardown(function () {

	});

	test("sut constructor calls uuid.v4()", sinon.test(function () {
		this.mock(uuid).expects('v4').once().withExactArgs();
		var message = new BusMessage('foobar');
	}));

	test("reply returns a new message with correlationId", sinon.test(function () {
		var type = 'coolType';
		var relatedMessage = sut.reply(type);
		assert.equal(sut.getId(), relatedMessage.getCorrelationId());
	}));

	test("onRelated can be called multiple times", sinon.test(function () {
		var type1 = 'foo';
		var type2 = 'bar';
		var func1 = function () {};
		var func2 = function () {};

		var expected = [{
			type: type1,
			callback: func1
		}, {
			type: type2,
			callback: func2
		}];

		sut.onRelated(type1, func1)
			.onRelated(type2, func2);

		var related = sut.getRelated();
		assert.deepEqual(related, expected);
	}));
});
