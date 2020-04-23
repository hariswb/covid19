import React from 'react'
import {scaleLinear,scaleLog, scaleTime} from 'd3-scale'
import {max,min} from 'd3-array'
import {select, selectAll, clientPoint} from 'd3-selection'
import {axisBottom, axisLeft} from 'd3-axis'
import {path} from 'd3-path'
import tip from 'd3-tip'
import * as d3 from 'd3'
import "./Chart.css"

class Chart extends React.Component{
	constructor(props){
		super(props)
		this.state = {
			position: ["oi"],
		}
		this.drawChart = this.drawChart.bind(this)
		this.handleMouse = this.handleMouse.bind(this)

	}

	componentDidMount(){
		this.drawChart()
	}
	componentDidUpdate(){
		this.drawChart()
	}
	drawChart(){
		const node = this.node
		const data = this.props.data
		const dataMax = max(data)
		const padding = this.props.padding
		const scale = this.props.scale
		const size = this.props.size
		const dates = this.props.dates


		//Scale
		
		const yScale = this.getYScale()

		const xScale = scaleTime()
			.domain([dates[0], dates[dates.length-1] ])
			.range([padding,size[0]-padding])
			.nice()
			.clamp(true)

		//Axes 

		const yAxis = axisLeft(yScale).ticks(5,"~s")

		const xAxis = axisBottom(xScale).ticks(10).tickFormat(d3.timeFormat("%b-%d"))
		
		//AXES


		select(node)
			.selectAll("g")
			.remove()

		select(node)
			.append("g")
			.attr("transform", "translate(0," + (size[1] - padding) + ")")
			.call(xAxis)
			.selectAll("text")
			.attr("transform", "rotate(315) translate(0,0)")
    		.style("text-anchor", "end")
    		.attr("class","axes")

		select(node)
			.append("g")
			.attr("transform", "translate("+padding+","+"0)")
			.call(yAxis)
			.selectAll("text")
    		.attr("class","axes")

		//LINE PATH

		select(node)
			.selectAll("path.line")
			.remove()

		const lineFunction = d3.line()
							   .y((d,i)=>yScale(d))
							   .x((d,i)=>xScale(dates[i]))

		select(node)
			.append("path")
			.attr("d",lineFunction(data))
			.attr("stroke",'black')
			.attr("stroke-width", "2")
			.attr("fill", "none")
			.attr("class","line")

		//CIRCLE ON RECTANGLE



		
		//CIRCLE MOUSE MOVE AND TOOLTIP

		const position = this.state.position

		const xInvert = xScale.invert(position[0])
		const bisect = d3.bisector(function(d) { return d; }).left
		const index = bisect(dates,xInvert)
		const i = index<data.length?index:data.length-1
		select(node)
			.append('g')
			.append('circle')
			.style('fill',"#ff9200ff")
			.attr("stroke","#222831")
			.attr("stroke-width","4")
			.attr('r',5)
			.attr("cy",()=>yScale(data[i]))
			.attr("cx",()=>xScale(dates[i]))
		
		const monthNames = ["January", "February", "March", "April", "May", "June",
  							"July", "August", "September", "October", "November", "December"];

		const theDate = new Date(dates[i])
		
		
		select(node)
      		.append("g")
      		.append('rect')
	    	.attr("alignment-baseline", "middle")
      		.attr("class","tooltip")
      		.attr("fill","#ff9200ff")
      		.attr("x", xScale(dates[i]))
      		.attr("y", yScale(data[i])-45)
      		.attr("rx",4)

		const tooltip = select(node).append('g')


		tooltip
	    	.append('text')
	    	.attr("text-anchor", "middle")
	    	.attr("alignment-baseline", "middle")
	    	.html(monthNames[(theDate.getMonth())] + ", " + theDate.getDate())
      		.attr("x", xScale(dates[i]))
      		.attr("y", yScale(data[i])-35)
      		.attr("class","date")

      	tooltip
      		.append('text')
      		.attr("text-anchor", "middle")
	    	.attr("alignment-baseline", "middle")
	    	.html(data[i])
      		.attr("x", xScale(dates[i]))
      		.attr("y", yScale(data[i])-15)
      		.attr("class","num")

      	

      	//RECTANGLE COVER

      	select(node)
		    .append('rect')
		    .style("fill", "none")
		    .style("pointer-events", "all")
		    .attr('width', size[0])
		    .attr('height', size[1])

		
	}


	getYScale(){
		const dataMax = max(this.props.data)
		const dataMin = min(this.props.data)

		const scale = this.props.scale
		const padding = this.props.padding
		const size = this.props.size


		switch(scale){
			case "linear":
				return scaleLinear()
						.domain([dataMin,dataMax])
						.range([size[1]-padding, padding]).nice()
				break;
			case "logarithmic":
				return scaleLog()
						.domain([1,1e6])
						.range([size[1]-padding, padding])
						.base(10);
		}
	}

	handleMouse(e){
		const position = clientPoint(e.target,e)
		this.setState({position: position})
	}



	render(){
		//console.log(this.node)
		return(
			<div>
				<svg 
					ref={node => this.node = node} 
					width={this.props.size[0]} 
					height={this.props.size[1]}
					onMouseMove={this.handleMouse}
					>
				</svg>
			</div>
			)
	}

}

export default Chart