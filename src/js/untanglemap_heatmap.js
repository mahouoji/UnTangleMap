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

var tailingZeroLookup = [32, 0, 1,
    26, 2, 23, 27, 0, 3, 16, 24, 30, 28, 11,
    0, 13, 4, 7, 17, 0, 25, 22, 31, 15, 29,
    10, 12, 6, 0, 21, 14, 9, 5, 20, 8, 19,
    18];

UTHeatmap.prototype = {
    initData: function(data) {
        this.data = data;
        //this.initHeatmap(labelPos, faceLayout);
        return this;
    },
    initPosLayout: function(labelPos, faceLayout) {
        this.labelPos = labelPos;
        this.faceLayout = faceLayout;
        this.initHeatmap();
        this.initGrid();
        return this;
    },
    update: function(facesAdded, facesRemoved) {
        this.updateGrid(facesAdded, facesRemoved);
        this.updateHeatmap(facesAdded, facesRemoved);
    },
    // Grid
    getGridData: function() {
        let data = []
        for (let i = 0; i < this.maxDepth; i++) {
            data.push([]);
        }
        for (const key in this.grid) {
            for (let i = 0; i < this.maxDepth; i++) {
                data[i] = data[i].concat(this.grid[key].data[i]);
            }
        }
        return data;
    },
    initGrid: function() {
        this.grid = {};
        for (let i = 0; i < this.faceLayout.length; i++) {//face loop
            this.addFaceGrid(this.faceLayout[i]);
        }
    },
    updateGrid: function(facesAdded, facesRemoved) {
        var self = this;
        facesAdded.forEach(face=>{
            if (face.key in self.grid) {
                console.log('Adding face already in.');
            } else {
                self.addFaceGrid(face);
            }
        });
        facesRemoved.forEach(key=>{
            if (key in self.grid) {
                delete self.grid[key];
            } else {
                console.log('Removing face not exist.');
            }
        });
    },
    addFaceGrid: function(face) {
        var self = this;
        let ids = face.vertIndex;
        let vpos = ids.map(id=>self.labelPos[id]);
        self.grid[face.key] = {
            key: face.key,
            data: []
        };
        for (let i = 0; i < self.maxDepth; i++) {
            self.grid[face.key].data.push([]);
        }
        self.grid[face.key].data[0].push(vpos);
        let n = 2 << (self.maxDepth - 2);
        let step = vpos.map(p=>[p[0]/n,p[1]/n]);
        for (let k = 1; k < n; k++) {
            let bin = self.maxDepth - 1 - tailingZeroLookup[(-k & k) % 37];
            //console.log(k);
            //console.log(bin);
            self.grid[face.key].data[bin].push(
                [[step[0][0] * k + step[1][0] * (n-k), step[0][1] * k + step[1][1] * (n-k)],
                [step[0][0] * k + step[2][0] * (n-k), step[0][1] * k + step[2][1] * (n-k)]],
                [[step[1][0] * k + step[0][0] * (n-k), step[1][1] * k + step[0][1] * (n-k)],
                [step[1][0] * k + step[2][0] * (n-k), step[1][1] * k + step[2][1] * (n-k)]],
                [[step[2][0] * k + step[0][0] * (n-k), step[2][1] * k + step[0][1] * (n-k)],
                [step[2][0] * k + step[1][0] * (n-k), step[2][1] * k + step[1][1] * (n-k)]]
            );
        }
    },
    // Heatmap
    getHeatmapData: function() {
        let data = []
        for (let i = 0; i < this.maxDepth; i++) {
            data.push([]);
        }
        for (const key in this.heatmap) {
            for (let i = 0; i < this.maxDepth; i++) {
                data[i] = data[i].concat(this.heatmap[key].data[i]);
            }
        }
        return data;
    },
    getScatterData: function() {
        let data = []
        for (const key in this.scatter) {
            data = data.concat(this.scatter[key]);
        }
        return data;
    },
    initHeatmap: function() {
        this.heatmap = {};
        this.scatter = {};
        for (let i = 0; i < this.faceLayout.length; i++) {//face loop
            this.addFaceHeatmap(this.faceLayout[i]);
        }
    },
    updateHeatmap: function(facesAdded, facesRemoved) {
        var self = this;
        facesAdded.forEach(face=>{
            if (face.key in self.heatmap) {
                console.log('Adding face already in.');
            } else {
                self.addFaceHeatmap(face);
            }
        });
        facesRemoved.forEach(key=>{
            if (key in self.heatmap) {
                delete self.heatmap[key];
                delete self.scatter[key];
            } else {
                console.log('Removing face not exist.');
            }
        });
    },
    addFaceHeatmap: function(face) {
        var self = this;
        let ids = face.vertIndex;
        let vpos = ids.map(id=>this.labelPos[id]);
        self.heatmap[face.key] = {
            key: face.key,
            data: []
        }
        self.scatter[face.key] = []; //scatter
        // init slots
        for (let i = 0; i < self.maxDepth; i++) {
            self.heatmap[face.key].data.push([]);
        }
        self.heatmap[face.key].data[0].push({
            vecPos: vpos,
            cnt: 0
        });
        self.getHeatmapSlotsRecursive(face.key, vpos, 1);
        //console.log(self.heatmap[face.key]);
        // init counter
        for (let j = 0; j < self.data.items.length; j++) {
            let item = self.data.items[j];
            let tercord = ids.map(id=>item.vec[id]);
            if (tercord[0] === 0 && tercord[1] === 0 && tercord[2] === 0) { continue; }
            let sum = tercord[0] + tercord[1] + tercord[2];
            tercord = tercord.map(cord=>cord/sum);
            // update scatter
            self.scatter[face.key].push({
                pos: [tercord[0] * vpos[0][0] + tercord[1] * vpos[1][0] + tercord[2] * vpos[2][0],
                      tercord[0] * vpos[0][1] + tercord[1] * vpos[1][1] + tercord[2] * vpos[2][1]],
                itemIndex: j
            });
            self.heatmap[face.key].data[0][0].cnt += 1;
            self.getCountRecursive(face.key, tercord, 0, 1);
        }
    },
    getHeatmapSlotsRecursive: function(key, vpos, depth) {
        var self = this;
        let midpos = [0, 1, 2].map(id=>getMidPoint(vpos[id], vpos[(id+1)%3]));//ab, bc, ac
        let newpos = [
            [vpos[0], midpos[0], midpos[2]],
            [midpos[0], vpos[1], midpos[1]],
            [midpos[2], midpos[1], vpos[2]],
            [midpos[0], midpos[1], midpos[2]]
        ];
        self.heatmap[key].data[depth].push(
            {vecPos: newpos[0], cnt: 0},
            {vecPos: newpos[1], cnt: 0},
            {vecPos: newpos[2], cnt: 0},
            {vecPos: newpos[3], cnt: 0}
        );
        depth += 1;
        if (depth >= self.maxDepth) { return; }
        for (let i = 0; i < 4; i++) {
            self.getHeatmapSlotsRecursive(key, newpos[i], depth);
        }
    },
    getCountRecursive: function(key, tercord, faceOffset, depth) {
        var self = this;
        if (depth >= self.maxDepth) { return; }
        let a = tercord[0], b = tercord[1], c = tercord[2];
        if (a > 0.5) {
            self.heatmap[key].data[depth][faceOffset].cnt += 1;
            self.getCountRecursive(key, [a-b-c, 2*b, 2*c],faceOffset * 4, depth + 1);
        } else if (b > 0.5) {
            self.heatmap[key].data[depth][faceOffset + 1].cnt += 1;
            self.getCountRecursive(key, [2*a, b-a-c, 2*c], (faceOffset+1) * 4, depth + 1);
        } else if (c > 0.5) {
            self.heatmap[key].data[depth][faceOffset + 2].cnt += 1;
            self.getCountRecursive(key, [2*a, 2*b, c-a-b], (faceOffset+2) * 4, depth + 1);
        } else {
            self.heatmap[key].data[depth][faceOffset + 3].cnt += 1;
            self.getCountRecursive(key, [a+b-c, -a+b+c, a-b+c],(faceOffset+3) * 4, depth + 1);
        }
    }
    // Highlight
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
    this.heatmap = {} // key=face.toString()
    this.grid = {} // key=face.toString()
    this.scatter = {} // key=face.toString()
    this.itemSelected = {};
}

UTHeatmap.init.prototype = UTHeatmap.prototype;

// attach to global
global.UnTangleMapHeatmap = UTHeatmap;
UTHeatmap.prototype = {};
}(window));