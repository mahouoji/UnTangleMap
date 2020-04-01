function main(){

    var controller = Controller();
    controller.loadStaticData();
    
    console.log(controller.data);

    var plot_opts = {
        margin: {top:70,left:150,bottom:150,right:150},
    }
    var utm = UnTangleMap("#untangle-container", plot_opts);
    
    var labels = [
    {'cord': [0, 0], 'label': 'A'},
    {'cord': [0, 1], 'label': 'B'},
    {'cord': [1, 0], 'label': 'C'},
    {'cord': [1, 1], 'label': 'D'},
    ];
    utm.plotLabels(labels);
}