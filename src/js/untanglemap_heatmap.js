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
    initData: function(data) {
        this.data = data;
        //this.initHeatmap(labelPos, faceLayout);
    },
    initHeatmap: function(labelPos, faceLayout) {
        this.labelPos = labelPos;
        this.faceLayout = faceLayout;
        this.initHeatmapSlots();
        this.initCount();
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
            self.getHeatmapSlotsRecursive(vpos, 1);
        });
        console.log(self.heatmap);
    },
    getHeatmapSlotsRecursive: function(vpos, depth) {
        var self = this;
        let midpos = [0, 1, 2].map(id=>getMidPoint(vpos[id], vpos[(id+1)%3]));//ab, bc, ac
        let newpos = [
            [vpos[0], midpos[0], midpos[2]],
            [midpos[0], vpos[1], midpos[1]],
            [midpos[2], midpos[1], vpos[2]],
            [midpos[0], midpos[1], midpos[2]]
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
            self.getHeatmapSlotsRecursive(newpos[i], depth);
        }
    },
    initCount: function() {
        var self = this;
        for (let i = 0; i < self.faceLayout.length; i++) {//face loop
            let face = self.faceLayout[i];
            let ids = face.vertIndex;
            for (let j = 0; j < self.data.items.length; j++) {
                let item = self.data.items[j];
                let tercord = ids.map(id=>item.vec[id]);
                if (tercord[0] === 0 && tercord[1] === 0 && tercord[2] === 0) { continue; }
                let sum = tercord[0] + tercord[1] + tercord[2];
                tercord = tercord.map(cord=>cord/sum);
                self.heatmap[0][i].cnt += 1;
                self.getCountRecursive(tercord, i * 4, 1);
            }
        }
    },
    getCountRecursive: function(tercord, faceOffset, depth) {
        var self = this;
        if (depth >= self.maxDepth) { return; }
        let a = tercord[0], b = tercord[1], c = tercord[2];
        if (a > 0.5) {
            self.heatmap[depth][faceOffset].cnt += 1;
            self.getCountRecursive([a-b-c, 2*b, 2*c],faceOffset * 4, depth + 1);
        } else if (b > 0.5) {
            self.heatmap[depth][faceOffset + 1].cnt += 1;
            self.getCountRecursive([2*a, b-a-c, 2*c], (faceOffset+1) * 4, depth + 1);
        } else if (c > 0.5) {
            self.heatmap[depth][faceOffset + 2].cnt += 1;
            self.getCountRecursive([2*a, 2*b, c-a-b], (faceOffset+2) * 4, depth + 1);
        } else {
            self.heatmap[depth][faceOffset + 3].cnt += 1;
            self.getCountRecursive([a+b-c, -a+b+c, a-b+c],(faceOffset+3) * 4, depth + 1);
        }
    }
};

UTHeatmap.init = function () {
    // config
    this.maxDepth = 4;
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