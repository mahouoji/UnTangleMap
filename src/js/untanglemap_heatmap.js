(function (global) {
"use strict";
var UTHeatmap = function () {
    return new UTHeatmap.init();
}

var getMidPoint = function(pos1, pos2) {
    return [0.5 * (pos1[0] + pos2[0]), 0.5 * (pos1[1] + pos2[1])];
};

var getSVGPoints = function(v) {
    return `${v[0][0]} ${v[0][1]},${v[1][0]} ${v[1][1]},${v[2][0]} ${v[2][1]}`
};

UTHeatmap.prototype = {
    initData: function(data, labelPos, faceLayout) {
        this.data = data;
        this.initHeatmap(labelPos, faceLayout);
    },
    initHeatmap: function(labelPos, faceLayout) {
        var self = this;
        this.labelPos = labelPos;
        this.faceLayout = faceLayout;
        this.initHeatmapSlots();
    },
    initHeatmapSlots: function() {
        var self = this;
        self.heatmap = []
        for (let i = 0; i < self.maxDepth; i++) {
            self.heatmap.push([]);
        }
        console.log(self.data);
        self.faceLayout.forEach(face => {
            let ids = face.vertIndex;
            let vpos = ids.map(id=>self.labelPos[id]);
            self.heatmap[0].push({
                vecPos: vpos,
                cnt: 0
            });
            self.makeHeatmapSlots(vpos, 1);
        });
        console.log(self.heatmap);
    },
    makeHeatmapSlots: function(vpos, depth) {
        var self = this;
        let midpos = [0, 1, 2].map(id=>getMidPoint(vpos[id], vpos[(id+1)%3]));//ab, bc, ac
        let newpos = [
            [vpos[0], midpos[0], midpos[2]],
            [midpos[0], vpos[1], midpos[1]],
            [midpos[2], midpos[1], vpos[2]],
            [midpos[0], midpos[0], midpos[2]]
        ];
        self.heatmap[depth].push(
            {vecPos: newpos[0], cnt: 0},
            {vecPos: newpos[1], cnt: 0},
            {vecPos: newpos[2], cnt: 0},
            {vecPos: newpos[3], cnt: 0}
        )
        depth += 1;
        if (depth >= self.maxDepth) { return; }
        for (let i = 0; i < 4; i++) {
            self.makeHeatmapSlots(newpos[i], depth);
        }
    }
};

UTHeatmap.init = function () {
    // config
    this.maxDepth = 3;
    // data
    this.data = null;
    this.labelPos = null;
    this.faceLayout = null;
    this.faceIndex = []
    // heatmap
    this.heatmap = []
}

UTHeatmap.init.prototype = UTHeatmap.prototype;

// attach to global
global.UnTangleMapHeatmap = UTHeatmap;
UTHeatmap.prototype = {};
}(window));