// hexagon algorithms
(function(global){
    "use strict";
    
    var HexCord = function(side) {
        return new HexCord.init(side);
    };

    var neighborOffset = [
        [1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]
    ];
    
    HexCord.init = function(side) {
        var self = this;
        self.side = side;
    };

    HexCord.prototype = {
        toString: function(hexcord) {
            return hexcord[0] + '_' + hexcord[1];
        },
        // hex coordinates[q, r] to svg coordinates[x, y]
        hex2x: function(hexcord) {
            return (hexcord[0] + 0.5 * hexcord[1]) * this.side;
        },
        hex2y: function(hexcord) {
            return (Math.sqrt(3) * 0.5 * hexcord[1]) * this.side;
        },
        // svg coordinates[x, y] to hex coordinates[q, r]
        point2q: function(pcord) {
            return (pcord[0] - pcord[1] / Math.sqrt(3)) / this.side;
        },
        point2r: function(pcord) {
            return (2.0 * pcord[1] / Math.sqrt(3)) / this.side;
        },
        // round point in svg coordinate[x, y] to nearest hexagon
        round2hex: function(pcord) {
            //TODO: more efficient implementation
            var q = this.point2q(pcord);
            var r = this.point2r(pcord);
            var s = - q - r;
    
            var qRound = Math.round(q);
            var rRound = Math.round(r);
            var sRound = Math.round(s);
    
            var qDiff = Math.abs(q - qRound);
            var rDiff = Math.abs(r - rRound);
            var sDiff = Math.abs(s - sRound);
    
            if (qDiff > rDiff && qDiff > sDiff) {
                qRound = -rRound - sRound;
            } else if (rDiff > sDiff) {
                rRound = -qRound - sRound;
            }
            return [qRound, rRound];
        },
        addHex: function(corda, cordb) {
            return [corda[0] + cordb[0], corda[1] + cordb[1]];
        },
        getNeighbors: function(hexcord) {
            return neighborOffset.map(o => this.addHex(hexcord, o));
        }
    };

    HexCord.init.prototype = HexCord.prototype;

    global.Hex = HexCord;
}(window));