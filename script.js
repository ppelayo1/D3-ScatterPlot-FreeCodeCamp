//constants
const URL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

const CONSTANTS = {
    URL:URL,
    SVG_WRAPPER_ID:'#graphWrapper',
    HEIGHT:400,
    WIDTH:900,
    LEFT_PADDING:60, //the ammount of padding from the left of the graph
    TOP_PADDING:20, //Amount of padding from the top of the graph
    RIGHT_PADDING:30, //The amount of padding from the right of the graph
    BOTTOM_PADDING:20, //The amount of padding from the bottom of the graph
    DOPER:'red',       //Color if rider was a suspected doper
    CLEAN:'blue'       //Color if the rider was not a suspected doper
};

function main (data){
    //make the http request
    let inputData = Object.assign({},data);  
    
    //build the toolTip
    buildToolTip();
    
    //build the graph
    buildGraph(inputData);
    
    //Display more info text
    buildLegend();
    

};

(function makeHttpRequest(){
    let url = CONSTANTS.URL;
    let data = '';
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function (){
        if(this.readyState == 4 && this.status == 200){
            data = xhttp.responseText;
            main(JSON.parse(data));
        }
    }

    xhttp.open('GET',url,true);
    xhttp.send();
    
    
}());

function buildLegend(){
    let x1 = 600;
    let y1 = 150;
    let x2 = 580;
    let y2 = 200;
    let boxWidth = 17;
    let boxHeigth = 17;
    let doper = CONSTANTS.DOPER;
    let clean = CONSTANTS.CLEAN;
    
    //alleged dopers
    let g = d3.select('svg').append('g');
    
    g.append('text')
        .text('Riders alleged to be doping:')
        .attr('id','moreInfo')
        .attr('x',0)
        .attr('y',0);
    g.append('rect')
        .attr('x',190)
        .attr('y',-12)
        .style('fill',doper)
        .attr('width',boxWidth)
        .attr('height',boxHeigth);
    g.attr('transform','translate(' + x1 +',' + y1 +')')
    g.attr('id','legend');
    g.attr('class','legend');
    
    //cleanRiders
    g = d3.select('svg').append('g');
    
    //alleged dopers
    g.append('text')
        .text('Riders not alleged to be doping')
        .attr('id','moreInfo')
        .attr('x',0)
        .attr('y',0);
    g.append('rect')
        .attr('x',210)
        .attr('y',-12)
        .style('fill',clean)
        .attr('width',boxWidth)
        .attr('height',boxHeigth);
    g.attr('transform','translate(' + x2 +',' + y2 +')')
    g.attr('id','legend');
    g.attr('class','legend');
}

//builds a toolTip, places a div on the body
function buildToolTip(){
    d3.select('body')
    .append('div')
    .attr('id','tooltip')
    .style('opacity',0);
}

function buildGraph(data){
    let dataSet = [];
    
    //build an array of the data
    for(let x in data){
        dataSet.push(data[x]);
    }
    
    //build the svg element
    d3.select('#graphWrapper')
        .append('svg')
        .attr('width',CONSTANTS.WIDTH)
        .attr('height',CONSTANTS.HEIGHT);
    
    
    
    //build the scales
    let scales = buildScales(dataSet);
    
    //build the axis
    buildAxis(dataSet,scales.xScaleAxis,scales.yScaleAxis);
    
    //build the points on the graph
    buildPoints(dataSet,scales.xScaleData,scales.yScaleData);
}

function buildPoints(dataSet,xScaleData,yScaleData){
    let svg= d3.select('svg');
    let doper = CONSTANTS.DOPER;
    let clean = CONSTANTS.CLEAN;
    
    svg.selectAll('circle')
        .data(dataSet)
        .enter()
        .append('circle')
        .attr('class','dot')
        .attr('data-xvalue',d=>d.Year)
        .attr('data-yvalue',d=>buildDate(d.Seconds))
        .attr('cx',d=>xScaleData(new Date(d.Year,0)))
        .attr('cy',d=>yScaleData(buildDate(d.Seconds)))
        .attr('r',5)
        .style('fill',(d)=>{
 
            if(d.Doping != ''){
                return doper;
            }
            else{
                return clean;
            }
        })
        .on('mouseover',addToolTip)
        .on('mouseout',removeToolTip)
}

//builds and places the axis
function buildAxis(dataSet,xScaleAxis,yScaleAxis){
    let svg= d3.select('svg');
    let formatString = '%M:%S';
    
    let xAxis = d3.axisBottom(xScaleAxis);
    let yAxis = d3.axisLeft(yScaleAxis);
    yAxis.tickFormat(d3.timeFormat(formatString));
    
    svg.append('g')
        .attr('id','x-axis')
        .attr('transform','translate(0,'+ (CONSTANTS.HEIGHT - CONSTANTS.BOTTOM_PADDING) +')')
        .call(xAxis);
    
    svg.append('g')
        .attr('id','y-axis')
        .attr('transform','translate('+CONSTANTS.LEFT_PADDING +','+ (0) +')')
        .call(yAxis);
}
function buildScales(dataSet){
    let yearOffSet = 1;
    let secondOffSet = 1;

    //data x scale
    let xScaleData = d3.scaleTime();
    xScaleData.domain([new Date(d3.min(dataSet,d=>d.Year - yearOffSet),0),new Date(d3.max(dataSet,d=>d.Year + yearOffSet),0)]);
    xScaleData.range([CONSTANTS.LEFT_PADDING,CONSTANTS.WIDTH - CONSTANTS.RIGHT_PADDING]);
    
    //axis x scale
    let xScaleAxis = xScaleData;
    //data y scale
    
    let yScaleData = d3.scaleTime();
    yScaleData.domain([buildDate(d3.min(dataSet,d=>(d.Seconds - secondOffSet))),buildDate(d3.max(dataSet,d=>d.Seconds + secondOffSet))])
    yScaleData.range([CONSTANTS.BOTTOM_PADDING,CONSTANTS.HEIGHT - CONSTANTS.TOP_PADDING]);
    
    //axis y scale
    let yScaleAxis = yScaleData;

    return {
        xScaleData:xScaleData,
        yScaleData:yScaleData,
        xScaleAxis:xScaleAxis,
        yScaleAxis:yScaleAxis
    };
}

//helper functions

//adds the tool tip
function addToolTip(d){
    let toolTip = d3.select('#tooltip');
    let xPos = d3.event.clientX;
    let yPos = d3.event.clientY;
    let leftPadding = 20;
  
    toolTip.style('opacity',0.75);
    toolTip.attr('data-year',d.Year)
    toolTip.html(d.Name +':' + d.Nationality + '<br>Position:' + d.Place + ' in ' + d.Time + '<br><br>' + d.Doping);
    toolTip.style('left',d3.touches);
    toolTip.style('left',xPos + leftPadding + 'px');
    toolTip.style('top',yPos + 'px');
    toolTip.attr('data-date',d[0]);
}
//removes the tool tip
function removeToolTip(){
    let toolTip = d3.select('#tooltip');
    toolTip.style('opacity',0);
}

function buildDate(seconds){
    return new Date(2000,0,0,0,0,seconds);
}

