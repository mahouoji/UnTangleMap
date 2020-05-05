(function (global, d3) {

"use strict";

var UnTangleMap = function (selector, userOpt) {
    return new UnTangleMap.init(selector, userOpt);
}

var Hex = global.Hex(1.0);
var Layout = global.UnTangleMapLayout();
var Heatmap = global.UnTangleMapHeatmap();
var Zoom = d3.zoom().scaleExtent([1, 10]);

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
        utgmap.append('g').attr('class', 'label-selected');
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
        self.selector.append("div").attr("class", "utility")
            .style('width', `${self.opt.utilWidth}px`)
            .style('height', `${self.opt.utilHeight}px`)
            .style('left', `${self.opt.width - self.opt.utilWidth}px`)
            .style('top', `${self.opt.height - self.opt.utilHeight}px`);
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
            .attr('vector-effect', 'non-scaling-stroke')
            .style('stroke', '#ccc')
            .style('stroke-width', '1px');
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
    disableZoom: function() {
        this.svg.call(d3.zoom()
            .on("zoom", null)
            .on("end", null));
        return this;
    },
    initZoom: function () {
        var self = this;
        // zoom
        function zoomed() {
            self.transform.x = d3.event.transform.x;
            self.transform.y = d3.event.transform.y;
            self.transform.k = d3.event.transform.k;
            self.adjusTransform(0);
            //console.log(self.transform.x, self.transform.y);
        }
        function zoomEnd() {
            self.adjustZoom();
        }
        Zoom.on("zoom", zoomed)
            .on("end", zoomEnd);
        self.svg.call(Zoom);
        //self.adjustZoom(); // resize to adjust current zooming when switching datasets
        return self;
    },
    adjusTransform: function(duration) {
        var self = this;
        var w = self.opt.side;
        var h = self.opt.side * Math.sqrt(3) / 2.0;
        // grid
        self.svg.selectAll('.grid-zoom-1')
            .transition().duration(duration).attr("transform",
            `translate(0,${self.transform.y % (h * self.transform.k)})scale(${self.transform.k})`);
        self.svg.selectAll('.grid-zoom-2')
            .transition().duration(duration).attr("transform",
            `translate(${self.transform.x % (w * self.transform.k)},${self.transform.y
                % (2 * h * self.transform.k)})scale(${self.transform.k})`);
        // labels and data items
        self.svg.select('.utgmap')
            .transition().duration(duration).attr("transform",
            `translate(${self.transform.x},${self.transform.y})scale(${self.transform.k})`);
        return self;
    },
    adjustZoomLabel: function(duration) {
        var self = this;
        // label font-size
        let labelFontSize = self.transform.k < 1.5 ? 7 : self.transform.k < 4 ? 6 : self.transform.k < 8 ? 4 : 3;
        let gridRaid = self.opt.gridRaid / (self.transform.k * 1.4);
        let label = self.svg.select('.utgmap').select('.label');
        label.selectAll('text').attr('font-size', labelFontSize);
        if(self.labelAsCircle) {
            label.selectAll('circle').transition().duration(duration).attr("r", self.opt.labelRaid);
            label.selectAll('text').transition().duration(duration).attr("transform", `translate(0,${labelFontSize+gridRaid})`);
            self.svg.select('.grid-d0').selectAll('circle').transition().duration(200).attr("r", self.opt.gridRaid);
            //$('.label').show();
        } else {
            label.selectAll('circle').transition().duration(duration).attr("r", 0);
            label.selectAll('text').transition().duration(duration).attr("transform", `translate(0,${-gridRaid})`);
            self.svg.select('.grid-d0').selectAll('circle').transition().duration(duration).attr("r", 0);
            //$('.label').hide();
        }
        return self;
    },
    adjustZoomHeatmap: function() {
        if (this.heatmapDisplayLevel === 0) {
            if (this.transform.k < 1.5) {
                $('.heatmap-d1').show();
                $('.heatmap-d2').hide();
                $('.heatmap-d3').hide();
                $('.ternary-grid-d1').show();
                $('.ternary-grid-d2').hide();
                $('.ternary-grid-d3').hide();
            } else if (this.transform.k < 4) {
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
            if (this.transform.k == 1.0) {
                $('.ternary-grid-d1').hide();
            }
        } else if (this.heatmapDisplayLevel === 1) {
            $('.heatmap-d1').show();
            $('.heatmap-d2').hide();
            $('.heatmap-d3').hide();
            $('.ternary-grid-d1').show();
            $('.ternary-grid-d2').hide();
            $('.ternary-grid-d3').hide();
        } else if (this.heatmapDisplayLevel === 2) {
            $('.heatmap-d1').hide();
            $('.heatmap-d2').show();
            $('.heatmap-d3').hide();
            $('.ternary-grid-d1').show();
            $('.ternary-grid-d2').show();
            $('.ternary-grid-d3').hide();
        } else if (this.heatmapDisplayLevel === 3) {
            $('.heatmap-d1').hide();
            $('.heatmap-d2').hide();
            $('.heatmap-d3').show();
            $('.ternary-grid-d1').show();
            $('.ternary-grid-d2').show();
            $('.ternary-grid-d3').show();
        } else {
            console.log('unknown display level');
        }
        return this;
    },
    adjustZoomScatter: function() {
        var self = this;
        let constItenSize = self.transform.k < 2 ? 1.0 : (self.transform.k < 5 ? 0.8 : self.transform.k < 8 ? 0.6 : 0.4);
        self.svg.select(".scatter-plot").selectAll("circle").attr('r', Math.max(self.opt.itemRaid / self.transform.k, constItenSize));
        return self;
    },
    adjustZoom: function() {
        this.adjustZoomLabel(0)
            .adjustZoomHeatmap()
            .adjustZoomScatter();
        let strokeWidth = this.transform.k < 1.5 ? this.opt.edgeStroke :
            this.transform.k < 5 ? this.opt.edgeStroke * 0.7 : this.opt.edgeStroke * 0.4;
        this.svg.select('.edge').selectAll('line')
            .attr('stroke-width', strokeWidth);
        return this;
    },
    // set up labels and label dragging
    initLabels: function (labelData) {
        var self = this;
        let vertex = self.svg.select('.utgmap').select('.label');
        let g = vertex.selectAll('g').data(labelData);
        let labelTrans = self.labelAsCircle ? `translate(0,${self.opt.labelFontSize+self.opt.gridRaid})` : 'translate(0,0)';
        let powScale = d3.scalePow().exponent(0.2).domain([0.,1.]);
        let colorScale = d3.scaleSequential(t=>d3.interpolatePurples(powScale(t)));
        g.exit().remove();
        g.enter().append('g').merge(g)
        .each(function(d) {
            d3.select(this).selectAll("*").remove(); // clear
            //text
            d3.select(this).append('text')
            .text(d => d.name)
            .attr('font-size', self.opt.labelFontSize)
            .attr('dx', function (d) { return Hex.hexToX(d.cord); })
            .attr('dy', function (d) { return Hex.hexToY(d.cord); })
            .attr("transform", labelTrans)
            .attr('text-anchor','middle')
            .attr('label', d=>d.name);
            // circle
            d3.select(this).append('circle')
            .attr('r', self.opt.labelRaid)
            .attr('cx', function (d) { return Hex.hexToX(d.cord); })
            .attr('cy', function (d) { return Hex.hexToY(d.cord); })
            .attr('label', d=>d.name)
            .attr('fill', d=>colorScale(self.data.labelScore[self.data.labelIndex[d.name]]));
        });
        self.updateLabelInteraction();
        return self;
    },
    updateLabelInteraction() {
        var self = this;
        let label = this.svg.select('.utgmap').select('.label');
        // drag
        if (this.dragEnabled) {
            this.initDrag();
        } else {
            label.selectAll('circle')
                .call(d3.drag()
                .on("start", null)
                .on("drag", null)
                .on("end", null));
            label.selectAll('text')
                .call(d3.drag()
                .on("start", null)
                .on("drag", null)
                .on("end", null));
        }
        // mouseover
        if (this.tooltipEnabled) {
            function mouseover(d) {
                let div = self.selector.select('.tooltip');
                div.style("opacity", .9);
                div.html(self.labelHTML[self.data.labelIndex[d.name]])
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY-80) + "px");
            }
            function mouseout() {
                let div = self.selector.select('.tooltip');
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
            }
            label.selectAll('circle')
                .on("mouseover", mouseover)
                .on("mouseout", mouseout);
            label.selectAll('text')
                .on("mouseover", mouseover)
                .on("mouseout", mouseout);
        } else {
            label.selectAll('circle')
                .on("mouseover", null)
                .on("mouseout", null);
            label.selectAll('text')
                .on("mouseover", null)
                .on("mouseout", null);
        }
        // click
        if (this.labelSelectEnabled) {
            function clicked(d) {
                if (d.name in self.labelSelected) {
                    delete self.labelSelected[d.name];
                } else {
                    let x = d3.select(this.parentNode).select('circle').attr('cx'),
                        y = d3.select(this.parentNode).select('circle').attr('cy');
                    self.labelSelected[d.name] = {
                        name: d.name,
                        index: self.data.labelIndex[d.name],
                        pos: [x, y]
                    }
                }
                self.updateLabelSelected();
                self.paraCord.updateLabelSelected(Object.values(self.labelSelected));
                self.scatterMat.updateLabelSelected(Object.values(self.labelSelected));
            }
            label.selectAll('circle')
                .attr('cursor', 'pointer')
                .on("click", clicked);
            label.selectAll('text')
                .attr('cursor', 'pointer')
                .on("click", clicked);
        } else {
            label.selectAll('circle')
                .on("click", null);
            label.selectAll('text')
                .on("click", null);
        }
        // heatmap Interaction
        if (this.itemSelectEnabled){
            function mouseenter(d) {
                let items = Heatmap.getItemsIn(d.faceKey, d.offset, d.depth);
                //console.log(items);
                self.paraCord.updateItemSelected(items);
                self.scatterMat.updateItemSelected(items);
                d3.select(this)
                    .attr('stroke', "#ff007f")
                    .attr('stroke-width', self.opt.gridStrokeSub * 3);
                d3.select(this).raise();
            }
            function mouseout() {
                d3.select(this)
                    .attr('stroke', '#eee')
                    .attr('stroke-width', self.opt.gridStrokeSub);
            }
            this.svg.select('.heatmap').selectAll('polygon')
                .on("mouseenter", mouseenter)
                .on("mouseout", mouseout);
        } else {
            this.svg.select('.heatmap').selectAll('polygon')
                .on("mouseenter", null)
                .on("mouseout", null);
        }
        // cursor
        if (!this.dragEnabled && !this.labelSelectEnabled) {
            label.selectAll('circle').attr('cursor', 'default');
            label.selectAll('text').attr('cursor', 'default');
        }
        return this;
    },
    initDrag: function() {
        var self = this;
        let dragBy = self.labelAsCircle ? 'circle' : 'text',
            notDragBy = self.labelAsCircle ? 'text' : 'circle';
        let label = self.svg.select('.utgmap').select('.label');
        // disable drag
        label.selectAll(notDragBy)
            .attr('cursor', 'default')
            .call(d3.drag()
            .on("start", null)
            .on("drag", null)
            .on("end", null));
        // enable drag
        let vertex = label.selectAll(dragBy)
            .attr('cursor', 'grab')
            .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
        // drag
        function dragstarted() {
            // drag
            d3.select(this.parentNode).raise();
            vertex.attr("cursor", "grabbing");
            // store
            let kx = self.labelAsCircle ? 'cx' : 'dx',
                ky = self.labelAsCircle ? 'cy' : 'dy';
            let x = d3.select(this).attr(kx);
            let y = d3.select(this).attr(ky);
            self.activeCord = Hex.svgToRoundHex([x,y]);
            self.activeName = d3.select(this).attr('label');
            // update layout
            let removed = Layout.removeLabel(self.activeCord);
            self.updateLayout([], removed);
            // get hints
            let hintData = Layout.getTopUtilities([self.activeName]);
            //console.log(hintData);
            self.updateHints(hintData);
            self.svg.select('.hint').style('opacity', 0.5);
            self.svg.select('.label-selected')
                .transition().duration(200).style('opacity', 0);
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
            let added = Layout.addLabel(name, hcord);
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
            self.updateLayout(added, []);
            // hide hints
            self.svg.select('.hint').transition().duration(100).style('opacity', 0);
            self.updateUtility();
            // update selected
            if (name in self.labelSelected) {
                self.labelSelected[name].pos = [x, y];
            }
            self.updateLabelSelected();
            self.svg.select('.label-selected').style('opacity', 1);
        }
        return self;
    },
    // update ternary plots (heatmap & grid, scatter plot)
    updateHeatmap: function () {
        var self = this;
        let heatmapData = Heatmap.getHeatmapData();
        let gridData = Heatmap.getGridData();
        for (let k = 0; k < 4; k++) {
            let maxCnt = d3.max(heatmapData[k].map(d=>d.cnt));
            let logScale = d3.scaleLog().domain([1, maxCnt+1]);
            let colorScale = d3.scaleSequential(t=>d3.interpolateGreens(logScale(t)));
            if (k <= 1) {
                colorScale = d3.scaleSequential(d3.interpolateGreens).domain([1, maxCnt+1]);
            }
            let poly = self.svg.select('.utgmap').select(`.heatmap-d${k}`)
                .selectAll('polygon').data(heatmapData[k])//, d=>`${d.vecPos[0][0]} ${d.vecPos[0][1]},${d.vecPos[1][0]} ${d.vecPos[1][1]},${d.vecPos[2][0]} ${d.vecPos[2][1]}`)
            poly.exit().remove();
            poly.enter().append('polygon').merge(poly)
                .attr('points', d=>`${d.vecPos[0][0]} ${d.vecPos[0][1]},${d.vecPos[1][0]} ${d.vecPos[1][1]},${d.vecPos[2][0]} ${d.vecPos[2][1]}`)
                .attr('fill', d=>colorScale(d.cnt + 1))
                .attr('cnt', d=>d.cnt)
                .attr('cnt-color', d=>colorScale(d.cnt + 1))
                .attr('stroke', '#eee')
                .attr('stroke-width', self.opt.gridStrokeSub)
                .attr('vector-effect', 'non-scaling-stroke')
                .attr('shape-rendering', 'crispEdges')
                .attr('stroke-linejoin', 'round')
                .attr('class', d=>`${d.faceKey}-${d.offset}-${d.depth}`);
            // update grids
            let edge = self.svg.select('.utgmap').select(`.ternary-grid-d${k}`)
                .selectAll('line').data(gridData[k])//, d=>`${d[0][0]}_${d[0][1]}_${d[1][0]}_${d[1][1]}`)
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
                .attr('stroke-linejoin', 'round');
        }
        return self;
    },
    updateScatterPlot: function () {
        var self = this;
        if (!self.renderScatterPlot || !self.scatterPlotDataChanged) { return self; } // lazy updating
        console.log('updating scatter map');
        let data = Heatmap.getScatterData();
        let scatter = self.svg.select('.utgmap').select('.scatter-plot');
        let circle = scatter.selectAll('circle')
            .data(data);
        circle.exit().remove();
        circle.enter().append('circle').merge(circle)
            .attr('cx', d=>d.pos[0])
            .attr('cy', d=>d.pos[1])
            .attr('class', d=>`item-${d.itemIndex}`)
            .attr('r', self.opt.itemRaid);
        self.scatterPlotDataChanged = false; // up-to-date
        return self;
    },
    clearScatterPlot: function () {
        this.svg.select('.utgmap').select('.scatter-plot').selectAll('circle').remove();
        this.scatterPlotDataChanged = true;
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
                        corr: self.data.corr[self.corrDisplayMethod][vindex[pair[0]]][vindex[pair[1]]]
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
        let colorScale = d3.scaleSequential(t=>d3.interpolateBlues(t*t))
            .domain(d3.extent(hintData.map(d=>d.util.utility)));
        hints.exit().remove();
        hints.enter().append('circle').merge(hints)
            .attr('r', self.opt.gridRaid)
            .attr('cx', d=>Hex.hexToX(d.cord))
            .attr('cy', d=>Hex.hexToY(d.cord))
            .attr('fill', d=>colorScale(d.util.utility));
        return self;
    },
    updateUtility: function() {
        this.selector.select('.utility')
            .html(`Utility: ${Layout.utility.utility.toFixed(4)} \
            | Edge: ${Layout.utility.edgeCorr.toFixed(2)} / ${Layout.utility.edgeCnt} \
            | Face: ${Layout.utility.triCorr.toFixed(2)} /  ${Layout.utility.triCnt}`);
        return this;
    },
    updateLabelSelected: function() {
        var self = this;
        let data = Object.values(this.labelSelected);
        let selected = this.svg.select('.utgmap').select('.label-selected')
            .selectAll('circle').data(data, d=>d.name);
        let colorScale = d3.scaleSequential(t=>d3.interpolateCool(t));
        selected.exit().remove();
        selected.enter().append('circle').merge(selected)
            .attr('r', self.opt.gridRaid * 0.3)
            .attr('cx', d=>d.pos[0])
            .attr('cy', d=>d.pos[1])
            //.attr('vector-effect', 'non-scaling-stroke')
            .style('stroke', (_,i)=>colorScale((i+1)/data.length))
            .style('stroke-width', self.opt.gridStroke * 3)
            .style('fill-opacity', 0)
            .style('opacity', 0.8);
    },
    // binding data and plotting
    updateLayout: function(facesAdded, facesRemoved) {
        let faceLayout = Layout.getFaceLayout();
        facesAdded = facesAdded || [];
        facesRemoved = facesRemoved || [];
        if (facesAdded.length > 0 || facesRemoved.length > 0) {
            this.scatterPlotDataChanged = true;
        }
        Heatmap.update(facesAdded, facesRemoved);
        this.updateHeatmap().updateScatterPlot();
        this.updateFaces(faceLayout)
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
        return this;
    },
    initLabelSelectedPos: function() {
        for (const key in this.labelSelected) {
            this.labelSelected[key].pos = this.labelPos[this.labelSelected[key].index];
        }
        return this;
    },
    initLabelHTML: function() {
        var self = this;
        self.labelHTML = [];
        self.data.labels.forEach(label => {
            let text = `<h3>${label.name}</h3>`;
            for (const key in label) {
                if (key === 'name') { continue; }
                text += `<div><b>${key}</b>: `;
                if (Array.isArray(label[key])) {
                    text += `<ul>`;
                    label[key].forEach(v=>{
                        text += `<li>${v}</li>`;
                    });
                    text += `</ul></div>`;
                } else {
                    text += `${label[key]}</div>`;
                }
            }
            self.labelHTML.push(text);
        });
        //console.log(self.labelHTML);
        return this;
    },
    updateCenter: function() {
        let xs = d3.extent(this.labelPos.map(d=>d[0]));
        let ys = d3.extent(this.labelPos.map(d=>d[1]));
        let centerPos = [0.5 * (xs[0] + xs[1]), 0.5 * (ys[0] + ys[1])];
        this.transform.x = this.opt.width / 2.0 - centerPos[0] * this.transform.k;
        this.transform.y =  this.opt.height / 2.0 - centerPos[1] * this.transform.k;
        this.svg.transition()
            .duration(750)
            .call(Zoom.transform, d3.zoomIdentity
                .translate(this.transform.x,this.transform.y).scale(this.transform.k) );
        //this.adjusTransform(500);
        return this;
    },
    // controller
    updateCorrMethod: function(method) {
        if (this.corrMethod === method) { return; }
        this.corrMethod = method;
        Layout.corrMethod = method;
        this.initData(this.data);
    },
    updateObjective: function(objective) {
        if (this.objective === objective) { return; }
        this.objective = objective;
        Layout.objective = objective;
        this.initData(this.data);
    },
    updateAlpha: function(alpha) {
        alpha = parseFloat(alpha);
        if (this.alpha === alpha) { return; }
        this.alpha = alpha;
        Layout.alpha = alpha;
        this.initData(this.data);
    },
    // updates on hide and show layers
    checkLabel: function(checked) {
        this.labelAsCircle = checked;
        this.adjustZoomLabel(200).updateLabelInteraction();
    },
    checkScatter: function(checked) {
        this.renderScatterPlot = checked;
        if (checked) { this.updateScatterPlot().adjustZoomScatter(); }
        else { this.clearScatterPlot(); }
    },
    // view options
    setCorrDisplayMethod: function(method) {
        if (this.corrDisplayMethod === method) { return; }
        this.corrDisplayMethod = method;
        this.updateEdges(Layout.getFaceLayout());
    },
    setHeatmapDisplayLevel: function(level) {
        level = parseInt(level);
        if (this.heatmapDisplayLevel === level) { return; }
        this.heatmapDisplayLevel = level;
        this.adjustZoomHeatmap();
    },
    // tools
    setInteractionMode: function(mode) {
        if (this.interactionMode === mode) { return; }
        // disable
        if (this.interactionMode === 'zoom') {
            //this.disableZoom();
        } else if (this.interactionMode === 'drag') {
            this.dragEnabled = false;
        } else if (this.interactionMode === 'info') {
            this.tooltipEnabled = false;
        } else if (this.interactionMode === 'label') {
            this.labelSelectEnabled = false;
        } else if (this.interactionMode === 'item') {
            this.itemSelectEnabled = false;
        }
        // enable
        this.interactionMode = mode;
        if (mode === 'zoom') {
            //this.initZoom();
            this.labelSelected = {};
            this.updateLabelSelected();
            this.paraCord.updateLabelSelected([]);
            this.scatterMat.updateLabelSelected([]);
        } else if (mode === 'drag') {
            this.dragEnabled = true;
        } else if (mode === 'info') {
            this.tooltipEnabled = true;
        } else if (mode === 'label') {
            this.labelSelectEnabled = true;
        } else if (mode === 'item') {
            this.itemSelectEnabled = true;
        }
        this.updateLabelInteraction();
    },
    initData: function(data, dataUpdated) {
        this.data = data;
        // init label layout
        let center = Hex.svgToRoundHex([this.opt.width / 2.0, this.opt.height / 2.0]);
        Layout.initLabelLayout(data, center);
        let labelLayout = Layout.getLabelLayout();
        let faceLayout = Layout.getFaceLayout();
        // store label pos
        this.initLabelPos(labelLayout).initLabelHTML();
        if (dataUpdated) {
            this.labelSelected = {};
        } else {
            this.initLabelSelectedPos();
        }
        this.updateLabelSelected();
        // init heatmap and ternary-grid
        this.scatterPlotDataChanged = true;
        Heatmap.initData(data).initPosLayout(this.labelPos, faceLayout);
        // draw
        this.initLabels(labelLayout).initZoom()
            .updateLayout()
            .updateCenter()
            .updateUtility();
    }
};

UnTangleMap.init = function (selector, userOpt) {
    var self = this;
    //data and states
    self.data = {labels: [], items: []};
    self.labelPos = [];// svg coordinates for labels by lableIndex
    self.labelHTML = []; // HTML formatted label info for tooltip by labelIndex
    self.labelSelected = {};
    self.transform = {x:0, y:0, k:1.0};// records transformation
    self.paraCord = null;
    self.scatterMat= null;
    // check boxes
    self.labelAsCircle = true; // show label vertex as (circle or text)
    self.scatterPlotDataChanged = false; // scatter plot data updated but not binded
    self.renderScatterPlot = false; // need to render scatter plot
    self.corrMethod = 'spearman';
    self.corrDisplayMethod = 'spearman';
    self.objective = 'average';
    self.alpha = 1.0;
    self.heatmapDisplayLevel = 0; // 0(auto), 1, 2, 3
    self.interactionMode = 'drag'; // zoom, drag, info, label, scatter
    self.dragEnabled = true;
    self.tooltipEnabled = false;
    self.labelSelectEnabled = false;
    self.itemSelectEnabled = false;
    // editing
    self.activeCord = HexCord(0, 0);
    self.activeName = '';
    // config
    self.opt = {
        margin: { top: 0, left: 0, bottom: 0, right: 0 },
        width: 800,
        height: 600,
        utilWidth: 400,
        utilHeight: 30,
        side: 30.0,
        gridStrokeTernary: [0.5, 0.8, 0.5, 0.3],
        gridStrokeSub: 0.2,
        gridStroke: 0.5,
        faceStroke: 0.5,
        edgeStroke: 2,
        gridRaid: 4,
        labelRaid: 3.5,
        labelFontSize: 7,
        itemRaid: 1.3
    };
    for (var o in userOpt) {
        self.opt[o] = userOpt[o];
    }
    //hexagon algorithms
    Hex.side = self.opt.side;
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