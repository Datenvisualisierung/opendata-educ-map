//based on https://github.com/yurukov/opendata-educ-map

var geo = null;
var amounts = null;
var j=null;
var margin = {top: 10, right: 20, bottom: 45, left: 70},
		width = 900 - margin.left - margin.right,
		height = 230 - margin.top - margin.bottom;

var formatPercent = d3.format(".1%");

var x = d3.scale.ordinal().rangeRoundBands([0, width], .2);
var y1 = d3.scale.pow().exponent(0.4).range([0, height]);
var y2 = d3.scale.linear().range([0, height]);

var xAxis = d3.svg.axis()
	.scale(x)
	.orient("top");

var yAxis1 = d3.svg.axis()
	.scale(y1)
	.orient("left");
var yAxis2 = d3.svg.axis()
	.scale(y2)
	.orient("left")
	.tickFormat(formatPercent);

var svg = d3.select("#chart").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")") 

var defaultValType=4;

d3.csv("data/2012_Schueler_Stadtteil.csv", function(data) {
	amounts=data;
	console.log("lade Daten 2012_Schueler_Stadtteil.csv");
	draw();
});	

d3.csv("data/2012_Schueler_Insgesamt.csv", function(data) {
	amounts2=data;

});	

d3.json("data/cologne.json", function(data) {
	geo=data;
		console.log("lade Daten cologe.json");
	draw();
});
//valType  1  --> GRUNDSCHULE
//valType  2  --> HAUPTSCHULE
//valType  3  --> REALSCHULE
//valType  4  --> GYMNASIUM
//valType  0  --> GESAMTSCHULE
function draw(valType) {
		console.log("bin in draw");
//Funktion geht zum ersten mal durch 
//und wird abgebrochen, weil cologne.json noch nicht geladen ist
	if ( geo==null || amounts==null){
		console.log("bin geo==null oder amounts==null");
		console.log("geo: " + geo);
		console.log("amounts: " + amounts);
		return;}
	//beim zweiten Durchlauf sind alle Daten durch d3 geladen 
	//die Zeile verstehe ich noch nicht
	valType = valType===undefined?defaultValType:valType;
	maxamount = 0;
	minamount = -1;
	//goes through each 86 Stadtteile of cologne.json 
	amounts.forEach(function(a) { 			
		//loops from 0 to 85

		for (i=0;i<geo.features.length;i++)
			//and builds 1 of 86 objects if there is a representant in cologne.json
			if (geo.features[i].properties.NUMMER==a.NUMMER) {
				geo.features[i].properties.title=geo.features[i].properties.NAME ;			
				geo.features[i].properties.GRUNDSCHULE=a.GRUNDSCHULE;
				geo.features[i].properties.HAUPTSCHULE=a.HAUPTSCHULE;
				geo.features[i].properties.REALSCHULE=a.REALSCHULE;
				geo.features[i].properties.GYMNASIUM=a.GYMNASIUM;
				geo.features[i].properties.GESAMTSCHULE=a.GESAMTSCHULE;
				geo.features[i].properties.ALLE=a.ALLE;
				if (valType==1)
					geo.features[i].properties.val=geo.features[i].properties.GRUNDSCHULE;
				else
				if (valType==2)
					geo.features[i].properties.val=geo.features[i].properties.HAUPTSCHULE;
				else
				if (valType==3){
					geo.features[i].properties.val=geo.features[i].properties.REALSCHULE;
				}
				else
				if (valType==4){
					geo.features[i].properties.val=geo.features[i].properties.GYMNASIUM;
				}
				else
				if (valType==0)
					geo.features[i].properties.val=geo.features[i].properties.GESAMTSCHULE;

				if (geo.features[i].properties.val>maxamount )
					maxamount=geo.features[i].properties.val;
				if (geo.features[i].properties.val<minamount || minamount==-1)
					minamount=geo.features[i].properties.val;
				break;
			}	
	});

	geo.features.sort(function(a,b) { return b.properties.val-a.properties.val; });
	geo.features.forEach(function(f,i) { f.index=i });

	scaleColor=d3.scale.pow().exponent(valType<3?0.3:1.3).domain([minamount,maxamount]);
	scaleColor.domain([0,0.5,1].map(scaleColor.invert));
	scaleColor.range(["#FF0000","#FFCC33","#009900"]);

	valColor = function(feature) {
		if (feature.properties.val)
			return scaleColor(feature.properties.val);
		else
			return "white";
	};
	

	if (j)
		map.removeLayer(j);
	j=L.geoJson(geo, {
	style: function (feature) {
	        return {fillColor:valColor(feature), 'color':'white', opacity:0.4, fillOpacity:0.5, weight:1};
	},
	onEachFeature: function (feature, layer) {
		var weiterfuehrend =  (feature.properties.ALLE - feature.properties.GRUNDSCHULE)
		if (feature.properties && feature.properties.title) {
			var text = "<h3>"+feature.properties.title+"</h3>"+
				"alle Schüler weiterführende Schulen: <b>"+weiterfuehrend +"</b>";
			if (feature.properties.val) {
				text+="<br/>Hauptschüler: <b>"+feature.properties.HAUPTSCHULE+" / "+
Math.round(feature.properties.HAUPTSCHULE/weiterfuehrend*100)+"%</b>"+
					"<br/>Realschüler: <b>"+feature.properties.REALSCHULE+" / "+
Math.round(feature.properties.REALSCHULE/weiterfuehrend*100)+"%</b>"+
					"<br/>Gymnasiasten: <b>"+feature.properties.GYMNASIUM+" / "+
Math.round(feature.properties.GYMNASIUM/weiterfuehrend*100)+"%</b>"+
					"<br/>Gesamtschüler: <b>"+feature.properties.GESAMTSCHULE+" / "+
Math.round(feature.properties.GESAMTSCHULE/weiterfuehrend*100)+"%</b>";
			} else
				text+="<br/>Няма данни";
			layer.bindPopup(text);
			layer.on("mouseover", featureMouseOver);
			layer.on("mouseout", featureMouseOut);

			layer.title=feature.properties.NAME;
			feature.layer=layer;
		    }
		}
	}).addTo(map);
//End Choropleth

//Start Balkediagramm
	//var yAxis = valType<3?yAxis1:yAxis2;
	var yAxis = yAxis1;

	x.domain(geo.features.map(function(f) { return f.properties.title; }));
	yAxis.ticks(8).scale().domain([0,maxamount]);

	svg.selectAll("g").remove();
	svg.selectAll("rect").remove();

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + margin.top + ")")
		.call(xAxis);

	svg.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(0," + margin.top + ")")
		.call(yAxis)

	var guides = svg.selectAll(".y.axis .tick");
	guides[0].shift();
	guides.append("line")
		.attr("x1",0)
		.attr("x2",width)
		.style("stroke", "#ccc");

	var chartLeft = $("#chart").offset().left;
	var chartRight = chartLeft+width;
	var xticks = $(".x.axis .tick text")
	xticks.each(function(i,o) {
		if (i<xticks.size()*0.15)
			o.style.textAnchor="start";
		else if (i>xticks.size()*0.85)
			o.style.textAnchor="end";
	});

	var a = svg.selectAll(".bar")
		.data(geo.features)
		.enter().append("g")
		.attr("transform", function(f) { return "translate("+x(f.properties.title)+","+(margin.top+2)+")"; });

	a.append("rect")
		.attr("class", "bar")
		.attr("width", x.rangeBand())
		.attr("height", function(f) { return yAxis.scale()(f.properties.val); })
		.style("fill", function(f) { return valColor(f); } )
		.on("mouseover",featureMouseOver)
		.on("mouseout",featureMouseOut)
		.on("click",featureClick);
	a.append("text")
		.attr("class", "bar-val")
		.attr("transform", function(f) { return "translate(0,"+(yAxis.scale()(f.properties.val)+margin.top+5)+")" }) 
		.text(function(f) { return valType<3?f.properties.val:formatPercent(f.properties.val); });
}
//End Balkendiagramm
function featureMouseOver(o) {
	if (!o)
		return;
	var feature,layer;
	if (o.target) {
		layer=o.target;
		feature=layer.feature;
	} else {
		layer=o.layer;
		feature=o;
	}
	layer.setStyle({opacity:0.8, fillOpacity:0.9}); 
	$(".x.axis .tick").get(feature.index).style.display="inline";
	$(".bar").get(feature.index).style.opacity=.5;
	$(".bar-val").get(feature.index).style.display="inline";
}

function featureMouseOut(o) {
	if (!o)
		return;
	var feature,layer,isMap=o.target;
	if (isMap) {
		layer=o.target;
		feature=layer.feature;
	} else {
		layer=o.layer;
		feature=o;
	}
	if (isMap) {
		layer.setStyle({opacity:0.6, fillOpacity:0.7});
		setTimeout( function() {
			layer.setStyle({opacity:0.4, fillOpacity:0.5});
		}, 100); 
	} else
		layer.setStyle({opacity:0.4, fillOpacity:0.5});
	$(".x.axis .tick").get(feature.index).style.display="";
	$(".bar").get(feature.index).style.opacity="";
	$(".bar-val").get(feature.index).style.display="";
}

function featureClick(o) {
	if (!o)
		return;
	var feature,layer,isMap=o.target;
	if (isMap) {
		layer=o.target;
		feature=layer.feature;
	} else {
		layer=o.layer;
		feature=o;
	}
	if (layer._layers)
		for (var key in layer._layers) {
			layer._layers[key].openPopup();
			break;
		}
	else
		layer.openPopup();
}

//Start Leafelet
L.Control.DataSwitch = L.Control.extend({
	options: {
		collapsed: true,
		position: 'topright',
		autoZIndex: true
	},

	initialize: function (dataValTypes, options) {
		L.setOptions(this, options);

		this._types = dataValTypes;
		this._active = options.default;
	},

	onAdd: function (map) {
		var container=$("<div class='leaflet-control'/>");
		for (var i in this._types)
			$("<div id='switch_"+this._types[i].type+"' class='leaflet-control-layers dataswitch' "+
			(this._active==this._types[i].type?"style='opacity:0.3;'":"")+">"+
			"<img src='" + this._types[i].src + "'"+
			" alt='" + this._types[i].title + "' title='" + this._types[i].title + "'/></div>")	
			.data("type",this._types[i].type)
			.data("control",this)
			.click(function() { 
				draw($(this).data("type")); 
				$(this).fadeTo(200,0.3);
				$("#switch_"+$(this).data("control")._active).fadeTo(200,1);
				$(this).data("control")._active=$(this).data("type");
			})
			.appendTo(container);
		return container.get(0);
	}
});

map = L.map('map', {
		maxBounds:new L.LatLngBounds(new L.LatLng(50.76426, 6.58424),new L.LatLng(51.1212, 7.30865)),
				minZoom:9,
		maxZoom:10,
		//Fullscreen 
		fullscreenControl: true,
		fullscreenControlOptions: {
			title:"Bildschirmansicht",
			forceSeparateButton:true
		},
		center:new L.LatLng(50.94318, 6.94628), 
		zoom:13
	});
map.on('exitFullscreen', function(){
	setTimeout(function() {map.setZoom(13);},500);
});

L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {id: 'examples.map-20v6611k',
	attribution: 'Map data &copy; 2011 OpenStreetMap'
}).addTo(map);

map.addControl(new L.Control.DataSwitch([
	{"title":"GRUNDSCHULE",src:"res/img/con_kin.png",type:1},
	{"title":"HAUPTSCHULE",src:"res/img/hauptschule.png",type:2},
	{"title":"REALSCHULE",src:"res/img/realschule.png",type:3},
	{"title":"GYMNASIUM",src:"res/img/gymnasium.png",type:4},
	{"title":"GESAMTSCHULE",src:"res/img/con_pop.png",type:0}],
	{"default":4}));
$("div[id^='switch'] img").tipsy({gravity: 'e',fade: true, html:true}); 





