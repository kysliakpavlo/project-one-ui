import React, { useEffect, useState } from 'react';
import _cloneDeep from "lodash/cloneDeep";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import SVGComponent from '../../SvgComponent';
import { toTimeStr } from '../../../../utils/helpers';

import './NotifyMeFor.scss';

const NotifyMeFor = ({ showMessage, getAllNotifyMe, saveNotifyMe, deleteNotifyme }) => {
    const [savedNotifications, setSavedNotifications] = useState({ assets: [], auctions: [] });

    const updateSelections = (notifications) => notifications.map(item => {
        item.email = item.type.includes('Email');
        item.sms = item.type.includes('SMS');
        return item;
    });

    useEffect(() => {
        getAllNotifyMe().then(response => {
            const auctions = updateSelections(response.result.auctions);
            const assets = updateSelections(response.result.assets);
            setSavedNotifications({ auctions, assets });
        }).catch(err => {
            showMessage({ messsage: err.message });
        });
    }, []);

    const onChange = (index, group, name, frequency, fIndex) => e => {
        const newItems = _cloneDeep(savedNotifications);
        const item = newItems[group][index];
        if (name === 'frequency') {
            item.frequency[fIndex].selected = !item.frequency[fIndex].selected;
        } else {
            item[name] = e.target.checked;
        }

        const subscription = [];
        if (item.email) subscription.push('Email');
        if (item.sms) subscription.push('SMS');
        const type = subscription.join(';');

        const payload = {
            type,
            time: item.time,
            auctionId: item.auctionId,
            frequency: item.frequency.filter(item => item.selected).map(item => item.frequency),
        };

        if (item.assetId) {
            payload.assetId = item.assetId;
        }

        saveNotifyMe(payload).then(res => {
            newItems[group][index] = item;
            setSavedNotifications(newItems);
        }).catch(err => showMessage({ message: err.message }));
    };

    const onDeleteNotifyme = (group, index) => {
        const items = savedNotifications[group];
        deleteNotifyme(items[index]).then(res => {
            showMessage({ message: res.message });
            setSavedNotifications({
                ...savedNotifications,
                [group]: items.filter((item, i) => i !== index)
            });
        }).catch(err => {
            showMessage({ message: err.message });
        })
    };

    const { assets = [], auctions = [] } = savedNotifications;

    return (
        <div className='notify-me-for'>
            <Card className='no-hover'>
                <Card.Header className='pt-3'>Auctions Notifications</Card.Header>
                <Card.Body className='pt-3'>
                    <Row>
                        {auctions.map((item, index) => (
                            <Col md='3' key={item.auctionId}>
                                <Card>
                                    <Card.Header className='header-bg-color'>
                                        <div className='ellipsis'>{item.auction?.name}</div>
                                        <small>Notify me before {item.time}</small>
                                    </Card.Header>
                                    <Card.Body className="pt-3 pb-0">
                                        {item.frequency?.length > 1 && item.frequency?.map((f, fIndex) => (
                                            <div key={f.frequency}>
                                                <Form.Check type="switch" label={<small>{toTimeStr(f.frequency)}</small>} id={`${item.auction?.name}_${f.frequency}_email`} onChange={onChange(index, 'auctions', 'frequency', f, fIndex)} checked={f.selected} />
                                            </div>
                                        ))}
                                        {item.frequency?.length > 1 && (
                                            <hr className='my-2' />
                                        )}
                                        <Row className='mx-0'>
                                            <Col className='px-0'>
                                                <Form.Check type="switch" id={`${item.auction?.name}_email`} label="Email" checked={item.email} onClick={onChange(index, 'auctions', 'email')} />
                                            </Col>
                                            <Col className='px-0'>
                                                <Form.Check type="switch" id={`${item.auction?.name}_sms`} label="SMS" checked={item.sms} onClick={onChange(index, 'auctions', 'sms')} />
                                            </Col>
                                        </Row>
                                        <div className='text-right my-2'>
                                            <Button variant="danger" onClick={() => onDeleteNotifyme('auctions', index)}><SVGComponent path="delete_black_24dp"></SVGComponent></Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Card.Body>
            </Card>
            <Card className='no-hover'>
                <Card.Header className='pt-3'>Assets Notifications</Card.Header>
                <Card.Body className='pt-3'>
                    <Row>
                        {assets.map((item, index) => (
                            <Col md='3' key={item.assetId}>
                                <Card>
                                    <Card.Header className='header-bg-color'>
                                        <div className='ellipsis'>{item.asset?.name}</div>
                                        <small>Notify me before {item.time}</small>
                                    </Card.Header>
                                    <Card.Body className="pt-3 pb-0">
                                        {item.frequency?.length > 1 && item.frequency?.map((f, fIndex) => (
                                            <div key={f.frequency}>
                                                <Form.Check type="switch" label={<small>{toTimeStr(f.frequency)}</small>} id={`${item.asset?.name}_${f.frequency}_email`} onChange={onChange(index, 'assets', 'frequency', f, fIndex)} checked={f.selected} />
                                            </div>
                                        ))}
                                        {item.frequency?.length > 1 && (
                                            <hr className='my-2' />
                                        )}
                                        <Row className='mx-0'>
                                            <Col className='px-0'>
                                                <Form.Check type="switch" id={`${item.asset?.name}_email`} label="Email" checked={item.email} onClick={onChange(index, 'assets', 'email')} />
                                            </Col>
                                            <Col className='px-0'>
                                                <Form.Check type="switch" id={`${item.asset?.name}_sms`} label="SMS" checked={item.sms} onClick={onChange(index, 'assets', 'sms')} />
                                            </Col>
                                        </Row>
                                        <div className='text-right my-2'>
                                            <Button variant="danger" onClick={() => onDeleteNotifyme('assets', index)}><SVGComponent path="delete_black_24dp"></SVGComponent></Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Card.Body>
            </Card >
        </div >
    )
}


export default NotifyMeFor;
