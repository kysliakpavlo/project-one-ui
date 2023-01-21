import React, { useState, useEffect, lazy, Suspense } from "react";
import { useHistory } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Tooltip from "react-bootstrap/Tooltip";
import { Link } from "react-router-dom";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import dayjs from "dayjs";
import _get from "lodash/get";
import _isEmpty from "lodash/isEmpty";
import Visible from "../Visible";
import CountdownTimer, { TextRenderer } from "../CountdownTimer";
import useWindowSize from "../../../hooks/useWindowSize";
import SvgComponent from "../SvgComponent";
import { stringify } from "qs";
import {
  toUrlString,
  isInRoom,
  constructImageUrl,
  preventEvent,
  getTimezoneName,
} from "../../../utils/helpers";
import {
  AUCTION_TYPES_MAP,
  AUCTION_TYPES,
  AUCTION_SITE_TYPE,
  ASSET_TYPE,
  LIVE,
  DEFAULT_IMAGE,
  ONE_YEAR,
} from "../../../utils/constants";
import "./FeatureAssetCard.scss";

const NotifyMe = lazy(() => import("../../common/NotifyMe"));

const FeatureAssetCard = ({
  asset,
  showMessage,
  setHomeAuction,
  setDetailsAuction,
  getAssetImages,
}) => {
  const [width] = useWindowSize();
  const [isNotified, setIsNotified] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [assetImages, setAssetImages] = useState([]);
  const history = useHistory();

  useEffect(() => {
    setIsNotified(asset.isNotified);
  }, [asset]);

  const navigateToAsset = (event, asset) => {
    preventEvent(event);
    let { assetId, auctionId, auctionNum, consignmentNo } = asset;
    if (
      history.location.pathname === "/" ||
      history.location.pathname === "/"
    ) {
      setHomeAuction(assetId);
    } else {
      setDetailsAuction(assetId);
    }
    history.push({
      pathname: `/asset`,
      search: stringify({
        auctionNum,
        consignmentNo,
      }),
      state: { isFeatured: 1, direction: "asc" },
    });
  };
  const getUrlForCard = () => {
    const { consignmentNo, auctionNum } = asset;
    let query = {
      pathname: `/asset`,
      search: stringify({
        auctionNum: auctionNum,
        consignmentNo: consignmentNo,
      }),
      state: { isFeatured: 1, direction: "asc" },
    };
    return query;
  };
  const notificationUpdate = (message) => {
    showMessage({ message: message });
    setIsNotified(true);
  };

  const getImages = () => {
    if (_isEmpty(assetImages) && parseInt(asset?.totalAssetImages) > 1) {
      getAssetImages(asset?.assetId).then((res) => {
        setAssetImages(res.result);
      });
    }
  };

  const onLeftArrow = (e) => {
    e.stopPropagation();
    e.preventDefault();
    getImages();
    const nextIndex = imageIndex - 1;
    setImageIndex(
      nextIndex < 0 ? parseInt(asset?.totalAssetImages) - 1 : nextIndex
    );
  };

  const onRightArrow = (e) => {
    e.stopPropagation();
    e.preventDefault();
    getImages();
    const nextIndex = imageIndex + 1;
    setImageIndex(
      nextIndex >= parseInt(asset?.totalAssetImages) ? 0 : nextIndex
    );
  };

  const startTime = dayjs(asset.datetimeOpen);
  const closeTime = dayjs(asset.datetimeClose);
  const now = dayjs();

  let statusTag;
  let dateTag;
  let timeTag;
  let isNextYear = false;
  const diff = closeTime - now;
  if (diff > ONE_YEAR) {
    isNextYear = true;
  }
  if (startTime <= now && closeTime > now) {
    statusTag = "Open Now";
    dateTag = closeTime.format("DD MMM");
    timeTag = `Ends : ${closeTime.format("hh:mm A")} ${getTimezoneName(
      closeTime
    )}`;
  } else if (startTime <= now && closeTime <= now) {
    statusTag = "Closed";
    dateTag = closeTime.format("DD MMM");
    timeTag = `Ends : ${closeTime.format("hh:mm A")} ${getTimezoneName(
      closeTime
    )}`;
  } else if (startTime > now) {
    statusTag = `Opens Soon`;
    dateTag = startTime.format("DD MMM");
    timeTag = `Starts : ${startTime.format("hh:mm A")} ${getTimezoneName(
      startTime
    )}`;
  }

  const isNotifyAllowed =
    statusTag !== "Closed" &&
    AUCTION_TYPES_MAP[asset.auctionType?.name] !== AUCTION_TYPES.EOI &&
    asset?.assetType !== ASSET_TYPE.BUY_NOW &&
    !(
      statusTag === "Open Now" &&
      AUCTION_TYPES_MAP[asset.auctionType?.name] === AUCTION_TYPES.IN_ROOM
    );

  let imageUrl = asset.assetImageUrl;
  if (!_isEmpty(assetImages)) {
    imageUrl = assetImages[imageIndex].imageUrl;
  }

  return (
    <Suspense>
      <div className="featured-asset-card">
        <Visible when={width <= 1180}>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>{asset?.title}</Tooltip>}
          >
            <h1 className="title">
              <strong> {asset?.title}</strong>
            </h1>
          </OverlayTrigger>
        </Visible>
        <Card>
          <Card.Body as={Row}>
            <div className="img-block">
              <Link to={getUrlForCard}>
                <Card.Img
                  onClick={(e) => navigateToAsset(e, asset)}
                  loading="lazy"
                  src={imageUrl ? imageUrl : DEFAULT_IMAGE}
                  onLoad={(e) => constructImageUrl(imageUrl, e.target)}
                  alt={asset.title}
                />
              </Link>
              <span
                className="navigate-prev-btn"
                onClick={(e) => onLeftArrow(e)}
              >
                <SvgComponent path="arrow-prev" />
              </span>
              <span
                className="navigate-next-btn"
                onClick={(e) => onRightArrow(e)}
              >
                <SvgComponent path="arrow-next" />
              </span>
              <div className="img-bottom">
                <Button
                  className="view-btn"
                  onClick={(e) => navigateToAsset(e, asset)}
                >
                  View Details
                </Button>
                {isNotifyAllowed && (
                  <NotifyMe
                    assetId={asset.assetId}
                    auctionId={_get(asset, "auctionData.auctionId")}
                    dataTimeClose={asset.datetimeClose}
                    notificationUpdate={notificationUpdate}
                    notifiedUser={isNotified}
                    displayText={false}
                  />
                )}
              </div>
            </div>
            <div className="details-block">
              <div className="status-tag ">
                <div className="label">Featured Assets</div>
                <div>
                  <SvgComponent path="gavel_white_24dp" />
                  <span className="date-tag"> {dateTag} </span>
                  <Visible when={asset?.assetType !== ASSET_TYPE.BUY_NOW}>
                    <span>{timeTag}</span>
                  </Visible>
                </div>
              </div>
              <Visible when={width > 1180}>
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>{asset?.title}</Tooltip>}
                >
                  <h1 className="title">
                    <strong> {asset?.title}</strong>
                  </h1>
                </OverlayTrigger>
              </Visible>
              <Visible when={width > 1024}>
                <div className="row location-detals mx-0">
                  <div className="col-6 p-0 pr-1">
                    <div className="label">Location</div>
                    <div>
                      <strong>
                        {asset?.assetSuburbState ? (
                          asset?.assetSuburbState
                        ) : (
                          <>
                            {asset?.city ? asset?.city.name : ""},{" "}
                            {asset?.state ? asset?.state.name : ""}
                          </>
                        )}
                      </strong>
                    </div>
                  </div>
                  <Visible
                    when={
                      !asset?.auctionData?.isEOI ||
                      (asset?.auctionData?.isEOI && !isNextYear)
                    }
                  >
                    <div className="col-6 p-0">
                      <div className="label">
                        {asset?.auctionData?.auctionType?.name
                          ? "Time Remaining"
                          : ""}
                      </div>
                      <CountdownTimer
                        bonusTime={asset?.isExtended}
                        renderer={TextRenderer}
                        time={closeTime}
                      />
                    </div>
                  </Visible>
                </div>
                <div className="row bidding-details mx-0">
                  <div className="col-6 p-0">
                    <div className="label">Bidding Type</div>
                    <div className="bid-type">
                      <strong>
                        {asset?.auctionData?.auctionType?.name
                          ? isInRoom(asset?.auctionData?.auctionType?.name)
                            ? LIVE
                            : asset?.auctionData?.auctionType?.name
                          : "Buy Now"}
                      </strong>
                    </div>
                  </div>
                  <div className="bid-now">
                    <Visible when={_get(asset, "assetType") !== "Buy Now"}>
                      <Button
                        className="bid-now-btn"
                        onClick={(e) => navigateToAsset(e, asset)}
                      >
                        Bid Now
                      </Button>
                    </Visible>
                    <Visible when={_get(asset, "assetType") === "Buy Now"}>
                      <Button
                        className="btn-buy-now"
                        variant="warning"
                        onClick={(e) => navigateToAsset(e, asset)}
                      >
                        <SvgComponent path="shopping-cart" />
                        Buy Now
                      </Button>
                    </Visible>
                  </div>
                </div>
              </Visible>
              <Visible when={width <= 1024}>
                <div className="tab-details">
                  <div className="col-4 p-0">
                    <div className="label">Location</div>
                    <div>
                      <strong>
                        {asset?.assetSuburbState ? (
                          asset?.assetSuburbState
                        ) : (
                          <>
                            {asset?.city ? asset?.city.name : ""},{" "}
                            {asset?.state ? asset?.state.name : ""}
                          </>
                        )}
                      </strong>
                    </div>
                  </div>
                  <Visible
                    when={
                      !asset?.auctionData?.isEOI ||
                      (asset?.auctionData?.isEOI && !isNextYear)
                    }
                  >
                    <div className="col-4 p-0 time-remain">
                      <div className="label">Time Remaining</div>
                      <div>
                        <CountdownTimer
                          bonusTime={asset?.isExtended}
                          renderer={TextRenderer}
                          time={closeTime}
                        />
                      </div>
                    </div>
                  </Visible>
                  <div className="col-4 p-0 ">
                    <div className="label">Bidding Type</div>
                    <div>
                      <strong>
                        {asset?.auctionData?.auctionType?.name
                          ? asset?.auctionData?.auctionType?.name
                          : "Buy Now"}
                      </strong>
                    </div>
                  </div>
                </div>
                <div className="bid-now justify-content-center">
                  <Visible when={_get(asset, "assetType") !== "Buy Now"}>
                    <Button
                      className="bid-now-btn"
                      onClick={(e) => navigateToAsset(e, asset)}
                    >
                      Bid Now
                    </Button>
                  </Visible>
                  <Visible when={_get(asset, "assetType") === "Buy Now"}>
                    <Button
                      className="btn-buy-now"
                      variant="warning"
                      onClick={(e) => navigateToAsset(e, asset)}
                    >
                      <SvgComponent path="shopping-cart" />
                      Buy Now
                    </Button>
                  </Visible>
                </div>
              </Visible>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Suspense>
  );
};

export default FeatureAssetCard;
