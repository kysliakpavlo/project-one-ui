import React, { useState, useEffect } from "react";
import _isEmpty from "lodash/isEmpty";
import { setAppTitle, toUrlString, preventEvent } from "../../../utils/helpers";
import "./QuarterlyReportsView.scss";
import { useHistory } from "react-router-dom";
// import PredictiveSearchBar from "../../common/PredictiveSearchBar";
import StaticHeader from "../../common/StaticHeader";

const QuarterlyReportsView = ({
  vendor,
  setLoading,
  getStaticPage,
  pageConfigurations,
}) => {
  const [quarterlyReportsDetail, SetQuarterlyReports] = useState([]);
  const [title, setTitle] = useState("");
  const history = useHistory();
  useEffect(() => {
    if (!_isEmpty(vendor)) {
      setAppTitle("News View", vendor.name);
    }
  }, [vendor]);
  useEffect(() => {
    pageConfigurations?.quaterlyReports &&
      getStaticPage(pageConfigurations?.quaterlyReports)
        .then((response) => {
          setTitle(response.result.page.title);
          let tag = document.createElement("div");
          tag.innerHTML = response.result.page.content;
          let anchorTag = tag.getElementsByTagName("a");
          for (let aTag of anchorTag) {
            aTag.setAttribute("class", "anchor-link");
            aTag.setAttribute("id", "reports");

            let url = aTag.href;
            url = url
              .split("/")
              .map((x) =>
                x.replace(
                  /www.slatteryauctions.com.au/g,
                  "static.slatteryauctions.com.au"
                )
              )
              .join("/");
            let title = url
              .split("/")
              [url.split("/").length - 1].toUpperCase()
              .replace("-", " ");
            if (title === "") {
              title = aTag.innerText.toUpperCase() + aTag.innerText.slice(1);
            }
            const obj = toUrlString({ url, title: title });
            aTag.setAttribute("href", `/content-page?${obj}`);
          }
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
          SetQuarterlyReports(tag.innerHTML);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
        });
  }, [pageConfigurations]);

  return (
    <>
      {/* <PredictiveSearchBar /> */}
      <div className="content-page container">
	  <h1 style={{textAlign: "center"}}>Quarterly Reports</h1>
        <div className="page-header">{title}</div>
        <div
          className="container"
          dangerouslySetInnerHTML={{ __html: quarterlyReportsDetail }}
        ></div>
      </div>
    </>
  );
};

export default QuarterlyReportsView;
