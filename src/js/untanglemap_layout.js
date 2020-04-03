// layout algorithms for UnTangle Map
(function (global) {
    "use strict";
    var UnTangleMap = function () {
        return new UnTangleMap.init();
    }

    var Hex = global.Hex(1.0);
    
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
            return $.map(self.labelMap.in, function(value, key) { return value });
        },

        addLabel: function(labelName, cord) {
            var self = this;
            //TODO: check validity
            //console.log(cord);
            let lableKey = cord.toString();
            if (lableKey in self.labelMap.cand) {
                delete self.labelMap.cand[lableKey];
            }
            self.labelMap.in[lableKey] = {
                'name': labelName,
                'cord': cord
            };
            //console.log(Hex.getNeighbors(cord));
            let neighbors = cord.getNeighbors();
            for (let i = 0; i < 6; i++) {
                let nCord = neighbors[i];
                let key = nCord.toString();
                if (key in self.labelMap.cand) {
                    self.labelMap.cand[key].cnt += 1;
    
                } else if (key in self.labelMap.out) {
                    delete self.labelMap.out[key];
                    self.labelMap.cand[key] = {
                        'cord': nCord,
                        'cnt': 2
                    }
                } else {
                    self.labelMap.out[key] = {
                        'cord': nCord,
                    }
                }
            }
            //console.log(self.labelMap);
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
            out: {}
        };
        self.labels = {};
    }
    
    UnTangleMap.init.prototype = UnTangleMap.prototype;
    
    // attach to global
    global.UnTangleMapLayout = UnTangleMap;
    
    }(window));