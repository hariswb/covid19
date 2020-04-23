import React from 'react'
import {useState, useEffect} from 'react'
import "./dashboard.css"


const News = (props)=>{

	const today = new Date()
	const twoWeeksBefore = new Date(today.getTime()-1.21e+9*2)

	const [news,setNews] = useState([])

	const query = props.countryData.language === "en"?
	{
		q: "+coronavirus"+ " AND " +"+"+props.countryData.name,
		from: twoWeeksBefore,
		to: today,
		language: "en",
		pageSize: 20
	}:
	{	
		q: "coronavirus" ,
		from: twoWeeksBefore,
		to: today,
		country: props.countryData.iso.toLowerCase()
	}
	
	async function fetchNews(){
		
		const NewsAPI = require('newsapi')
		const newsapi = new NewsAPI('4c389de1e74e4a8db25d6c977926348f')
		const response = await props.countryData.language==="en"?await newsapi.v2.everything(query): await newsapi.v2.topHeadlines(query)
		// const response = await newsapi.v2.everything(query)
		setNews(await response.articles)
	}

	useEffect(()=>{
		fetchNews(query);
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
				<h4>We're sorry, nothing to thow here</h4>
			</div>
		

	return(
		<div className={"newslist"}>
			{headlines.length>0?headlines:empty}
		</div>
	)
}

export default News