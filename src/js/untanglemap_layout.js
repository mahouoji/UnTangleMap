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
            console.log($.map(self.labelMap.faces, function(value, key) { return value }));
        },

        getLabelLayout: function() {
            return $.map(this.labelMap.in, function(value, key) { return value });
        },

        getFaceLayout: function() {
            return $.map(this.labelMap.faces, function(value, key) { return value });
        },

        addLabel: function(labelName, cord) {
            var self = this;
            //TODO: check validity
            let key = cord.toString();
            if (key in self.labelMap.cand) {
                delete self.labelMap.cand[key];
            } else if(Object.keys(self.labelMap.in).length > 2) {
                console.log('return');
                return;
            }
            // add to map
            self.labelMap.in[key] = {
                'name': labelName,
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
                        let triCord = faces[i];
                        self.labelMap.faces[triCord.toString()] = {
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
            //console.log(self.labelMap);
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
                if (nkey in self.labelMap.cand) {
                    self.labelMap.cand[nkey].cnt -= 1;
                    if (self.labelMap.cand[nkey].cnt < 2) {
                        delete self.labelMap.cand[nkey];
                    }
                } else if (nkey in self.labelMap.out) {
                    delete self.labelMap.out[nkey];
                }
            })
            faces.forEach(fcord => {
                let fkey = fcord.toString();
                if (fkey in self.labelMap.faces) {
                    delete self.labelMap.faces[fkey];
                }
            })
            //console.log(self.labelMap);
        }
        
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
            faces: {}
        };
        self.labels = {};
    }
    
    UnTangleMap.init.prototype = UnTangleMap.prototype;
    
    // attach to global
    global.UnTangleMapLayout = UnTangleMap;
    
    }(window));