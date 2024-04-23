// set the dimensions and margins of the graph
var margin = {top: 10, right: 20, bottom: 30, left: 50},
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg2 = d3.select("#wordcloud").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svg3 = d3.select("#bubble").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//wordcloud and bubble
d3.csv("./stock.csv", function(data) {

    var sector_list = data.map(function(d) {return d["Sector"];});
    var unique_sector = Array.from(new Set(sector_list));
    var colorScale = d3.scaleOrdinal().domain(unique_sector).range(d3.schemeSet2)

    // wordcloud
    data.forEach(function(d) {
        d["Marketcap_r"] = d["Marketcap %"] * 20;
    });

    var marketcap = data.map(function(d) {
        return { text: d["Symbol"], size: d["Marketcap_r"], color: colorScale(d["Sector"])  };
    });

    var layout = d3.layout.cloud()
        .size([width, height])
        .words(marketcap)
        .font('Impact')
        .padding(3)
        .fontSize(function(d) { return d.size; })
        .on("end", draw);
    layout.start();

    function draw(words) {
        svg2.append("g")
            .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
            .selectAll("text")
            .data(words)
            .enter()
            .append("text")
            .style("font-size", function(d) { return d.size; })
            .style("fill", function(d) { return d.color; })
            .attr("text-anchor", "middle")
            .style("font-family", "Impact")
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text; });
    }

    // bubble
    // Add X axis
    var x = d3.scaleLinear()
        .domain([-25, 95])
        .range([ 0, width ]);
    svg3.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 480])
        .range([ height, 0]);
    svg3.append("g")
        .call(d3.axisLeft(y));
    // Add a scale for bubble size
    var z = d3.scaleLinear()
        .domain([1.834514e+10, 3.168000e+12])
        .range([1, 110]);

    // Add tooltip
    var tooltip = d3.select("#bubble")
        .append("div")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "steelblue")
        .style("border", "1px solid white")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("color", "white")
    var showTooltip = function(d) {
        tooltip
            .transition()
            .duration(200)
        tooltip
            .style("opacity", 0.75)
            .html(d['Symbol'] + '<br>' + d['Name'] + '<br>' + d['Sector'] + '<br>'
                + d['Price Annual Average Growth Rate'] + '<br>' + d['Price Average'])
            .style("left", (d3.event.pageX+10) + "px")
            .style("top", (d3.event.pageY+10) + "px")
    }
    var moveTooltip = function(d) {
        tooltip
            .style("left", (d3.event.pageX+10) + "px")
            .style("top", (d3.event.pageY+10) + "px")
    }
    var hideTooltip = function(d) {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
    }
    // Add dots
    svg3.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "bubbles")
        .attr("cx", function (d) { return x(d['Price Annual Average Growth Rate']); } )
        .attr("cy", function (d) { return y(d['Price Average']); } )
        .attr("r", function (d) { return z(d['Marketcap']); } )
        .style("fill",function (d) { return colorScale(d['Sector']); } )
        .on("mouseover", showTooltip )
        .on("mousemove", moveTooltip )
        .on("mouseleave", hideTooltip )
})