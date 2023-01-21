import React from 'react'
import Table from "react-bootstrap/Table";
import dayjs from 'dayjs';
import { DATE_FORMAT } from '../../../utils/constants';

import './OnlineUsers.scss';

const OnlineUsers = ({ activeUsers = [] }) => {
    return (
        <div className='online-users'>
            <Table className="table-striped table-bordered mt-2 mb-2">
                <thead>
                    <tr>
                        <th>Auction Number</th>
                        <th>Alias</th>
                        <th>Name</th>
                        <th>Session Start</th>
                    </tr>
                </thead>
                <tbody>
                    {activeUsers && activeUsers.map(user => {
                        return (
                            <tr>
                                <td>{user.auctionNum}</td>
                                <td>{user.alias}</td>
                                <td>{user.name}</td>
                                <td>{dayjs(user.createdDate).format(DATE_FORMAT.DATETIME)}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
        </div>
    )
}

export default OnlineUsers;