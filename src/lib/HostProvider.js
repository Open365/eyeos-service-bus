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

var HostProvider = function(hosts) {
	this.setHosts(hosts);
	this.currentHostIndex = 0;
};

HostProvider.prototype.setHosts = function(hosts) {
	if (!hosts) {
		return;
	}

	this.hostArray = hosts;
	this.shuffle();
};

HostProvider.prototype.shuffle  = function() {
	//Not needed anymore because we only have one host now
	//Consul takes care of it
};

HostProvider.prototype.getHost = function() {
	this.currentHostIndex = (this.currentHostIndex + 1) % this.hostArray.length;
	return this.hostArray[this.currentHostIndex];
};


module.exports = HostProvider;