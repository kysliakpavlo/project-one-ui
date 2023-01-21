import React, { useEffect } from "react";
import _isEmpty from "lodash/isEmpty";
import IframeComm from "react-iframe-comm";
import { fromUrlString, setAppTitle } from "../../../utils/helpers";
import { useLocation } from "react-router-dom";
import "./CommonIframe.scss";

const IframComponent = ({ location, vendor, setLoading, toUrl }) => {
  const locationUrl = useLocation();
  let params =
    locationUrl.search !== "" &&
    fromUrlString(locationUrl.search?.split("?")[1]);
  useEffect(() => {
    if (!_isEmpty(vendor)) {
      setAppTitle(params.title, vendor.name);
    }
    setLoading(false);
  }, [vendor]);
  const attributes = {
    src: toUrl
      ? fromUrlString(toUrl.split("?")[1]).url
      : fromUrlString(location.search.split("?")[1]).url,
    width: "100%",
    height: `${window.innerHeight}`,
    class: "static-frame",
    overflow: "hidden",
    frameBorder: 0, // show frame border just for fun...
  };
  return (
    <div className="iframe-content">
      <IframeComm attributes={attributes} />
    </div>
  );
};

export default IframComponent;
