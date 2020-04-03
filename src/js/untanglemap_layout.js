// layout algorithms for UnTangle Map
(function (global) {
    "use strict";
    var UnTangleMap = function () {
        return new UnTangleMap.init();
    }

    UnTangleMap.prototype = {
        // layout
        getLabelLayout: function(data, center) {
            var self = this;
            data = data || self.data;
            center = center || HexCord(0, 0);
    
            //let label = self.getFirstLabel(data.labels);
            //self.addLabel(label.name, center);
            let labelNames = data.labels.map(l => l.name);
            self.addLabel(labelNames[0], center);
            self.addLabel(labelNames[1], center.getNeighbors()[0]);

            for (let i = 2; i < labelNames.length; i++) {
                //console.log(self.labelMap.cand);
                for (let key in self.labelMap.cand) {
                    self.addLabel(labelNames[i],  self.labelMap.cand[key].cord);
                    break;
                }
            }
            /*while(labelNames.length > 0) {
                name = labelNames
                Map.addLabel(name, cord);
                delete labelNames[name];
    
                for (name in labelNames) {
                    for (cord in self.labelMap.cand) {
                        Map.addLabel(name, cord);
                        delete labelNames[name];
                        break;
                    }
                }
            }*/
            console.log($.map(self.labelMap.in, function(value, key) { return value }));
            console.log($.map(self.labelMap.tri, function(value, key) { return value }));
            return $.map(self.labelMap.in, function(value, key) { return value });
        },

        addLabel: function(labelName, cord) {
            var self = this;
            //TODO: check validity
            let key = cord.toString();
            if (key in self.labelMap.cand) {
                delete self.labelMap.cand[key];
            }
            // add to map
            self.labelMap.in[key] = {
                'name': labelName,
                'cord': cord
            };
            // update neighbors
            let neighbors = cord.getNeighbors();
            let triangles = cord.getTriangles();
            neighbors.forEach((ncord, i) => {
                let nkey = ncord.toString();
                if (nkey in self.labelMap.in) {
                    let nextNcord = neighbors[(i + 1) % 6];
                    if (nextNcord.toString() in self.labelMap.in) {
                        let triCord = triangles[i];
                        self.labelMap.tri[triCord.toString()] = {
                            'cord': triCord
                        }
                    }
                } else if(nkey in self.labelMap.cand) {
                    self.labelMap.cand[nkey].cnt += 1;
    
                } else if (nkey in self.labelMap.out) {
                    delete self.labelMap.out[nkey];
                    self.labelMap.cand[nkey] = {
                        'cord': ncord,
                        'cnt': 2
                    }
                } else {
                    self.labelMap.out[nkey] = {
                        'cord': ncord,
                    }
                }
            });
        },
    
        removeLabel: function (labelData) {
            var self = this;
            var cord = labelData.cord;
            let lableKey = cord.toString();
            if (!(lableKey in self.labelMap.in)) {
                console.log("removing cord not exist")
                return;
            }
            for (ncord in cord.getNeighbors()) {
                let key = ncord.toString();
                if (key in self.labelMap.cand) {
                    self.labelMap.cand[key].cnt -= 1;
                    if (self.labelMap.cand[key].cnt < 2) {
                        delete self.labelMap.cand[key];
                    }
                } else if (key in self.labelMap.out) {
                    delete self.labelMap.out[key];
                 }
            }
        },
        
    };
    
    UnTangleMap.init = function () {
        var self = this;
        // data
        self.data = {labels: [], items: []};
        // label map
        self.labelMap = {
            in: {},
            cand: {},
            out: {},
            tri: {}
        };
        self.labels = {};
    }
    
    UnTangleMap.init.prototype = UnTangleMap.prototype;
    
    // attach to global
    global.UnTangleMapLayout = UnTangleMap;
    
    }(window));