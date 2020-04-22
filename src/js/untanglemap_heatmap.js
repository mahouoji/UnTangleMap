(function (global) {
    "use strict";
    var UTHeatmap = function () {
        return new UTHeatmap.init();
    }

    UTHeatmap.init = function () {
        var self = this;
        // data
        self.data = {};
    }

    UTHeatmap.init.prototype = UTHeatmap.prototype;

    // attach to global
    global.UnTangleMapHeatmap = UTHeatmap;
    UTHeatmap.prototype = {};
}(window));