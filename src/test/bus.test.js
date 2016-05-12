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

var Bus = require('../lib/bus.js');
var sinon = require('sinon');
var StompClient = require('../lib/stompclient.js');
var EventHandler = require('../lib/eventhandler.js');
var BusMessage = require('../lib/busmessage.js');

suite('Bus suite:', function () {
	var sut,
		stompClient,
		eventHandler,
		name = 'papupi',
		message,
		funcWrapper,
		hosts = [{host: 'fakeHost', port: 'fakePort'}],
		user = 'fakeUser',
		password = 'fakePassword',
		destination = 'fakeDestination',
		connectCallback = function () {};
	setup(function () {
		eventHandler = new EventHandler();
		stompClient = new StompClient(eventHandler);
		sut = new Bus(name, hosts, user, password, destination, connectCallback, eventHandler, stompClient);
		message = new BusMessage('myCoolType');
		message.setData({
			coolData: 'foobar'
		});
		funcWrapper = {
			func: function () {
			}
		};
	});

	teardown(function () {

	});

	test("connect calls stompClient connect", sinon.test(function () {

		this.mock(stompClient)
			.expects('connect')
			.once()
			.withExactArgs();

		sut.connect();

	}));

	test("connect when passed a callback calls stompClient.setConnectCallback", sinon.test(function () {
		this.stub(stompClient, 'connect');
		this.mock(stompClient)
			.expects('setConnectCallback')
			.once()
			.withExactArgs('func');
		sut.connect('func');
	}));

	test("on calls eventHandler on", sinon.test(function () {
		var ev = 'fakeEvent', callback = function () {};

		this.mock(eventHandler).expects('on').once().withExactArgs(ev, callback);

		sut.on(ev, callback);
	}));

	test("onAny calls eventHandler onAny", sinon.test(function () {
		var ev = 'fakeEvent', callback = function () {
		};

		this.mock(eventHandler).expects('onAny').once().withExactArgs(callback);

		sut.onAny(callback);
	}));

	test("send calls stompClient.send with message with from", sinon.test(function () {
		var expectedMessage = Object.create(message);
		expectedMessage.from = name;
		this.mock(stompClient).expects('send').once().withExactArgs(expectedMessage);
		sut.send(message);
	}));

	test("send calls eventHandler.onAny for onRelated without type", sinon.test(function () {
		var func = function () {
		};
		message.onRelated(func);
		this.mock(eventHandler).expects('onAny').once().withExactArgs(sinon.match.func);

		this.stub(stompClient, 'send');
		sut.send(message);
	}));

	test("send calls eventHandler.on for onRelated with type", sinon.test(function () {
		var func = function () {
		};
		var type = 'coolType';
		message.onRelated(type, func);
		this.mock(eventHandler).expects('on').once().withExactArgs(type, sinon.match.func);

		this.stub(stompClient, 'send');
		sut.send(message);
	}));

	function relatedCallbackTests (calledTimes, callbackMessage, stubFunc, type, self) {
		self.mock(funcWrapper).expects('func').exactly(calledTimes);
		if (type) {
			message.onRelated(type, funcWrapper.func);
		} else {
			message.onRelated(funcWrapper.func);
		}

		self.stub(eventHandler, stubFunc, function (type, cb) {
			if (!cb) {
				cb = type;
			}
			cb(callbackMessage);
		});

		self.stub(stompClient, 'send');

		sut.send(message);
	}

	test("message relatedCallback is not called when correlationId does not match", sinon.test(function () {
		relatedCallbackTests(0, message, 'onAny', null, this);
	}));

	test("message relatedCallback is called when correlationId matches", sinon.test(function () {
		relatedCallbackTests(1, message.reply('foobar'), 'onAny', null, this);
	}));

	test("message relatedCallback is not called when correlationId does not match with type", sinon.test(function () {
		relatedCallbackTests(0, message, 'on', 'fakeType', this);
	}));

	test("message relatedCallback is not called when correlationId matches with type", sinon.test(function () {
		relatedCallbackTests(1, message.reply('foobar'), 'on', 'fakeType', this);
	}));

	test("setUseEnhancedMessages calls stompClient.setUseEnhancedMessages", sinon.test(function () {
		this.mock(stompClient)
			.expects('setUseEnhancedMessages')
			.once()
			.withExactArgs('foo');
		sut.setUseEnhancedMessages('foo');
	}));
});
