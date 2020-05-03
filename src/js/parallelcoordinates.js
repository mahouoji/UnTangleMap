(function (global, d3) {
  "use strict";

var ParallelCoords = function(selector, userOpt) {
  return new ParallelCoords.init(selector, userOpt);
}

ParallelCoords.prototype = {
  initAxis: function() {
    var self = this;
    let xScale = d3.scalePoint()
    .range([0, this.opt.inWidth])
    .padding(1)
    .domain(this.dimDisplayed);
    self.svg.selectAll("g")
      .data(self.dimDisplayed).enter()
      .append("g")
      .attr("transform", function(d) { return "translate(" + xScale(d) + ",0)"; })
      // And I build the axis with the call function
      .each(function(d) { d3.select(this).call(d3.axisLeft().scale(self.yScale)); })
      // Add axis title
      .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; })
        .style("fill", "black")
        .style("font-size", "10");
    return this;
  },
  initData: function(data) {
    this.data = data;
    this.dimensions = data.labels;
    this.dimDisplayed = this.dimensions.map(d=>d.name).slice(0,6);
    this.initAxis();
  }
};

ParallelCoords.init = function(selector, userOpt) {
  // plotting options
  this.opt = {
    margin: {top: 30, right: 10, bottom: 20, left: 0},
    width: 400,
    height: 300
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
}

ParallelCoords.init.prototype = ParallelCoords.prototype;
global.ParallelCoords = ParallelCoords;
}(window, d3));
/*
// Parse the Data
d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv", function(data) {

  // Extract the list of dimensions we want to keep in the plot. Here I keep all except the column called Species
  dimensions = d3.keys(data[0]).filter(function(d) { return d != "Species" })

  // For each dimension, I build a linear scale. I store all in a y object
  var y = {}
  for (i in dimensions) {
    name = dimensions[i]
    y[name] = d3.scaleLinear()
      .domain( d3.extent(data, function(d) { return +d[name]; }) )
      .range([height, 0])
  }

  // Build the X scale -> it find the best position for each Y axis
  x = d3.scalePoint()
    .range([0, width])
    .padding(1)
    .domain(dimensions);

  // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
      return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
  }

  // Draw the lines
  svg
    .selectAll("myPath")
    .data(data)
    .enter().append("path")
    .attr("d",  path)
    .style("fill", "none")
    .style("stroke", "#69b3a2")
    .style("opacity", 0.5)

  // Draw the axis:
  svg.selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
    .data(dimensions).enter()
    .append("g")
    // I translate this element to its right position on the x axis
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
    // And I build the axis with the call function
    .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
    // Add axis title
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d; })
      .style("fill", "black")
}

})*/