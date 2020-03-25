(function (global, d3) {

"use strict";
var UnTangleMap = function (selector, userOpt) {
    return new UnTangleMap.init(selector, userOpt);
}

UnTangleMap.prototype = {
    plotGrid: function () {
        //axis
        var grid = this.svg.append('g').attr('class', 'axes');
        var axes_q = grid.append('g').attr('class', 'axes');
        var axes_s = grid.append('g').attr('class', 'axes');
        var axes_r = grid.append('g').attr('class', 'axes');

        //step
        var w = this.opt.side;
        var h = this.opt.side * Math.sqrt(3) / 2.0;
        var width = this.opt.width;
        var height = this.opt.height;
        // horizontal
        axes_q.selectAll('.gird-q')
            .data(d3.range(0, height / h + 1))
            .enter()
            .append('line')
            .attr('class', 'grid-q')
            .attr('x1', 0)
            .attr('y1', function (d) { return d * h; })
            .attr('x2', width)
            .attr('y2', function (d) { return d * h; });
        // left
        axes_s.selectAll('.gird-s')
            .data(d3.range(0, width * 2 / w))
            .enter()
            .append('line')
            .attr('class', 'grid-s')
            .attr('x1', function (d) { return (d + 1) * w; })
            .attr('y1', -2 * h)
            .attr('x2', function (d) { return d * w - (height + 2 * h) / Math.sqrt(3); })
            .attr('y2', height + 2 * h);
        // right
        axes_r.selectAll('.gird-r')
            .data(d3.range(-width * 2 / w, width * 2 / w))
            .enter()
            .append('line')
            .attr('class', 'grid-r')
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
            .attr('r', this.opt.graid)
            .attr('cx', function (d) { return d[0] * w - (d[1] % 2 ? w / 2 : 0); })
            .attr('cy', function (d) { return d[1] * h; });


        // zoom
        var zoom = d3.zoom().scaleExtent([1, 10])
            .on("zoom", zoomed);

        function zoomed() {
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
            //circleG.attr("transform", d3.event.transform);
        }
        this.svg.call(zoom);
    },

    plotVertex: function (vertexData) {
        var vertex = this.svg.append('g').attr('class', 'label');
        vertex.selectAll('.labels')
            .data(d3.range(0, 1))
            .enter()
            .append('circle')
            .attr('r', 4)
            .attr('cx', function (d) { return 0; })
            .attr('cy', function (d) { return 0; });
    },
    
};

UnTangleMap.init = function (selector, userOpt) {
    var self = this;
    //config
    self.opt = {
        width: 900,
        height: 600,
        side: 40,
        graid: 5,
        margin: { top: 50, left: 50, bottom: 50, right: 50 }
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