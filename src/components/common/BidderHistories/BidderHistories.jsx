import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import Tooltip from "react-bootstrap/Tooltip";
import BootstrapTable from "react-bootstrap-table-next";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";

import SvgComponent from "../SvgComponent";
import { SOCKET } from "../../../utils/constants";

import "./BidderHistories.scss";
import { setLoading } from "../../../actions/app";

const BidderHistories = (props) => {
    const { auctionId } = props.match.params;
    const { assetId } = props.match.params;
    const { socket } = props;
    const [bidHistories, setBidHistories] = useState([]);
    const rowClasses = (row) => {
        let className = row.actionType
            ? row.highestBidder && row.actionType.includes("Retracted")
                ? "bg-retracted"
                : row.highestBidder
                ? "bg-highest"
                : row.actionType.includes("Retracted")
                ? "bg-retracted"
                : row.actionType.includes("Reset")
                ? "bg-reset"
                : row.actionType.includes("Automatic")
                ? "bg-automatic"
                : row.actionType.includes("Maximum")
                ? "bg-maximum"
                : ""
            : "";
        if (row.isLatest) {
            className = className.concat(" latest-row");
        }
        return className;
    };

    const deleteBid = (param) => {
        props.setLoading(true);
        props
            .deleteBid({
                assetId: param?.assetId,
                auctionId: param?.auctionId,
                accountId: param?.accountId,
                bidType: param?.bidType,
                amount: param?.amount,
            })
            .then((res) => {
                getBidHistory();
                props.setLoading(false);
            })
            .catch((err) => {
                props.setLoading(false);

                props.showMessage({ message: err.message, type: "error" });
            });
    };
    const columns = [
        {
            dataField: "createdDate",
            text: "Time",
            sort: true,
        },
        {
            dataField: "amount",
            text: `Amount`,
            sort: true,
            formatter: (value) => (
                <span>
                    {value.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                    })}
                </span>
            ),
        },
        {
            dataField: "accountAlias",
            text: "Buyer Alias",
            sort: true,
            formatter: (value, row) => <span>{value}</span>,
        },
        {
            dataField: "firstName",
            text: "Buyer Name",
            sort: true,
            formatter: (value, row) => (
                <span>
                    {value ? `${value}${" "} ${row?.lastName}` : `${row?.name}`}
                    {row.bidderType && <span> </span>}
                </span>
            ),
        },
        {
            dataField: "actionType",
            text: "Action",
            formatter: (value, row) => (
                <span>
                    {value}
                    {row?.canDelete && (
                        <OverlayTrigger placement="top" overlay={<Tooltip>Delete this Bid</Tooltip>}>
                            <span
                                className="icons delete"
                                onClick={() => {
                                    deleteBid(row);
                                }}
                            >
                                <SvgComponent path="delete_black_24dp" />
                            </span>
                        </OverlayTrigger>
                    )}
                    {value === "Manual Bid" && (
                        <OverlayTrigger placement="top" overlay={<Tooltip>User places a manual bid amount that increases the bid.</Tooltip>}>
                            <span className="icons info">
                                &nbsp;&nbsp; <SvgComponent path="info" />
                            </span>
                        </OverlayTrigger>
                    )}

                    {value === "Automatic Bid" && (
                        <OverlayTrigger placement="top" overlay={<Tooltip>The bid amount is increased because there is an existing automatic bid in place.</Tooltip>}>
                            <span className="icons info">
                                {" "}
                                <SvgComponent path="info" />
                            </span>
                        </OverlayTrigger>
                    )}

                    {value === "Maximum Bid" && (
                        <OverlayTrigger placement="top" overlay={<Tooltip>The customer sets highest current bid</Tooltip>}>
                            <span className="icons info">
                                {" "}
                                <SvgComponent path="info" />
                            </span>
                        </OverlayTrigger>
                    )}

                    {value === "Absentee Maximum Bid" && (
                        <OverlayTrigger placement="top" overlay={<Tooltip>The customer sets highest current bid</Tooltip>}>
                            <span className="icons info">
                                <SvgComponent path="info" />
                            </span>
                        </OverlayTrigger>
                    )}

                    {value === "Reset Maximum Bid by Customer" && (
                        <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>The customer resets an Automatic bid. The new amount cannot be lower than the current bid amount.</Tooltip>}
                        >
                            <span className="icons info">
                                {" "}
                                <SvgComponent path="info" />
                            </span>
                        </OverlayTrigger>
                    )}

                    {value === "Reset Absentee Maximum Bid by Customer" && (
                        <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>The customer resets an Automatic bid. The new amount cannot be lower than the current bid amount.</Tooltip>}
                        >
                            <span className="icons info">
                                <SvgComponent path="info" />
                            </span>
                        </OverlayTrigger>
                    )}

                    {(value === "Retracted Bid by staff" || value === "Retracted Auto bid by staff") && (
                        <OverlayTrigger placement="top" overlay={<Tooltip>The staff member retracts the bid amount (this can be any type of bid).</Tooltip>}>
                            <span className="icons info">
                                <SvgComponent path="info" />
                            </span>
                        </OverlayTrigger>
                    )}
                </span>
            ),
        },
    ];
    const getBidHistory = () => {
        props.setLoading(true);
        props.getBidderHistory({ assetId, auctionId }).then((res) => {
            res.result.map((item, index) => {
                item.isLatest = index === 0;
                item.createdDate = dayjs(item.createdDate).format("DD/MM/YYYY, h:mm:ss a");
            });
            setBidHistories(res.result);
            props.setLoading(false);
        });
    };
    useEffect(() => {
        getBidHistory();
        props.setLoading(false);
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on(SOCKET.ON_ASSET_CHANGE, (res) => {
                props.setLoading(true);
                props
                    .getBidderHistory({ assetId, auctionId })
                    .then((res) => {
                        res.result.map((item, index) => {
                            item.isLatest = index === 0;
                            item.createdDate = dayjs(item.createdDate).format("DD/MM/YYYY, h:mm:ss a");
                        });
                        setBidHistories(res.result);
                        props.setLoading(false);
                    })
                    .catch((err) => {
                        props.showMessage({ message: err?.message, type: "error" });
                        props.setLoading(false);
                    });
            });
        }
    }, [socket]);
    return (
        <div className="bidder-history">
            <BootstrapTable keyField="accountAssetBidId" data={bidHistories} columns={columns} rowClasses={rowClasses} />
        </div>
    );
};

export default BidderHistories;
