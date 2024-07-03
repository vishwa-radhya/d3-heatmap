const width =1150;
const height =550;
const svgWidth = width-40;
const svgHeight = height -80;
const marginLeft=60;
const marginTop=20;
const legSvgWidth=450;
const legSvgHeight=80;
let fdata =[];
const loader = document.getElementById('loader');
const colors=['#2774B7','#6D8CA6','#9EC5CC','#C5E5EC','#EFED85','#E5C854','#E39015','#E35A15','#F1371F','#FFF'];

const container = d3.select('body')
                    .append('div')
                    .attr('class','container')
                    .style('width',width+'px')
                    .style('height',height+'px')
                    
container.append('text').text('Monthly Global Land-Surface Temperature')
                        .attr('class','title')
                        .attr('id','title');

container.append('text').text('1753 - 2015: base temparature 8.66℃')
                        .attr('class','sub-title').attr('id','description');

container.append('text').text('Months').attr('class','del')

const tooltip =container.append('div').attr('class','tooltip').attr('id','tooltip');

const svg = d3.select('div.container')
                .append('svg')
                .attr('width',svgWidth)
                .attr('height',svgHeight-110)
                .attr('class','svg')

container.append('text').text('Years');

const legendSvg =d3.select('div.container')
                    .append('svg')
                    .attr('class','legend')
                    .attr('width',legSvgWidth-50)
                    .attr('height',legSvgHeight).attr('id','legend');

const legendTickValues=[2.8,3.9,5.0,6.1,7.2,8.3,9.5,10.6,11.7,12.8]

const legendAxisScale=d3.scaleLinear().domain([d3.min(legendTickValues)-1.8,d3.max(legendTickValues)+1.8]).range([0,legSvgWidth-80]);

const legendAxis=d3.axisBottom(legendAxisScale).tickValues(legendTickValues).tickFormat(d3.format('.1f'))

const tickPositions = legendTickValues.map(val=>legendAxisScale(val));

const gapBetweenLegendTicks = tickPositions.slice(1).map((pos,i)=>pos-tickPositions[i]);


legendSvg.append('g').call(legendAxis)
                    .attr('transform',`translate(20,${legSvgHeight-20})`);

const zeroArray= Array(9).fill(0);

legendSvg.selectAll('rect').data(zeroArray)
                            .enter()
                            .append('rect')
                            .attr('width',gapBetweenLegendTicks[0]+3.5)
                            .attr('height',20)
                            .attr('x',(d,i)=>i*30+69)
                            .attr('y',legSvgHeight-40)
                            .attr('fill',(d,i)=>colors[i]);

function constructHeatMap(){
    const yearArray = fdata.monthlyVariance.map(d=>d.year);

const tickValuesForYears = d3.range(d3.min(yearArray),d3.max(yearArray)).filter(d=>d%10===0);


const xAxisScale = d3.scaleLinear().domain([d3.min(yearArray),d3.max(yearArray)]).range([0,svgWidth-70]);


const xAxis = d3.axisBottom(xAxisScale).tickValues(tickValuesForYears).tickFormat(d3.format('d'));


svg.append('g').call(xAxis)
                .attr('transform',`translate(${marginLeft},${svgHeight-140})`).attr('id','x-axis');


const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const yAxisScale = d3.scaleBand().domain(months).range([0,svgHeight-160]);

const yAxis = d3.axisLeft(yAxisScale);

svg.append('g').call(yAxis).attr('transform',`translate(${marginLeft},${marginTop})`).attr('id','y-axis');



svg.selectAll('rect').data(fdata.monthlyVariance)
                    .enter()
                    .append('rect')
                    .attr('x',(d,_)=>xAxisScale(d.year)+marginLeft)
                    .attr('y',(d,_)=>yAxisScale(months[d.month-1])+20)
                    .attr('width',4)
                    .attr('data-month',(d,i)=>d.month)
                    .attr('data-year',(d,_)=>d.year)
                    .attr('data-temp',(d,_)=>fdata.baseTemperature+d.variance)
                    .attr('index',(_,i)=>i)
                    .attr('height',yAxisScale.bandwidth())
                    .attr('class','cell')
                    .attr('fill',(d,i)=>{
                        const difference = fdata.baseTemperature+(d.variance);
                        const diff=difference.toFixed(1);
                        if(diff>=2.9 && diff<=3.9){
                            return colors[0];
                        }
                        if(diff>=3.9 && diff<=5.0){
                            return colors[1];
                        }
                        if(diff>=5.0 && diff<=6.1){
                            return colors[2];
                        }
                        if(diff>=6.1 && diff<=7.2){
                            return colors[3];
                        }
                        if(diff>=7.2 && diff<=8.3){
                            return colors[4];
                        }
                        if(diff>=8.3 && diff<=9.5){
                            return colors[5];
                        }
                        if(diff>=9.5 && diff<=10.6){
                            return colors[6];
                        }
                        if(diff>=10.6 && diff<=11.7){
                            return colors[7];
                        }
                        if(diff>=11.7 && diff<=12.8){
                            return colors[8];
                        }
                        return colors[9]
                    }).on('mouseover',(e)=>{
                        
                        const i = e.target.getAttribute('index');
                        const temp =fdata.monthlyVariance[i];
                        const vr = temp.variance.toFixed(1);
                        const variance = vr.toString()[0] === '-' ? vr : '+'+vr.toString();
                        tooltip.html(
                            temp.year.toString()+' - '+months[temp.month-1]+'<br>'+eval(fdata.baseTemperature+temp.variance).toFixed(1)+'℃'+'<br>'+variance+'℃'
                        ).style('left',(e.pageX+10+'px')).style('top',(e.pageY-10+'px')).transition(800).style('opacity','0.9').attr('data-year',temp.year)
                    }).on('mouseout',()=>{
                        tooltip.transition(800).style('opacity','0')
                    })
}

window.onload=()=>{
    fetchData();
} 

async function fetchData(){
    loader.style.animation='spin 1s ease-in-out infinite';
    loader.style.display='block';
    try{
        const response =await fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json');
        fdata = await response.json();
        constructHeatMap();
        loader.style.animation='stop-spin';
        loader.style.display='none';
    }catch(e){
        console.log(e);
    }
}

