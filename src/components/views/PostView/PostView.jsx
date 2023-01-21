import React, { useState, useEffect } from "react";
import _isEmpty from "lodash/isEmpty";
import { setAppTitle, toUrlString, preventEvent, fromUrlString } from "../../../utils/helpers";
import "./PostView.scss";
import PredictiveSearchBar from "../../common/PredictiveSearchBar";
import StaticHeader from "../../common/StaticHeader";
import { useHistory, useParams } from "react-router-dom";
import { PasswordStrengthField } from "../../common/FormField";
import { Stack, Skeleton } from "@mui/material";
import PageBanner from "../../common/PageBanner";
import Breadcrumb from "../../common/Breadcrumb";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

const PostView = ({ vendor, isLoading, setLoading, getSinglePost }) => {
	const { postName } = useParams();
	const [postContent, setPostContent] = useState([]);
	const history = useHistory();

	useEffect(() => {
		if (!_isEmpty(vendor)) {
			setAppTitle("News", vendor.name);
		}
	}, [vendor]);

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
		console.log("##########nTESTER single post", postName);

		getSinglePost(postName)
			.then((response) => {
				console.log("Get POST VIEW Response: ", response);
				setPostContent(response);
				setLoading(false);
			})
			.catch((error) => {
				console.log({ message: "getNewsError", error });
				setLoading(false);
			});
	}, [postName]);

	const renderPostOld = (post) => {
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

	const SinglePostSkeletong = () => {

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
		)
	};

	const renderPost = ({ name, bodyText }) => {
		return (
			<>
				<div
					className="blogPost"
					dangerouslySetInnerHTML={
						{
							__html: `<h1>${name}</h1>${bodyText}`
						}
					}
				></div>
			</>
		);
	};

	return (
		<>
			<PageBanner title="Post"/>
			<Container>
				<Breadcrumb items={[
					{ label: "Home", path: "/" },
					{ label: "News" }
				]} />
					<div className="news-content">
						{isLoading && <SinglePostSkeletong />}
						{postContent && renderPost(postContent)}
					</div>
			</Container>
		</>
	);
};

export default PostView;
