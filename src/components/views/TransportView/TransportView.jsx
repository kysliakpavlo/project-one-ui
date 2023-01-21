import React, { useEffect, useState } from "react";
import _isEmpty from "lodash/isEmpty";
import Container from "react-bootstrap/Container";
import {
  setAppTitle,
  fromUrlString,
  removeNumber,
} from "../../../utils/helpers";
import PredictiveSearchBar from "../../common/PredictiveSearchBar";
import ShowOnScroll from "../../common/SearchBox/ShowOnScroll";
import TransportCalculators from "../../common/TransportCalculators";
import Breadcrumb from "../../common/Breadcrumb";
import "./TransportView.scss";

const TransportView = ({
  vendor,
  loadAppData,
  setLoading,
  location,
  getTransportFee,
  getCities,
  getTransportAssetTypes,
  showMessage,
}) => {
  const [transportFee, setTransportFee] = useState(null);
  const [cities, setCities] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const isVisible = ShowOnScroll(70);

  let urlString = decodeURIComponent(location.search.split("?")[1]);
  let assetType = "";
  if (urlString.split("&")[0] !== "undefined") {
    assetType = fromUrlString(urlString.split("&")[0]).assetType;
  }
  useEffect(() => {
    if (vendor) {
      setAppTitle("Transport Calculator", vendor.name);
    }
  }, [vendor]);

  useEffect(() => {
    if (!_isEmpty(vendor)) {
      getCities().then((res) => {
        setCities(res.result);
        setLoading(false);
      });
      getTransportAssetTypes().then((res) => {
        res.result.forEach((element) => {
          element.name = removeNumber(element.name);
        });
        setAssetTypes(res.result);
      });
    }
  }, [vendor, setCities]);

  const onCalculate = (values) => {
    setLoading(true);
    const req = { ...values };
    if (/\dKm$/.test(req.toLocation)) {
      req["distance"] = values.toLocation;
      delete req.toLocation;
    }

    getTransportFee(req)
      .then((res) => {
        const result =
          res.result &&
          res.result.filter(
            (transport) => transport.toCity !== null || transport.distance
          );
        setTransportFee(result);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  const pages = [
    { label: "Home", path: "/" },
    { label: "Frieght & Transport Calculator" },
  ];

  return (
    <div className="transport-view">
      <div className="div-search-bar">
        <Container
          className={
            !isVisible ? "mt-0 search-bar-visible" : "mt-0 search-bar-invisible"
          }
        >
          <PredictiveSearchBar />
        </Container>
      </div>
      <Container>
        <div className="breadcrums px-0">
          <Breadcrumb items={pages} />
        </div>
        <TransportCalculators
          showMessage={showMessage}
          assetType={assetType}
          cities={cities}
          assetTypeList={assetTypes}
          transportFee={transportFee}
          onCalculate={onCalculate}
        />
      </Container>
    </div>
  );
};

export default TransportView;
