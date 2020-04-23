import React from 'react';
import {useState, useEffect} from 'react'
import Chart from './chart.js';
import News from './news.js'
import "./dashboard.css"
import * as CountryISO from './country-codes.json'
import logo from './logo.svg';

function Graph() {
  	//FETCH API
  	//const url = 'https://covidapi.info/api/v1/country/IND/timeseries/2020-03-10/2020-03-19'
  	const d = new Date()
	const latestDate = [d.getFullYear(), d.getMonth()+1, d.getDate()].map(x=>x.toString()).join('-')
  	const url =`https://covidapi.info/api/v1/global/timeseries/2020-01-01/${latestDate}`
	
	const [data,setData] = useState({})	
	const [scale, setScale] =useState("linear")
	const [tab, setTab] = useState({linear:"selected", logarithmic:"",dailyCases:""})
	const [status, setStatus] = useState("confirmed")
	const [statusTab, setStatusTab] = useState({confirmed:"selected",deaths:"",recovered:""})
	const [country,setCountry] = useState("USA")	
	const [lang,setLang] = useState("en")
	const [langTab, setLangTab] = useState({en:"selected", local:""})
	const [dimensions, setDimensions] = useState({
		width: window.innerWidth * 0.6, 
		height: window.innerHeight *0.7
	})



	async function fetchUrl(){
		const response = await fetch(url);
		const responseJson = await response.json()
		const result = await responseJson.result
		const keys = await Object.keys(result)
		
		const t = {}
		for (const key of keys){
			const x = {	
						date: result[key].map(x=>new Date(x.date.concat(" 00:00:00"))),
						confirmed:result[key].map(x=>x.confirmed).filter(y=>y>0),
						deaths:result[key].map(x=>x.deaths).filter(y=>y>0),
						recovered:result[key].map(x=>x.recovered).filter(y=>y>0)}
			t[key] = x
		}
		setData(await t)
	}

	useEffect(()=>{
		fetchUrl(url);
	},[]);

	//LISTEN TO RESIZE

	function debounce(fn, ms) {
	  let timer
	  return _ => {
	    clearTimeout(timer)
	    timer = setTimeout(_ => {
	      timer = null
	      fn.apply(this, arguments)
	    }, ms)
	  };
	}

	useEffect(()=>{
		const debouncedHandleResize = debounce(function handleResize(){
			setDimensions({
				width: window.innerWidth *0.6,
				height: window.innerHeight *0.7
			})
		}, 1000)

		window.addEventListener('resize', debouncedHandleResize)

		return _ => {
      		window.removeEventListener('resize', debouncedHandleResize)
    	}
		
	})

	console.log(dimensions)
	

	//QUERY DATA
	const getNumbers = (id,query) =>{return data.IDN===undefined?[]:data[id][query]}
	const getDates = (id,query) =>{return getNumbers(id,"date").slice(getNumbers(id,"date").length-getNumbers(id,status).length)}
	
	function getCountryData (id,query){
		const obj = CountryISO.default.find(x=>x["ISO3166-1-Alpha-3"]===id)
		return obj === undefined?id:obj[query]
	}



	const numbers = getNumbers(country,status)
	const dates = getDates(country,status)
	const dailyNumbers = [0].concat(numbers).map((x,i,arr)=>arr[i+1]-arr[i])
		  dailyNumbers.pop()


	//MENU LIST
	const countries = Object.keys(data).map((x)=>{
								const numbers = getNumbers(x,"confirmed")
								const confirmedNumber = numbers[numbers.length-1]
								const countryName = getCountryData(x,"CLDR display name")
								return <div 
											className={"card"} 
											onClick={()=>setCountry(x)} 
											num={confirmedNumber}>
											<span>
												<p><strong>{confirmedNumber}  </strong> 
													<span>{countryName}</span>
												</p>
												
											</span>

										</div>
							})
							.sort((a,b)=>b.props.num-a.props.num)

	///console.log(numbers, dates)
  	const worldTotal =	Object.entries(data).map(item=>{
  			const num = item[1]["confirmed"]
  			return num[num.length-1]
  			}).reduce((a, b) => a + b, 0)
  	

  	//console.log(numbers,dates)

  	function setGraph(str){
  		switch(str){
  			case 'linear':
  				setScale("linear");
  				setTab({linear:"selected", logarithmic:"",dailyCases:""})
  				break;
  			case 'logarithmic':
  				setScale("logarithmic");
  				setTab({linear:"", logarithmic:"selected",dailyCases:""})
  				break;
  			case 'dailyCases':
  				setScale("dailyCases");
  				setTab({linear:"", logarithmic:"",dailyCases:"selected"})
  				break;
  		}
  	}

  	function setNews(str){
  		switch(str){
  			case 'en':
  				setLang('en');
  				setLangTab({en:"selected", local:""});
  				break;
  			case 'local':
  				setLang('local');
  				setLangTab({en:"", local:"selected"});
  				break;
  		}
  	}

  	function setStatusChart(str){
  		switch(str){
  			case 'confirmed':
  				setStatus('confirmed');
  				setStatusTab({confirmed:"selected",deaths:"",recovered:""});
  				break;
  			case 'deaths':
  				setStatus('deaths');
  				setStatusTab({confirmed:"",deaths:"selected",recovered:""});
  				break;
  			case 'recovered':
  				setStatus('recovered');
  				setStatusTab({confirmed:"",deaths:"",recovered:"selected"});
  				break;
  		}
  	}

  	// console.log(CountryISO.default)
  	// console.log(getCountryData(country,"ISO3166-1-Alpha-2"))

  	return(
      <div className={"dashboard"}>
      	<div className={"dashboard-head"}>
        	<img src={logo} className="App-logo" alt="logo"/>
        	<p>Covid-19 Dashboard</p>
      	</div>
      	<div className={"container"}>
      		<div className={"menu"}>
	 			<div className={"menu-title"}>
	 				<p>{worldTotal}</p>
	 				<span>Confirmed Cases In {Object.keys(data).length} Countries</span>
	 			</div>
	 			<div className={"countrylist"}>
	      			{countries}
	 			</div>
	      	</div>
      		<div className={"charts"}>
      			<div className={"desc"}>
      				<p>
      					{status.toUpperCase()} CASES OF {getCountryData(country,"CLDR display name").toUpperCase()}
      				</p>
      			</div>
      			<div className={"chart"}>
      				<Chart data={scale==='dailyCases'?dailyNumbers:numbers} 
      						dates={dates} 
      						size={[dimensions.width,dimensions.height]} 
      						padding={50} 
      						scale={scale==="dailyCases"?"linear":scale}/>
      			</div>
      			<div className={"tab"}>
      				<ul className={"tabrow"}>
	      				<li className={tab.linear} onClick={()=>setGraph("linear")}>Linear</li>
	      				<li className={tab.logarithmic} onClick={()=>setGraph("logarithmic")} >Logarithmic</li>
	      				<li className={tab.dailyCases} onClick={()=>setGraph("dailyCases")}>Daily Cases</li>
      				</ul>
      				<ul className={"tabrow tabstatus"}>
	      				<li className={statusTab.recovered} onClick={()=>setStatusChart("recovered")}>recovered</li>
	      				<li className={statusTab.deaths} onClick={()=>setStatusChart("deaths")} >Deaths</li>
	      				<li className={statusTab.confirmed} onClick={()=>setStatusChart("confirmed")}>Confirmed</li>
      				</ul>
      			</div>
      		</div>

      		<div className={"news"}>
      			<div className={"desc"}>
      				<p>
	      				News
      				</p>
      			</div>
      			<News latestDate={latestDate}
      					countryData={{name: getCountryData(country,"CLDR display name"), 
      									iso:getCountryData(country,"ISO3166-1-Alpha-2"),
      									language:lang
      								}}
      			/>
      			<div className={"tab"}>
      				<ul className={"tabrow"}>
						<li className={langTab.local} onClick={()=>setNews("local")}>LOCAL</li>
						<li className={langTab.en} onClick={()=>setNews("en")}>EN</li>
					</ul>
      			</div>
      		</div>
      	</div>
      </div>
    )
}

export default Graph;

     			
