import React, { useState } from "react";
import _isEmpty from "lodash/isEmpty";
import _isFunction from "lodash/isFunction";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Visible from "../Visible";
import SvgComponent from "../SvgComponent";
import { ASSET_STATUS, DEFAULT_IMAGE } from "../../../utils/constants";
import { constructImageUrl } from "../../../utils/helpers";
import { stringify, parse } from "qs";
import { Link } from "react-router-dom";
import "./AssetCardImages.scss";

const AssetCardImages = ({
	image,
	totalImages,
	spinCar,
	auctionId,
	assetId,
	isWatchListed,
	isLoggedIn,
	toggleLogin,
	addToWatchlist,
	status,
	onClick,
	spincarClick,
	showSlider = true,
	getAssetImages,
	searchCrietria,
	groupName,
	setDetailsAsset,
	auctionNum,
	consignmentNo,
	assetStatusClosed,
}) => {
	const [assetImages, setAssetImages] = useState([]);
	const [imageIndex, setImageIndex] = useState(0);
	const [watchList, setWatchList] = useState(isWatchListed);
	const getImages = () => {
		if (_isEmpty(assetImages) && totalImages > 1) {
			getAssetImages(assetId).then((res) => {
				// set index of 0 to the featured image
				// so the image appears first
				res.result.forEach((element, i) => {
					if (element.imageUrl == image) {
						const img_obj = res.result.splice(i, 1)[0];
						res.result.splice(0, 0, img_obj); // move featured images to the top of the list, array 0
					}
				});
				setAssetImages(res.result);
			});
		}
	};

	const onLeftArrow = (e) => {
		e.stopPropagation();
		e.preventDefault();
		getImages();
		const nextIndex = imageIndex - 1;
		setImageIndex(nextIndex < 0 ? totalImages - 1 : nextIndex);
	};

	const onRightArrow = (e) => {
		e.stopPropagation();
		e.preventDefault();
		getImages();
		const nextIndex = imageIndex + 1;
		setImageIndex(nextIndex >= totalImages ? 0 : nextIndex);
	};

	const triggerAddToWatchList = (e) => {
		setWatchList(!watchList);
		if (_isFunction(addToWatchlist)) {
			addToWatchlist({ assetId, watchList });
		}
	};

	const onAddToWatchList = (e) => {
		e.stopPropagation();
		e.preventDefault();
		if (!isLoggedIn) {
			toggleLogin(true, triggerAddToWatchList);
		} else {
			triggerAddToWatchList(e);
		}
	};
	const getUrlLink = () => {
		let query = {
			pathname: `/asset`,
			search: stringify({
				auctionNum: auctionNum,
				consignmentNo: consignmentNo,
			}),
			state: { searchCrietria, groupName },
		};
		return query;
	};
	let imageUrl = image;
	if (!_isEmpty(assetImages)) {
		imageUrl = assetImages[imageIndex].imageUrl;
	}

	const setDetails = () => {
		setDetailsAsset(assetId);
	};

	return (
		<div className="asset-card-images assetGridCard__images">
			<Link to={getUrlLink}>
				<Card.Img
					variant="top"
					onClick={() => setDetails()}
					loading="lazy"
					src={imageUrl ? imageUrl : DEFAULT_IMAGE}
					onLoad={(e) => constructImageUrl(imageUrl, e.target)}
				/>
			</Link>
			<Visible when={!assetStatusClosed && addToWatchlist}>
				<Button
					variant="outline-primary"
					className={`watch-list ${watchList === true && "active"}`}
					onClick={(e) => onAddToWatchList(e)}
				>
					{watchList === true ? <SvgComponent path="star-filled" /> : <SvgComponent path="star_border" />}
				</Button>
			</Visible>
			<Visible when={!!spinCar}>
				<Button
					variant="outline-warning"
					className="spin-car"
					onClick={spincarClick}
				>
					<SvgComponent path="spin-car" />
				</Button>
			</Visible>
			{showSlider && (
				<>
					{Number(totalImages) === 0 && !imageUrl ? (
						<p> No images</p>
					) : (
						<>
							<Button className="arrowLeft" onClick={(e) => onLeftArrow(e)}>
								<SvgComponent path="arrow-prev" />
							</Button>
							
							<Button className="arrowRight" onClick={(e) => onRightArrow(e)}>
								<SvgComponent path="arrow-next" />
							</Button>
							</>
					)}
				</>
			)}
		</div>
	);
};

export default AssetCardImages;
