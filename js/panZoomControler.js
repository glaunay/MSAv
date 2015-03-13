function startPanZoomControler(opt) {
    console.log("SPZ init");
/*
    svgCtrl the Svg where the controler will be drawn
    svgFrame the Svg that hosts the below gLayer
    gLayer the g element which will be transformed to reflect view point modification
*/
 // if ('svgElement' in opt) {

     /*   if (!opt.svgCtrl || !opt.svgFrame || !opt.gLayer) {
            alert("missing panZoomCtrl constructor arguments");
            return;
        }
*/
// host, where to draw control --> svg node
// svg Frame the svg element containing the target
// target, which g to alter

    var callback  = opt.onSlide ? opt.onSlide : function (val) { console.log(val);};

    var dragCtrl = d3.behavior.drag()
                    //.on("dragstart", dragstarted)
                    .on("drag", allDrag);
    d3.select(opt.host).append('svg:g').attr("id","controler").call(dragCtrl);

 d3.select(opt.host).on('click', function (){
    console.log("click coordinates : " + d3.event.x + " " + d3.event.y);}
    );
    function allDrag (){
        var r = d3.select(this).selectAll('circle.pzBack').attr("r");

        console.log("Dragging it ");
        var str = "translate(" + (d3.event.x - r/2) + ", " + (d3.event.y - r/2) + ")";
        console.log(str);
        d3.select(opt.host + " g#controler")
        .attr("transform", str);
    };



    var curCourse = 84;
    var min = opt.min ? opt.min : 0,
        max = opt.max ? opt.max : 100;
    var scale = d3.scale.linear()
                            .domain([0, curCourse])
                            .range([min, max]).clamp(true);


    var dragCursor = d3.behavior.drag()
                        //.on("dragstart", dragstarted)
                        .on("drag", cDrag)
                        .on("dragend", cDragEnded);

    var oX = 0;
    function cDrag () {
        var w = d3.select(this).attr("width");
        var newX = d3.event.x - w/2 < curCourse ? d3.event.x - w/2 > 0 ? d3.event.x - w/2 : 0 : curCourse;
        d3.select(this).attr("x", newX); // approx
        console.log(oX + " xx " + newX);
        oX = newX
      //  callback(scale(newX));
    }
    function cDragEnded () {
        callback(scale(oX));
        /*var value = d3.select(this).attr("x")
        console.log(value);
        callback(scale(value));*/
        //return promise w/ value
        //return;
    }

    d3.select(opt.host + ' #controler').append("circle")
	  .attr("cx", 50)
	  .attr("cy", 50)
	  .attr("r", 42)
      .attr('class', 'pzBack')
	  .style("opacity", 0.25)
	  .style("fill","rgb(139, 133, 139)");

      // North
       d3.select(opt.host + ' #controler').append("svg:path")
	  .attr("d", "M50 10 l12 20 a40,70 0 0,0 -24,0z")
	  .attr("class", "button");
      // West
      d3.select(opt.host + ' #controler').append("svg:path")
	  .attr("d", "M10 50 l20 -12 a70,40 0 0,0 0,24z")
	  .attr("class", "button");
      // South
      d3.select(opt.host + ' #controler').append("svg:path")
	  .attr("d", "M50 90 l12 -20 a40,70 0 0,1 -24,0z")
	  .attr("class", "button");
      // East
      d3.select(opt.host + ' #controler').append("svg:path")
	  .attr("d", "M90 50 l-20 -12 a70,40 0 0,1 0,24z")
	  .attr("class", "button");

      d3.select(opt.host + ' #controler').append("circle")
	  .attr("cx", 50).attr("cy", 50).attr("r", 20)
	  .attr("class", "compass");

      d3.select(opt.host + ' #controler').append("circle")
	  .attr("cx", 50).attr("cy", 41).attr("r", 8)
	  .attr("class", "button");

       d3.select(opt.host + ' #controler').append("circle")
	  .attr("cx", 50).attr("cy", 59).attr("r", 8)
	  .attr("class", "button");

      d3.select(opt.host + ' #controler').append("rect")
	  .attr("x", 46).attr("y", 39.5).attr("width", 8).attr("height", 3)
	  .attr("class", "plus-minus");

      d3.select(opt.host + ' #controler').append("rect")
	  .attr("x", 46).attr("y", 57.5).attr("width", 8).attr("height", 3)
	  .attr("class", "plus-minus");

      d3.select(opt.host + ' #controler').append("rect")
	  .attr("x", 48.5).attr("y", 55).attr("width", 3).attr("height", 8)
	  .attr("class", "plus-minus");

   // var svgHost = $(opt['svgFrame'])[0];

    var w =  d3.select(opt.svgFrame).attr('width'),
    h =  d3.select(opt.svgFrame).attr('height');
    d3.select(opt.host + ' g#controler').append("svg:g").attr("id", "tSlider");
    d3.select(opt.host + ' g#controler').selectAll('g#tSlider').append("svg:rect").attr('class', "tBar")
                                        .attr("x", 10).attr("y", 100).attr("width", curCourse)
                                        .attr("height", 15).attr("rx",5).attr("ry",5).style('fill', 'steelblue');
    d3.select(opt.host + ' g#controler').selectAll('g#tSlider').append("svg:rect").attr('class', "tCursor")
                                        .attr("x", 5).attr("y", 95).attr("width", 25).attr("height", 25)
                                        .attr("rx",5).attr("ry",5).style('fill', 'firebrick').call(dragCursor);
    // G resume here
    // linear scale w/ min max value from matrix.
    // and callback W/ on drag --> promise works?
    // Add handler for displaycing crl w/in svg



   // var autofocusScaffold = '<g id="autofocus"><rect></rect><text></text></g>';
  /*   d3.select(opt.host + ' #controler').append("svg:g").attr("id", "autofocus").append("svg:rect");
     d3.select(opt.host + ' #controler g#autofocus').append("svg:text");
     d3.select(opt.host + ' #controler g#autofocus').style("cursor", 'pointer');
     d3.select(opt.host + ' #controler g#autofocus rect')
	  .attr("x", 10).attr("y", 100).attr("width", 84).attr("height", 20).attr("rx",5).attr("ry",5)
	  .style("fill","rgba(139, 133, 139, 0.25)"); // rgb(128, 0, 128)

	 d3.select(opt.host + ' #controler g#autofocus text')
	    .append("tspan")
    	.attr("x",20)
	    .attr("y", 115)
	    .style("cursor", 'pointer')
	    .style("fill","#225EA8")
	    .text("autofocus");*/
    //vizObject.core.centrum();
    //console.log("PanZoom Component init");
    var self = function ()
    {
	return {
        min : opt.min,
        max : opt.max,
        svgFrame : opt.svgFrame,
        gLayer : opt.gLayer,
	    callback : opt.onClickCallback ? opt.onClickCallback : function (){},
	    host : opt.host,
	    docWidth : w,
	    docHeight : h,
	    transMatrix : [1,0,0,1,0,0],
	    scale : 1.0,
	    _releaseMatrix : function(){
	    var matrix = $(this.gLayer).attr("transform");
	    if(!matrix){
	    	matrix = [1,0,0,1,0,0];
	    }else{
	    	var reg = /-?[0-9]+(\.[0-9]*)?/gi;
	    	var matrix = matrix.match(reg);
	    	for (var i=0; i < matrix.length; i++) {
			  matrix[i] = parseFloat(matrix[i]);
			};
	    }
		this.transMatrix =  matrix;
	    },
	    pan : function (dx, dy)
	    {
		this._releaseMatrix();
		this.transMatrix[4] += dx;
		this.transMatrix[5] += dy;

		var newMatrix = "matrix(" +  this.transMatrix.join(' ') + ")";

		$(this.gLayer).attr("transform", newMatrix);
		this.callback();
	    },
	    zoom : function (scale)
		{
		    this._releaseMatrix();
		    //console.log('from ' +  this.transMatrix);
		    for (var i=0; i<this.transMatrix.length; i++)
		    {

			this.transMatrix[i] *= scale;
			//console.log('to ' +  this.transMatrix[i]);
		    }
		    //console.log((1-scale)*this.docWidth/2 + " " + (1-scale)*this.docHeight/2);
		    this.transMatrix[4] += (1-scale)*this.docWidth/2;
		    this.transMatrix[5] += (1-scale)*this.docHeight/2;
		    //console.log('to ' +  this.transMatrix);
		    var newMatrix = "matrix(" +  this.transMatrix.join(' ') + ")";
            targetSvg = this.externalView ? this.externalView : this.svgElement;  /// wont work here
		    $(this.gLayer).attr("transform", newMatrix);
	   	    this.callback();
		},
	    setViewPoint : function (data) { // x,y coor and an option to encompass all displayed element
		var xOffset = this.docWidth / 2 - data.x,
		yOffset = this.docHeight / 2 - data.y;
		//console.log(this.docWidth + " x "  + this.docHeight);
		//console.log("bary : " + data.x + "  " + data.y);
		this.pan(xOffset, yOffset);
		//console.log(xOffset, yOffset);
		this.callback();
	    },
        slide : function (f) {f}
	};
    } ();


    var ctrl = $(opt.host + ' #controler .button');

    $(opt.host + ' #controler g#autofocus')
    	.on('click', function (event) {

		      vizObject.core.centrum();
		      event.stopPropagation();
		  });
    $(ctrl[0]).on('click', function (event) {
		      self.pan(0,-50);
		      event.stopPropagation();
		  });
    $(ctrl[1]).on('click', function (event){
		      self.pan(-50,0);
		      event.stopPropagation();
		  });
    $(ctrl[2]).on('click', function (event){
		      self.pan(0,50);
		      event.stopPropagation();
		  });
    $(ctrl[3]).on('click', function (event){
		      self.pan(50,0);
		      event.stopPropagation();
		  });
    $(ctrl[4]).on('click', function (event){
		      self.zoom(0.9);
		      event.stopPropagation();
		  });
    $(ctrl[5]).on('click', function (event){
		      self.zoom(1.1);
		      event.stopPropagation();
		  });

    return self;
}

