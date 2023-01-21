import React from "react";
import ReactExport from "react-data-export";
import dayjs from 'dayjs';
import Button from "react-bootstrap/Button";
import { DATE_FORMAT } from '../../../utils/constants';
import { ASSET_STATUS } from "../../../utils/constants";

import './AuctionStatsExcel.scss';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

class AuctionStatsExcel extends React.Component {
    state = {
        onlineUsers: [],
        downloadExcel: false,
        totalAssets: [],
        passedInAssets: [],
        refferedAssets: [],
        soldAssets: []
    }

    fetchData = () => {
        this.props.searchAssets({ auctionId: this.props.auctionId }).then(res => {
            if (res.result) {
                this.setState({ totalAssets: res.result?.searchResult }, () => {
                    const tempPassedIn = this.state.totalAssets.filter(item => item.status === ASSET_STATUS.PASSED_IN) || [];
                    const tempReferred = this.state.totalAssets.filter(item => item.status === ASSET_STATUS.REFERRED) || [];
                    const tempSold = this.state.totalAssets.filter(item => item.status === ASSET_STATUS.SOLD) || [];
                    this.setState({ passedInAssets: tempPassedIn, refferedAssets: tempReferred, soldAssets: tempSold, downloadExcel: true });
                });

            }
        })
    }

    render() {
        return (
            <div classsName='auction-excel'>
                <Button onClick={this.fetchData} className="export-btn">Export Data as Excel</Button>
                {this.state.downloadExcel ?
                    <ExcelFile filename="auction-statistics" hideElement >
                        <ExcelSheet data={this.props.onlineUsers} name="Online Users">
                            <ExcelColumn label="Aunction Number" value="auctionNum" />
                            <ExcelColumn label="Alias" value="alias" />
                            <ExcelColumn label="Name" value="name" />
                            <ExcelColumn label="Session Start" value={(col) => dayjs(col.createdDate).format(DATE_FORMAT.DATETIME)} />
                        </ExcelSheet>
                        <ExcelSheet data={this.props.chartData} name="Margin">
                            <ExcelColumn label="Title" value="title" />
                            <ExcelColumn label="HighestBid Amount" value="currentBidAmount" />
                            <ExcelColumn label="Reserve Price" value={(col) => col.reservePrice ? col.reservePrice : 0} />
                        </ExcelSheet>
                        <ExcelSheet data={this.state.totalAssets} name="Total Assets">
                            <ExcelColumn label="Auction Number" value={(col) => col.auctionData.auctionNum} />
                            <ExcelColumn label="Consignment No" value="consignmentNo" />
                            <ExcelColumn label="Lot No" value="lotNo" />
                            <ExcelColumn label="Title" value="title" />
                            <ExcelColumn label="Location" value={(col) => col.city.name} />
                            <ExcelColumn label="HighestBid Amount" value="currentBidAmount" />
                            <ExcelColumn label="Status" value={(col) => col.isCurrent ? "Current" : `${col && col.status === ASSET_STATUS.RELEASED ? "Upcoming" : col && col.status}`} />
                        </ExcelSheet>
                        <ExcelSheet data={this.state.passedInAssets} name="Total PassedIn Assets">
                            <ExcelColumn label="Auction Number" value={(col) => col.auctionData.auctionNum} />
                            <ExcelColumn label="Consignment No" value="consignmentNo" />
                            <ExcelColumn label="Lot No" value="lotNo" />
                            <ExcelColumn label="Title" value="title" />
                            <ExcelColumn label="Location" value={(col) => col.city.name} />
                            <ExcelColumn label="HighestBid Amount" value="currentBidAmount" />
                            <ExcelColumn label="Status" value="status" />
                        </ExcelSheet>
                        <ExcelSheet data={this.state.refferedAssets} name="Total Referred Assets">
                            <ExcelColumn label="Auction Number" value={(col) => col.auctionData.auctionNum} />
                            <ExcelColumn label="Consignment No" value="consignmentNo" />
                            <ExcelColumn label="Lot No" value="lotNo" />
                            <ExcelColumn label="Title" value="title" />
                            <ExcelColumn label="Location" value={(col) => col.city.name} />
                            <ExcelColumn label="HighestBid Amount" value="currentBidAmount" />
                            <ExcelColumn label="Status" value="status" />
                        </ExcelSheet>
                        <ExcelSheet data={this.state.soldAssets} name="Total Sold Assets">
                            <ExcelColumn label="Auction Number" value={(col) => col.auctionData.auctionNum} />
                            <ExcelColumn label="Consignment No" value="consignmentNo" />
                            <ExcelColumn label="Lot No" value="lotNo" />
                            <ExcelColumn label="Title" value="title" />
                            <ExcelColumn label="Location" value={(col) => col.city.name} />
                            <ExcelColumn label="HighestBid Amount" value="currentBidAmount" />
                            <ExcelColumn label="Status" value="status" />
                        </ExcelSheet>
                    </ExcelFile> :
                    null}
            </div>
        );
    }
}

export default AuctionStatsExcel;