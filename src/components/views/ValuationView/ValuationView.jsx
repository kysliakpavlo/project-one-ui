import React, { useState, useEffect } from "react";
import _isEmpty from "lodash/isEmpty";
import { setAppTitle } from "../../../utils/helpers";
import "./ValuationPage.scss";
import PredictiveSearchBar from "../../common/PredictiveSearchBar";
import StaticHeader from "../../common/StaticHeader";
import Breadcrumb from "../../common/Breadcrumb";
import Container from "react-bootstrap/Container";

const ValuationView = ({
  vendor,
  setLoading,
  getStaticPage,
  pageConfigurations,
}) => {
  const [valuationDetail, setValuationDetail] = useState([]);
  const [title, setTitle] = useState("");
  useEffect(() => {
    if (!_isEmpty(vendor)) {
      setAppTitle("Valuation", vendor.name);
    }
  }, [vendor]);
  useEffect(() => {
    pageConfigurations?.valuationId &&
      getStaticPage(pageConfigurations?.valuationId)
        .then((response) => {
          setTitle(response.result.page.title);
          let tag = document.createElement("div");
          tag.innerHTML = response.result.page.content.replace(/\u00a0/g, " ");
          let imgTag = tag.getElementsByTagName("img");
          for (let item of imgTag) {
            let attr = item.getAttribute("src");
            attr = attr
              .split("/")
              .map((x) =>
                x.replace(
                  /www.slatteryauctions.com.au/g,
                  "static.slatteryauctions.com.au"
                )
              )
              .join("/");
            item.setAttribute("src", attr);
            item.parentElement.parentElement.setAttribute(
              "class",
              "image-block"
            );
            let attrSet = item.getAttribute("srcset");
            if (attrSet !== null) {
              attrSet = attrSet
                .split("/")
                .map((x) =>
                  x.replace(
                    /www.slatteryauctions.com.au/g,
                    "static.slatteryauctions.com.au"
                  )
                )
                .join("/");
              item.setAttribute("srcset", attrSet);
            }
          }
          let anchorTag = tag.getElementsByTagName("a");
          for (let aTag of anchorTag) {
            let attr = aTag.getAttribute("href");
            if (attr !== null) {
              attr = attr
                .split("/")
                .map((x) =>
                  x.replace(
                    /www.slatteryauctions.com.au/g,
                    "static.slatteryauctions.com.au"
                  )
                )
                .join("/");
              aTag.setAttribute("href", attr);
            }
          }
          setValuationDetail(tag.innerHTML);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
        });
  }, [pageConfigurations]);
  const pages = [{ label: "Home", path: "/" }, { label: "About Slattery" }];
  return (
    <>
      <PredictiveSearchBar />
      <div className="valuation-view container">
        <div className="banner"></div>
        <div className="view-header">
          <Container>
            <div className="breadcrums px-0">
              <Breadcrumb items={pages} />
            </div>
          </Container>
        </div>
        <StaticHeader header={title}></StaticHeader>
        <div
          className="container valuation-container"
          dangerouslySetInnerHTML={{ __html: valuationDetail }}
        ></div>
      </div>
    </>
  );
};

export default ValuationView;
