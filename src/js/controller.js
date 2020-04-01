(function (global, d3) {
"use strict";

var Controller = function() {
    return new Controller.init();
}

Controller.prototype = {
    loadStaticData: function (path) {
        var self = this;
        path = path || "data/test.json";
        d3.json(path, function(data) {
            self.updateData(data);
            //console.log(self.data);
        });
    },

    updateData: function(data) {
        var self = this;
        self.data = data;
        // UnTangle Map
        // TODO: compute layout
    }
};

Controller.init = function() {
    this.data = {};
}

Controller.init.prototype = Controller.prototype;
global.Controller = Controller;

}(window, d3));