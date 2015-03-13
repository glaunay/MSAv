function run () {

    var msaW = 800,
        msaH = 500;

    var scaffold = '<div id="dcaView"></div><div id="msaView"></div>';
    $("body").append(scaffold);

    maestro = { 'id' : "NS Root for msa dca visualization components integration"};
    d3.json("./data/analysisFull_complete_g020_correl.json", function(data) {
//bacteria_g02_tml_correl.json
        maestro.heatMap = dcaViewer({target : "#dcaView", width : 1600, height : 1600, onCellClick : injectTooltip});
        maestro.data = data;
        var msaOpt = {  cons : maestro.data.sca.conservation ? maestro.data.sca.conservation : null,
                        nColView : 35,
                        nRowView : 10,
                        target : "#msaView",
                        data : data.msa.matrix,
                        seqName : data.msa.headers,
                        seqBind : function (seqData){
                            dataSca = reduce(maestro.data.sca.matrix, seqData);
                            dataDca = reduce(maestro.data.dca.DC, seqData);
                            dataMi = reduce(maestro.data.dca.MI, seqData);

                            d3.select(maestro.heatMap.target).selectAll("div.ctrl").remove();
                            var ctrlElem = d3.select(maestro.heatMap.target).append('div')
                                .attr("class", "ctrl");
                            ctrlElem.append('span').attr("class", "toggler")
                                .text("DCA").on("click", function(){
                                    maestro.heatMap.draw(dataDca.matrix, dataDca.list);
                            });
                            ctrlElem.append('span').attr("class", "toggler")
                                .text("SCA").on("click", function(){
                                    maestro.heatMap.draw(dataSca.matrix, dataSca.list);
                            });
                            ctrlElem.append('span').html('<i class="fa fa-scissors"></i>')
                                .on("click", function(){
                                    maestro.heatMap.triangUpToggle();
                            });
                            ctrlElem.append('span').html('<i class="fa fa-lightbulb-o"></i>')
                                .on("click", function(){
                                    maestro.heatMap.highlight();
                            });
                            ctrlElem.append('span').html('<i class="fa fa-list"></i>')
                                .on("click", function(){
                                    var offset = {
                                        top : $(this).position().top,
                                        left :  $(this).position().left  + 50
                                    };
                                    console.dir($(this).position());
                                    if(d3.selectAll("div#scoreChartWrapper").size() > 0) {
                                        d3.selectAll("div#scoreChartWrapper").style("visibility",
                                        function(){
                                            return d3.select(this).style("visibility") === "hidden" ? "visible" : "hidden";
                                        });
                                        return;
                                    }
                                    var list = maestro.heatMap.asList;
                                    var array = [];
                                    for (var i = list.length ; i > list.length - 100; i--) {
                                        var datum = list[i - 1].ref;
                                        var iDat = {"n" : datum.iSeqPos, "l" : datum.iLetter},
                                        jDat = {"n" : datum.jSeqPos, "l" : datum.jLetter};

                                        if (datum.iMsa > datum.jMsa) {
                                            iDat = {"n" : datum.jSeqpos, "l" : datum.jLetter};
                                            jDat = {"n" : datum.iSeqPos, "l" : datum.iLetter};
                                        }
                                        array.push([iDat.l + ( iDat.n + 1 ), jDat.l + (jDat.n + 1), list[i - 1].v]);
                                    }
                                    d3.select('body').append("div").attr("id", "scoreChartWrapper")
                                        .append("div").attr("class", "scoreChartHeader");
                                    d3.selectAll('div#scoreChartWrapper')
                                        .append("table").attr("id", "scoreChart");
                                    $("div#scoreChartWrapper").css({"top" : offset.top, "left" : offset.left});
                                    console.dir(array);
                                    array.forEach(function(elem){ elem[2] = elem[2] + '<div class="scoreSearchBut"> <i class="fa fa-search"></i></div>';})
                                    $("table#scoreChart").DataTable({
                                        "data" : array,
                                        "columns" : [
                                            { sTitle : "A" },
                                            { sTitle : "B" },
                                            { sTitle : "score" }
                                            ],
                                        /*"pagingType": "full_numbers"*/
                                        initComplete: function () {
                                            var api = this.api();
                                                api.$('td div.scoreSearchBut').click( function () {
                                                    //console.dir(this);
                                                    $(this).toggleClass("on");
                                                    var td = this.parentNode;
                                                    maestro.heatMap.highlightCell({
                                                        aa1 : $(td).siblings()[0].innerHTML,
                                                        aa2 : $(td).siblings()[1].innerHTML
                                                    })
                                                    //console.dir($(td).siblings()[0]);
                                                    //api.search( this.innerHTML ).draw();
                                            });
                                        }
                                    });
                                    $("div#scoreChartWrapper").drags({"handle" : "div.scoreChartHeader"});
                            });
                            //maestro.heatMap.draw(dataSca.matrix, dataSca.list);
                            maestro.heatMap.draw(dataDca.matrix, dataDca.list);
                            }, draggable : true
                        }
        if (data.msa.backtrack) msaOpt.positionMask = data.msa.backtrack;
        if (data.tml) msaOpt.locations = data.tml;
        maestro.msaObject = newMsa(msaOpt);
        $("#msaView").css({"max-width" : + (maestro.msaObject.w + 10) + "px", "margin-left" : "5px", "margin-top" : "5px"});
        maestro.msaObject.draw();
    });
}

/*



*/

function reduce (matrix, seqData) {


    var arrayOut = [], matrixOut = [];
    var x = 0;
    for (var i = 0; i < seqData.length ; i++) {
        if (seqData[i].letter === "-") continue;
        var iDat = {
            letter : seqData[i].letter,
            seqPos : seqData[i].pos,
            msaPos : i
        };
        arrayOut.push(iDat);
        matrixOut.push([]);
        for (var j = 0; j < seqData.length ; j++) {
            if (seqData[j].letter === "-") continue;
            var jDat = {
                letter : seqData[j].letter,
                seqPos : seqData[j].pos,
                msaPos : j
            };
            matrixOut[x].push({ 'score' : matrix[i][j], 'i' : iDat, 'j' : jDat });
        }
        x++;
    }
    return {
        list : arrayOut,
        matrix : matrixOut
    }
}
function injectTooltip(opt) {// add color code to arguments plz
    console.log(opt);
    var colorCode = maestro.msaObject.aaSpecs;

    if (opt.event) { console.log(opt.event);}

    var a = sortFreq(maestro.data.msa.frequency[opt.datum.iMsa]),
        b = sortFreq(maestro.data.msa.frequency[opt.datum.jMsa]);

    console.dir(opt.datum);
    console.log("IFREQQ");
    console.dir(a);
    var selector = "k_"
                    + opt.datum.iLetter
                    + opt.datum.iSeqPos +'_'
                    + opt.datum.jLetter
                    + opt.datum.jSeqPos;
    var iDat = {"n" : opt.datum.iSeqPos, "l" : opt.datum.iLetter},
        jDat = {"n" : opt.datum.jSeqPos, "l" : opt.datum.jLetter},
        iFreq = a, jFreq = b;

    if (opt.datum.iMsa > opt.datum.jMsa) {
        iDat = {"n" : opt.datum.jSeqPos, "l" : opt.datum.jLetter};
        jDat = {"n" : opt.datum.iSeqPos, "l" : opt.datum.iLetter};
        iFreq = b;
        jFreq = a;
    }

    // Filter on attribute to avoid injecty in preexisting one $d3.select('div.mToolTip')
    $('div.mToolTip#' + selector).remove();
    $('body').append( '<div class="mToolTip" id="' + selector + '">'
                    + '<div class="header"></div>'
                    + '<div class="lPart"></div><div class="rPart"></div>'
                    + '<div class="footer"></div>'
                    + '</div>');

    console.dir(opt);
    $('div.mToolTip#' + selector + ' div.header').append('<i class="fa fa-close pull-right"></i>');
    $('div.mToolTip#' + selector + ' i').on("click", function(){
        var n = this.parentNode;
        n = n.parentNode;
        d3.select(n).remove();
    });
    d3.selectAll('div.mToolTip#' + selector + ' div.lPart').append('div').attr("class", "sTitle").text(iDat.l + "" + (iDat.n + 1));
    d3.selectAll('div.mToolTip#' + selector + ' div.rPart').append('div').attr("class", "sTitle").text(jDat.l + "" + (jDat.n + 1));
    drawChart(d3.select('div.mToolTip#' + selector + ' div.lPart'), iFreq, colorCode);
    drawChart(d3.select('div.mToolTip#' + selector + ' div.rPart'), jFreq, colorCode);

    $('div.mToolTip#' + selector).css({'top' : opt.event.y + "px", 'left' : opt.event.x + "px"});
    $('div.mToolTip#' + selector).drags({handle : 'div.header'});
}

function drawChart (d3sel, data, colorCode) {
    console.dir(d3sel);
    console.dir(data);
    console.dir(colorCode);

    var lMargin = 50;
    var topMargin = 50;
    var vSpace = 10;

    var rh = 25;
    var h = (vSpace + rh - 1) * 5 + topMargin;

    var xO = lMargin - rh - 5;

    var lw = 25;

    var svg = d3sel.append('svg').attr('class', 'chart').attr('width', "250").attr('height', h);
    var chart = svg.append('g').style("fill", "grey");
    var w = svg.attr('width');
    var barScale = d3.scale.linear().domain([0, 1])
        .range([0, w - xO]);
    //chart.append("rect").attr("class", "grid").attr('width',  lMargin + barScale(round5(data[0].freq * 100)/100)).attr("height", h)
    //.attr("x", lMargin - rh - 5).attr("y", topMargin - vSpace/2);

    var grid = chart.append("rect").attr("class", "grid").attr('width', "100%").attr("height", h)
    .attr("x", lMargin - rh - 5).attr("y", topMargin - vSpace/2);

    console.dir(data);
    console.log(w);
    /*var rMax = round5(100 * (data[0].freq + 0.05);
    var fqScale = d3.scale.domain(0, rMax).range(lMargin, chart.attr("width"));
*/

    var tick = range(0,round5(data[0].freq * 100)/100, 0.05);
    chart.selectAll('.line').data(tick).enter().append('line').attr('class', 'line')
    .attr("x1", function (d){ return barScale(d) + lMargin;})
    .attr("x2", function (d){ return barScale(d) + lMargin;})
    .attr("y2", h)
    .attr("y1", topMargin - vSpace/2).style("stroke", "white");//.style("stroke-width" , "1px");

    chart.selectAll('.bar').data(data).enter().append('rect').attr('class', 'bar').attr('width', function(d){ return barScale(d.freq);})
        .style('fill', function(d){return colorCode[d.letter].color})
        .style("stroke", "black")
        .attr('height', rh).attr("y" , function(d,i){ return topMargin + i * (rh + vSpace)}).attr("x" , lMargin);
    var lgroup = chart.selectAll(".letterCode").data(data).enter().append('g');

    lgroup.append('rect').attr('width', lw).attr('height', rh).style("fill", "white");
    lgroup.append('text').text(function(d){ return d.letter;})
    .style('fill', 'black').attr("x", lw * 0.3).attr("y", rh * 0.75);
    lgroup.attr('transform', function(d,i){
        return  'translate( ' + (lMargin - rh - 5) + ', ' + (topMargin + i * (rh + vSpace)) + ')';
    });


}
function sortFreq (obj) {
    var copy = clone(obj);
    var max = 0;
    var sum = 0;
    var dataOut = [];
    for (var key in copy) {
        max = copy[key] > max ? copy[key] : max;
        sum += copy[key];
    }

    while(Object.size(copy) > 0) {
        var cur_i, cur_max = 0;
        for (var key in copy) {
            if (copy[key] > cur_max) {
                cur_max = copy[key];
                cur_i = key;
            }
        }
        if (cur_max ==0) break;
        dataOut.push({"letter" : cur_i, "freq" : parseFloat(cur_max/sum)});
        delete copy[cur_i];
        cur_max = 0;
    }
    return dataOut;
}

/*
function setMetricCtrl () {

    d3.select('g#controler')
    if ('dca' in maestro.data){
        if (maestro.data.dca.DC)

    }

}
*/