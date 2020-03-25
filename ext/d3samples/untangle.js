(function (global, d3) {

"use strict";
var UnTangleMap = function (selector, userOpt) {
    return new UnTangleMap.init(selector, userOpt);
}

UnTangleMap.prototype = {
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
        }
        self.svg.call(zoom);
    },

    hex2x: function(hexcord) {
        return (hexcord[0] + 0.5 * hexcord[1]) * this.opt.side;
    },

    hex2y: function(hexcord) {
        return (Math.sqrt(3) * 0.5 * hexcord[1]) * this.opt.side;
    },

    plotLabels: function (labelData) {
        var vertex = this.svg.append('g').attr('class', 'label');
        var self = this;
        vertex.selectAll('.labels')
            .data(labelData)
            .enter()
            .append('circle')
            .attr('r', self.opt.labelRaid)
            .attr('cx', function (d) { return self.hex2x(d.cord); })
            .attr('cy', function (d) { return self.hex2y(d.cord); });
    },
    
};

UnTangleMap.init = function (selector, userOpt) {
    var self = this;
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
    //canvas
    self.svg = d3.select(selector).append('svg')
        .attr('width', self.opt.width)
        .attr('height', self.opt.height);

}

UnTangleMap.init.prototype = UnTangleMap.prototype;

// attach to global
global.UnTangleMap = UnTangleMap;

}(window, d3));