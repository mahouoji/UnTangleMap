// hexagon algorithms
(function(global){
    "use strict";
    
    var HexCord = function(side) {
        return new HexCord.init(side);
    };
    
    HexCord.init = function(side) {
        var self = this;
        self.side = side;
    };

    HexCord.prototype = {
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
    };

    HexCord.init.prototype = HexCord.prototype;

    global.HexCord = global.Hex = HexCord;
}(window));