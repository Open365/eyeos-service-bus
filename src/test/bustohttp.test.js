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
var BusToHttp = require('../bustohttp/bustohttp.js'),
    MappingsCollection = require('../bustohttp/mappingscollection.js'),
    Mapping = require('../bustohttp/mapping.js'),
    ManagementBus = require('../lib/managementbus.js'),
    BusMessage = require('../lib/busmessage.js');
    http = require('http'),
    HttpWrapper = require('eyeos-http-wrapper');

suite('BusToHttp Suite', function() {
    var sut,
		mappingsCollection,
		managementBus,
		busMessage,
		toRestore = [],
		fakeRequest,
		httpWrapper,
		mapping,
		messageData,
		expectedDataString,
		busMessageString = "getTemplate",
		busResponseMessage = "templatesList",
		restHttpMethod = "POST",
		restPath = "http://localhost:9091/getTemplate",
		brokerHosts = [{host: "127.0.0.1", port: 3423}],
		restHost = "http://testhost",
		restPort = 6789,
		headers,
		brokerHosts = [{host: 'fakeHost', port: 'fakePort'}],
		connectCallback = function(){};

    setup(function() {
        fakeRequest = fakeRequest = {
            write: function() {},
            end: function() {}
        };
        mapping = new Mapping(busMessageString, busResponseMessage, restHttpMethod, restPath);
        mappingsCollection = new MappingsCollection();
        mappingsCollection.add(mapping);
		managementBus = new ManagementBus('test', brokerHosts, connectCallback);
        httpWrapper = new HttpWrapper();
        busMessage = new BusMessage(busMessageString);
		messageData = {'templateId': 2};
		headers = {
			'Content-Type': 'application/json'
		};
		busMessage.setData(messageData);
		sut = new BusToHttp('testAppName', brokerHosts, restHost, restPort, headers, null, mappingsCollection, managementBus, httpWrapper);
	});

    test('addMapping calls mappingsCollection add', sinon.test(function() {
        var expectedMapping = new Mapping(busMessageString, busResponseMessage, restHttpMethod, restPath);
        this.mock(mappingsCollection).expects('add').once().withExactArgs(expectedMapping);
        sut.addMapping(expectedMapping);
    }));

    test('addMapping calls bus on', sinon.test(function() {
        this.mock(managementBus).expects('on').once().withExactArgs(busMessageString, sinon.match.func);
        sut.addMapping(mapping);
    }));

    test('send call httpWrapper request with correct params', sinon.test(function() {
        var expectedOptions = {
            host: restHost,
            port: restPort,
            path: restPath,
            method: restHttpMethod,
            headers: headers
        };

        this.mock(httpWrapper).expects('request').once().withExactArgs(messageData, expectedOptions, sinon.match.func, sinon.match.func);
        sut.send(busMessage);
    }));

	test('send shouldn\'t call httpWrapper request when mapping.doRequest is false', sinon.test(function() {
		mapping.doRequest = function() {return false;};
		var stub = sinon.stub(httpWrapper, 'request');
		sut.send(busMessage);
		sinon.assert.notCalled(stub);
	}));

    test('send call managementBus.send', sinon.test(function() {
        var response = '{}';
        var responseBody = JSON.parse(response);
        var expectedReplyBusMessage = busMessage.reply(mapping.getBusResponseMessage());
        expectedReplyBusMessage.setData(responseBody);

        var stub = this.stub(httpWrapper, 'request', function(string, options, callback) {
            callback(response);
        });

        var actualReplyBusMessage;
        this.stub(managementBus, 'send', function(replyBusMessage) {
            actualReplyBusMessage = replyBusMessage;
        });

        sut.send(busMessage);

        assert.deepEqual(expectedReplyBusMessage.getData(), actualReplyBusMessage.getData());
    }));

	test('send shouldn\'t call managementBus.send when mapping has not a ResponseMessage', sinon.test(function() {
		var response = '{}';
		mapping.busResponseMessage = null;

		var stub = this.stub(httpWrapper, 'request', function(string, options, callback) {
			callback(response);
		});

		var managementBusSendStub = this.stub(managementBus, 'send');

		sut.send(busMessage);

		sinon.assert.notCalled(managementBusSendStub);
	}));

    test('connectToBus calls managementbus.connect', sinon.test(function() {
        this.mock(managementBus).expects('connect').once();
        sut.connectToBus();
    }));




});
