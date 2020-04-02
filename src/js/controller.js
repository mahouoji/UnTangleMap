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
        self.unTangleMap.updateData(data);
    }
};

Controller.init = function() {
    var self = this;
    self.data = {};

    var plot_opts = {
        margin: {top:70,left:150,bottom:150,right:150},
    }
    self.unTangleMap = UnTangleMap("#untangle-container", plot_opts);
}

Controller.init.prototype = Controller.prototype;
global.Controller = Controller;

}(window, d3));