(function (global, d3) {
"use strict";

var Controller = function() {
    return new Controller.init();
}

Controller.prototype = {
    loadStaticData: function (path) {
        var self = this;
        path = path || "data/imdb_year_genre.json";
        d3.json(path).then(function(data) {
            self.updateData(data);
            //console.log(self.data);
        });
    },

    preprocessData: function (data) {
        //TODO: check validity

        // hashmap for label to index in label list
        data.labelIndex = data.labels.reduce((map, label, index)=>{
            map[label.name] = index;
            return map;
        }, {});
        // label score
        let itemSum = data.items.map(item=>item.vec.reduce((total,n)=>total+n, 0));
        data.labelScore = data.items.reduce((total, item, index)=>{
            //console.log(total.map((x,i)=>x + item.vec[i] / itemSum[index]));
            if (itemSum[index] === 0) { return total; }
            return total.map((x,i)=>x + item.vec[i] / itemSum[index]);
        }, Array(data.labels.length).fill(0));
        data.labelScore = data.labelScore.map(x=>x/data.items.length);
        //console.log(data.labelScore);
        // data.labelScore = data.items.reduce((total, item)=>{
        //     return total.map((x,i)=>x + item.vec[i]);
        // }, Array(data.labels.length).fill(0));
        // let total = data.labelScore.reduce((total,n)=>total+n);
        // console.log(total);
        // data.labelScore = data.labelScore.map(x=>x/total);
        // console.log(data.labelScore);
        return data;
    },

    updateData: function(data) {
        var self = this;
        self.data = self.preprocessData(data);
        //console.log(self.data);
        // UnTangle Map
        self.unTangleMap.initData(self.data);
    },
    updateCorrMethod: function(method) {
        var self = this;
        console.log(self.data);
        if (!(method in self.data.corr)) {
            console.log('Correlation method ' + method +' not implemented');
            return;
        }
        self.corrMethod = method;
        self.unTangleMap.updateCorrMethod(method);
    },
    checkLabel: function(checked) {
        this.unTangleMap.checkLabel(checked);
    }
};

Controller.init = function() {
    var self = this;
    self.data = {};
    self.corrMethod = "spearman";

    var plot_opts = {
        margin: {top:70,left:150,bottom:150,right:150},
    }
    self.unTangleMap = UnTangleMap("#untangle-container", plot_opts);
}

Controller.init.prototype = Controller.prototype;
global.Controller = Controller;

}(window, d3));