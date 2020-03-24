(function (global, d3) {

    var UnTangleMap = function () {
        return new UnTangleMap.init();
    }

    var originOffset = [0, 0];

    UnTangleMap.prototype = {
        drawGrids: function (selector, userOpt) {
            // configure
            var opt = {
                width: 900,
                height: 600,
                side: 40,
                graid: 5,
                margin: { top: 50, left: 50, bottom: 50, right: 50 }
            };
            for (var o in userOpt) {
                opt[o] = userOpt[o];
            }

            //canvas
            var svg = d3.select(selector).append('svg')
                .attr('width', opt.width)
                .attr('height', opt.height);

            //step
            var w = opt.side;
            var h = Math.sqrt(opt.side * opt.side - (opt.side / 2) * (opt.side / 2));

            //axis
            var grid = svg.append('g').attr('class', 'axes');
            var axes_h = grid.append('g').attr('class', 'axes');
            var axes_l = grid.append('g').attr('class', 'axes');
            var axes_r = grid.append('g').attr('class', 'axes');
            // horizontal
            axes_h.selectAll('.gird-h')
                .data(d3.range(0, opt.height / h + 1))
                .enter()
                .append('line')
                .attr('class', 'grid-h')
                .attr('x1', 0)
                .attr('y1', function (d) { return d * h; })
                .attr('x2', opt.width)
                .attr('y2', function (d) { return d * h; });
            // left
            axes_l.selectAll('.gird-l')
                .data(d3.range(0, opt.width * 2 / w))
                .enter()
                .append('line')
                .attr('class', 'grid-l')
                .attr('x1', function (d) { return (d + 1) * w; })
                .attr('y1', -2 * h)
                .attr('x2', function (d) { return d * w - (opt.height + 2 * h) / Math.sqrt(3); })
                .attr('y2', opt.height + 2 * h);
            // right
            axes_r.selectAll('.gird-r')
                .data(d3.range(-opt.width * 2 / w, opt.width * 2 / w))
                .enter()
                .append('line')
                .attr('class', 'grid-r')
                .attr('x1', function (d) { return (d - 1) * w; })
                .attr('y1', -2 * h)
                .attr('x2', function (d) { return d * w + (opt.height + 2 * h) / Math.sqrt(3); })
                .attr('y2', opt.height + 2 * h);
            // vertex
            var vertex = grid.append('g').attr('class', 'grid-vertex');
            vertex.selectAll('.grid-vertex')
                .data(d3.cross(d3.range(-1, opt.width / w + 1), d3.range(-1, opt.height / h + 1)))
                .enter()
                .append('circle')
                .attr('r', opt.graid)
                .attr('cx', function (d) { return d[0] * w - (d[1] % 2 ? w / 2 : 0); })
                .attr('cy', function (d) { return d[1] * h; });


            // zoom
            var zoom = d3.zoom().scaleExtent([1, 10])
                .on("zoom", zoomed);

            function zoomed() {
                axes_h.attr("transform",
                    "translate(0,"
                    + d3.event.transform.y % (h * d3.event.transform.k)
                    + ")scale(" + d3.event.transform.k + ")");
                axes_l.attr("transform",
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
            svg.call(zoom);
        },
    };


    UnTangleMap.init = function () {

    }

    UnTangleMap.init.prototype = UnTangleMap.prototype;

    // attach to global
    global.UnTangleMap = UnTangleMap;

}(window, d3));