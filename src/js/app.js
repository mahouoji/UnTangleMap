function main(){
    var controller = Controller();
    controller.loadStaticData();

    $(document).ready(function() {
        $('#untangleDataSelect').change(function() {
            let dataPath = {
                'imdb_mg': "data/imdb_movie_genre.json",
                'imdb_yg': "data/imdb_year_genre.json",
                'dblp_ac': "data/dblp_author_conf.json",

            }
            //console.log($('#untangleDataSelect').val());
            controller.loadStaticData(dataPath[$('#untangleDataSelect').val()]);
        });
        $('#untangleCorrSelect').change(function() {
            controller.updateCorrMethod($('#untangleCorrSelect').val());
        });
        $('#checkboxLabel').change(function(){
            controller.checkLabel(this.checked);
        })
        $('#checkboxCorr').change(function(){
            if(this.checked) {
                $('.edge').show();
                $('.face').hide();
            } else {
                $('.edge').hide();
                $('.face').show();
            }
        })
        $('#checkboxScatter').change(function(){
            if(this.checked) {
                $('.scatter-plot').show();
                if (!$('#checkboxHeatmap').prop("checked")) {
                    $('.ternary-grid').show();
                }
            } else {
                $('.scatter-plot').hide();
                $('.ternary-grid').hide();
            }
        })
        $('#checkboxHeatmap').change(function(){
            if(this.checked) {
                $('.heatmap').show();
                $('.ternary-grid').hide();
                //let poly = d3.select('.heatmap').selectAll('polygon');
                //poly.attr('fill', ()=>d3.select(this).attr('cnt-color'));
            } else {
                $('.heatmap').hide();
                if ($('#checkboxScatter').prop("checked")) {
                    $('.ternary-grid').show();
                }
                //d3.select('.heatmap').attr('fill', 'none');
            }
        })
    })
}