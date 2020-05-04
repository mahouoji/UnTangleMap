function main(){
    var controller = Controller();
    controller.loadStaticData();

    $(document).ready(function() {
        // Data
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
            let method = $('#untangleCorrSelect').val();
            controller.updateCorrMethod(method);
            $(`#corrViewOptionContainer #option${method}`).click();
        });
        $('#untangleObjectiveSelect').change(function() {
            controller.unTangleMap.updateObjective($('#untangleObjectiveSelect').val());
        });
        $('#untangleAlphaOption input:radio').click(function() {
            //console.log($(this).val());
            controller.unTangleMap.updateAlpha($(this).val());
        });
        // Tool Bar
        // Layers
        $('#checkboxLabel').change(function(){
            controller.unTangleMap.checkLabel(this.checked);
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
        $('#checkboxScatter').change(function(){
            controller.unTangleMap.checkScatter(this.checked);
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
        // Options
        $('#corrViewOptionContainer input:radio').click(function() {
            //console.log($(this).val());
            controller.unTangleMap.setCorrDisplayMethod($(this).val());
        });
        $('#heatmapViewOptionContainer input:radio').click(function() {
            //console.log($(this).val());
            controller.unTangleMap.setHeatmapDisplayLevel($(this).val());
        });
        // Tools
        $('#toolContainer input:radio').click(function() {
            console.log($(this).val());
            controller.unTangleMap.setInteractionMode($(this).val());
        });
    })
}