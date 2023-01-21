import React, { useEffect, useState } from "react";
import "./FourTiles.scss";
import SvgComponent from "../SvgComponent";
import SVG from "react-inlinesvg";





const FourTiles = (apiResponse) => {

	const createMarkup = (data) => {
		return { __html: data }
	}

	return (
		<section>
			<div className="howItWorks">
				<div className="howItWorks__container">
					<div className="container container-xxl">
						<h2>How it works</h2>
						<div className="howItWorks__wrapper">
	
	{/* Map out items according to indexes */}

							<div className="howItWorks__item">
								<div className="howItWorks__item-header">
									{/* <SvgComponent path={ben1Icon} /> */}
									{/* <SVG cacheRequests={true} src={apiResponse.apiResponse.ben1Icon}/> */}
									<img src={apiResponse.apiResponse.ben1Icon} alt={apiResponse.apiResponse.ben1Heading} />
									<span>1</span>
								</div>
								<div className="howItWorks__item-content">
									<h6>{apiResponse.apiResponse.ben1Heading}</h6>
									{apiResponse.apiResponse.ben1Description && <div dangerouslySetInnerHTML={createMarkup(apiResponse.apiResponse.ben1Description)} ></div>}
								</div>
							</div>

							<div className="howItWorks__item">
								<div className="howItWorks__item-header">
									{/* <SvgComponent path="check_update" /> */}
									{/* <SVG cacheRequests={true} src={apiResponse.apiResponse.ben2Icon}/> */}
									<img src={apiResponse.apiResponse.ben2Icon} alt={apiResponse.apiResponse.ben2Heading} />
									<span>2</span>
								</div>
								<div className="howItWorks__item-content">
									<h6>{apiResponse.apiResponse.ben2Heading}</h6>
									{apiResponse.apiResponse.ben2Description && <div dangerouslySetInnerHTML={createMarkup(apiResponse.apiResponse.ben2Description)} ></div>}
								</div>
							</div>
							<div className="howItWorks__item">
								<div className="howItWorks__item-header">
									{/* <SvgComponent path="notification_update" /> */}
									{/* <SVG cacheRequests={true} src={apiResponse.apiResponse.ben3Icon}/> */}
									<img src={apiResponse.apiResponse.ben3Icon} alt={apiResponse.apiResponse.ben3Heading} />
									<span>3</span>
								</div>
								<div className="howItWorks__item-content">
									<h6>{apiResponse.apiResponse.ben3Heading}</h6>
									{apiResponse.apiResponse.ben3Description && <div dangerouslySetInnerHTML={createMarkup(apiResponse.apiResponse.ben3Description)} ></div>}
								</div>
							</div>
							<div className="howItWorks__item">
								<div className="howItWorks__item-header">
									{/* <SvgComponent path="thumb_update" /> */}
									{/* <SVG cacheRequests={true} src={apiResponse.apiResponse.ben4Icon}/> */}
									<img src={apiResponse.apiResponse.ben4Icon} alt={apiResponse.apiResponse.ben4Heading} />
									<span>4</span>
								</div>
								<div className="howItWorks__item-content">
								<h6>{apiResponse.apiResponse.ben4Heading}</h6>
									{apiResponse.apiResponse.ben4Description && <div  dangerouslySetInnerHTML={createMarkup(apiResponse.apiResponse.ben4Description)} ></div>}
								</div>
							</div>


						</div>
					</div>
				</div>
			</div>
		</section>



	)
};

export default FourTiles;

