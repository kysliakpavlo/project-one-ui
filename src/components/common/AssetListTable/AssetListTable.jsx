import React from 'react'
import Table from "react-bootstrap/Table";
import { ASSET_STATUS } from "../../../utils/constants";

const AssetListTable = ({ assetList = [] }) => {
    return (
        <div className='assetList-table'>
            <Table className="table-striped table-bordered mt-2 mb-2">
                <thead>
                    <tr>
                        <th>Auction Number</th>
                        <th>Consignment No</th>
                        <th>Lot No</th>
                        <th>Title</th>
                        <th>Location</th>
                        <th>HighestBid Amount</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {assetList && assetList.map(asset => {
                        return (
                            <tr>
                                <td>{asset.auctionData.auctionNum}</td>
                                <td>{asset.consignmentNo}</td>
                                <td>{asset.lotNo}</td>
                                <td>{asset.title}</td>
                                <td>{asset.city.name}</td>
                                <td>{asset.currentBidAmount}</td>
                                <td>{asset && asset.isCurrent ? "Current" : `${asset && asset.status === ASSET_STATUS.RELEASED ? "Upcoming" : asset && asset.status}`}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
        </div>
    )
}

export default AssetListTable;