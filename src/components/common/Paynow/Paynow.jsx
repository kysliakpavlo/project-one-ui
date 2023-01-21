import React, { useEffect } from 'react';
import { PAYPAL_CLIENT_ID } from '../../../utils/constants';
import scriptLoader from './scriptLoader';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import './Paynow.scss';

const scriptPath = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=AUD`;
const Paynow = ({ amount, onCancel, setLoading, showMessage, onSuccess, payUsingCard }) => {

    const onPaypalJsLoad = () => {
        setTimeout(() => {
            setLoading(false);
        }, 0);
        document.querySelector('#paypal-button-container').innerHTML = '';
        window.paypal.Buttons({
            style: {
                shape: 'rect',
                color: 'gold',
                layout: 'vertical',
                label: 'paypal',
            },

            createOrder: function (data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        "amount": {
                            "currency_code": "AUD",
                            "value": amount
                        }
                        // reference_id: 123,
                        // items: [{
                        //     name: 'Car',
                        //     assetId: '1234'
                        // }, {
                        //     name: 'Truck',
                        //     assetId: 'fdom3o45903'
                        // }]
                    }]
                });
            },

            onApprove: function (data, actions) {
                return actions.order.capture().then(function (details) {
                    showMessage({ message: 'Transaction completed by ' + details.payer.name.given_name + '!' });
                    onSuccess(details);
                });
            },

            onError: function (err) {
            }
        }).render('#paypal-button-container');
    };

    useEffect(() => {
        setLoading(true);
        scriptLoader('paypalScript', scriptPath, onPaypalJsLoad)
    }, []);

    const onPayUsingCard = () => {
        payUsingCard({}).then(res => {

        }, err => {
            showMessage({ message: err.message, type: 'warning' });
        })
    };

    return (
        <Modal className='bottom-right' dialogClassName="paynow-modal" show={true} onHide={onCancel}>
            <Modal.Header closeButton>
                <Modal.Title>Pay Now</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div id="smart-button-container">
                    <Button variant="primary" className="btn-block" onClick={onPayUsingCard}>Pay with Registered Card</Button>
                    <div className='separator my-3'>
                        <span>or</span>
                    </div>
                    <div id="paypal-button-container"></div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default Paynow;
