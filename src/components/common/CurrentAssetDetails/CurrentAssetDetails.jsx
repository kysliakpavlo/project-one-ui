import React from "react";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Card from "react-bootstrap/Card";
import SvgComponent from "../SvgComponent";
import { DEFAULT_IMAGE } from "../../../utils/constants";
import { constructImageUrl, toAmount } from "../../../utils/helpers";
import Visible from "../Visible";
import { stringify } from "qs";
import "./CurrentAssetDetails.scss";

class CurrentAssetDetails extends React.Component {
  state = {
    imageIndex: 0,
  };

  onLeftArrow = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const nextIndex = this.state.imageIndex - 1;
    this.setState({
      imageIndex:
        nextIndex < 0
          ? parseInt(this.props.asset?.totalAssetImages) - 1
          : nextIndex,
    });
  };

  onRightArrow = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const nextIndex = this.state.imageIndex + 1;
    this.setState({
      imageIndex:
        nextIndex >= parseInt(this.props.asset?.totalAssetImages)
          ? 0
          : nextIndex,
    });
  };

  render() {
    const { imageIndex } = this.state;
    const { asset } = this.props;
    let imageUrl = null;
    imageUrl = asset?.assetImageUrl;
    if (imageIndex > 0 && asset && asset.assetImages.length > 1) {
      imageUrl = asset.assetImages[imageIndex].imageUrl;
    }

    return (
      <div key={asset?.assetId} className="current-asset-details">
        <div className="current-btn-top">
          <Button variant="warning" className="current-btn">
            Current
          </Button>
        </div>
        <Visible when={asset?.assetId}>
          <div className={`${asset ? "asset-details" : "d-none"}`}>
            <div className="title">
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>{asset?.title}</Tooltip>}
              >
                <div className="text">{asset?.title}</div>
              </OverlayTrigger>
            </div>
            <Link
              type="button"
              target="_blank"
              to={`/asset?${stringify({
                auctionNum: asset?.auctionData?.auctionNum,
                consignmentNo: asset?.consignmentNo,
              })}`}
              className="slt-green full-details-btn mobile-visible"
            >
              Full Details
              <SvgComponent path="open_in_new_white" />
            </Link>
            <div className="asset-images">
              <Link
                type="button"
                target="_blank"
                to={`/asset?${stringify({
                  auctionNum: asset?.auctionData?.auctionNum,
                  consignmentNo: asset?.consignmentNo,
                })}`}
                className="slt-green full-details-btn"
              >
                Full Details
                <SvgComponent path="open_in_new_white" />
              </Link>
              <Card.Img
                variant="top"
                onLoad={(e) => constructImageUrl(imageUrl, e.target)}
                src={imageUrl ? imageUrl : DEFAULT_IMAGE}
              />
              <ButtonGroup className="btn-block">
                <Button
                  variant="secondary"
                  className="nav-btn"
                  onClick={(e) => {
                    this.onLeftArrow(e);
                  }}
                >
                  <SvgComponent path="arrow-prev" />
                </Button>
                <Button variant="secondary" disabled>
                  {imageIndex + 1}/{asset?.totalAssetImages}
                </Button>
                <Button
                  variant="secondary"
                  className="nav-btn"
                  onClick={(e) => {
                    this.onRightArrow(e);
                  }}
                >
                  <SvgComponent path="arrow-next" />
                </Button>
              </ButtonGroup>
            </div>
            <div className="details">
              <div className="row mx-0">
                <div className="col-6 px-0 label">Consignment No.</div>
                <div className="col-6 px-0 val">{asset?.consignmentNo}</div>
              </div>
              <Visible when={asset?.manufacturer}>
                <div className="row mx-0 mt-1">
                  <div className="col-6 px-0 label">Manufacturer</div>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      asset?.manufacturer ? (
                        <Tooltip>{asset?.manufacturer}</Tooltip>
                      ) : (
                        <span></span>
                      )
                    }
                  >
                    <div className="col-6 px-0 val">{asset?.manufacturer}</div>
                  </OverlayTrigger>
                </div>
              </Visible>
              <Visible when={asset?.model}>
                <div className="row mx-0 mt-1">
                  <div className="col-6 px-0 label">Model</div>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      asset?.model ? (
                        <Tooltip>{asset?.model}</Tooltip>
                      ) : (
                        <span></span>
                      )
                    }
                  >
                    <div className="col-6 px-0 val">{asset?.model}</div>
                  </OverlayTrigger>
                </div>
              </Visible>
              <div className="row mx-0 mt-1">
                <Visible when={asset?.transmission}>
                  <div className="col-5 px-0 label">
                    <SvgComponent path="sync-alt" />
                    {"  "}
                    {asset?.transmission}
                  </div>
                </Visible>
                <Visible when={asset?.odoMeter}>
                  <div className="col-7 px-0 val">
                    {" "}
                    <SvgComponent path="direction-car" /> {" KM: "}
                    {asset?.odoMeter}{" Showing"}
                  </div>
                </Visible>
              </div>
              <div className="row mx-0 mt-1">
                <Visible when={asset?.lotNo}>
                  <div className="col-5 px-0 label">
                    <SvgComponent path="transportation" />
                    {"  "}Lot : {asset?.lotNo}
                  </div>
                </Visible>
                <Visible when={asset?.city?.name || asset?.state?.name}>
                  <div className="col-7 px-0 val">
                    {" "}
                    <SvgComponent path="location" /> {asset?.city?.name},{" "}
                    {asset?.state?.name}
                  </div>
                </Visible>
              </div>
            </div>
            <div className="bid">
              <div className="label">Current Bid</div>
              <div className="val">
                {(asset?.currentBidAmount &&
                  toAmount(asset?.currentBidAmount)) ||
                  toAmount(0)}
              </div>
            </div>
          </div>
        </Visible>
      </div>
    );
  }
}

export default CurrentAssetDetails;
