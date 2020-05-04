(function (global, d3) {
  "use strict";

var ParallelCoords = function(selector, userOpt) {
  return new ParallelCoords.init(selector, userOpt);
}

ParallelCoords.prototype = {
  initLayers: function() {
    this.svg.append('g').attr('class', 'path');
    this.svg.append('g').attr('class', 'axis');
    return this;
  },
  initAxis: function() {
    var self = this;
    // console.log(this.dimDisplayed);
    this.svg.select('.axis').selectAll("*").remove();
    this.svg.select('.axis').selectAll("g")
      .data(self.dimDisplayed).enter()
      .append("g")
      .attr("transform", function(d) { return "translate(" + self.xScale(d.name) + ",0)"; })
      // And I build the axis with the call function
      .each(function(d) { d3.select(this).selectAll("*").remove(); d3.select(this).call(d3.axisLeft().scale(self.yScale)); })
      // Add axis title
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(d=>d.name)
      .style("fill", "black")
      .style("font-size", "8px");
    return this;
  },
  initPath: function() {
    var self = this;
    function path(d) {
      return d3.line()(self.dimDisplayed.map(p => {return [self.xScale(p.name), self.yScale(d[p.index])]; }));
    }
    //console.log(this.itemDisplayed);
    let g = this.svg.select('.path').selectAll("path").data(this.itemDisplayed);
    g.exit().remove();
    g.enter().append("path").merge(g)
      .attr("d",  path)
      .style("fill", "none")
      .style("stroke", "#08519c")
      .style("opacity", 0.3);
    return this;

  },
  updateLabelSelected: function(labelsSelected) {
    this.dimDisplayed = labelsSelected;
    this.xScale = d3.scalePoint()
      .range([0, this.opt.inWidth])
      .padding(1)
      .domain(this.dimDisplayed.map(d=>d.name));
    this.initAxis().initPath();
    return this;
  },
  initData: function(data) {
    this.data = data;
    this.dimensions = data.labels;
    this.dimDisplayed = [];
    this.itemDisplayed = data.items.map(item=>item.normVec);
    this.xScale = d3.scalePoint()
      .range([0, this.opt.inWidth])
      .padding(1)
      .domain(this.dimDisplayed.map(d=>d.name));
    this.initAxis().initPath();
  }
};

ParallelCoords.init = function(selector, userOpt) {
  // plotting options
  this.opt = {
    margin: {top: 30, right: 10, bottom: 20, left: 0},
    width: 400,
    height: 200
  }
  for (var o in userOpt) {
    this.opt[o] = userOpt[o];
  }
  this.opt.inWidth = this.opt.width - this.opt.margin.right - this.opt.margin.left;
  this.opt.inHeight = this.opt.height - this.opt.margin.top - this.opt.margin.bottom;
  // data
  this.data = {};
  this.dimensions = [];
  this.yScale = d3.scaleLinear().domain([0., 1.]).range([this.opt.inHeight, 0]);

  // init canvas
  this.selector = d3.select(selector);
  this.svg = this.selector.append('svg')
    .attr('width', this.opt.width)
    .attr('height', this.opt.height)
    .append('g')
    .attr("transform",`translate(${this.opt.margin.left},${this.opt.margin.top})`);
  this.initLayers();
}

ParallelCoords.init.prototype = ParallelCoords.prototype;
global.ParallelCoords = ParallelCoords;
}(window, d3));