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

var sinon = require('sinon');
var assert = require('chai').assert;
var chai = require("chai");
chai.should();
chai.use(require('chai-things'));

var parseHostsList = require('../lib/broker-utils').parseHostsList;

suite('parseHostsList Suite', function() {
	test("a list of three brokers is parsed ok", sinon.test(function () {

		var hostsList = "host1:61613,host2:61613,host3:61613";
		var parsedList = parseHostsList(hostsList);

		assert.isArray(parsedList, "parseHostList expected to return an Array");
		assert.lengthOf(parsedList, 3, "expected 3 hosts from : " + hostsList);

		parsedList.should.include.something.that.deep.equals({host: "host1", port: 61613});
		parsedList.should.include.something.that.deep.equals({host: "host2", port: 61613});
		parsedList.should.include.something.that.deep.equals({host: "host3", port: 61613});
	}));

	test("heading and trailing spaces are ignored", sinon.test(function () {

		var hostsList = "host1:61613 , host2:61613,host3:61613 ";
		var parsedList = parseHostsList(hostsList);

		assert.isArray(parsedList, "parseHostList expected to return an Array");
		assert.lengthOf(parsedList, 3, "expected 3 hosts from : " + hostsList);

		parsedList.should.include.something.that.deep.equals({host: "host1", port: 61613});
		parsedList.should.include.something.that.deep.equals({host: "host2", port: 61613});
		parsedList.should.include.something.that.deep.equals({host: "host3", port: 61613});
	}));

	test("no empty elements are allowed", sinon.test(function () {

		var hostsList = "host1:61613 , host2:61613,host3:61613 ,";

		var parseHostsWithWrongList = parseHostsList.bind(this, hostsList);

		assert.throws(parseHostsWithWrongList, Error);
	}));

	test("A list of one host/port is parsed ok", sinon.test(function () {
		var hostsLists = '1.2.3.4:1337';
		var expected = [{
			host: "1.2.3.4",
			port: 1337
		}];

		var actual = parseHostsList(hostsLists);
		assert.deepEqual(actual, expected);
	}));
});
