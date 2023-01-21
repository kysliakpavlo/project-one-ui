import React, { useEffect, useState } from 'react';
import _get from 'lodash/get';
import { Link } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Enquire from '../Enquire';
import Visible from '../Visible';
import SvgComponent from '../SvgComponent';

import './TransportCalculatorTable.scss';

const TransportCalculatorTable = ({ assetType, fromLocation, onClose, enquiry, assetDetail, loggedInUser, showMessage, getTransportFee }) => {
    const [data, setData] = useState([]);
    const [showEnquire, setShowEnquire] = useState(false);

    useEffect(() => {
        const req = { assetType, fromLocation };

        getTransportFee(req).then(res => {
            const result = res.result && res.result.filter(transport => transport.toCity !== null || transport.distance);
            setData(result);
        });
    }, [assetType, fromLocation]);


    const toggleEnquire = () => {
        setShowEnquire(!showEnquire);
    }

    return (
        <div className='transport-calculator-table'>
            {onClose && (
                <Button onClick={onClose} className='close-btn slt-dark'>
                    <SvgComponent path='close' />
                </Button>
            )}
            <div className='table-wrapper'>
                <Table bordered>
                    <thead>
                        <tr>
                            <th>To Location</th>
                            <th>Approx. Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data && data.map((transport) => {
                            return (
                                <tr key={transport.transportFeeId}>
                                    <td> {_get(transport.toCity, 'name') || transport.distance}</td>
                                    <td>{transport.approximatePrice}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>
            </div>
            <Visible when={enquiry && !data.length}>
                <Button className='more-btn slt-green' onClick={toggleEnquire}>Enquire more</Button>
            </Visible>
            <Visible when={!enquiry || data.length}>
                <Button as={Link} className='more-btn slt-green' to='/transport'>More Locations</Button>
            </Visible>
            {showEnquire && (
                <Enquire asset={assetDetail} show={showEnquire} loggedInUser={loggedInUser} showMessage={showMessage} onClose={toggleEnquire} />
            )}
        </div>
    );
};

export default TransportCalculatorTable;
