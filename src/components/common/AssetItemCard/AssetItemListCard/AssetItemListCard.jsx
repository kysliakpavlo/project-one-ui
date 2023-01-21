import React from "react";
import dayjs from "dayjs";
import _get from "lodash/get";
import _has from "lodash/has";
import { useHistory } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import AssetCardImages from "../../AssetCardImages";
import CountdownTimer from "../../CountdownTimer";
import ReserveMet from "../../ReserveMet";
import Visible from "../../Visible";
import NotifyMe from "../../NotifyMe";
import SvgComponent from "../../SvgComponent";
import DownloadAuctionDocuments from "../../DownloadAuctionDocuments";
import { ASSET_STATUS, ASSET_TYPE, AUCTION_TYPES_MAP, AUCTION_TYPES, MESSAGES } from "../../../../utils/constants";
import { isInRoom, toAmount, toUrlString, preventEvent, encrypt } from "../../../../utils/helpers";

import "./AssetItemListCard.scss";

const AssetItemListCard = ({
	item,
	isLoggedIn,
	toggleLogin,
	loggedInUser,
	className,
	showMessage,
	onAddToWatchList,
	onCompleteTimer,
	currentDetails,
	notifyMeContainer,
	notificationUpdate,
	onCardShowAction,
	openAssetDetails,
	getBidValues,
	searchCrietria,
	groupName,
	setDetailsAsset,
	handleClickOutside,
}) => {
	const history = useHistory();
	const closeTime = dayjs(item.datetimeClose);
	const startTime = dayjs(item.auctionData.datetimeOpen);
	const now = dayjs().add(2, "seconds");
	const isStarted = item && item.auctionData && dayjs(item.auctionData.datetimeOpen).diff(dayjs(), "milliseconds") <= 0;

	const auctionType = _get(item, "auctionData.auctionType.name");
	const assetStatusClosed = item?.status === ASSET_STATUS.SOLD || item?.status === ASSET_STATUS.REFERRED || item?.status === ASSET_STATUS.PASSED_IN;
	const classes = [className];
	if (closeTime <= now || assetStatusClosed) {
		classes.push("closed-asset");
	} else if (!isStarted) {
		classes.push("opening-soon-asset");
	} else if (item.isExtended && !assetStatusClosed) {
		classes.push("bonus-time-card");
	}

	let dateTag;
	let timeTag;
	let statusTag;

	if (!isStarted) {
		statusTag = "Opening Soon";
		dateTag = startTime.format("DD MMM");
		timeTag = `Starts : ${startTime.format("hh:mm A")} ${item.auctionData?.timezoneName || ""}`;
	} else if (closeTime <= now) {
		statusTag = "Closed";
		dateTag = closeTime.format("DD MMM");
		timeTag = `Ends : ${closeTime.format("hh:mm A")} ${item?.auctionData?.timezoneName || ""}`;
	}

	const joinLiveAuction = (e) => {
		preventEvent(e);
		const itemObj = toUrlString({
			auctionId: item.auctionData?.auctionId,
			timeZone: item.timezoneName,
			location: item.state?.name,
			auctionName: item.auctionName,
			auctionNumber: item.auctionNum,
			startDate: item.datetimeOpen,
			endDate: item.datetimeClose,
		});
		if (loggedInUser && loggedInUser.role === "Admin") {
			history.push(`/admin-console/${encrypt(item.auctionData?.auctionId)}`);
		} else if (!isLoggedIn) {
			toggleLogin(true, () => callTermsCondition(itemObj, item.termsAgreed, item.auctionData?.auctionId));
		} else {
			getBidValues({
				assetId: item.assetId,
				auctionId: item.auctionData?.auctionId,
			}).then((res) => {
				if (loggedInUser && !loggedInUser.cardExist) {
					showMessage({ message: MESSAGES.CARD_MISSING, type: "error" });
					history.push(`/profile?onComplete=/terms-condition?${itemObj}`);
				} else if (res && res.result && res.result.termsAgreed) {
					history.push(`/simulcast-auction/${encrypt(item.auctionData?.auctionId)}`);
				} else {
					callTermsCondition(itemObj, item.termsAgreed, item.auctionData?.auctionId);
				}
			});
		}
	};

	const callTermsCondition = (item, terms, auctionId) => {
		if (loggedInUser && loggedInUser.role === "Admin") {
			history.push(`/admin-console/${encrypt(auctionId)}`);
		} else if (loggedInUser && !loggedInUser.cardExist) {
			showMessage({ message: MESSAGES.CARD_MISSING, type: "error" });
			history.push(`/profile?onComplete=/terms-condition?${item}`);
		} else if (!terms) {
			history.push(`/terms-condition?${item}`);
		} else if (isLoggedIn) {
			history.push(`/simulcast-auction/${encrypt(auctionId)}`);
		}
	};

	const isNotifyAllowed = statusTag !== "Closed" && !(isStarted && AUCTION_TYPES_MAP[item.auctionData?.auctionType?.name] === AUCTION_TYPES.IN_ROOM);

	return (
		// <Card
		//   className={`asset-item-list-card no-hover ${classes.join(" ")}`}
		//   onClick={(e) => handleClickOutside(e)}
		// >
		//   <Card.Title>
		//     <OverlayTrigger
		//       placement="top"
		//       overlay={<Tooltip>{item.title}</Tooltip>}
		//     >
		//       <span className="text-truncate">{item.title}</span>
		//     </OverlayTrigger>
		//     <div className="asset-basic-details">
		//       <Visible when={_get(item, "transmission")}>
		//         <OverlayTrigger
		//           placement="top"
		//           overlay={<Tooltip>{item?.transmission}</Tooltip>}
		//         >
		//           <div className="detail">
		//             <SvgComponent path="sync-alt" />
		//             {item?.transmission}
		//           </div>
		//         </OverlayTrigger>
		//       </Visible>
		//       <Visible when={_get(item, "odoMeter")}>
		//         <OverlayTrigger
		//           placement="top"
		//           overlay={
		//             <Tooltip>
		//               KM: {Number(item?.odoMeter).toLocaleString()}
		//               {" Showing"}
		//             </Tooltip>
		//           }
		//         >
		//           <div className="detail">
		//             <SvgComponent path="direction-car" />
		//             KM: {Number(item?.odoMeter).toLocaleString()}
		//             {" Showing"}
		//           </div>
		//         </OverlayTrigger>
		//       </Visible>
		//       <Visible when={_get(item, "lotNo")}>
		//         <OverlayTrigger
		//           placement="top"
		//           overlay={<Tooltip>Lot: {item?.lotNo}</Tooltip>}
		//         >
		//           <div className="detail">
		//             <SvgComponent path="lot-no" />
		//             Lot: {item?.lotNo}
		//           </div>
		//         </OverlayTrigger>
		//       </Visible>
		//       <OverlayTrigger
		//         placement="top"
		//         overlay={
		//           <Tooltip>
		//             {item.assetSuburbState
		//               ? _get(item, "assetSuburbState", "")
		//               : `${_get(item, "city.name", "")}, ${_get(
		//                   item,
		//                   "state.name",
		//                   ""
		//                 )}`}
		//           </Tooltip>
		//         }
		//       >
		//         <div className="detail">
		//           <SvgComponent path="location" />
		//           {item.assetSuburbState
		//             ? _get(item, "assetSuburbState", "")
		//             : `${_get(item, "city.name", "")}, ${_get(
		//                 item,
		//                 "state.name",
		//                 ""
		//               )}`}
		//         </div>
		//       </OverlayTrigger>
		//     </div>
		//   </Card.Title>
		//   <Card.Body className="asset-details-section">
		//     <AssetCardImages
		//       isLoggedIn={isLoggedIn}
		//       toggleLogin={toggleLogin}
		//       spinCar={item.spincar}
		//       image={item.assetImageUrl}
		//       totalImages={item.totalAssetImages}
		//       auctionNum={item?.auctionData?.auctionNum}
		//       consignmentNo={item?.consignmentNo}
		//       isWatchListed={item.isWatchListed}
		//       assetStatusClosed={assetStatusClosed}
		//       isExtended={item.isExtended}
		//       addToWatchlist={(data) =>
		//         onAddToWatchList({
		//           ...data,
		//           auctionId: item?.auctionData?.auctionId,
		//         })
		//       }
		//       assetId={item.assetId}
		//       auctionId={item?.auctionData?.auctionId}
		//       className="asset-image"
		//       status={item.status}
		//       onClick={openAssetDetails}
		//       spincarClick={(e) => onCardShowAction(e, "spin-car", item)}
		//       searchCrietria={searchCrietria}
		//       groupName={groupName}
		//       setDetailsAsset={setDetailsAsset}
		//     />
		//     <div className="asset-details">
		//       <div className="d-flex justify-content-between">
		//         <div className="asset-info">
		//           <div className="asset-details-cateogory">{item.title}</div>
		//           <div className="asset-details-description">
		//             {item.description}
		//           </div>
		//         </div>
		//         <Visible
		//           when={
		//             item.assetType !== ASSET_TYPE.BUY_NOW && !item.auctionData.isEOI
		//           }
		//         >
		//           <Card.Text as="div" className="time-remaining">
		//             <CountdownTimer
		//               bonusTime={item.isExtended}
		//               time={!assetStatusClosed ? item.datetimeClose : dayjs()}
		//               onComplete={onCompleteTimer.bind(null, item)}
		//             />
		//           </Card.Text>
		//         </Visible>
		//       </div>
		//       <Row className={`detail-actions auction-type-${auctionType}`}>
		//         <Visible when={statusTag}>
		//           <div className="status-tag">
		//             <div className="label">{statusTag}</div>
		//             <div>
		//               <SvgComponent path="gavel_black_24dp" />
		//               <span className="date-tag"> {dateTag} </span>
		//               <span>{timeTag}</span>
		//             </div>
		//           </div>
		//         </Visible>
		//         <div className="reserve-met-section">
		//           <Visible
		//             when={!item.auctionData.isEOI && item.showReserveOnSearch}
		//           >
		//             <p> {item.reserveMet ? "Reserve Met" : "Reserve Not Met"}</p>
		//             <ReserveMet percent={item.reservePercentage} />
		//           </Visible>
		//         </div>
		//         <div className="d-flex align-items-end">
		//           <Visible when={!item.auctionData.isEOI && !isInRoom(auctionType)}>
		//             {item.assetType === ASSET_TYPE.BUY_NOW ? (
		//               <div className="buy-now">
		//                 <div className="current-bid">
		//                   <strong>{toAmount(item.listedPrice)}</strong>
		//                 </div>
		//                 <Button
		//                   className="btn-buy-now"
		//                   variant="warning"
		//                   disabled={item.status === ASSET_STATUS.UNDER_OFFER}
		//                   onClick={openAssetDetails}
		//                 >
		//                   <SvgComponent path="shopping-cart" />
		//                   {item.status === ASSET_STATUS.UNDER_OFFER
		//                     ? item.status
		//                     : ASSET_STATUS.BUY_NOW}
		//                 </Button>
		//               </div>
		//             ) : closeTime <= now ||
		//               item.currentBidAmount ||
		//               item.startingBid ? (
		//               <div className="current-bid">
		//                 {closeTime <= now || assetStatusClosed ? (
		//                   <strong>Bidding Closed</strong>
		//                 ) : item.currentBidAmount ? (
		//                   <span>
		//                     <span>Current Bid: </span>
		//                     <strong>{toAmount(item.currentBidAmount)}</strong>
		//                   </span>
		//                 ) : item.startingBid ? (
		//                   <span>
		//                     <span>Starting Bid: </span>
		//                     <strong>{toAmount(item.startingBid)}</strong>
		//                   </span>
		//                 ) : null}
		//               </div>
		//             ) : null}
		//           </Visible>
		//           <Visible when={item.auctionData.isEOI}>
		//             <DownloadAuctionDocuments
		//               assetId={item.assetId}
		//               auctionId={item.auctionData.auctionId}
		//             />
		//           </Visible>
		//           <div className="full-details">
		//             <Button onClick={openAssetDetails}>Full Details</Button>
		//           </div>
		//         </div>
		//       </Row>
		//     </div>
		//   </Card.Body>
		//   <Visible
		//     when={!item.auctionData.isEOI && item.assetType !== ASSET_TYPE.BUY_NOW}
		//   >
		//     <Card.Body className="asset-actions-section">
		//       <Visible
		//         when={
		//           !item.auctionData.isEOI &&
		//           item.assetType !== ASSET_TYPE.BUY_NOW &&
		//           isNotifyAllowed
		//         }
		//       >
		//         <NotifyMe
		//           assetId={item.assetId}
		//           container={notifyMeContainer}
		//           onNotifyMeToggle={(e) => onCardShowAction(e, "notifyme", item)}
		//           auctionId={item.auctionData.auctionId}
		//           notificationUpdate={notificationUpdate}
		//           notifiedUser={item.isNotified}
		//           view="horizontal"
		//           className={currentDetails === "notifyme" && "selected"}
		//           dataTimeClose={item.datetimeClose}
		//         />
		//       </Visible>
		//       <Button
		//         onClick={(e) => onCardShowAction(e, "bid-history", item)}
		//         className={`slt-dark ${
		//           currentDetails === "bid-history" && "selected"
		//         }`}
		//       >
		//         Bid History
		//       </Button>
		//       <Button
		//         onClick={(e) => onCardShowAction(e, "details", item)}
		//         className={`slt-dark ${currentDetails === "details" && "selected"}`}
		//       >
		//         Details
		//       </Button>
		//       {/* <Button
		//         onClick={(e) => onCardShowAction(e, "freight-cal", item)}
		//         className={`slt-dark ${
		//           currentDetails === "freight-cal" && "selected"
		//         }`}
		//       >
		//         Freight Cal.
		//       </Button> */}
		//       <Visible
		//         when={
		//           !item.auctionData.isEOI &&
		//           !assetStatusClosed &&
		//           !isInRoom(auctionType) &&
		//           startTime <= now &&
		//           closeTime >= now
		//         }
		//       >
		//         <div className="place-bid">
		//           <Button
		//             variant="warning"
		//             className={currentDetails === "placebid" && "selected"}
		//             onClick={(e) => onCardShowAction(e, "placebid", item)}
		//             block
		//           >
		//             Bid Now
		//           </Button>
		//           <Visible when={item.highestBidder}>
		//             <OverlayTrigger
		//               placement="right"
		//               overlay={
		//                 <Tooltip>You are currently the highest bidder.</Tooltip>
		//               }
		//             >
		//               <span className="highest-bidder-indicator">
		//                 <SvgComponent path="gavel" />
		//               </span>
		//             </OverlayTrigger>
		//           </Visible>
		//         </div>
		//       </Visible>
		//       <Visible when={item?.displayJoinAuction && closeTime >= now}>
		//         <Button
		//           className="join-live-btn"
		//           variant="warning"
		//           onClick={joinLiveAuction}
		//         >
		//           <SvgComponent path="gavel" />
		//           Join Live
		//         </Button>
		//       </Visible>
		//       <Visible
		//         when={
		//           !item.auctionData.isEOI &&
		//           !assetStatusClosed &&
		//           isInRoom(auctionType) &&
		//           startTime > now
		//         }
		//       >
		//         <div className="place-bid">
		//           <Button
		//             variant="warning"
		//             className={currentDetails === "placebid" && "selected"}
		//             onClick={(e) => onCardShowAction(e, "placebid", item)}
		//           >
		//             Absentee Bid
		//           </Button>
		//         </div>
		//       </Visible>
		//     </Card.Body>
		//   </Visible>
		// </Card>

		<Card
			className={`asset-item-list-card no-hover ${classes.join(" ")}`}
			onClick={(e) => handleClickOutside(e)}
		>
			<Card.Body className="asset-details-section">
				<Row>
					{/* First Column */}
					<Col md={5}>
						<AssetCardImages
							isLoggedIn={isLoggedIn}
							toggleLogin={toggleLogin}
							spinCar={item.spincar}
							image={item.assetImageUrl}
							totalImages={item.totalAssetImages}
							auctionNum={item?.auctionData?.auctionNum}
							consignmentNo={item?.consignmentNo}
							isWatchListed={item.isWatchListed}
							assetStatusClosed={assetStatusClosed}
							isExtended={item.isExtended}
							addToWatchlist={(data) =>
								onAddToWatchList({
									...data,
									auctionId: item?.auctionData?.auctionId,
								})
							}
							assetId={item.assetId}
							auctionId={item?.auctionData?.auctionId}
							className="asset-image"
							status={item.status}
							onClick={openAssetDetails}
							spincarClick={(e) => onCardShowAction(e, "spin-car", item)}
							searchCrietria={searchCrietria}
							groupName={groupName}
							setDetailsAsset={setDetailsAsset}
						/>
					</Col>

					{/* Second Column */}
					<Col md={5}>
						<div className="asset-details-cateogory">{item.title}</div>

						<div className="asset-basic-details">
							<Visible when={_get(item, "transmission")}>
								<div className="detail">
									<SvgComponent path="sync-alt" />
									{item?.transmission}
								</div>
							</Visible>
							<Visible when={_get(item, "odoMeter")}>
								<div className="detail">
									<SvgComponent path="direction-car" />
									KM: {Number(item?.odoMeter).toLocaleString()}
									{" Showing"}
								</div>
							</Visible>
							<Visible when={_get(item, "lotNo")}>
								<div className="detail">
									<SvgComponent path="lot-no" />
									Lot: {item?.lotNo}
								</div>
							</Visible>

							<div className="detail">
								<SvgComponent path="location" />
								{item.assetSuburbState ? _get(item, "assetSuburbState", "") : `${_get(item, "city.name", "")}, ${_get(item, "state.name", "")}`}
							</div>
						</div>
						<div className="d-flex align-items-end">
							<Visible when={!item.auctionData.isEOI && !isInRoom(auctionType)}>
								{item.assetType === ASSET_TYPE.BUY_NOW ? (
									<div className="buy-now">
										<div className="current-bid">
											<strong>{toAmount(item.listedPrice)}</strong>
										</div>
										<Button
											className="btn-buy-now"
											variant="warning"
											disabled={item.status === ASSET_STATUS.UNDER_OFFER}
											onClick={openAssetDetails}
										>
											<SvgComponent path="shopping-cart" />
											{item.status === ASSET_STATUS.UNDER_OFFER ? item.status : ASSET_STATUS.BUY_NOW}
										</Button>
									</div>
								) : closeTime <= now || item.currentBidAmount || item.startingBid ? (
									<div className="current-bid">
										{closeTime <= now || assetStatusClosed ? (
											<strong>Bidding Closed</strong>
										) : item.currentBidAmount ? (
											<span>
												<span>Current Bid: </span>
												<strong>{toAmount(item.currentBidAmount)}</strong>
											</span>
										) : item.startingBid ? (
											<span>
												<span>Starting Bid: </span>
												<strong>{toAmount(item.startingBid)}</strong>
											</span>
										) : null}
									</div>
								) : null}
							</Visible>
						</div>
						<div className="time-remaining-wrap">
							<Visible when={item.assetType !== ASSET_TYPE.BUY_NOW && !item.auctionData.isEOI}>
								<Card.Text
									as="div"
									className="time-remaining"
								>
									<p>Auction Ends in:</p>
									<CountdownTimer
										bonusTime={item.isExtended}
										time={!assetStatusClosed ? item.datetimeClose : dayjs()}
										onComplete={onCompleteTimer.bind(null, item)}
									/>
								</Card.Text>
							</Visible>
							<Visible when={item.assetType !== ASSET_TYPE.BUY_NOW && !item.auctionData.isEOI}>
								<Card.Text
									as="div"
									className="time-remaining"
								>
									<CountdownTimer
										bonusTime={item.isExtended}
										time={!assetStatusClosed ? item.datetimeClose : dayjs()}
										onComplete={onCompleteTimer.bind(null, item)}
									/>
								</Card.Text>
							</Visible>
						</div>
					</Col>

					{/* Third Column */}
					<Col md={2}>
						<Visible when={!item.auctionData.isEOI && item.assetType !== ASSET_TYPE.BUY_NOW && isNotifyAllowed}>
							<NotifyMe
								assetId={item.assetId}
								container={notifyMeContainer}
								onNotifyMeToggle={(e) => onCardShowAction(e, "notifyme", item)}
								auctionId={item.auctionData.auctionId}
								notificationUpdate={notificationUpdate}
								notifiedUser={item.isNotified}
								view="horizontal"
								className={currentDetails === "notifyme" && "selected"}
								dataTimeClose={item.datetimeClose}
							/>
						</Visible>

						<div className="bottom-content">
							<Button
								onClick={(e) => onCardShowAction(e, "bid-history", item)}
								className={`slt-dark ${currentDetails === "bid-history" && "selected"} bid-history-button`}
							>
								Bid History
							</Button>
							<div className="full-details">
								<Button onClick={openAssetDetails}>Full Details</Button>
							</div>
							{/* <Button
							onClick={(e) => onCardShowAction(e, "details", item)}
							className={`slt-dark ${currentDetails === "details" && "selected"}`}
						>
							Details
						</Button> */}
							<div className="place-bid">
								<Button
									variant="warning"
									className={currentDetails === "placebid" && "selected"}
									onClick={(e) => onCardShowAction(e, "placebid", item)}
									block
								>
									Bid Now
								</Button>
								<Visible when={item.highestBidder}>
									<OverlayTrigger
										placement="right"
										overlay={<Tooltip>You are currently the highest bidder.</Tooltip>}
									>
										<span className="highest-bidder-indicator">
											<SvgComponent path="gavel" />
										</span>
									</OverlayTrigger>
								</Visible>
							</div>
							<Visible when={item.auctionData.isEOI}>
								<DownloadAuctionDocuments
									assetId={item.assetId}
									auctionId={item.auctionData.auctionId}
								/>
							</Visible>
						</div>
					</Col>
				</Row>
			</Card.Body>
		</Card>
	);
};

export default AssetItemListCard;
