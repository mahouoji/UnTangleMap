// layout algorithms for UnTangle Map
(function (global) {
    "use strict";
    var UnTangleMap = function () {
        return new UnTangleMap.init();
    }

    UnTangleMap.prototype = {
        // layout
        initLabelLayout: function(data, center) {
            var self = this;
            center = center || HexCord(0, 0);
            self.data = data;

            // TODO: sort labels
            //let label = self.getFirstLabel(data.labels);
            //self.addLabel(label.name, center);
            let labelNames = self.data.labels.map(l => l.name);
            self.addLabel(labelNames[0], center);
            self.addLabel(labelNames[1], center.getNeighbors()[0]);

            while (labelNames.length > 0) {
                let res = self.placeLable(labelNames);
                self.addLabel(res[0], res[1], res[2]);
                labelNames = labelNames.filter(name=>name !== res[0]);
            }

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
            }
            console.log($.map(self.labelMap.in, function(value, key) { return value }));
            console.log($.map(self.labelMap.faces, function(value, key) { return value }));
        },

        getLabelLayout: function() {
            return $.map(this.labelMap.in, function(value, key) { return value });
        },

        getCandidateLayout: function() {
            return $.map(this.labelMap.cand, function(value, key) { return value });
        },

        getFaceLayout: function() {
            return $.map(this.labelMap.faces, function(value, key) { return value });
        },

        placeLable: function(labels) {
            var self = this;
            let maxLabel = '';
            let maxCord = Hex(0, 0, 0);
            let maxRec = {
                utility: -10000.0,
                edgeCorr: 0.0,
                edgeCnt: 0,
                triCorr: 0.0,
                triCnt: 0
            };
            $.each(self.labelMap.cand, function(key, _){
                if (!(key in self.labelMap.in) && self.labelMap.cand[key].cnt >= 2) {//valid slots
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
            console.log(maxLabel);
            console.log(maxRec.utility);
            return [maxLabel, maxCord, maxRec];
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
            neighbors.forEach((ncord, i) => {
                let nkey = ncord.toString();
                if (nkey in self.labelMap.in) {
                    // update edge corr
                    let nid = self.labelMap.in[nkey].index;
                    edgeCorr += self.data.corr[self.utility.method][nid][id];
                    edgeCnt += 1;
                    // update face corr
                    let nnkey = neighbors[(i + 1) % 6].toString();
                    if (nnkey in self.labelMap.in) {
                        let nnid = self.labelMap.in[nnkey].index;
                        triCorr += (self.data.corr[self.utility.method][nid][id]
                                + self.data.corr[self.utility.method][nid][nnid]
                                + self.data.corr[self.utility.method][nnid][id]) / 3.0;
                        triCnt += 1;
                    }
                }
            });
            return {
                'utility': self.utility.alpha * (self.utility.edgeCorr + edgeCorr) / (self.utility.edgeCnt + edgeCnt)
                + (1 - self.utility.alpha) * (self.utility.triCorr + triCorr) / (self.utility.triCnt + triCnt),
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

        addLabel: function(labelName, cord, utility) {
            var self = this;
            //TODO: check validity
            let key = cord.toString();
            if (key in self.labelMap.cand && self.labelMap.cand[key].cnt >= 2) {
                //delete self.labelMap.cand[key];
            } else if(Object.keys(self.labelMap.in).length > 2) {
                console.log('invalid position');
                //return;
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
                // update faces
                if (nkey in self.labelMap.in) {
                    let nextNcord = neighbors[(i + 1) % 6];
                    if (nextNcord.toString() in self.labelMap.in) {
                        let triCord = faces[i];
                        self.labelMap.faces[triCord.toString()] = {
                            'cord': triCord
                        }
                    }
                }
                // update candidates
                if (!(nkey in self.labelMap.cand)) {
                    self.labelMap.cand[nkey] = {
                        'cord': ncord,
                        'cnt': 0
                    }
                }
                self.labelMap.cand[nkey].cnt += 1;
            });
            console.log(self.labelMap);
        },
    
        removeLabel: function (cord) {
            var self = this;
            let key = cord.toString();
            if (!(key in self.labelMap.in)) {
                console.log("removing cord not exist")
                return;
            }
            delete self.labelMap.in[key];

            let neighbors = cord.getNeighbors();
            let faces = cord.getFaces();
            neighbors.forEach(ncord => {
                let nkey = ncord.toString();
                if (!(nkey in self.labelMap.cand)) {
                    console.log("not in candidate");
                }
                self.labelMap.cand[nkey].cnt -= 1;
                if (self.labelMap.cand[nkey].cnt === 0) {
                    delete self.labelMap.cand[nkey];
                }
            });
            faces.forEach(fcord => {
                let fkey = fcord.toString();
                if (fkey in self.labelMap.faces) {
                    delete self.labelMap.faces[fkey];
                }
            });
            console.log(self.labelMap);
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
            triCnt: 0,
            // settings
            alpha: 0.5,
            method: 'spearman'
        }

    }
    
    UnTangleMap.init.prototype = UnTangleMap.prototype;
    
    // attach to global
    global.UnTangleMapLayout = UnTangleMap;
    
    }(window));