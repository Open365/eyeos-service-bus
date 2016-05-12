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
// Stomp client makes eyeos bus clients independent of the STOM implementation.
// stompclient receives an array of hosts objects in the form:
//                 {host: 'aHost', port: aPort}
// stompclient shuffles the array of hosts one time, then connects
// sequentially on the hosts pointed by the suffled array.

// eyeos requires
var Stomp = require('eyeos-stomp').Stomp;
var logger = require('log2out').getLogger('stompclient');
var BusMessage = require('./busmessage.js');

// Constructor
function StompClient (hosts, user, password, destination, connectCallback, eventHandler) {

    function _shuffleArray (array) {// recipe from: http://stackoverflow.com/a/6274398
        var counter = array.length,
            temp,
            index;
        while (counter > 0) {
            index = Math.floor(Math.random() * counter);
            counter--;
            temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }
        return array;
    }

    // this.stompHosts: all hosts we can connect to.
    // stompHosts array is shuffled so that we can connect to the brokers sequentially
    // (usual connect or when connection is lost) but load is spread between all
    // brokers since each client will be shuffling its stompHosts list.
    this.stompHosts = _shuffleArray(hosts);
    this.user = user;
    this.password = password;
    // stomp destination in the form [queue|topic]/<name>
    this.destination = destination;
    this.connectCallback = connectCallback;
    this.currentHostIndex = 0;

    this.eventHandler = eventHandler;
    // this.useEnhancedMessages: if true, BusMessage instances are sent/received.
    // If false,the Stomp client will work with txt messages,for (de)serialize.
    // to maintain backwards compatibility, default messages are BusMessage.
    this.useEnhancedMessages = true;
};

StompClient.prototype = {
    _connectToNextStompHost: function () {
        // this.settings: current stomp settings
        this.settings = this._generateNextStompHostSettings();
        this.stomp = this._createNewStomp(this.settings);
        this._addListeners(this.destination, this.connectCallback);
        this.stomp.connect();
    },

    connect: function () {
        if (!this.stomp) {
            logger.info("Connecting to bus. Received hosts :",
                this.stompHosts, "destination: ", this.destination);

            this._connectToNextStompHost();
        } else {
            logger.warn("Called connect() but already connected.")
        }
    },

    setUseEnhancedMessages: function (useEnhancedMessages) {
        this.useEnhancedMessages = useEnhancedMessages;
    },

    _areSameHost: function _areSameHost (host1, host2) {
        if (!host1 || !host2) {
            return false;
        }
        return host1.host === host2.host && host1.port === host2.port
    },

    _getNextStompHost: function () {
        this.currentHostIndex = (this.currentHostIndex + 1) % this.stompHosts.length;

        return this.stompHosts[this.currentHostIndex];
    },

    _generateNextStompHostSettings: function () {
        var stompHost = this._getNextStompHost();
        return {
            host: stompHost.host,
            port: stompHost.port,
            login: this.user,
            passcode: this.password
        };
    },

    setConnectCallback: function (connectCallback) {
        if (this.connectCallback) {
            logger.warn("Overwriting connection callback");
        }
        this.connectCallback = connectCallback;
    },

    _addListeners: function (destination, connectCallback) {
        var self = this;
        this.stomp.on('connected', function () {
            logger.info("Bus connected to:", destination, self.settings);
            var headers = {
                destination: destination
            };
            self.stomp.subscribe(headers);
            if (connectCallback && typeof connectCallback === "function") {
                connectCallback();
            }
        });

        this.stomp.on('error', function (err) {
            logger.error("Error in stomp client for destination:", destination, err);
        });

        this.stomp.on('disconnected', function (err) {
            logger.warn("Disconnected from stomp for destination:", destination, "settings:", self.settings, ". retrying in 1000ms. Error was:", err);
            setTimeout(function () {
                self._connectToNextStompHost();
            }, 1000);
        });

        this.stomp.on('message', function (receivedMessage) {
            try {
                logger.debug("Received Bus message from:", destination, receivedMessage);
                var busMessage,
                    eventType;
                if (self.useEnhancedMessages) {
                    busMessage = BusMessage.fromJsonString(receivedMessage.body[0]);
                    eventType = busMessage.getType();
                } else {
                    busMessage = receivedMessage.body[0];
                    eventType = 'eyeosGuestServicesMessage';
                }

                logger.debug("Emitting ", eventType);
                self.eventHandler.emit(eventType, busMessage);
                logger.debug("Emitting ", self.eventHandler.ON_ANY_EVENT_NAME);
                self.eventHandler.emit(self.eventHandler.ON_ANY_EVENT_NAME, busMessage);
            } catch (err) {
                logger.error('Stomp on message received error from:', destination, err,
                    'received message was: ', receivedMessage);
            }
        });


    },

    _createNewStomp: function (settings) {
        return new Stomp(settings);
    },

    send: function (messageData) {
        var message;
        if (this.useEnhancedMessages) {
            message = {
                destination: this.destination,
                body: messageData.toJsonString()
            };
        } else {
            message = {
                destination: this.destination,
                body: messageData.getData()
            };
        }
        logger.debug("Sending message to bus:", message);
        this.stomp.send(message);
    }
};

module.exports = StompClient;
