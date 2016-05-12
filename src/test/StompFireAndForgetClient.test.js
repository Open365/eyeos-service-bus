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
var StompFireAndForgetClient = require('../lib/StompFireAndForgetClient');


suite('StompFireAndForgetClient', function() {
    var sut;
    var stompClient = {
        connect: function(){},
        on: function(event, callback){callback.call();},
        once: function(event, callback){callback.call();},
        send: function() {},
        disconnect: function() {}
    };
    var stompClientMock;
    var fakeSettings = {};
    var destination = 'a destination';
    var message = 'a message';


    setup(function() {
        stompClientMock = sinon.mock(stompClient);
        sut = new StompFireAndForgetClient(fakeSettings, stompClient);
    });

    teardown(function() {
        stompClientMock.restore();
    });

    suite('send', function(){
        test('should call client connect', function() {
            var expVerifyRequest = stompClientMock.expects('connect').once();
            var actual = sut.send(destination, message);
            expVerifyRequest.verify();
        });

        test('When connected should call client send', function() {
            var expectedArgs = {
                destination: destination,
                body: JSON.stringify(message)
            };
            var expVerifyRequest = stompClientMock.expects('send').once().withExactArgs(expectedArgs, true);
            var actual = sut.send(destination, message);
            expVerifyRequest.verify();
        });


    });
});
