import React, { useState, useEffect, useCallback } from "react";
import _isEmpty from "lodash/isEmpty";
import { setAppTitle } from "../../../utils/helpers";
import SvgComponent from "../../common/SvgComponent";
import { useHistory } from "react-router-dom";
import Breadcrumb from "../../common/Breadcrumb";
import Container from "react-bootstrap/Container";
import "./AboutView.scss";
import PageBanner from "../../common/PageBanner";
import TextImagePanel from "../../common/TextImagePanel/TextImagePanel";
import FourTiles from "../../common/FourTiles/FourTiles";

const AboutView = ({ vendor, setLoading, getStaticPage, getCategoryGroups, pageConfigurations, getAboutUsContent }) => {
	const [apiResponse, setApiResponse] = useState({});

	useEffect(() => {
		if (!_isEmpty(vendor)) {
			setAppTitle("About Us", vendor.name);
		}
	}, [vendor]);

	useEffect(() => {
		console.log("run now");
		const t0 = performance.now();
		getAboutUsContent()
			.then((response) => {
				const t1 = performance.now();
				console.warn(`Call to getAboutUsContent took ${t1 - t0} milliseconds.`);
				console.log("About Us response", response);
				setApiResponse(response);
				setLoading(false);
			})
			.catch((error) => {
				const t1 = performance.now();
				console.error(`Call to getAboutUsContent took ${t1 - t0} milliseconds.`);
				console.log("Error getting content: About Us");
				setLoading(false);
			});
	}, []);

	const pages = [{ label: "Home", path: "/" }, { label: "About Slattery" }];

	return (
		<>
			<PageBanner title={"About Us"} />

			<Container>
				<Breadcrumb items={pages} />

				<TextImagePanel
					imageOrder={"left"}
					button={apiResponse?.section1Button}
					description={apiResponse?.section1Description}
					heading={apiResponse?.section1Heading}
					image={apiResponse?.section1Image}
				/>
			</Container>

			<FourTiles apiResponse={apiResponse ? apiResponse : ""} />

			<Container>
				<TextImagePanel
					imageOrder={"right"}
					button={apiResponse?.section2Button}
					description={apiResponse?.section2Description}
					heading={apiResponse?.section2Heading}
					image={apiResponse?.section2Image}
				/>
			</Container>
		</>
	);
};

export default AboutView;
