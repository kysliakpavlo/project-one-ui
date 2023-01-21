import React, { useState } from "react";
import * as Yup from "yup";
import _get from "lodash/get";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { Form as FormikForm, Field, withFormik } from "formik";
import Visible from "../../Visible";
import AppSpinner from "../../AppSpinner";
import ReserveMet from "../../ReserveMet";
import ImageGallery from "../ImageGallery";
import SvgComponent from "../../SvgComponent";
import { TextField } from "../../FloatingField";
import { CheckBoxField } from "../../FormField";
import DownloadAuctionDocuments from "../../DownloadAuctionDocuments";
import { toAmount } from "../../../../utils/helpers";
import validator from "../../../../utils/validator";
import {
  AUCTION_TYPES,
  AUCTION_TYPES_MAP,
  ASSET_TYPE,
  ASSET_STATUS,
  SUBSCRIPTION_SOURCE,
  MESSAGES,
} from "../../../../utils/constants";

import "./ImageGalleryView.scss";

function ImageGalleryView({
  show,
  startIndex,
  activeView,
  handleClose,
  images,
  assetDetail,
  absenteeCurrentBidAmount,
  buyNowHandler,
  assetStatusClosed,
}) {
  const [shown, setShown] = useState(activeView === "spin-car");
  const [sliding, setSliding] = useState(false);

  const DivView360 = (props) => {
    return (
      <div className="iframe-360-wrapper">
        <iframe
          scrolling="no"
          allowFullScreen
          src={props.src}
          frameBorder="0"
          title="360 view"
        />
      </div>
    );
  };

  const onChangeEnd = () => {
    setTimeout(() => {
      setSliding(false);
    }, 450);
  };

  const onChangeStart = () => {
    if (!sliding) setSliding(true);
  };

  return (
    <Modal
      show={show}
      fullscreen
      onHide={handleClose}
      className={`image-gallery-view ${sliding ? "sliding" : ""}`}
      backdropClassName="image-gallery-backdrop"
    >
      <Modal.Header closeButton>
        <Modal.Title />
      </Modal.Header>
      <Modal.Body>
        <div className="header">
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip>{assetDetail.title}</Tooltip>}
          >
            <div className="title">{assetDetail.title}</div>
          </OverlayTrigger>
          <Button
            className="gallery-action-btn btn-gallery"
            onClick={() => setShown(false)}
          >
            <SvgComponent path="gallery" />
          </Button>
          <Visible when={shown}>
            <Button
              className="gallery-action-btn image-gallery-icon image-gallery-play-button"
              disabled
            >
              <SvgComponent path="play" />
            </Button>
          </Visible>
          <Visible when={_get(assetDetail, "spincar")}>
            <Button
              className="gallery-action-btn spin-cars"
              onClick={() => setShown(true)}
            >
              <SvgComponent path="360_black" />
            </Button>
          </Visible>
        </div>
        <Row className="gallery-content">
          <Col className="gallery-images-content">
            {shown ? (
              <DivView360 src={assetDetail.spincar} />
            ) : (
              <div className="h-100">
                <AppSpinner />
                <ImageGallery
                  isModal
                  onSlide={onChangeEnd}
                  onTouchEnd={onChangeEnd}
                  onTouchMove={onChangeStart}
                  onBeforeSlide={onChangeStart}
                  items={images}
                  startIndex={startIndex}
                  showFullscreenButton={false}
                  renderPlayPauseButton={(onClick, isPlaying) => (
                    <Button
                      onClick={onClick}
                      className="image-gallery-icon image-gallery-play-button"
                    >
                      <SvgComponent path={isPlaying ? "pause" : "play"} />
                    </Button>
                  )}
                />
              </div>
            )}
          </Col>
          <Col className="gallery-details-content">
            <div className="div-spec">
              <Card className="product-spec">
                <div className="prod-spec-details">
                  <h3 className="h3-asset-title">{assetDetail.title}</h3>
                  <span className="spn-con-num">Consignment No. </span>
                  {assetDetail.consignmentNo}
                </div>
                <Table borderless size="sm">
                  <tbody>
                    <tr>
                      <td>
                        {" "}
                        <SvgComponent path="transportation" />
                        {"  "}Lot : {_get(assetDetail, "lotNo", "")}
                      </td>
                      <td>
                        {" "}
                        <SvgComponent path="location" />{" "}
                        {assetDetail.city?.name}, {assetDetail.state?.name}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <SvgComponent path="sync-alt" />
                        {"  "}
                        {_get(assetDetail, "transmission", "")}
                      </td>
                      <td>
                        <SvgComponent path="direction-car" />
                        {"  "}KM: {_get(assetDetail, "odoMeter", "")}
                        {" Showing"}
                      </td>
                    </tr>
                    <tr>
                      <Visible
                        when={
                          assetDetail.pageViews >=
                          assetDetail.pageViewsThreshold
                        }
                      >
                        <td>
                          <SvgComponent path="visibility" />
                          {"  "}{" "}
                          {assetDetail.pageViews === null
                            ? "0"
                            : assetDetail.pageViews}
                          {"  "}Views
                        </td>
                      </Visible>
                      <Visible
                        when={
                          assetDetail.totalBidsAsset >=
                            assetDetail.minimumBidsTreshold &&
                          assetDetail.assetType !== ASSET_TYPE.BUY_NOW &&
                          assetDetail.assetType !== ASSET_TYPE.EOI
                        }
                      >
                        <td>
                          <SvgComponent path="gavel" />
                          {"  "}{" "}
                          {assetDetail.totalBidsAsset === null
                            ? "0"
                            : assetDetail.totalBidsAsset}
                          {"  "}Bids
                        </td>
                      </Visible>
                      <Visible
                        when={
                          assetDetail.totalWatchers >=
                            assetDetail.minimumWatchersTreshold &&
                          (assetDetail.assetType === ASSET_TYPE.BUY_NOW ||
                            assetDetail.assetType === ASSET_TYPE.EOI)
                        }
                      >
                        <td>
                          <SvgComponent path="star-filled" />
                          {"  "}{" "}
                          {assetDetail.totalWatchers === null
                            ? "0"
                            : assetDetail.totalWatchers}
                          {"  "}Watchers
                        </td>
                      </Visible>
                    </tr>
                    <tr>
                      <Visible
                        when={
                          assetDetail.assetType !== ASSET_TYPE.BUY_NOW &&
                          assetDetail.assetType !== ASSET_TYPE.EOI
                        }
                      >
                        <td className="text-center">
                          <SvgComponent path="star-filled" />
                          {"  "}{" "}
                          {assetDetail.totalWatchers === null
                            ? "0"
                            : assetDetail.totalWatchers}
                          {"  "}Watchers
                        </td>
                      </Visible>
                    </tr>
                  </tbody>
                </Table>
                <Visible when={assetDetail.showReserveOnAssetDetail}>
                  <div
                    className={
                      assetDetail.pageViews > 15
                        ? "reservemet-div"
                        : "views-number col-6 reservemet-div"
                    }
                  >
                    <span className="spn-reservemet">
                      {assetDetail.reserveMet
                        ? "Reserve Met"
                        : "Reserve Not Met"}
                    </span>
                    <ReserveMet percent={assetDetail.reservePercentage} />
                  </div>
                </Visible>
                <Visible
                  when={
                    assetDetail.assetType !== ASSET_TYPE.BUY_NOW &&
                    assetDetail.assetType !== ASSET_TYPE.EOI
                  }
                >
                  <div className="view-bidamnts">
                    {assetStatusClosed ? (
                      <div className="bid-amnt">
                        My Bid:{" "}
                        {assetDetail.myHighestBid.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                          minimumFractionDigits: 0,
                        })}
                      </div>
                    ) : (
                      <div className="bid-amnt">
                        Current Bid:{" "}
                        {AUCTION_TYPES_MAP[
                          assetDetail.auctionData?.auctionType?.name
                        ] === AUCTION_TYPES.IN_ROOM
                          ? absenteeCurrentBidAmount?.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                              minimumFractionDigits: 0,
                            }) || 0
                          : assetDetail.currentBidAmount?.toLocaleString(
                              "en-US",
                              {
                                style: "currency",
                                currency: "USD",
                                minimumFractionDigits: 0,
                              }
                            ) || 0}
                      </div>
                    )}
                  </div>
                </Visible>
                <Visible when={assetDetail.assetType === ASSET_TYPE.BUY_NOW}>
                  <div className="buy-now">
                    <div className="btn-under">
                      {toAmount(assetDetail.listedPrice)}
                    </div>
                    <Button
                      disabled={assetDetail.status === ASSET_STATUS.UNDER_OFFER}
                      variant="warning"
                      className="btn-buynow"
                      onClick={buyNowHandler}
                    >
                      <SvgComponent path="shopping-cart" />
                      {assetDetail.status === ASSET_STATUS.UNDER_OFFER
                        ? assetDetail.status
                        : ASSET_STATUS.BUY_NOW}
                    </Button>
                  </div>
                </Visible>
                <Visible when={assetDetail.assetType === ASSET_TYPE.EOI}>
                  <DownloadAuctionDocuments
                    assetId={assetDetail.assetId}
                    auctionId={assetDetail?.auctionData?.auctionId}
                  />
                </Visible>
              </Card>

              <Card className="enquiry-card">
                <div className="div-title-qstn">
                  <h3>Have a Question?</h3>
                </div>
                <FormikForm noValidate autoComplete="off">
                  <div className="ask-qstn">
                    <Row>
                      <Col sm={12}>
                        <p className="desc">
                          Contact your friendly Slattery Auctions team today.
                        </p>
                      </Col>
                      <Col sm={12}>
                        <Field
                          component={TextField}
                          label="First Name"
                          placeholder=""
                          name="firstName"
                          required
                        />
                      </Col>
                      <Col sm={12}>
                        <Field
                          component={TextField}
                          label="Last Name"
                          placeholder=""
                          name="lastName"
                          required
                        />
                      </Col>
                      <Col sm={12}>
                        <Field
                          component={TextField}
                          label="Email"
                          placeholder=""
                          name="email"
                          required
                        />
                      </Col>
                      <Col sm={12}>
                        <Field
                          component={TextField}
                          label="Phone / Mobile"
                          placeholder=""
                          name="phone"
                          required
                        />
                      </Col>
                      <Col sm={12}>
                        <Field
                          component={TextField}
                          name="comments"
                          label="Comments"
                          fieldAs="textarea"
                          rows={6}
                          required
                        />
                      </Col>
                      <Col sm={12}>
                        <Field
                          component={CheckBoxField}
                          type="switch"
                          className="txt-news"
                          name="subscribeNewsLetter"
                          label="I want to be kept up to date with the latest stock and upcoming auctions"
                        />
                      </Col>
                      <Col sm={12}>
                        <Button
                          className="btn btn-primary btn-submit"
                          type="submit"
                        >
                          Submit
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </FormikForm>
              </Card>
            </div>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
}
export default withFormik({
  mapPropsToValues: ({ loggedInUser, assetDetail }) => {
    const {
      firstName = "",
      lastName = "",
      email = "",
      mobile: phone = "",
    } = loggedInUser || {};
    const { assetId } = assetDetail || {};
    const recordType = assetDetail?.auctionData?.isEOI ? "EOI" : "General";
    const state = assetDetail.state.name;
    const assetInterest = assetDetail?.assetCategory?.categoryGroup?.groupName
      ? assetDetail?.assetCategory?.categoryGroup?.groupName
      : "";
    return {
      firstName,
      lastName,
      email,
      phone,
      state,
      comments: "",
      subscribeNewsLetter: false,
      assetId,
      recordType,
      assetInterest,
      subscriptionSource: SUBSCRIPTION_SOURCE.ENQUIRY,
    };
  },
  validationSchema: Yup.object().shape({
    firstName: validator.name,
    lastName: validator.name,
    email: validator.email,
    phone: validator.phone,
    comments: validator.requiredString(
      "Please provide information about query"
    ),
  }),
  handleSubmit: (values, { props, ...formikProps }) => {
    props.submitAssetEnquire(values).then(
      (res) => {
        props.showMessage({ message: MESSAGES.ENQUIRY_SUBMIT });
        formikProps.resetForm();
      },
      (err) => {
        props.showMessage(err.message);
      }
    );
  },
})(ImageGalleryView);
