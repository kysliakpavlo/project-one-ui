import React, { useState, useEffect } from "react";
import _isEmpty from "lodash/isEmpty";
import { setAppTitle, toUrlString, preventEvent, fromUrlString } from "../../../utils/helpers";
import "./NewsView.scss";
import PredictiveSearchBar from "../../common/PredictiveSearchBar";
import StaticHeader from "../../common/StaticHeader";
import { useHistory } from "react-router-dom";
import { Stack, Skeleton } from "@mui/material";
import PageBanner from "../../common/PageBanner";
import Breadcrumb from "../../common/Breadcrumb";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";


const NewsView = ({ vendor, setLoading, isLoading, getStaticPost, pageConfigurations, getNews }) => {
	const [allNews, setNews] = useState([]);
	const history = useHistory();

	console.log('s loading', isLoading)

	useEffect(() => {
		if (!_isEmpty(vendor)) {
			setAppTitle("News", vendor.name);
		}
	}, [vendor]);

	// useEffect(() => {
	// 	pageConfigurations?.newsEighteen &&
	// 		getStaticPost(pageConfigurations?.newsEighteen)
	// 			.then((response) => {
	// 				// setNewsDetail(response.result);
	// 				setLoading(false);
	// 			})
	// 			.catch((err) => {
	// 				setLoading(false);
	// 			});
	// }, [pageConfigurations]);

	const navigateToRoute = (event) => {
		if (event.target.id === "header-logo") {
			history.push(`/`);
			window.location.reload();
		}
		// preventEvent(event);
		document.addEventListener("click", function (e) {
			if (e.target.id !== "header-logo") {
				e.preventDefault();
				let url = e.target.href;
				if (url) {
					if (fromUrlString(url).includes("finance")) {
						return history.push(`/finance`);
					}
					if (url.includes("product")) {
						let assetId = url.split("/")[4];
						let auctionId = url.split("/")[5];
						const obj = toUrlString({ assetId, auctionId });
						return history.push(`/asset?${obj}`);
					} else {
						url = url
							.split("/")
							.map((x) => x.replace(/www.slatteryauctions.com.au/g, "static.slatteryauctions.com.au"))
							.join("/");
						const obj = toUrlString({ url });
						if (e.target.className === "anchor-link") {
							return history.push(`/content-page?${obj}`);
						}
					}
				}
			}
		});
	};



	// useEffect(() => {
	// 	document.addEventListener("click", navigateToRoute);
	// 	return () => {
	// 		document.removeEventListener("click", navigateToRoute);
	// 	};
	// }, []);

	useEffect(() => {
		getNews()
			.then((response) => {
				console.log('GetNews Response: ', response);
				setNews(response);
				setLoading(false);
			})
			.catch((error) => {
				console.log({ message: 'getNewsError', error });
				setLoading(false);
			});
	}, []);

	const renderPost = (post) => {
		let tag = document.createElement("div");
		tag.innerHTML = post.content;
		let anchorTag = tag.getElementsByTagName("a");
		for (let aTag of anchorTag) {
			aTag.setAttribute("class", "anchor-link");
			aTag.setAttribute("target", "");
			let url = aTag.href;
			if (url.includes("finance")) {
				url = "/finance";
				aTag.setAttribute("href", url);
			} else if (url.includes("product")) {
				let assetId = url.split("/")[4];
				let auctionId = url.split("/")[5];
				const obj = toUrlString({ assetId, auctionId });
				url = `/asset?${obj}`;
				aTag.setAttribute("href", url);
			} else {
				url = aTag.href
					.split("/")
					.map((x) => x.replace(/www.slatteryauctions.com.au/g, "static.slatteryauctions.com.au"))
					.join("/");
				let title = url.split("/")[url.split("/").length - 1].toUpperCase().replace("-", " ");
				if (title === "") {
					title = aTag.innerText.toUpperCase() + aTag.innerText.slice(1);
				}
				const obj = toUrlString({ url, title: title });
				aTag.setAttribute("href", `/content-page?${obj}`);
			}
		}
		let imgTag = tag.getElementsByTagName("img");
		for (let item of imgTag) {
			let attr = item.getAttribute("src");
			attr = attr
				.split("/")
				.map((x) => x.replace(/www.slatteryauctions.com.au/g, "static.slatteryauctions.com.au"))
				.join("/");
			item.setAttribute("src", attr);
			let attrSet = item.getAttribute("srcset");
			if (attrSet !== null) {
				attrSet = attrSet
					.split("/")
					.map((x) => x.replace(/www.slatteryauctions.com.au/g, "static.slatteryauctions.com.au"))
					.join("/");
				item.setAttribute("srcset", attrSet);
			}
		}

		return tag.innerHTML;
	};

	const BlogPostSkeleton = () => {

		const imgStyles = {
			marginBottom: '10px',
			paddingBottom: '56.25%'
		};

		const titleStyles = {
			fontSize: '24px',
			marginBottom: '22px'
		};

		const pStyles = {
			marginBottom: '22px'
		};

		return (
			<>
				<div className="col-6">
					<Stack spacing={1} sx={{ marginBottom: '40px' }}>
						<Skeleton
							variant='rounded'
							sx={imgStyles}
						/>
						<Skeleton
							variant='text'
							sx={titleStyles}
						/>
						<Skeleton
							variant='text'
							sx={pStyles}
						/>
					</Stack>
				</div>
				<div className="col-6">
					<Stack spacing={1} >
						<Skeleton
							variant='rounded'
							sx={imgStyles}
						/>
						<Skeleton
							variant='text'
							sx={titleStyles}
						/>
						<Skeleton
							variant='text'
							sx={pStyles}
						/>
					</Stack>
				</div>
			</>
		);
	};

	return (
		<>
			<PageBanner title={'News'} />
			<Container>
				<Breadcrumb items={[{ label: "Home", path: "/" }, { label: "News" }]} />
				<Row>
					{isLoading && <BlogPostSkeleton />}
					{allNews &&
						allNews.map((post) => (
							<div className="col-6" key={post.id}>
								<div className="blogPost">
									<div className="blogPost__img">
										<a href={`news/${post.sfid}`} className="blogPost__link">
											<img src={post.image1} alt="" />
										</a>
									</div>
									<div className="blogPost__title"><h2>{post.name}</h2></div>
									<a href={`news/${post.sfid}`} className="blogPost__link">Read more</a>
								</div>
							</div>
						))}
				</Row>
			</Container>
		</>
	);
};

export default NewsView;
