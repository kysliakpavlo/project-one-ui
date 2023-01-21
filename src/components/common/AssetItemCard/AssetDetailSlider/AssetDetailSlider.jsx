import React, { useEffect, useState } from "react";
import _get from "lodash/get";
import _keys from "lodash/keys";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { splitWord } from "../../../../utils/helpers";
import SvgComponent from "../../SvgComponent";

import "./AssetDetailSlider.scss";

const AssetDetailSlider = ({ assetId, auctionId, getPartialAssetDetails }) => {
	const [details, setDetails] = useState(null);
	const [totlaSlides, setTotlaSlides] = useState(1);
	const [currentSlide, setCurrentSlide] = useState(1);

	useEffect(() => {
		getPartialAssetDetails({ assetId, auctionId }).then((res) => {
			setDetails(res.result);
			setTotlaSlides(res.totalRecords);
		});
	}, []);

	const onDecrement = () => setCurrentSlide(currentSlide - 1);
	const onIncrement = () => setCurrentSlide(currentSlide + 1);

	const key = _keys(details)[currentSlide - 1];
	const data = _get(details, key, null);

	return (
		<div className="asset-detail-slider">
			<div className="details">
				<div className="details-title">{splitWord(key)}</div>
				{data &&
					_keys(data).map((key) => (
						<Row className="details-row" key={key}>
							<Col className="details-label">{splitWord(key)}</Col>
							<Col className="details-value">
								{key === "highestBid"
									? data[key]?.toLocaleString("en-US", {
											style: "currency",
											currency: "USD",
											minimumFractionDigits: 0,
									  })
									: key === "odometer"
									? Number(data[key])?.toLocaleString() + " Showing"
									: data[key]}{" "}
							</Col>
						</Row>
					))}
			</div>
			<ButtonGroup className="nav-btns">
				<Button onClick={onDecrement} disabled={currentSlide <= 1}>
					<SvgComponent path="arrow-prev" />
				</Button>
				<span>
					{currentSlide} / {totlaSlides}
				</span>
				<Button onClick={onIncrement} disabled={currentSlide >= totlaSlides}>
					<SvgComponent path="arrow-next" />
				</Button>
			</ButtonGroup>
		</div>
	);
};

export default AssetDetailSlider;
