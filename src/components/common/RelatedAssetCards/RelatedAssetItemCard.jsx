import { React, useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Visible from "../Visible";
import SvgComponent from "../SvgComponent";
import DownloadAuctionDocuments from "../DownloadAuctionDocuments";
import { constructImageUrl, toAmount, getAssetLocation } from "../../../utils/helpers";
import { ASSET_STATUS, ASSET_TYPE, DEFAULT_IMAGE, MESSAGES } from "../../../utils/constants";

import "./RelatedAssetItemCard.scss";

const RelatedAssetItemCard = ({ relatedAsset, isLoggedIn, toggleLogin, showMessage, navigateToRelatedAsset, addToWatchlist }) => {
	const [isWatchListed, setWatchList] = useState(relatedAsset.isWatchListed);

	const triggerAddToWatchList = (e, isWatchListed) => {
		if (e && e.stopPropagation) {
			e.stopPropagation();
		}
		setWatchList(isWatchListed);
		const req = {
			assetId: relatedAsset.assetId,
		};
		if (relatedAsset?.auctionData?.auctionId) {
			req.auctionId = relatedAsset.auctionData.auctionId;
		}
		addToWatchlist(req).then(
			(res) => {
				showMessage({
					message: isWatchListed === true ? MESSAGES.ADD_WATCHLIST : MESSAGES.REMOVE_WATCHLIST,
				});
			},
			(error) => {
				showMessage({
					message: error.message,
					type: "error",
					duration: 2000,
				});
			}
		);
	};

	const onAddToWatchList = (e, isWatchListed) => {
		e.stopPropagation();
		e.preventDefault();
		if (!isLoggedIn) {
			toggleLogin(true, () => triggerAddToWatchList(e, isWatchListed));
		} else {
			triggerAddToWatchList(e, isWatchListed);
		}
	};

	return (
		<Card className="related-asset-item-card no-hover">
			<Card.Img
				onClick={() => navigateToRelatedAsset(relatedAsset?.consignmentNo, relatedAsset?.auctionData?.auctionNum)}
				variant="top"
				src={DEFAULT_IMAGE}
				onLoad={(e) =>
					relatedAsset.assetImages && relatedAsset.assetImages && relatedAsset.assetImages.length && constructImageUrl(relatedAsset.assetImages[0].imageUrl, e.target)
				}
			/>

			<Card.Body className="asset-basic-details">
				<Row>
					<Card.Header>{relatedAsset.title}</Card.Header>
				</Row>
				<Row>
					<Col
						xs={4}
						className="detail"
					>
						{/* <OverlayTrigger placement="top" overlay={<Tooltip>{relatedAsset.lotNo}</Tooltip>}>
                            <div>
                                <SvgComponent path="lot-no" /> {relatedAsset.lotNo}
                            </div>
                        </OverlayTrigger> */}
						<div>
							<SvgComponent path="lot-no" /> {relatedAsset.lotNo}
						</div>
					</Col>
					<Col
						xs={8}
						className="detail"
					>
						{/* <OverlayTrigger placement="top" overlay={<Tooltip>{relatedAsset.assetAddress ? `${relatedAsset.assetAddress}` : null} </Tooltip>}>
                            <div>
                                <SvgComponent path="location" /> {getAssetLocation(relatedAsset)}
                            </div>
                        </OverlayTrigger> */}
						<div>
							<SvgComponent path="location" /> {getAssetLocation(relatedAsset)}
						</div>
					</Col>
				</Row>
				<Row>
					<Visible when={relatedAsset.assetType !== ASSET_TYPE.EOI && relatedAsset.assetType !== ASSET_TYPE.BUY_NOW}>
						<div className="related-asset-current-bid">
							Current Bid: <strong>${relatedAsset.currentBidAmount}</strong>
						</div>
					</Visible>
					<Visible when={relatedAsset.assetType === ASSET_TYPE.EOI}>
						<DownloadAuctionDocuments
							assetId={relatedAsset.assetId}
							auctionId={relatedAsset?.auctionData?.auctionId}
						/>
					</Visible>
				</Row>
				<Row>
					<Visible when={relatedAsset.assetType === ASSET_TYPE.BUY_NOW}>
						<Visible when={relatedAsset.assetType === ASSET_TYPE.BUY_NOW}>
							<div className="buy-now">
								<Button
									disabled={relatedAsset.status === ASSET_STATUS.UNDER_OFFER}
									variant="warning"
									className="btn-buynow"
									onClick={() => navigateToRelatedAsset(relatedAsset.assetId, relatedAsset?.auctionData?.auctionId)}
								>
									{/* <SvgComponent path="shopping-cart" /> */}
									{relatedAsset.status === ASSET_STATUS.UNDER_OFFER ? relatedAsset.status : ASSET_STATUS.BUY_NOW}
								</Button>

								<div className="btn-under">{toAmount(relatedAsset?.currentBidAmount)}</div>
							</div>
						</Visible>
					</Visible>
					<Visible when={relatedAsset.status && relatedAsset.status !== ASSET_STATUS.SOLD}>
						<Button
							variant="outline-primary"
							className={`watch-list  ${isWatchListed === true && "active"}`}
							onClick={(e) => onAddToWatchList(e, !isWatchListed)}
						>
							{isWatchListed && isLoggedIn ? <SvgComponent path="star-filled" /> : <SvgComponent path="star_border" />}
						</Button>
					</Visible>
				</Row>
			</Card.Body>
		</Card>
	);
};

export default RelatedAssetItemCard;
