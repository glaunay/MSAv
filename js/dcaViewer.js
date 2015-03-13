function testDcaView(opt) {

   if (!opt.target) {
        alert("no target div specied");
        return;
    }

    d3.json("dca.json", function(dca) {
        var matrix = dca.data;
        for (var i = 0; i < matrix.length; i++) {
            for (var j = 0; j < matrix[i].length; j++) {
                var score = matrix[i][j];
                matrix[i][j] = { "value" : score, "i" : i, "j" : j, selected : false };
            }
        }
        console.log(matrix);
        //var nodes = dca.msa;
        dcaViewerObj = dcaViewer({target : opt.target });
        dcaViewerObj.draw(matrix);
    });
}

function dcaViewer(options) {

    var w = options.width ? options.width : 800,
        h = options.height ? options.height : 800,
        margin = {top: 80, right: 0, bottom: 10, left: 80};

    var matrix = null;
    //nodes = null;

    return {
        mouseTrack : {x: 0, y: 0},
        target : options.target,
        zLayer : null,
        data : {
                matrix : null,
                min : null,
                max : null
            },
        svg : null,
      //  nodes : null,
        margin : margin,
        width : w,
        height : h,
        rw : null,
        rh : null,
        grp : null,
        aaPairsToCell : {},
        colorScale : null,
        panZoomObj : null,
        sliderObj : null,
        asList : [],
        onCellClick : options.onCellClick ? options.onCellClick : null,
        _parse : function(matrix, sequence) {
            console.dir(sequence);


            console.log("MMM");
            console.dir(matrix[0][0]);
            this.data.min = matrix[0][0].score;
            this.data.max = matrix[0][0].score;
            this.data.matrix = [];
            for (var i = 0; i < matrix.length; i++) {
                this.data.matrix.push([]);
                for (var j = 0; j < matrix[i].length; j++) {
                    var score = parseFloat(matrix[i][j].score);
                    var iMsa = matrix[i][j].i.msaPos;
                    var jMsa = matrix[i][j].j.msaPos;
                    this.data.max = this.data.max < score ? score : this.data.max;
                    this.data.min = this.data.min > score ? score : this.data.min;
                    this.data.matrix[i].push ({
                        "iLetter" : sequence ? sequence[i].letter : null,
                        "jLetter" : sequence ? sequence[j].letter : null,
                        "iSeqPos" : sequence ? sequence[i].seqPos : null,
                        "jSeqPos" : sequence ? sequence[j].seqPos : null,
                        "value" : score,
                        "i" : i,
                        "j" : j,
                        selected : false,
                        "iMsa" : iMsa,
                        "jMsa" : jMsa
                    });
                }
            }
            var tmp = [];
            for (var i = 0; i < this.data.matrix.length; i++) {
                for (var j = i + 1; j < this.data.matrix[i].length; j++) {
                    if (this.data.matrix[i][j].value == this.data.min) continue;
                    tmp.push({"i" : matrix[i][j].iSeqPos, "j" : matrix[i][j].jSeqPos, "ref" : this.data.matrix[i][j], "v" : this.data.matrix[i][j].value})
                }
            }
            this.asList = _.sortBy(tmp, function(e){return e.v});
        },
        triangUpToggle : function () {
            // diagonal black
            ///hide bottom
            var self = this;
            for (var i = 0; i < this.data.matrix.length ; i++) {
                for (var j = 0; j < i ; j++) {
                    var node = this.data.matrix[i][j].svg
                    d3.select(node).style("visibility",
                        function(){
                            return d3.select(this).style("visibility") === "hidden" ? "visible" : "hidden";
                        })
                }
                d3.select(this.data.matrix[i][i].svg).style("fill", function(d) {
                    return d3.select(this).style("fill") === "rgb(0, 0, 0)" ? self.colorScale(d.value) : "black";
                })
            }
        },
        draw : function(data, list) {
            var self = this;
            document.addEventListener('mousemove', function(e){
                self.mouseTrack.x = e.clientX || e.pageX;
                self.mouseTrack.y = e.clientY || e.pageY
            }, false);

            if (data) this._parse(data, list);

            this.colorScale = d3.scale.linear()
                .domain([0, 1])
                .range(["yellow", "red"]);

// Clear previous
            d3.select(this.target).selectAll("svg").remove();


            this.svg = d3.select(this.target).append("svg")
                .attr("width", self.width + self.margin.left + self.margin.right)
                .attr("height", self.height + self.margin.top + self.margin.bottom)
                .attr('class', 'frame');
            this.zLayer = this.svg.append('g').attr('class' , 'zLayer');


        // Create a group for each row in the data matrix and translate the
        // group vertically
            this.rw = (self.width * 0.9) / self.data.matrix.length;
            this.rh = (self.height * 0.9) / self.data.matrix[0].length;
            this.grp = this.zLayer.selectAll('g')
                        .data(self.data.matrix).enter()
                        .append('g')
                        .attr('transform', function(d, i) {
                            return 'translate(0, ' + (self.rh + 1) * i + ')';
                        })
                        .attr('class', 'row');
            this.grp.selectAll('rect')
                .data(function(d) { return d; })
                .enter()
                .append('rect')
                .attr("class", "cell")
                .attr('x', function(d, i) { return (self.rw + 1) * i; })
                .attr('width', self.rw)
                .attr('height', self.rh)
                .attr('stroke', 'white')
                .attr('stroke-width', '0.1')
                .style('fill', function(d){
                    return self.colorScale(d.value);
                }).each(function(d){
                    self.data.matrix[d.i][d.j].svg = this;
                    self.aaPairsToCell[d.iLetter + (d.iSeqPos + 1) + "_" + d.jLetter + (d.jSeqPos + 1)] = this;
                });
            this.panZoomObj = startPanZoomControler( {
                                                    min : self.data.min, max : self.data.max,
                                                    host : 'svg.frame', svgFrame : 'svg.frame',
                                                    gLayer : 'g.zLayer',
                                                    onSlide : function (value){
                                                        console.log(value);
                                                        var colorScale = d3.scale.linear()
                                                            .domain([0, 1])
                                                            .range(["yellow", "red"]);
                                                        self.svg.selectAll('.cell')
                                                            .style('fill', function(d){
                                                                //console.dir(d);
                                                                if (d.value < value) return 'grey';
                                                                    return colorScale(d.value);
                                                        });
                                                    }
                                                    });

            this._setMonitoring();
        },
        _setMonitoring : function () {
            var self = this;
            this.svg.selectAll('rect.cell').on('click', function (d) {
                if (self.onCellClick){
                    self.onCellClick({ 'svgElem' : this, 'event' : d3.event, 'datum' : d });
                    return;
                }
                var x = d3.select(this).attr("x");
                x = parseFloat(x) + 0.5 * self.rw;
                console.log(x);
                var gNode = $(this).parent()[0];
                console.dir(gNode);
                var tr = d3.select(gNode).attr("transform");
                var coor = getTranslationCoordinates(tr);
                console.dir(coor);
                var y = parseFloat(coor[1]) + 0.5 * self.rh;
                var score = Math.ceil(d.value * 100) / 100;
                var tpw = self.zLayer.append('g').attr("transform", "translate (" + x + ", " + y + ")")
               /* .attr("height", "50").html('<div class="dcaToolTip"><div class="tContent">'
                    + d.i + ' <> ' + d.j + ' <span class=score>' + d.value + '</span>'
                    + '<i class="fa fa-close pull-right"></i></div>'
                    + '<div class="tailShadow"></div><div class="tail1"></div><div class="tail2"></div>')*/
                var c1 = d.iLetter ? d.iLetter + (d.i + 1) : d.i + 1;
                var c2 = d.jLetter ? d.jLetter + (d.j + 1) : d.j + 1 ;
                console.dir(d);
                tpw.append('rect').attr("width","100").attr("height","30").style("fill", "none");
                tpw.append('foreignObject').attr("width","150").attr("height","30")
                .html(function(d){
                    return '<div class="dcaToolTip">' + c1 + ' <> ' + c2
                        + ' <span class=score>' + score + '</span><i class="fa fa-close pull-right"></i></div>'
                    }
                );
                tpw.selectAll('i.fa-close').on('click', function (){
                    tpw.remove();
                });
            });

        },
        magnifyColRow : function(index) {
            this.magnifyRow(index);
            this.magnifyCol(index);
        },
        _indexToPosition : function(index) {
            return { x : (this.rh + 1) * index, y : (this.rw + 1) * index };
        },
        highlightCell: function(opt) {
            var self = this;
            if (!opt.aa1 || !opt.aa2) {
                alert("ouille");
                return;
            }
            var cell = this.aaPairsToCell[opt.aa1 + "_" + opt.aa2];
            console.dir(cell);
            var datum = d3.select(cell).datum();
            if (datum.svgBig){
                datum.svgBig.remove();
                d3.select(cell).style("visibility", "visible");
                datum.svgBig = null;
            } else {
                d3.select(cell).style("visibility", "hidden");
                var xOffset = d3.select(cell).attr("x"), // get it from x attribute of svg
                    yOffset = getTranslationCoordinates(d3.select(cell.parentNode).attr("transform"))[1]; // get it from parent class row
                console.log(xOffset + " /// " + yOffset);
                datum.svgBig = self.zLayer.append("rect")
                    .attr({ "x" : xOffset,
                            "y" : yOffset,
                            "width" : self.rw,
                            "height" : self.rw
                    })
                    .style("fill", "red")
                    .on("click", function(){
                        console.dir(cell);
                        console.dir(this);
                        $(cell).d3Click();
                       // cell.onclick.apply(cell);
                    });

                    bloom(datum.svgBig);
                    //datum.svgBig.transition()
                    //    .each("end", bloom);
                    function bloom (elem) {
                        var bloomOf = self.rw * 3; // size increase
                        //var rect = d3.select(svgElem);
                            (function repeat() {
                                elem.attr(
                                    { "x" : xOffset,
                                      "y" : yOffset,
                                      "width" : self.rw,
                                      "height" : self.rw
                                    })
                                    .transition().duration(1500)
                                    .attr(
                                    { "x" : xOffset - bloomOf/2,
                                      "y" : yOffset - bloomOf/2,
                                      "width" : self.rw + bloomOf,
                                      "height": self.rw + bloomOf
                                    })
                                    .each("end", repeat);
                            })();
                    };
                    //datum.svgBig.transition().attr("width", 3000).attr("height", 3000);

            }
            console.dir(datum);
            //d3.select(cell).filter(function(d){if (d)}).transition().attr("width", 200).style("fill", "black");
        },
        // To messy superimposed svg elem,
        highlight: function (){
            this.svg.selectAll('.cell').filter(function(d){
                if (d3.select(this).style("fill") === "rgb(128, 128, 128)") return null;
                if (d3.select(this).style("fill") === "rgb(0, 0, 0)") return null;
                return this;
            })
            .style("fill", "green")
            .attr("class", function(d){return d3.select(this).attr('class') + " highlighted";})
            .transition()
                .attr("x", function (d){
                    console.log(d3.select(this).attr("x"));
                    return d3.select(this).attr("x") - 5 - 1;
                })
                .attr("y", function (d){
                    return d3.select(this).attr("y") - 5 - 1;
                })
                .attr("width", 15)
                .attr("height", 15);

        },
        magnifyRow : function(index) {
            var xFirst = d3.select(this.svg).selectAll('.cell').first().attr('x'),
            xLast = parseFloat( d3.select(this.svg).selectAll('.cell').last().attr('x'))
            + parseFloat( d3.select(this.svg).selectAll('.cell').last().attr('width'));
            var w = parseFloat(xLast) - parseFloat(xFirst);
            console.log(xLast + ' - ' + xFirst + " --> " + w);
            var pos = indexToPosition(index);
            d3.select(this.svg).selectAll('g.zLayer').append('rect').attr('class', 'contour').style('fill', 'none')
            .attr({'x' : 0, 'y' : pos.y, 'width' : w, 'height' : rh }).style({'stroke-width' : 0.75, 'stroke' : 'blue'});
        },
        magnifyCol : function(index) {
            var self = this;
            var x = this.svg.selectAll('.cell').index(index).attr('x');
            var myString = this.svg.selectAll('.row').last().attr('transform');
            var myRegexp = /translate\(([^,]+),([^,]+)\)/;
            var match = myRegexp.exec(myString);
            var coordinates = [parseFloat(match[1]), parseFloat(match[2])];
            var y = coordinates[1];
            var h = y - 0 + this.rh;
            this.svg.selectAll('g.zLayer').append('rect').attr('class', 'contour').style('fill', 'none')
                .attr({'x' : x, 'width' : self.rw, 'height' : h }).style({'stroke-width' : 0.75, 'stroke' : 'blue'})
                .attr('transform', function(d, i) {
                    return 'translate(0, 0)';
                });
        }
    };
}