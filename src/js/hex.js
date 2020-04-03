// hexagon algorithms
(function(global){
    "use strict";

    var Hex = function(side) {
        return new Hex.init(side);
    }
    Hex.init = function(side) {
        this.side = side;
    };
    
    var HexCord = function(q, r, s) {
        return new HexCord.init(q, r, s);
    };
    HexCord.init = function(q, r, s) {
        this.q = q;
        this.r = r;
        this.s = s || ((s === 0) ? 0 : 0-q-r);
    };

    var neighborOffsets = [
        HexCord(1, 0), HexCord(0, 1), HexCord(-1, 1),
        HexCord(-1, 0), HexCord(0, -1), HexCord(1, -1)
    ];

    var triangleOffests = [
        HexCord(0, 0, -1), HexCord(0, 1, 0), HexCord(-1, 0, 0),
        HexCord(0, 0, 1), HexCord(0, -1, 0), HexCord(1, 0, 0)
    ];

    HexCord.prototype = {
        toString: function(hexcord) {
            return `${this.q}_${this.r}_${this.s}`;
        },
        // round to nearest hexagon
        round: function() {
            var qRound = Math.round(this.q);
            var rRound = Math.round(this.r);
            var sRound = Math.round(this.s);

            var qDiff = Math.abs(this.q - qRound);
            var rDiff = Math.abs(this.r - rRound);
            var sDiff = Math.abs(this.s - sRound);

            if (qDiff > rDiff && qDiff > sDiff) {
                qRound = -rRound - sRound;
            } else if (rDiff > sDiff) {
                rRound = -qRound - sRound;
            }
            return HexCord(qRound, rRound);
        },
        add: function(other) {
            return HexCord(this.q + other.q, this.r + other.r, this.s + other.s);
        },
        getNeighbors: function() {
            return neighborOffsets.map(o => this.add(o));
        },
        getTriangles: function() {
            return triangleOffests.map(o => this.add(o));
        }
    };

    Hex.prototype = {
        // hex coordinates[q, r] to svg coordinates[x, y]
        hexToX: function(hexcord) {
            return (hexcord.q + 0.5 * hexcord.r) * this.side;
        },
        hexToY: function(hexcord) {
            return (Math.sqrt(3) * 0.5 * hexcord.r) * this.side;
        },
        hexToSvg: function(hexcord) {
            return [this.hexToX(hexcord), ths.hexToY(hexcord)];
        },
        // svg coordinates[x, y] to hex coordinates[q, r]
        svgToQ: function(pcord) {
            return (pcord[0] - pcord[1] / Math.sqrt(3)) / this.side;
        },
        svgToR: function(pcord) {
            return (2.0 * pcord[1] / Math.sqrt(3)) / this.side;
        },
        svgToHex: function(pcord) {
            return HexCord(this.svgToQ(pcord), this.svgToR(pcord));
        },
        // round point in svg coordinate[x, y] to nearest hexagon
        svgToRoundHex: function(pcord) {
            //TODO: more efficient implementation
            return this.svgToHex(pcord).round();
        },
    };

    HexCord.init.prototype = HexCord.prototype;
    Hex.init.prototype = Hex.prototype;
    global.HexCord = HexCord;
    global.Hex = Hex;
}(window));