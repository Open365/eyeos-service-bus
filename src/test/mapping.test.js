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

var sinon = require('sinon'),
	assert = require('chai').assert;
var Mapping = require('../bustohttp/mapping.js');

suite('Mapping Suite', function() {
	var sut;

	setup(function() {
		sut = new Mapping();
	});

	test('executeParamConverterFunction when paramConverterFunction is not a function returns data as is', function() {
		var expectedData = 'some data';
		var actualData = sut.executeParamConverterFunction(expectedData);
		assert.equal(expectedData, actualData);
	});

	test('executeParamConverterFunction when paramConverterFunction is a function converts data', function() {
		var expectedData = 'called';
		sut.setParamConverterFunction(function() {
			return expectedData;
		});
		var actualData = sut.executeParamConverterFunction('anydata');
		assert.equal(expectedData, actualData);
	});

	test('doRequest when doRequestFunction is not a function returns true', function() {
		var expectedData = true;
		sut.setDoRequestFunction('anydata');
		var actualData = sut.doRequest();
		assert.equal(expectedData, actualData);
	});
});
