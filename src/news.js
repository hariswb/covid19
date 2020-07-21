import React from 'react'
import {useState, useEffect} from 'react'
import "./dashboard.css"


const News = (props)=>{

	function dateISO8601(dateobject){
		return [
			dateobject.getFullYear(), 
			dateobject.getMonth()+1, 
			dateobject.getDate()
			]
			.map(x=>x.toString()).join('-')
	}

	const today = dateISO8601(new Date())
	const twoWeeksAgo = dateISO8601(new Date(new Date().getTime()-1.21e+9*1))

	const [news,setNews] = useState([])

	async function fetchNews(){
		const proxyurl = "https://cors-anywhere.herokuapp.com/";
		const everythingUrl = 
					proxyurl +
					'http://newsapi.org/v2/everything?' +
		  		'q=+coronavirus'+ " AND "+"+"+props.countryData.name+"&"+
          'language=en&' +
          'pageSize=20&'+
          'from='+today+"&"+
          'to='+twoWeeksAgo+"&"+
          'apiKey=4c389de1e74e4a8db25d6c977926348f';

    const topheadlinesUrl =
					proxyurl +
    			'http://newsapi.org/v2/top-headlines?' +
		  		'country='+props.countryData.iso.toLowerCase()+'&'+
		  		'q=+coronavirus&'+ 
		  		'from='+today+"&"+
          'to='+twoWeeksAgo+"&"+
          'apiKey=4c389de1e74e4a8db25d6c977926348f';

          console.log(today,twoWeeksAgo)

		const req = new Request(props.countryData.language==="en"?everythingUrl:topheadlinesUrl);	
		let response = await fetch(req)
		let data = await response.json()
		setNews(await data.articles)
	}

	useEffect(()=>{
		fetchNews();
	},[props.countryData]);
	
	const headlines = 
		news
		.sort((a,b)=>new Date(b.publishedAt) - new Date(a.publishedAt))
		.map(article=>{
		return(
			<div className={"article"}>
				<h4 >
					<a href={article.url} target={"_blank"}>
						<strong>{article.title}</strong>
					</a>
				</h4>
				<span >{article.publishedAt.slice(0,10)}</span>
				<p>
					{article.description}
					<i>({article.source.name})</i>
				</p>
			</div>
			)
	})

	const empty = 
			<div className={"empty"}>
				<h4>We're sorry, news in that country's language is not available. Please use the english version. </h4>
			</div>
		
	
	return(
		<div className={"newslist"}>
			{headlines.length>0?headlines:empty}
		</div>
	)
}

export default News