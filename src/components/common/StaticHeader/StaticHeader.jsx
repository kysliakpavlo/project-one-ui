import React from "react";

import "./StaticHeader.scss";

const StaticHeader = ({ header }) => {

    return (
        <div className="div-static-header">
            <div className="div-head">
                <p className="p-static-header">{header}</p>
            </div>
            <div className="div-logo">
                <img
                    alt="slattery-logo"
                    src={window.location.origin + '/ev-green-logo.svg'}
                    className="img-static-header"
                />
            </div>
        </div>
    );
}
export default StaticHeader;