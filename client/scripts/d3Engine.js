
// ------ CONFIG DATA ---------

var d3Engine = {};

d3Engine.initValues = function (width, height) {
  // colors key
  d3Engine.colors = ["steelblue", "darkorange", "darkseagreen"];
  d3Engine.prodKey = [];

  // Data for stars legend at bottom
  d3Engine.legendData = ['1 star', '2 stars', '3 stars', '4 stars', '5 stars'];

  // overall chart vars
  d3Engine.width = width || 600;
  d3Engine.height = height || 300;

  // tooltip vars
  d3Engine.ttOffset = 10;
  d3Engine.ttWidth = 220;
  d3Engine.ttHeight = 115;

  // x scale based on star rating
  d3Engine.x = d3.scale.linear()
            .domain([0, 6])
            .range([0, d3Engine.width]);

  // another scale, narrower range for foci (don't want foci at edge)
  d3Engine.fociX = d3.scale.linear()
            .domain([0, 5])
            .range([100, d3Engine.width-70]);

  // Create foci (1 per 0.5 star spaced out horizontally across chart)
  var fociGen = function (numFoci, x) {
    var results = [];
    for (var i = 0; i < numFoci; i++) {
      results.push({x: d3Engine.fociX(i+1)/2, y: d3Engine.height/2});
    }
    return results;
  };

  d3Engine.foci = fociGen(11, d3Engine.x);
};

// ---------------------------------


// ------ PREP DATA RECEIVED FROM OUTSIDE ---------
d3Engine.populateWMData = function (rawData, prodNum) {
  var results = [];
  for (var i = 0; i < rawData.length; i++) {
    var obj = {};
    obj.reviewLength = rawData[i].reviewText.length;
    obj.dotSize = obj.reviewLength/50 + 20;
    obj.stars = +rawData[i].overallRating.rating;
    obj.prodKey = d3Engine.prodKey[prodNum];
    obj.username = rawData[i].reviewer;
    obj.reviewTitle = rawData[i].title.slice(0,24) + "..."
    obj.review = rawData[i].reviewText;
    obj.reviewStart = obj.review.slice(0, 110) + "...";
    results.push(obj);
  }
  return results;
};

d3Engine.populateBBData = function (rawData, prodNum) {
  var results = [];
  for (var i = 0; i < rawData.length; i++) {
    var obj = {};
    obj.reviewLength = rawData[i].comment.length;
    obj.dotSize = obj.reviewLength/50 + 20;
    obj.stars = +rawData[i].rating;
    obj.prodKey = d3Engine.prodKey[prodNum];
    obj.username = rawData[i].reviewer[0].name;
    obj.reviewTitle = rawData[i].title.slice(0,24) + "..."
    obj.review = rawData[i].comment;
    obj.reviewStart = obj.review.slice(0, 110) + "...";
    results.push(obj);
  }
  return results;
};
// ---------------------------------


// ------ MAIN CHART CREATION FUNCTION ---------

d3Engine.create = function (el, width, height, products) {

  d3Engine.initValues(width, height);

  // populate chart with review data
  d3Engine.data = [];
  for (var i = 0; i < products.length; i++) {
    d3Engine.prodKey[i] = {name: products[i].name, color: d3Engine.colors[i], source: products[i].source};
    if (products[i].source === 'Walmart') {
      d3Engine.data = d3Engine.data.concat(d3Engine.populateWMData(products[i].Reviews,i));
    } else if (products[i].source === 'Best Buy') {
      d3Engine.data = d3Engine.data.concat(d3Engine.populateBBData(products[i].Reviews,i));
    }
  }

  // chart overall dimensions
  this.chart = d3.select(".chart")
    .attr("width", d3Engine.width)
    .attr("height", d3Engine.height);

  // clear D3 chart
  this.chart.selectAll("g").remove();
  d3.select(".hoverbox").remove();

  // create a "g" element for every review (will contain a circle and a text obj)
  var circle = this.chart.selectAll("g.node")
      .data(d3Engine.data)
    .enter().append("g")
      .classed("node", true)
      .attr("transform", function(d, i) { 
        return "translate(" + (d3Engine.x(d.stars)+ d.dotSize) + ", 50)";
      });

  // create a circle element for every g element
  circle.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", function(d) { return d.dotSize/2; })
    .style("fill", function(d) { return d.prodKey.color; })
    .style("stroke", "white")
    .style("stroke-width", 2)
    .style("stroke-opacity", 0.5);

  // create a text element for every g
  circle.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dy", ".35em")
    .text(function(d) {return d.stars;});

  // Bottom legend (# of stars)
  var legend = this.chart.selectAll("g.legend")
    .data(d3Engine.legendData)
    .enter().append("g")
    .classed("legend", true)
    .attr("transform", "translate(0, " + (d3Engine.height-25) + ")");

  legend.append("text")
    .attr("x", function(d, i) { return d3Engine.x((i*1.2)+0.5); })
    .attr("y", 0)
    .text(function(d) {return d});

  // Product legend
  var productLegend = this.chart.selectAll("g.productLegend")
    .data(d3Engine.prodKey)
    .enter().append("g")
    .classed("productLegend", true)
    .attr("transform", "translate(20,10)");

  productLegend.append("rect")
    .attr("x", 0)
    .attr("y", function(d,i) { return i*25; })
    .attr("width", 25)
    .attr("height", 25)
    .style("fill", function (d) { return d.color; });

  productLegend.append("text")
    .attr("x", 35)
    .attr("y", function (d,i) { return i*25 + 13; })
    .attr("dy", "0.35em")
    .text(function(d) { 
      if (d.name.length > 40) {
        return d.name.slice(0,40) + "..." + " at " + d.source;
      } else {
        return d.name + " at " + d.source;
      }
    });

  tooltipSetup();
  forceInit();
};
// ---------------------------------


// ------ TOOLTIP DEF ---------

function tooltipSetup() {
  tooltip = d3.select(".d3-container")
    .append("div")
    .style("width", d3Engine.ttWidth + "px")
    .style("height", d3Engine.ttHeight + "px")
    .classed("hoverbox", true);

  tooltip.append('div')
    .classed("username", true);

  tooltip.append('div')
    .classed("reviewTitle", true);

  tooltip.append('div')
    .classed("reviewText", true);

  var nodes = d3Engine.chart.selectAll("g.node");

  nodes.on('mouseover', function(d) {
    var mouseLoc = d3.mouse(this.parentNode);
    if (mouseLoc[0] + d3Engine.ttOffset + d3Engine.ttWidth > d3Engine.width) {
      mouseLoc[0] = mouseLoc[0] - d3Engine.ttOffset*2 - d3Engine.ttWidth;
    }
    if (mouseLoc[1] + d3Engine.ttOffset + d3Engine.ttHeight > d3Engine.height) {
      mouseLoc[1] = mouseLoc[1] - d3Engine.ttOffset*2 - d3Engine.ttHeight;
    }
    tooltip
          .style("display", "block")
          .style("left", (mouseLoc[0]+d3Engine.ttOffset)+"px")
          .style("top", (mouseLoc[1]+d3Engine.ttOffset)+"px")
          .transition()
          .duration(200)
          .style('opacity', 1);
    var ttHeader = d.username + " on " + d.prodKey.name;
    if (ttHeader.length > 20) {
      ttHeader = ttHeader.slice(0,20) + "...";
    }
    tooltip.select(".username")
      .text(ttHeader);
    tooltip.select(".reviewTitle")
      .text(d.reviewTitle);
    tooltip.select(".reviewText")
      .text(d.reviewStart);
  });

  nodes.on('mouseout', function(d) {
    tooltip.transition()
      .duration(200)
      .style('opacity', 0)
      .each('end', function () {
        tooltip.style("display", "none");
      });
  });
}

// // ---------------------------------


// ------ FORCE DEFINITION AND START---------

function forceInit() {
  var force = d3.layout.force()
    .gravity(0)
    .links([])
    .nodes(d3Engine.data)
    .charge(function(d) { return d.dotSize * -1.5; })
    .size([d3Engine.width, d3Engine.height]);

  force.start();

  force.on("tick", function(e) {
    var k = .1 * e.alpha;

    d3Engine.data.forEach(function(o,i) {
      o.y += (d3Engine.foci[o.stars*2].y - o.y) * k;
      o.x += (d3Engine.foci[o.stars*2].x - o.x) * k;
      d3Engine.chart.selectAll("g.node")
        .attr("transform", function(d) { 
          return "translate(" + d.x + "," + d.y + ")";
        });
    });
  });
}

// ---------------------------------


module.exports = d3Engine;


