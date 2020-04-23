function main(){
    var controller = Controller();
    controller.loadStaticData();

    $(document).ready(function() {
        $('#untangleDataSelect').change(function() {
            let dataPath = {
                'imdb_mg': "data/imdb_mg.json",
                'imdb_yg': "data/imdb.json",
                'dblp_ac': "data/dblp.json",

            }
            //console.log($('#untangleDataSelect').val());
            controller.loadStaticData(dataPath[$('#untangleDataSelect').val()]);
        });
        $('#untangleCorrSelect').change(function() {
            console.log("hi!");
        });
        $('#checkboxLabel').change(function(){
            if(this.checked) {
                $('.label').show();
            } else {
                $('.label').hide();
            }
        })
        $('#checkboxScatter').change(function(){
            if(this.checked) {
                $('.scatter-plot').show();
            } else {
                $('.scatter-plot').hide();
            }
        })
        $('#checkboxCorr').change(function(){
            if(this.checked) {
                $('.edge').show();
            } else {
                $('.edge').hide();
            }
        })
        $('#checkboxHeatmap').change(function(){
            if(this.checked) {
                $('.heatmap').show();
            } else {
                $('.heatmap').hide();
            }
        })
    })
}