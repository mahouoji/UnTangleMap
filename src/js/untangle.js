(function (global, d3) {

"use strict";

var UnTangleMap = function (selector, userOpt) {
    return new UnTangleMap.init(selector, userOpt);
}

UnTangleMap.prototype = {
    // plotting svg
    plotGrid: function () {
        //step
        var self = this;
        var w = self.opt.side;
        var h = self.opt.side * Math.sqrt(3) / 2.0;
        var width = self.opt.width;
        var height = self.opt.height;

        //axis
        var grid = self.svg.append('g').attr('class', 'grid-axes');
        var axes_q = grid.append('g').attr('class', 'grid-axes-q');
        var axes_s = grid.append('g').attr('class', 'grid-axes-s');
        var axes_r = grid.append('g').attr('class', 'grid-axes-r');
        // horizontal
        axes_q.selectAll('.grid-axes-q')
            .data(d3.range(0, height / h + 1))
            .enter()
            .append('line')
            .attr('class', 'grid-axes-q')
            .attr('x1', 0)
            .attr('y1', function (d) { return d * h; })
            .attr('x2', width)
            .attr('y2', function (d) { return d * h; });
        // left
        axes_s.selectAll('.grid-axes-s')
            .data(d3.range(0, width * 2 / w))
            .enter()
            .append('line')
            .attr('class', 'grid-axes-s')
            .attr('x1', function (d) { return (d + 1) * w; })
            .attr('y1', -2 * h)
            .attr('x2', function (d) { return d * w - (height + 2 * h) / Math.sqrt(3); })
            .attr('y2', height + 2 * h);
        // right
        axes_r.selectAll('.grid-axes-r')
            .data(d3.range(-width * 2 / w, width * 2 / w))
            .enter()
            .append('line')
            .attr('class', 'grid-axes-r')
            .attr('x1', function (d) { return (d - 1) * w; })
            .attr('y1', -2 * h)
            .attr('x2', function (d) { return d * w + (height + 2 * h) / Math.sqrt(3); })
            .attr('y2', height + 2 * h);
        // vertex
        var vertex = grid.append('g').attr('class', 'grid-vertex');
        vertex.selectAll('.grid-vertex')
            .data(d3.cross(d3.range(-1, width / w + 1), d3.range(-1, height / h + 1)))
            .enter()
            .append('circle')
            .attr('r', this.opt.gridRaid)
            .attr('cx', function (d) { return d[0] * w - (d[1] % 2 ? w / 2 : 0); })
            .attr('cy', function (d) { return d[1] * h; });


        // zoom
        var zoom = d3.zoom().scaleExtent([1, 10])
            .on("zoom", zoomed);

        function zoomed() {
            // grid
            axes_q.attr("transform",
                "translate(0,"
                + d3.event.transform.y % (h * d3.event.transform.k)
                + ")scale(" + d3.event.transform.k + ")");
            axes_s.attr("transform",
                "translate(" + d3.event.transform.x % (w * d3.event.transform.k) + ","
                + d3.event.transform.y % (2 * h * d3.event.transform.k)
                + ")scale(" + d3.event.transform.k + ")");
            axes_r.attr("transform",
                "translate(" + d3.event.transform.x % (w * d3.event.transform.k) + ","
                + d3.event.transform.y % (2 * h * d3.event.transform.k)
                + ")scale(" + d3.event.transform.k + ")");
            vertex.attr("transform",
                "translate(" + d3.event.transform.x % (w * d3.event.transform.k) + ","
                + d3.event.transform.y % (2 * h * d3.event.transform.k)
                + ")scale(" + d3.event.transform.k + ")");
            // labels
            self.svg.select(".label")
                    .attr("transform", d3.event.transform);
            // offset
            self.originOffset[0] = d3.event.transform.x;
            self.originOffset[1] = d3.event.transform.y;
        }
        self.svg.call(zoom);
    },

    plotLabels: function (labelData) {
        var self = this;
        labelData = labelData; //TODO
        var vertex = self.svg.append('g').attr('class', 'label').attr('cursor', 'grab');
        vertex.selectAll('.labels')
            .data(labelData)
            .enter()
            .append('circle')
            .attr('r', self.opt.labelRaid)
            .attr('cx', function (d) { return self.Hex.hex2x(d.cord); })
            .attr('cy', function (d) { return self.Hex.hex2y(d.cord); })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        function dragstarted() {
            d3.select(this).raise();
            vertex.attr("cursor", "grabbing");
        }

        function dragged(d) {
            var hcord = self.Hex.round2hex([d3.event.x, d3.event.y]);
            // find label item with
            //console.log([d3.event.x, d3.event.y]);
            //console.log([hcord[0], hcord[1]]);
            d3.select(this)
                .attr("cx", function(d) {return self.Hex.hex2x(hcord); })
                .attr("cy", function(d) {return self.Hex.hex2y(hcord); });
        }

        function dragended() {
            vertex.attr("cursor", "grab");
        }
    },

    // controllers
    updateData: function(data) {
        var self = this;
        self.data = data;

        self.plotLabels(self.getLabelLayout());
    },

    // label algorithms
    // layout
    getLabelLayout: function(center, data) {
        var self = this;
        center = center || [0, 0];
        data = data || self.data;

        //let label = self.getFirstLabel(data.labels);
        //self.addLabel(label.name, center);
        let labelNames = data.labels.map(l => l.name);
        self.addLabel(labelNames[0], center);
        self.addLabel(labelNames[1], self.Hex.getNeighbors(center)[0]);

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

    getFirstLabel: function(labels) {
        return labels[0];
    },

    addLabel: function(labelName, cord) {
        var self = this;
        //TODO: check validity
        //console.log(cord);
        let lableKey = self.Hex.toString(cord);
        if (lableKey in self.labelMap.cand) {
            delete self.labelMap.cand[lableKey];
        }
        self.labelMap.in[lableKey] = {
            'name': labelName,
            'cord': cord
        };
        //console.log(self.Hex.getNeighbors(cord));
        let neighbors = self.Hex.getNeighbors(cord);
        for (let i = 0; i < 6; i++) {
            let nCord = neighbors[i];
            let key = self.Hex.toString(nCord);
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
        let lableKey = self.Hex.toString(cord);
        if (!(lableKey in self.labelMap.in)) {
            console.log("removing cord not exist")
            return;
        }
        for (ncord in self.Hex.getNeighbors(cord)) {
            let key = self.Hex.toString(ncord);
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

UnTangleMap.init = function (selector, userOpt) {
    var self = this;
    //data
    self.data = {labels: [], items: []};

    self.originOffset = [0, 0];
    //config
    self.opt = {
        margin: { top: 50, left: 50, bottom: 50, right: 50 },
        width: 900,
        height: 600,
        side: 40,
        gridRaid: 5,
        labelRaid: 4,
    };
    for (var o in userOpt) {
        self.opt[o] = userOpt[o];
    }
    //hexagon algorithms
    self.Hex = Hex(self.opt.side);
    // label map
    self.labelMap = {
        in: {},
        cand: {},
        out: {}
    };
    self.labels = {};
    //canvas
    self.svg = d3.select(selector).append('svg')
        .attr('width', self.opt.width)
        .attr('height', self.opt.height);
    self.plotGrid();
}

UnTangleMap.init.prototype = UnTangleMap.prototype;

// attach to global
global.UnTangleMap = UnTangleMap;

}(window, d3));