// layout algorithms for UnTangle Map
(function (global) {
    "use strict";
    var UnTangleMap = function () {
        return new UnTangleMap.init();
    }

    UnTangleMap.prototype = {
        // layout
        initRec: function() {
            var self = this;
            self.labelMap = {
                in: {},
                cand: {},
                faces: {}
            };
            self.utility.utility = 0.0;
            self.utility.edgeCorr = 0.0;
            self.utility.edgeCnt = 0;
            self.utility.triCorr = 0.0;
            self.utility.triCnt =  0;

        },
        initLabelLayout: function(data, center) {
            var self = this;
            center = center || HexCord(0, 0);
            self.initRec();
            self.data = data;

            let labelNames = self.data.labels.map(l => l.name);
            // TODO: sort labels
            //let label = self.getFirstLabel(data.labels);
            let firstLabel = labelNames[0];
            //let secondLabel = labelNames[1];
            self.addLabel(firstLabel, center);
            //self.addLabel(secondLabel, center.getNeighbors()[0]);
            labelNames = labelNames.filter(name=>name !== firstLabel);
            //labelNames = labelNames.filter(name=>name !== secondLabel);
            while (labelNames.length > 0) {
                let res = self.maximizeUtility(labelNames);
                self.addLabel(res[0], res[1], res[2]);
                labelNames = labelNames.filter(name=>name !== res[0]);
            }
            /*
            // without layout algorithm
            for (let i = 2; i < labelNames.length; i++) {
                res = self.placeLable(labelNames);
                //console.log(self.labelMap.cand);
                for (let key in self.labelMap.cand) {
                    if (!(key in self.labelMap.in) && self.labelMap.cand[key].cnt >= 2) {
                        self.addLabel(labelNames[i],  self.labelMap.cand[key].cord);
                        break;
                    }
                }
            }*/
            //console.log($.map(self.labelMap.in, function(value, key) { return value }));
            //console.log($.map(self.labelMap.faces, function(value, key) { return value }));
        },

        getLabelLayout: function() {
            return Object.values(this.labelMap.in);
        },

        getCandidateLayout: function() {
            return Object.values(this.labelMap.cand);
        },

        getFaceLayout: function() {
            return Object.values(this.labelMap.faces);
        },

        makeUtility: function(util, ecrr, ecnt, tcrr, tcnt) {
            return {
                utility: util,
                edgeCorr: ecrr,
                edgeCnt: ecnt,
                triCorr: tcrr,
                triCnt: tcnt
            };
        },
        maximizeUtility: function(labels) {
            var self = this;
            let maxLabel = null,
                maxCord = null,
                maxRec = {
                    utility: -10000.0,
                    edgeCorr: 0.0,
                    edgeCnt: 0,
                    triCorr: 0.0,
                    triCnt: 0
                };
            Object.keys(self.labelMap.cand).forEach(key=>{
                if (self.isValidSlot(key)) {//valid slots
                    labels.forEach(name=>{
                        let cord = self.labelMap.cand[key].cord;
                        let util = self.getUpdatedUtility(name, cord);
                        if (maxRec.utility < util.utility) {
                            maxLabel = name;
                            maxCord = cord;
                            maxRec.utility = util.utility;
                            maxRec.edgeCorr = util.edgeCorr;
                            maxRec.edgeCnt = util.edgeCnt;
                            maxRec.triCorr = util.triCorr;
                            maxRec.triCnt = util.triCnt;
                        }
                    })
                }
            });
            //console.log(maxLabel);
            //console.log(maxCord.toString());
            //console.log(maxRec.utility);
            //console.log("maxLable: " + maxLabel + ' ' + maxRec.utility);
            return [maxLabel, maxCord, maxRec];
        },
        getTopUtilities: function(labels) {
            var self = this;
            let utils = [];
            Object.keys(self.labelMap.cand).forEach(key=>{
                if (self.isValidSlot(key)) {//valid slots
                    labels.forEach(name=>{
                        let cord = self.labelMap.cand[key].cord;
                        utils.push({
                            'cord': cord,
                            'util': self.getUpdatedUtility(name, cord)
                        });
                    })
                }
            });
            return utils.sort((a, b)=>a.util.utility - b.util.utility);
        },
        // compute utility when putting label at cord
        getUpdatedUtility: function(labelName, cord) {
            var self = this;
            let id = self.data.labelIndex[labelName];
            let edgeCorr = 0.0;
            let edgeCnt = 0;
            let triCorr = 0.0;
            let triCnt = 0;
            let neighbors = cord.getNeighbors();
            let shared = cord.getShareEdges();

            let numLabels = Object.keys(self.labelMap.in).length;
            if (numLabels === 0) { return self.makeUtility(0.0,0.0,0,0.0,0); }
            if (numLabels === 1) {
                for(let i = 0; i < neighbors.length; i++) {
                    let ncord = neighbors[i];
                    let nkey = ncord.toString();
                    if (nkey in self.labelMap.in) {
                        let nid = self.labelMap.in[nkey].index;
                        let corr = self.data.corr[self.corrMethod][nid][id];
                        return self.makeUtility(corr, corr, 1, 0.0, 0);
                    }
                }
                return self.makeUtility(-1.0,0.0,0,0.0,0);
            }

            neighbors.forEach((ncord, i) => {
                let nkey = ncord.toString();
                if (nkey in self.labelMap.in) {
                    let nid = self.labelMap.in[nkey].index;
                    let pnkey = neighbors[(i + 5) % 6].toString();
                    let nnkey = neighbors[(i + 1) % 6].toString();
                    if (nnkey in self.labelMap.in || pnkey in self.labelMap.in) {
                        // update edge corr
                        edgeCorr += self.data.corr[self.corrMethod][nid][id];
                        edgeCnt += 1;
                    }
                    if (nnkey in self.labelMap.in) {
                        let nnid = self.labelMap.in[nnkey].index;
                        // another edge
                        if (!(shared[i] in self.labelMap.in)) {
                            edgeCorr += self.data.corr[self.corrMethod][nid][nnid];
                            edgeCnt += 1;
                        }
                        // update face corr
                        triCorr += (self.data.corr[self.corrMethod][nid][id]
                                + self.data.corr[self.corrMethod][nid][nnid]
                                + self.data.corr[self.corrMethod][nnid][id]) / 3.0;
                        triCnt += 1;
                    }
                }
            });
            let totalEdge = 1.0, totalTri = 1.0;
            if (self.objective === 'average') {
                totalEdge = self.utility.edgeCnt + edgeCnt,
                totalTri = self.utility.triCnt + triCnt;
            }
            return {
                'utility': self.alpha * (self.utility.edgeCorr + edgeCorr) / totalEdge
                + (1 - self.alpha) * (self.utility.triCorr + triCorr) / totalTri,
                'edgeCorr': edgeCorr,
                'edgeCnt': edgeCnt,
                'triCorr': triCorr,
                'triCnt': triCnt
            };
        },

        updateUtility: function(util) {
            this.utility.utility = util.utility;
            this.utility.edgeCorr += util.edgeCorr;
            this.utility.edgeCnt += util.edgeCnt;
            this.utility.triCorr += util.triCorr;
            this.utility.triCnt += util.triCnt;
        },

        isEmptySlot: function(key) {
            return !(key in this.labelMap.in);
        },

        isValidSlot: function(key) {
            var self = this;
            if (key in self.labelMap.in) { return false; }
            let numLabels = Object.keys(self.labelMap.in).length;
            if (numLabels === 0) { return true; }
            if (numLabels === 1 && key in self.labelMap.cand) { return true; }
            if (!(key in self.labelMap.cand)
                || self.labelMap.cand[key].cnt < 2) { return false; }
            if ((self.labelMap.cand[key].ins & (self.labelMap.cand[key].ins >> 1))
                || (self.labelMap.cand[key].ins & (self.labelMap.cand[key].ins >> 5))) {
                return true;
            }
            return false;
        },

        addLabel: function(labelName, cord, utility) {
            var self = this;
            let facesAdded = [];
            let key = cord.toString();
            if (key in self.labelMap.in) {
                console.log('Adding label to used slot');
                return;
            } else if (!self.isValidSlot(key)) {
                console.log('Adding label to disconnected slot');
            }
            // update utility
            let util = utility || self.getUpdatedUtility(labelName, cord);
            self.updateUtility(util);
            // add to map
            self.labelMap.in[key] = {
                'name': labelName,
                'index': self.data.labelIndex[labelName],
                'cord': cord
            };
            // update neighbors
            let neighbors = cord.getNeighbors();
            let faces = cord.getFaces();
            neighbors.forEach((ncord, i) => {
                let nkey = ncord.toString();
                if (nkey in self.labelMap.in) {
                    let nextNcord = neighbors[(i + 1) % 6];
                    if (nextNcord.toString() in self.labelMap.in) {
                        // update faces
                        let triCord = faces[i];
                        let triKey = triCord.toString();
                        let vertIndex = triCord.getVertices().map(h=>self.data.labelIndex[self.labelMap.in[h].name])
                        self.labelMap.faces[triKey] = {
                            'key': triKey,
                            'cord': triCord,
                            'vertIndex': vertIndex
                        }
                        facesAdded.push({
                            'key': triKey,
                            'cord': triCord,
                            'vertIndex': vertIndex
                        });
                    }
                }
                // update candidates
                if (!(nkey in self.labelMap.cand)) {
                    self.labelMap.cand[nkey] = {
                        'cord': ncord,
                        'cnt': 0,
                        'ins': 0 //bitwise record for neighbors in map
                    }
                }
                self.labelMap.cand[nkey].cnt += 1;
                self.labelMap.cand[nkey].ins |= (1 << ((i + 3) % 6));
            });
            //console.log(self.labelMap);
            //console.log(self.utility);
            //console.log(facesAdded);
            return facesAdded;
        },
    
        removeLabel: function (cord) {
            var self = this;
            let facesRemoved = [];
            let key = cord.toString();
            if (!(key in self.labelMap.in)) {
                console.log("removing cord not exist")
                return;
            }
            // update utility
            let util= self.getUpdatedUtility(self.labelMap.in[key].name, cord);
            util.edgeCorr = -util.edgeCorr;
            util.edgeCnt = -util.edgeCnt;
            util.triCorr = -util.triCorr;
            util.triCnt = -util.triCnt;
            self.updateUtility(util);
            // remove from map
            delete self.labelMap.in[key];
            // update neighbors
            let neighbors = cord.getNeighbors();
            let faces = cord.getFaces();
            neighbors.forEach((ncord, i) => {
                let nkey = ncord.toString();
                if (!(nkey in self.labelMap.cand)) {
                    console.log("not in candidate");
                }
                self.labelMap.cand[nkey].cnt -= 1;
                if (self.labelMap.cand[nkey].cnt === 0) {
                    delete self.labelMap.cand[nkey];
                } else {
                    self.labelMap.cand[nkey].ins &= ~(1 <<((i + 3) % 6));
                }
            });
            faces.forEach(fcord => {
                let fkey = fcord.toString();
                if (fkey in self.labelMap.faces) {
                    facesRemoved.push(fkey);
                    delete self.labelMap.faces[fkey];
                }
            });
            //console.log(self.labelMap);
            //console.log(self.utility);
            //console.log(facesRemoved);
            return facesRemoved;
        },

    };
    
    UnTangleMap.init = function () {
        var self = this;
        // data
        self.data = {};
        // label map
        self.labelMap = {
            in: {},
            cand: {},
            faces: {}
        };
        self.utility = {
            // records
            utility: 0.0,
            edgeCorr: 0.0,
            edgeCnt: 0,
            triCorr: 0.0,
            triCnt: 0
        };
        self.corrMethod = 'spearman';
        self.objective = 'average';
        self.alpha = 1.0;
    }
    
    UnTangleMap.init.prototype = UnTangleMap.prototype;
    
    // attach to global
    global.UnTangleMapLayout = UnTangleMap;
    
}(window));