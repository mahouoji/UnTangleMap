(function (global, d3) {

"use strict";

var UnTangleMap = function (selector, userOpt) {
    return new UnTangleMap.init(selector, userOpt);
}

var Hex = global.Hex(1.0);
var Layout = global.UnTangleMapLayout();

UnTangleMap.prototype = {
    // set up groups
    initLayers: function() {
        var self = this;
        // grid
        let grid = self.svg.append('g').attr('class', 'grid');
        grid.append('g').attr('class', 'grid-axes-q');
        grid.append('g').attr('class', 'grid-axes-s');
        grid.append('g').attr('class', 'grid-axes-r');
        grid.append('g').attr('class', 'grid-vertex');
        // map
        let utgmap = self.svg.append('g').attr('class', 'utgmap');
        utgmap.append('g').attr('class', 'face');
        utgmap.append('g').attr('class', 'hint');
        utgmap.append('g').attr('class', 'label');
        return self
    },
    // set up grid and zooming
    initGrid: function () {
        //step
        var self = this;
        var w = self.opt.side;
        var h = self.opt.side * Math.sqrt(3) / 2.0;
        var width = self.opt.width;
        var height = self.opt.height;

        //axis
        let axes_q = self.svg.select('.grid-axes-q');
        let axes_s = self.svg.select('.grid-axes-s');
        let axes_r = self.svg.select('.grid-axes-r');
        let vertex = self.svg.select('.grid-vertex');
        // horizontal
        axes_q.selectAll('line')
            .data(d3.range(0, height / h + 1))
            .enter()
            .append('line')
            .attr('class', 'grid-axes-q')
            .attr('x1', 0)
            .attr('y1', function (d) { return d * h; })
            .attr('x2', width)
            .attr('y2', function (d) { return d * h; });
        // left
        axes_s.selectAll('line')
            .data(d3.range(-1, width * 2 / w))
            .enter()
            .append('line')
            .attr('class', 'grid-axes-s')
            .attr('x1', function (d) { return (d + 1) * w; })
            .attr('y1', -2 * h)
            .attr('x2', function (d) { return d * w - (height + 2 * h) / Math.sqrt(3); })
            .attr('y2', height + 2 * h);
        // right
        axes_r.selectAll('line')
            .data(d3.range(-width * 2 / w, width * 2 / w))
            .enter()
            .append('line')
            .attr('class', 'grid-axes-r')
            .attr('x1', function (d) { return (d - 1) * w; })
            .attr('y1', -2 * h)
            .attr('x2', function (d) { return d * w + (height + 2 * h) / Math.sqrt(3); })
            .attr('y2', height + 2 * h);
        // vertex
        vertex.selectAll('circle')
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
            // labels and data items
            self.svg.select('.utgmap').attr("transform", d3.event.transform);
            // offset
            self.originOffset[0] = d3.event.transform.x;
            self.originOffset[1] = d3.event.transform.y;
        }
        self.svg.call(zoom);
    },
    // set up labels and label dragging
    initLabels: function (labelData) {
        var self = this;
        labelData = labelData; //TODO
        var hints = self.svg.select('.utgmap').select('.hint');
        var vertex = self.svg.select('.utgmap').select('.label').attr('cursor', 'grab');
        vertex.selectAll('circle')
            .data(labelData)
            .enter()
            .append('circle')
            .attr('r', self.opt.labelRaid)
            .attr('cx', function (d) { return Hex.hexToX(d.cord); })
            .attr('cy', function (d) { return Hex.hexToY(d.cord); })
            .attr('label', d=>d.name)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));
        //hints
        var hintData = Layout.getCandidateLayout();
        hints.selectAll('circle')
            .data(hintData)
            .enter()
            .append('circle')
            .attr('r', self.opt.gridRaid)
            .attr('cx', function (d) { return Hex.hexToX(d.cord); })
            .attr('cy', function (d) { return Hex.hexToY(d.cord); })
            .attr('opacity', d=>d.cnt/6.0);
        // drag
        function dragstarted() {
            let x = d3.select(this).attr('cx');
            let y = d3.select(this).attr('cy');
            let hcord = Hex.svgToRoundHex([x,y]);
            Layout.removeLabel(hcord);
            self.updateLayout();
            d3.select(this).raise();
            vertex.attr("cursor", "grabbing");
        }

        function dragged(d) {
            //var hcord = Hex.round2hex([d3.event.x, d3.event.y]);
            // find label item with
            //console.log([d3.event.x, d3.event.y]);
            //console.log([hcord[0], hcord[1]]);
            //d3.select(this)
            //    .attr("cx", function(d) {return Hex.hex2x(hcord); })
            //    .attr("cy", function(d) {return Hex.hex2y(hcord); });
            d3.select(this)
                .attr("cx", d3.event.x)
                .attr("cy", d3.event.y);
        }

        function dragended() {
            vertex.attr("cursor", "grab");
            let hcord = Hex.svgToRoundHex([d3.event.x, d3.event.y]);
            let name = d3.select(this).attr('label');
            Layout.addLabel(name, hcord);
            self.updateLayout();
            d3.select(this)
                .attr("cx", Hex.hexToX(hcord))
                .attr("cy", Hex.hexToY(hcord));
        }
        return self;
    },

    updateFaces: function(faceData) {
        var self = this;
        var face = self.svg.select('.utgmap').select('.face')
            .selectAll('polyline').data(faceData);
        face.exit().remove();
        face.enter().append('polyline').merge(face)
        .attr('points', function (f) { return Hex.faceToSvgPath(f.cord); })
        console.log(faceData);
        return self;
    },

    updateHints: function(hintData) {
        var self = this;
        var hints = self.svg.select('.utgmap').select('.hint')
            .selectAll('circle').data(hintData);
        hints.exit().remove();
        hints.enter().append('circle').merge(hints)
            .attr('r', self.opt.gridRaid)
            .attr('cx', function (d) { return Hex.hexToX(d.cord); })
            .attr('cy', function (d) { return Hex.hexToY(d.cord); })
            .attr('opacity', d => d.cnt / 6.0);
        return self;
    },

    updateLayout: function() {
        this.updateFaces(Layout.getFaceLayout())
            .updateHints(Layout.getCandidateLayout());
    },

    // controllers
    initData: function(data) {
        var self = this;
        self.data = data;

        Layout.initLabelLayout(data);
        self.initLabels(Layout.getLabelLayout())
            .updateFaces(Layout.getFaceLayout());
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
    Hex.side = self.opt.side;
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
    self.initLayers().initGrid();
}

UnTangleMap.init.prototype = UnTangleMap.prototype;

// attach to global
global.UnTangleMap = UnTangleMap;

}(window, d3));