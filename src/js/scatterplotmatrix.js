(function (global, d3) {
  "use strict";

var ScatterMatrix = function(selector, userOpt) {
  return new ScatterMatrix.init(selector, userOpt);
}

ScatterMatrix.prototype = {
  initLayers: function() {
    this.svg.append('g').attr('class', 'path');
    this.svg.append('g').attr('class', 'axis');
    return this;
  },
  initScatter: function() {
    var self = this;
    this.svg.selectAll("*").remove();
    for (let i = 0; i < this.dimDisplayed.length; i++) {
      for (let j = 0; j < this.dimDisplayed.length; j++) {
        let xLabel = this.dimDisplayed[i];
        let yLabel = this.dimDisplayed[j];
        if (i === j) {
          this.svg.append('g')
            .attr("transform", `translate(${this.posScale(xLabel.name)},${this.posScale(yLabel.name)})`)
            .append('text')
            .attr("x", this.opt.scatterSize / 2)
            .attr("y", this.opt.scatterSize / 2)
            .text(xLabel.name)
            .attr("text-anchor", "middle")
            .style("font-size", "10px");
          continue;
        }
        // Add X Scale of each graph
        let xExtent = d3.extent(this.itemDisplayed, d=>+d[xLabel.index]);
        let xScale = d3.scaleLinear()
          .domain(xExtent).nice()
          .range([0, this.opt.scatterSize - 2 * this.opt.scatterMargin]);
        // Add Y Scale of each graph
        let yExtent = d3.extent(this.itemDisplayed, d=>+d[yLabel.index]);
        let yScale = d3.scaleLinear()
          .domain(yExtent).nice()
          .range([this.opt.scatterSize - 2 * this.opt.scatterMargin, 0]);
        // Add a 'g' at the right position
        //console.log(xLabel.name, yLabel.name);
        //console.log(this.posScale(xLabel.name), this.posScale(yLabel.name));
        let tmp = this.svg
          .append('g')
          .attr('class', 'scatter')
          .attr("transform", `translate(${
            this.posScale(xLabel.name) + this.opt.scatterMargin},${
            this.posScale(yLabel.name) + this.opt.scatterMargin})`);
        // Add X and Y axis in tmp
        tmp.append("g")
          .attr("transform", `translate(0,${this.opt.scatterSize - this.opt.scatterMargin * 2})`)
          .call(d3.axisBottom(xScale).ticks(2));
        tmp.append("g")
          .call(d3.axisLeft(yScale).ticks(2));
        // Add circle
        tmp.selectAll('circle')
          .data(this.itemDisplayed)
          .enter()
          .append("circle")
            .attr("cx", d=>xScale(d[xLabel.index]))
            .attr("cy", d=>yScale(d[yLabel.index]))
            .attr("r", 1)
            .attr("fill", "#08519c")
            .style("opacity", 0.5);
      }
    }
    return this;
  },
  updateScatterSelected: function() {
    var self = this;
    this.svg.selectAll('.scatter').selectAll('circle')
      .attr('fill', (_,i)=>self.itemSelected.has(i) ? "#ff007f": "#08519c")
      .each(function(_,i) {
        if(self.itemSelected.has(i)) {
          this.parentNode.appendChild(this);
        }
      });
    return this;
  },
  updateLabelSelected: function(labelsSelected) {
    this.dimDisplayed = Object.values(labelsSelected);
    if (this.dimDisplayed.length === 0) { this.svg.selectAll("*").remove(); return; }
    this.opt.scatterSize = this.opt.inWidth / this.dimDisplayed.length;
    //console.log(this.opt.scatterSize);
    this.posScale = d3.scalePoint()
      .domain(this.dimDisplayed.map(d=>d.name))
      .range([0, this.opt.inWidth - this.opt.scatterSize]);
    this.initScatter();
    return this;
  },
  updateItemSelected: function(itemSelected) {
    this.itemSelected = new Set(itemSelected);
    this.updateScatterSelected();
    return this;
  },
  initData: function(data) {
    this.data = data;
    this.dimensions = data.labels;
    this.dimDisplayed = [];//this.dimensions.map((d, i)=>{return {name: d.name, index: i};}).slice(0, 3);
    this.itemSelected = new Set();
    this.itemDisplayed = data.items.map(item=>item.normVec);
    this.updateLabelSelected(this.dimDisplayed);
  }
};

ScatterMatrix.init = function(selector, userOpt) {
  // plotting options
  this.selector = d3.select(selector);
  this.opt = {
    margin: {top: 10, right: 10, bottom: 10, left: 10},
    width: this.selector.node().getBoundingClientRect().width,
    height:  this.selector.node().getBoundingClientRect().height,
    scatterMargin : 15
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
  this.svg = this.selector.append('svg')
    .attr('width', this.opt.width)
    .attr('height', this.opt.height)
    .append('g')
    .attr("transform",`translate(${this.opt.margin.left},${this.opt.margin.top})`);
  this.initLayers();
}

ScatterMatrix.init.prototype = ScatterMatrix.prototype;
global.ScatterMatrix = ScatterMatrix;
}(window, d3));