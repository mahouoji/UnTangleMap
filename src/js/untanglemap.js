(function (global, d3) {

"use strict";

var UnTangleMap = function (selector, userOpt) {
    return new UnTangleMap.init(selector, userOpt);
}

var Hex = global.Hex(1.0);
var Layout = global.UnTangleMapLayout();

UnTangleMap.prototype = {
    // init plots and interactions
    // set up groups
    initLayers: function() {
        var self = this;
        // grid
        let grid = self.svg.append('g').attr('class', 'grid');
        grid.append('g').attr('class', 'grid-axes-q grid-zoom-1');
        grid.append('g').attr('class', 'grid-axes-s grid-zoom-2');
        grid.append('g').attr('class', 'grid-axes-r grid-zoom-2');
        grid.append('g').attr('class', 'grid-vertex grid-zoom-2');
        // map
        let utgmap = self.svg.append('g').attr('class', 'utgmap');
        utgmap.append('g').attr('class', 'face');
        utgmap.append('g').attr('class', 'edge');
        utgmap.append('g').attr('class', 'scatter-plot');
        utgmap.append('g').attr('class', 'hint');
        utgmap.append('g').attr('class', 'label');
        // tooltip
        self.selector.append("div").attr("class", "tooltip");
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
        let grid = self.svg.select('.grid');
        // horizontal
        grid.select('.grid-axes-q').selectAll('line')
            .data(d3.range(0, height / h + 1))
            .enter()
            .append('line')
            .attr('class', 'grid-axes-q')
            .attr('x1', 0)
            .attr('y1', function (d) { return d * h; })
            .attr('x2', width)
            .attr('y2', function (d) { return d * h; })
            .attr('stroke', '');
        // left
        grid.select('.grid-axes-s').selectAll('line')
            .data(d3.range(-1, width * 2 / w))
            .enter()
            .append('line')
            .attr('class', 'grid-axes-s')
            .attr('x1', function (d) { return (d + 1) * w; })
            .attr('y1', -2 * h)
            .attr('x2', function (d) { return d * w - (height + 2 * h) / Math.sqrt(3); })
            .attr('y2', height + 2 * h);
        // right
        grid.select('.grid-axes-r').selectAll('line')
            .data(d3.range(Math.floor(-width * 2 / w), width * 2 / w))
            .enter()
            .append('line')
            .attr('class', 'grid-axes-r')
            .attr('x1', function (d) { return (d - 1) * w; })
            .attr('y1', -2 * h)
            .attr('x2', function (d) { return d * w + (height + 2 * h) / Math.sqrt(3); })
            .attr('y2', height + 2 * h);
        // vertex
        grid.select('.grid-vertex').selectAll('circle')
            .data(d3.cross(d3.range(-1, width / w + 1), d3.range(-1, height / h + 1)))
            .enter()
            .append('circle')
            .attr('r', this.opt.gridRaid)
            .attr('cx', function (d) { return d[0] * w - (d[1] % 2 ? w / 2 : 0); })
            .attr('cy', function (d) { return d[1] * h; });
        // style
        grid.selectAll('line')
            .attr('stroke', self.opt.gridStroke)
            .attr('vector-effect', 'non-scaling-stroke');
        grid.selectAll('circle')
            .attr('stroke', self.opt.gridStroke)
            .attr('vector-effect', 'non-scaling-stroke');
    },
    initZoom: function () {
        var self = this;
        var w = self.opt.side;
        var h = self.opt.side * Math.sqrt(3) / 2.0;
        // zoom
        var zoom = d3.zoom().scaleExtent([1, 10])
            .on("zoom", zoomed);
        function zoomed() {
            // grid
            self.svg.selectAll('.grid-zoom-1').attr("transform",
                "translate(0,"
                + d3.event.transform.y % (h * d3.event.transform.k)
                + ")scale(" + d3.event.transform.k + ")");
            self.svg.selectAll('.grid-zoom-2').attr("transform",
                "translate(" + d3.event.transform.x % (w * d3.event.transform.k) + ","
                + d3.event.transform.y % (2 * h * d3.event.transform.k)
                + ")scale(" + d3.event.transform.k + ")");
            // labels and data items
            let utgmap = self.svg.select('.utgmap').attr("transform", d3.event.transform);
            // label font-size
            let labelFontSize = Math.min(self.opt.labelFontSize, 32 / d3.event.transform.k);
            let gridRaid = Math.min(self.opt.gridRaid, 8 / d3.event.transform.k);
            utgmap.selectAll('text').attr('font-size', labelFontSize);
            utgmap.selectAll('text').attr("transform","translate(0,"+(labelFontSize+gridRaid)+")")
            // circles
            //self.svg.select(".grid-vertex").selectAll("circle").attr('r', Math.min(self.opt.gridRaid, 8 / d3.event.transform.k));
            //console.log(Math.min(self.opt.gridRaid, 12 / d3.event.transform.k));

            // offset
            self.originOffset[0] = d3.event.transform.x;
            self.originOffset[1] = d3.event.transform.y;
        }
        self.svg.call(zoom);
        return self;
    },
    // set up labels and label dragging
    initLabels: function (labelData) {
        var self = this;
        let hints = self.svg.select('.utgmap').select('.hint');
        let vertex = self.svg.select('.utgmap').select('.label').attr('cursor', 'grab');
        let g = vertex.selectAll('g').data(labelData);
        g.exit().remove();
        g.enter().append('g').merge(g)
        .each(function(d) {
            d3.select(this).selectAll("*").remove();
            d3.select(this).append('text')
            .text(d => d.name)
            .attr('font-size', self.opt.labelFontSize)
            .attr('dx', function (d) { return Hex.hexToX(d.cord); })
            .attr('dy', function (d) { return Hex.hexToY(d.cord); })
            .attr("transform","translate(0,"+(self.opt.labelFontSize+self.opt.gridRaid)+")")
            .attr('text-anchor','middle')
            .on("mouseover", d=>{
                console.log(self.data.labels[self.data.labelIndex[d.name]]);
            });
            d3.select(this).append('circle')
            .attr('r', self.opt.labelRaid)
            .attr('cx', function (d) { return Hex.hexToX(d.cord); })
            .attr('cy', function (d) { return Hex.hexToY(d.cord); })
            .attr('label', d=>d.name)
            // drag
            .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
        });
        // drag
        function dragstarted() {
            let x = d3.select(this).attr('cx');
            let y = d3.select(this).attr('cy');
            self.activeCord = Hex.svgToRoundHex([x,y]);
            Layout.removeLabel(self.activeCord);
            self.updateLayout();
            d3.select(this.parentNode).raise();
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
            d3.select(this.parentNode).select('text')
                .attr("dx", d3.event.x)
                .attr("dy", d3.event.y);
        }

        function dragended() {
            vertex.attr("cursor", "grab");
            let hcord = Hex.svgToRoundHex([d3.event.x, d3.event.y]);
            let name = d3.select(this).attr('label');
            if (!Layout.isEmptySlot(hcord.toString())) {
                hcord = self.activeCord;
            }
            Layout.addLabel(name, hcord);
            let x = Hex.hexToX(hcord),
                y = Hex.hexToY(hcord);
            d3.select(this)
                .attr("cx", x)
                .attr("cy", y);
            d3.select(this.parentNode).select('text')
                .attr("dx", x)
                .attr("dy", y);
            // update position record
            self.labelPos[self.data.labelIndex[name]] = [x, y];
            //console.log(self.labelPos);
            self.updateLayout();
        }
        return self;
    },

    // update plots
    updateFaces: function(faceData) {
        var self = this;
        var face = self.svg.select('.utgmap').select('.face')
            .selectAll('polyline').data(faceData);
        face.exit().remove();
        face.enter().append('polyline').merge(face)
        .attr('points', function (f) { return Hex.faceToSvgPath(f.cord); })
        return self;
    },
    updateScatterPlot: function (faceData) {
        var self = this;
        let scatter = self.svg.select('.utgmap').select('.scatter-plot');
        let data = []
        faceData.forEach(face=>{
            let ids = face.vertIndex;
            let pa = self.labelPos[ids[0]];
            let pb = self.labelPos[ids[1]];
            let pc = self.labelPos[ids[2]];
            self.data.items.forEach(item=>{
                let a = item.vec[ids[0]];
                let b = item.vec[ids[1]];
                let c = item.vec[ids[2]];
                if (a > 0 || b > 0 || c > 0) {
                    let sum = a + b + c;
                    a = a/sum;
                    b = b/sum;
                    c = c/sum;
                    data.push([a * pa[0] + b * pb[0] + c * pc[0],
                               a * pa[1] + b * pb[1] + c * pc[1]]);
                }
            });
        });
        //console.log(self.labelPos);
        let circle = scatter.selectAll('circle')
            .data(data);
        circle.exit().remove();
        circle.enter().append('circle').merge(circle)
            .attr('cx', d=>d[0])
            .attr('cy', d=>d[1])
            .attr('r', self.opt.itemRaid);
        /*
        let g = scatter.selectAll('g')
            .data(faceData);
        g.exit().remove();
        g.enter().append('g').merge(g);
        g.selectAll('circle')
            .data(self.data.items)
            .enter()
            .append('circle');*/
        return self;
    },
    updateEdges: function (faceData) {
        var self = this;
        let selection = self.svg.select('.utgmap').select('.edge');
        let edgeSet = {};
        faceData.forEach(face=>{
            let vindex = face.vertIndex; //[lid0, lid1, lid2]
            let vpos = vindex.map(id=>self.labelPos[id]); //[[x, y], [x, y], [x, y]]
            let vcord = face.cord.getVertices(); // [hcord0, hcord1, hcord2]
            let eids = face.cord.getSum() === 1 ? [[0, 1], [1, 2], [0, 2]] : [[1, 0], [2, 1], [2, 0]];
            eids.forEach(pair=>{
                let ecord = [vcord[pair[0]], vcord[pair[1]]] // [hcord, hcord]
                let key = `${ecord[0].toString()}-${ecord[1].toString()}`;
                if (!(key in edgeSet)) {
                    edgeSet[key] = {
                        pos1: vpos[pair[0]],
                        pos2: vpos[pair[1]],
                        corr: self.data.corr[self.corrMethod][vindex[pair[0]]][vindex[pair[1]]]
                    }
                }
            });
        });
        let line = selection.selectAll('line')
            .data($.map(edgeSet, function(value, key) { return value }))
        line.exit().remove();
        line.enter().append('line').merge(line)
            .attr('x1', d=>d.pos1[0])
            .attr('y1', d=>d.pos1[1])
            .attr('x2', d=>d.pos2[0])
            .attr('y2', d=>d.pos2[1])
            .attr('stroke', '#999')
            .attr('stroke-width', 1);
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
            .updateHints(Layout.getCandidateLayout())
            .updateScatterPlot(Layout.getFaceLayout());
    },

    // manage data
    initLabelPos: function(labelData) {
        var self = this;
        self.labelPos = self.data.labels.map(d=>[0,0]);
        labelData.forEach(rec => {
            self.labelPos[rec.index] = Hex.hexToSvg(rec.cord);
        });
    },

    // controller
    initData: function(data) {
        var self = this;
        self.data = data;

        let center = Hex.svgToRoundHex([self.opt.width / 2.0, self.opt.height / 2.0]);
        Layout.initLabelLayout(data, center);
        let labelLayout = Layout.getLabelLayout();
        let faceLayout = Layout.getFaceLayout();
        let candLayout = Layout.getCandidateLayout();
        self.initLabelPos(labelLayout);
        self.initLabels(labelLayout).initZoom()
            .updateHints(candLayout)
            .updateFaces(faceLayout)
            .updateScatterPlot(faceLayout)
            .updateEdges(faceLayout);
    },
};

UnTangleMap.init = function (selector, userOpt) {
    var self = this;
    //data
    self.data = {labels: [], items: []};

    self.originOffset = [0, 0];
    self.corrMethod = 'spearman';
    //config
    self.opt = {
        margin: { top: 50, left: 50, bottom: 50, right: 50 },
        width: 1000,
        height: 550,
        side: 30.0,
        gridStroke: 0.5,
        gridRaid: 4,
        labelRaid: 3,
        labelFontSize: 8,
        itemRaid: 2,
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
    self.activeCord = HexCord(0, 0);
    self.labelPos = [];//svg coordinates for labels by lableIndex
    //canvas
    self.selector = d3.select(selector);
    self.svg = self.selector.append('svg')
        .attr('width', self.opt.width)
        .attr('height', self.opt.height);
    self.initLayers().initGrid();
}

UnTangleMap.init.prototype = UnTangleMap.prototype;

// attach to global
global.UnTangleMap = UnTangleMap;

}(window, d3));