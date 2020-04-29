(function (global, d3) {

"use strict";

var UnTangleMap = function (selector, userOpt) {
    return new UnTangleMap.init(selector, userOpt);
}

var Hex = global.Hex(1.0);
var Layout = global.UnTangleMapLayout();
var Heatmap = global.UnTangleMapHeatmap();

UnTangleMap.prototype = {
    // init plots and interactions
    // set up groups
    initLayers: function() {
        var self = this;
        // grid
        self.addGridLayer('grid-d0');
        //self.addGridLayer('grid-d1')
        //    .addGridLayer('grid-d2')
        //    .addGridLayer('grid-d3');
        // map
        let utgmap = self.svg.append('g').attr('class', 'utgmap');
        let heatmap = utgmap.append('g').attr('class', 'heatmap');
        heatmap.append('g').attr('class', 'heatmap-d0');
        heatmap.append('g').attr('class', 'heatmap-d1');
        heatmap.append('g').attr('class', 'heatmap-d2');
        heatmap.append('g').attr('class', 'heatmap-d3');
        let tgrid = utgmap.append('g').attr('class', 'ternary-grid');
        tgrid.append('g').attr('class', 'ternary-grid-d0');
        tgrid.append('g').attr('class', 'ternary-grid-d1');
        tgrid.append('g').attr('class', 'ternary-grid-d2');
        tgrid.append('g').attr('class', 'ternary-grid-d3');
        utgmap.append('g').attr('class', 'face');
        utgmap.append('g').attr('class', 'edge');
        utgmap.append('g').attr('class', 'scatter-plot');
        utgmap.append('g').attr('class', 'hint');
        utgmap.append('g').attr('class', 'label');
        // tooltip
        self.selector.append("div").attr("class", "tooltip");
        return self
    },
    addGridLayer: function(gridSelector) {
        let grid = this.svg.append('g').attr('class', gridSelector);
        grid.append('g').attr('class', 'grid-axes-q grid-zoom-1');
        grid.append('g').attr('class', 'grid-axes-s grid-zoom-2');
        grid.append('g').attr('class', 'grid-axes-r grid-zoom-2');
        grid.append('g').attr('class', 'grid-vertex grid-zoom-2');
        return this;
    },
    // set up grid and zooming
    initGrid: function () {
        //step
        var self = this;
        let w = self.opt.side;
        let h = self.opt.side * Math.sqrt(3) / 2.0;
        let width = self.opt.width;
        let height = self.opt.height;

        //axis
        self.drawGridLines('.grid-d0', width, height, w, h, self.opt.gridStroke);
        //self.drawGridLines('.grid-d1', width, height, w/2., h/2., self.opt.gridStrokeSub);
        //self.drawGridLines('.grid-d2', width, height, w/4., h/4., self.opt.gridStrokeSub);
        //self.drawGridLines('.grid-d3', width, height, w/8., h/8., self.opt.gridStrokeSub);
        // vertex
        let grid = self.svg.select('.grid-d0');
        grid.select('.grid-vertex').selectAll('circle')
            .data(d3.cross(d3.range(-1, width / w + 1), d3.range(-1, height / h + 1)))
            .enter()
            .append('circle')
            .attr('r', this.opt.gridRaid)
            .attr('cx', function (d) { return d[0] * w - (d[1] % 2 ? w / 2 : 0); })
            .attr('cy', function (d) { return d[1] * h; });
        // style
        grid.selectAll('circle')
            .attr('stroke', self.opt.gridStroke)
            .attr('vector-effect', 'non-scaling-stroke');
    },
    drawGridLines: function(gridSelector, width, height, w, h, stroke) {
        //axis
        let grid = this.svg.select(gridSelector);
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
            .attr('stroke', stroke);
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
        grid.selectAll('line')
            .attr('stroke', '#ccc')
            .attr('stroke-width', stroke)
            .attr('vector-effect', 'non-scaling-stroke')
            .attr('shape-rendering', 'crispEdges');
    },
    initZoom: function () {
        var self = this;
        var w = self.opt.side;
        var h = self.opt.side * Math.sqrt(3) / 2.0;
        // zoom
        var zoom = d3.zoom().scaleExtent([1, 10])
            .on("zoom", zoomed)
            .on("end", zoomEnd);
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
            self.svg.select('.utgmap').attr("transform", d3.event.transform);
            // offset
            self.transform.x = d3.event.transform.x;
            self.transform.y = d3.event.transform.y;
            self.transform.k = d3.event.transform.k;
        }
        function zoomEnd() {
            self.adjustZoom();
        }
        self.svg.call(zoom);
        //self.adjustZoom(); // resize to adjust current zooming when switching datasets
        return self;
    },
    adjustZoom: function() {
        var self = this;
        let utgmap = self.svg.select('.utgmap');
        // label font-size
        //let labelFontSize = Math.min(self.opt.labelFontSize, 28 / self.transform.k);
        let labelFontSize = self.transform.k < 1.5 ? 8 : self.transform.k < 4 ? 6 : self.transform.k < 8 ? 4 : 3;
        //let gridRaid = Math.min(self.opt.gridRaid, 8 / self.transform.k);
        let gridRaid = self.opt.gridRaid / (self.transform.k * 1.4);
        let labelTrans = self.labelAsCircle ? `translate(0,${labelFontSize+gridRaid})` : `translate(0,${-gridRaid})`;
        utgmap.selectAll('text').attr('font-size', labelFontSize);
        utgmap.selectAll('text').attr("transform",labelTrans);
        // circles
        let constItenSize = self.transform.k < 2 ? 1.0 : (self.transform.k < 5 ? 0.8 : 0.6);
        self.svg.select(".scatter-plot").selectAll("circle").attr('r', Math.max(self.opt.itemRaid / self.transform.k, constItenSize));
        // heatmap
        if (self.transform.k < 1.5) {
            $('.heatmap-d1').show();
            $('.heatmap-d2').hide();
            $('.heatmap-d3').hide();
            $('.ternary-grid-d1').show();
            $('.ternary-grid-d2').hide();
            $('.ternary-grid-d3').hide();
        } else if (self.transform.k < 4) {
            $('.heatmap-d1').hide();
            $('.heatmap-d2').show();
            $('.heatmap-d3').hide();
            $('.ternary-grid-d1').show();
            $('.ternary-grid-d2').show();
            $('.ternary-grid-d3').hide();
        } else {
            $('.heatmap-d1').hide();
            $('.heatmap-d2').hide();
            $('.heatmap-d3').show();
            $('.ternary-grid-d1').show();
            $('.ternary-grid-d2').show();
            $('.ternary-grid-d3').show();
        }
        if (self.transform.k == 1.0) {
            $('.ternary-grid-d1').hide();
        }
        // grid
        /*
        if (self.transform.k < 2) {
            $('.grid-d1').show();
            $('.grid-d2').hide();
            $('.grid-d3').hide();
        } else if (self.transform.k < 5) {
            $('.grid-d1').hide();
            $('.grid-d2').show();
            $('.grid-d3').hide();
        } else {
            $('.grid-d1').hide();
            $('.grid-d2').hide();
            $('.grid-d3').show();
        }*/
        return self;
    },
    // set up labels and label dragging
    initLabels: function (labelData) {
        var self = this;
        let vertex = self.svg.select('.utgmap').select('.label').attr('cursor', 'grab');
        let g = vertex.selectAll('g').data(labelData);
        let labelTrans = self.labelAsCircle ? `translate(0,${self.opt.labelFontSize+self.opt.gridRaid})` : 'translate(0,0)';
        g.exit().remove();
        g.enter().append('g').merge(g)
        .each(function(d) {
            d3.select(this).selectAll("*").remove();
            d3.select(this).append('text')
            .text(d => d.name)
            .attr('font-size', self.opt.labelFontSize)
            .attr('dx', function (d) { return Hex.hexToX(d.cord); })
            .attr('dy', function (d) { return Hex.hexToY(d.cord); })
            .attr("transform", labelTrans)
            .attr('text-anchor','middle')
            .attr('label', d=>d.name)
            //.attr('stroke', 'white')
            //.attr('stroke-width', 0.2)
            //.attr('vector-effect', 'non-scaling-stroke')
            .on("mouseover", d=>{
                console.log(self.data.labels[self.data.labelIndex[d.name]]);
            });
            d3.select(this).append('circle')
            .attr('r', self.opt.labelRaid)
            .attr('cx', function (d) { return Hex.hexToX(d.cord); })
            .attr('cy', function (d) { return Hex.hexToY(d.cord); })
            .attr('label', d=>d.name);
        });
        self.initDrag();
        return self;
    },
    initDrag: function() {
        var self = this;
        let dragBy = self.labelAsCircle ? 'circle' : 'text',
            notDragBy = self.labelAsCircle ? 'text' : 'circle';
        let label = self.svg.select('.utgmap').select('.label');
        // disable drag
        label.selectAll(notDragBy)
            .call(d3.drag()
            .on("start", null)
            .on("drag", null)
            .on("end", null));
        // enable drag
        let vertex = label.selectAll(dragBy)
            .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
        // drag
        function dragstarted() {
            let kx = self.labelAsCircle ? 'cx' : 'dx',
                ky = self.labelAsCircle ? 'cy' : 'dy';
            let x = d3.select(this).attr(kx);
            let y = d3.select(this).attr(ky);
            console.log(x, y);
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
            d3.select(this.parentNode).select('circle')
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
            d3.select(this.parentNode).select('circle')
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
            .selectAll('polygon').data(faceData);
        face.exit().remove();
        face.enter().append('polygon').merge(face)
        .attr('points', function (f) { return Hex.faceToSvgPath(f.cord); })
        .attr('stroke-width', self.opt.faceStroke)
        .attr('stroke-linejoin', 'round');
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
        return self;
    },
    getSVGPoints: function (v) {
        return `${v[0][0]} ${v[0][1]},${v[1][0]} ${v[1][1]},${v[2][0]} ${v[2][1]}`
    },
    updateHeatmap: function (faceData) {
        var self = this;
        Heatmap.initHeatmap(self.labelPos, faceData);
        for (let k = 0; k < 4; k++) {
            let maxCnt = d3.max(Heatmap.heatmap[k].map(d=>d.cnt));
            let logScale = d3.scaleLog().domain([1, maxCnt+1]);
            let colorScale = d3.scaleSequential(t=>d3.interpolateGreens(logScale(t)));
            if (k === 0) {
                colorScale = d3.scaleSequential(d3.interpolateGreens).domain([1, maxCnt+1]);
            }
            let poly = self.svg.select('.utgmap').select(`.heatmap-d${k}`)
                .selectAll('polygon').data(Heatmap.heatmap[k])
            poly.exit().remove();
            poly.enter().append('polygon').merge(poly)
                .attr('points', d=>self.getSVGPoints(d.vecPos))
                .attr('fill', d=>colorScale(d.cnt + 1))
                .attr('cnt', d=>d.cnt)
                .attr('cnt-color', d=>colorScale(d.cnt + 1))
                .attr('stroke', '#ccc')
                .attr('stroke-width', self.opt.gridStrokeSub)
                .attr('vector-effect', 'non-scaling-stroke')
                .attr('shape-rendering', 'crispEdges')
                .attr('stroke-linejoin', 'round');
            // update grids
            let edge = self.svg.select('.utgmap').select(`.ternary-grid-d${k}`)
                .selectAll('line').data(Heatmap.grid[k])
            edge.exit().remove();
            edge.enter().append('line').merge(edge)
                .attr('x1', d=>d[0][0])
                .attr('y1', d=>d[0][1])
                .attr('x2', d=>d[1][0])
                .attr('y2', d=>d[1][1])
                .attr('stroke', '#ccc')
                .attr('stroke-width', self.opt.gridStrokeTernary[k])
                .attr('vector-effect', 'non-scaling-stroke')
                .attr('shape-rendering', 'crispEdges')
                .attr('stroke-linejoin', 'round'); }

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
                        corr: self.data.corr[self.opt.corrMethod][vindex[pair[0]]][vindex[pair[1]]]
                    }
                }
            });
        });
        let colorScale = d3.scaleDiverging(t=>d3.interpolateRdYlBu(1-t)).domain([-1, 0, 1])
        let line = selection.selectAll('line')
            .data(Object.values(edgeSet))
        line.exit().remove();
        line.enter().append('line').merge(line)
            .attr('x1', d=>d.pos1[0])
            .attr('y1', d=>d.pos1[1])
            .attr('x2', d=>d.pos2[0])
            .attr('y2', d=>d.pos2[1])
            .attr('stroke', d=>colorScale(d.corr))
            .attr('stroke-width', self.opt.edgeStroke)
            .attr('stroke-linecap', 'round');
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
    checkLabel: function(checked) {
        var self = this;
        let label = self.svg.select('.utgmap').select('.label');
        self.labelAsCircle = checked;
        let gridRaid = self.opt.gridRaid / (self.transform.k * 1.4);
        if(checked) {
            label.selectAll('circle').transition().duration(200).attr("r", self.opt.labelRaid);
            label.selectAll('text').transition().duration(200).attr("transform", `translate(0,${self.opt.labelFontSize+gridRaid})`);
            self.svg.select('.grid-d0').selectAll('circle').transition().duration(200).attr("r", self.opt.gridRaid);
            //$('.label').show();
        } else {
            label.selectAll('circle').transition().duration(200).attr("r", 0);
            label.selectAll('text').transition().duration(200).attr("transform", `translate(0,${-gridRaid})`);
            self.svg.select('.grid-d0').selectAll('circle').transition().duration(200).attr("r", 0);
            //$('.label').hide();
        }
        self.initDrag();
    },
    updateLayout: function() {
        let faceLayout = Layout.getFaceLayout();
        let candLayout = Layout.getCandidateLayout();
        this.updateHints(candLayout)
            .updateFaces(faceLayout)
            .updateHeatmap(faceLayout)
            .updateScatterPlot(faceLayout)
            .updateEdges(faceLayout)
            .adjustZoom(); // resize to adjust current zooming when switching datasets
        return this;
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
        Heatmap.initData(data);
        let labelLayout = Layout.getLabelLayout();
        self.initLabelPos(labelLayout);
        self.initLabels(labelLayout).initZoom()
            .updateLayout();
    },
    updateCorrMethod: function(method) {
        this.opt.corrMethod = method;
        Layout.corrMethod = method;
        this.initData(this.data);
    }
};

UnTangleMap.init = function (selector, userOpt) {
    var self = this;
    //data and states
    self.data = {labels: [], items: []};
    self.labelPos = [];// svg coordinates for labels by lableIndex
    self.transform = {x:0, y:0, k:1.0};// records transformation
    self.labelAsCircle = true; // show label vertex as (circle or text)
    //config
    self.opt = {
        margin: { top: 50, left: 50, bottom: 50, right: 50 },
        width: 1000,
        height: 550,
        side: 30.0,
        gridStrokeTernary: [0.5, 0.8, 0.5, 0.3],
        gridStrokeSub: 0.3,
        gridStroke: 0.5,
        faceStroke: 0.5,
        edgeStroke: 2,
        gridRaid: 4,
        labelRaid: 3,
        labelFontSize: 8,
        itemRaid: 1.3,
        corrMethod: 'spearman'
    };
    for (var o in userOpt) {
        self.opt[o] = userOpt[o];
    }
    //hexagon algorithms
    Hex.side = self.opt.side;
    self.activeCord = HexCord(0, 0);
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