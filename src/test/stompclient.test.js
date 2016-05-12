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
var StompClient = require('../lib/stompclient.js');
var EventHandler = require('../lib/eventhandler.js');
var BusMessage = require('../lib/busmessage.js');
var Stomp = require('eyeos-stomp').Stomp;
var assert = require('chai').assert;

suite("StompClient suite:", function () {
	var sut, eventHandler, stomp, hosts, destination,
		user, password, func, settings, stompFake,
		eventType, from, id, correlationId, data, messageData;


	setup(function () {
		stompFake = {
			connect: function () {
			},
			on: function () {
			}
		};
//		hosts = [
//			{host: 'fakeHost', port: 'fakePort'}
//		];
		hosts = [
			{host: 'host1', port: 61613},
			{host: 'host2', port: 61613},
			{host: 'host1', port: 61614},
			{host: 'host3', port: 23232}
		];
		user = 'fakeUser';
		password = 'fakePassword';
		destination = 'fakeDestination';
		func = function () {
		};

		eventType = 'fakeEvent';
		from = 'fakeFrom';
		data = {
			foo: "bar"
		};
		id = 'fakeId';
		correlationId = 'fakeCorrelationId';
		messageData = new BusMessage(eventType);
		messageData
			.setData(data)
			.setFrom(from)
			.setId(id)
			.setCorrelationId(correlationId);

		eventHandler = new EventHandler();
		sut = new StompClient(hosts, user, password, destination, func, eventHandler);

		settings = sut._generateNextStompHostSettings();
		stomp = new Stomp(settings);
		sut.stomp = stomp;
	});

	teardown(function () {
	});

	function stubAddListeners (self) {
		self.stub(sut, '_addListeners');
	}

	function stubCreateNewStomp (self) {
		self.stub(sut, '_createNewStomp', function () {
			return stompFake;
		});
	}

	test("connect calls stomp.connect when no stomp available", sinon.test(function () {
		sut.stomp = null;
		stubAddListeners(this);
		stubCreateNewStomp(this);
		this.mock(stompFake).expects('connect').once().withExactArgs();
		sut.connect();
	}));

	test("connect doesn't call stomp.connect when stomp available", sinon.test(function () {
		stubAddListeners(this);
		stubCreateNewStomp(this);
		this.mock(stompFake).expects('connect').never();
		sut.connect();
	}));

	test("connect calls _createNewStomp with next host in list. when no stomp available", sinon.test(function () {
		sut.stomp = null;
		var nextStompHost = sut.stompHosts[(sut.currentHostIndex + 1) % sut.stompHosts.length];
		nextStompHost.login = sut.user;
		nextStompHost.passcode = sut.password;

		stubAddListeners(this);
		this.mock(sut)
			.expects('_createNewStomp')
			.once()
			.withExactArgs(nextStompHost)
			.returns(stompFake);

		sut.connect();
	}));

	test("connect calls add listeners  when no stomp available", sinon.test(function () {
		sut.stomp = null;
		stubCreateNewStomp(this);
		this.mock(sut)
			.expects('_addListeners')
			.once()
			.withExactArgs(destination, func);

		sut.connect();
	}));

	test("connect calls _getNextStompHost when no stomp available", sinon.test(function () {
		sut.stomp = null;
		stubCreateNewStomp(this);
		this.mock(sut)
			.expects('_getNextStompHost')
			.once()
			.withExactArgs()
			.returns(hosts[0]);
		sut.connect();
	}));

	test("_getNextStompHost returns same host when there is only one host in hosts", sinon.test(function () {
		var hosts = [
			{host: 'host', port: 'port'}
		];
		var currentHost = hosts[0];
		sut.stompHosts = hosts;
		var nextHost = sut._getNextStompHost();
		assert.equal(currentHost.host, nextHost.host);
		assert.equal(nextHost.port, nextHost.port);
	}));

	test("consecutive calls to _getNextStompHost always return a different host there are some hosts in hosts array", sinon.test(function () {
		sut.stomp = null;

		var hosts = [
			{host: 'host1', port: 61613},
			{host: 'host2', port: 61613},
			{host: 'host1', port: 61614},
			{host: 'host3', port: 23232}
		];

		sut.stompHosts = hosts;
		sut.settings = hosts[0];


		for (var i = 0; i < 10; i++) {// test an arbitrary number of times
			var nextHost = sut._getNextStompHost();
			assert.isFalse(sut.settings.port === nextHost.port &&
				sut.settings.host === nextHost.host);
			sut.settings = nextHost;
		}
	}));

	test("_getNextStompHost returns a correct host when current host is null or undefined", sinon.test(function () {
		sut.stomp = null;

		var hosts = [
			{host: 'host1', port: 61613},
			{host: 'host2', port: 61613},
			{host: 'host1', port: 61614},
			{host: 'host3', port: 23232}
		]

		var nextHost = sut._getNextStompHost(hosts, null);
		assert.isNotNull(nextHost);
		assert.isDefined(nextHost);
		var nextHost = sut._getNextStompHost(hosts, undefined);
		assert.isNotNull(nextHost);
		assert.isDefined(nextHost);
		var nextHost = sut._getNextStompHost(hosts);
		assert.isNotNull(nextHost);
		assert.isDefined(nextHost);


	}));


	test("_createNewStomp creates a new Stomp instance", sinon.test(function () {
		var stomp = sut._createNewStomp(settings);
		assert.instanceOf(stomp, Stomp, "The constructor doesn't create a Stomp instance");
	}));

	test("connected listener in stomp calls stomp.subscribe", sinon.test(function () {
		var headers = {
			destination: destination
		};
		this.mock(stomp).expects('subscribe').once().withExactArgs(headers);
		sut._addListeners(destination, func);
		stomp.emit('connected');
	}));

	test("connected listener in stomp calls connect callback function", sinon.test(function () {
		var funcWrapper = {
			func: function () {
			}
		};
		this.stub(stomp, 'subscribe');
		this.mock(funcWrapper).expects('func').once().withExactArgs();
		sut._addListeners(destination, funcWrapper.func);
		stomp.emit('connected');
	}));

	test("disconnected listener in stomp calls stomp.connect", sinon.test(function () {
		var err = "fake error";
		this.mock(sut).expects('_connectToNextStompHost').once().withExactArgs();
		this.stub(global, 'setTimeout', function (func, timeout) {
			func();
		});
		sut._addListeners(destination, func);
		stomp.emit('disconnected', err);
	}));

	suite('With useEnhancedMessages => true', function () {

		setup(function () {
			sut.setUseEnhancedMessages(true);
		});

		test("message listener in stomp emits events for message type and onAny", sinon.test(function () {
			var messageBody = JSON.stringify({
				type: eventType,
				from: from,
				data: data,
				correlationId: correlationId,
				id: id
			});
			var mock = this.mock(eventHandler);
			mock.expects('emit').once().withExactArgs(eventType, messageData);
			mock.expects('emit').once().withExactArgs(eventHandler.ON_ANY_EVENT_NAME, messageData);

			var receivedMessage = {
				headers: {
				},
				body: [messageBody]
			};
			sut._addListeners(destination, func);
			stomp.emit('message', receivedMessage);
		}));

		test("send calls stomp.send", sinon.test(function () {
			sut.destination = destination;
			var body = messageData.toJsonString();
			var expectedSendMessage = {
				destination: destination,
				body: body
			};
			this.mock(stomp).expects('send').once().withExactArgs(expectedSendMessage);
			sut.send(messageData);
		}));
	});


	suite('With useEnhancedMessages => false', function () {
		setup(function () {
			sut.setUseEnhancedMessages(false);
		});

		test("message listener in stomp emits events for message type and onAny", sinon.test(function () {
			var messageBody = JSON.stringify(data);
			var mock = this.mock(eventHandler);
			mock.expects('emit').once().withExactArgs("eyeosGuestServicesMessage", messageBody);
			mock.expects('emit').once().withExactArgs(eventHandler.ON_ANY_EVENT_NAME, messageBody);

			var receivedMessage = {
				headers: {
				},
				body: [messageBody]
			};
			sut._addListeners(destination, func);
			stomp.emit('message', receivedMessage);
		}));

		test("send calls stomp.send", sinon.test(function () {
			sut.destination = destination;
			var body = messageData.getData();
			var expectedSendMessage = {
				destination: destination,
				body: body
			};
			this.mock(stomp).expects('send').once().withExactArgs(expectedSendMessage);
			sut.send(messageData);
		}));
	});
});
