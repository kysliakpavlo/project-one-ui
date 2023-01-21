import React, { useEffect, useState } from 'react';
import ReactExport from "react-data-export";
import Table from 'react-bootstrap/Table';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import SvgComponent from '../SvgComponent';
import Visible from "../Visible";
import NoResults from "../NoResults";
import './AssetWatchers.scss';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const AssetWatchers = (props) => {
    const { assetId } = props.match.params;
    const [assetWatchers, setAssetWatchers] = useState([]);
    const [activeId, setActiveId] = useState(0);
    const [downloadExcel, setDownloadExcel] = useState(false);

    useEffect(() => {
        props.getAssetWatchers({ assetId }).then((res) => {
            setAssetWatchers(res.result);
        })
    }, [assetId])

    const toggleActive = (id) => {
        if (activeId === id) {
            setActiveId(null);
        } else {
            setActiveId(id);
        }
    }

    const refreshLoad = () => {
        props.getAssetWatchers({ assetId }).then((res) => {
            setAssetWatchers(res.result)
        })
    }

    return (
        <div className='asset-watchers p-3 container px-0'>
            <h4 className="p-2">
                <strong>Asset Watchers</strong>
                <div className="pull-right">
                    <Button onClick={() => { setDownloadExcel(true) }} className="export-btn">Export Data as Excel</Button>
                    {downloadExcel ?
                        <ExcelFile filename="asset-watchers" hideElement >
                            {assetWatchers && assetWatchers.map((watcher, index) => (
                                <ExcelSheet key={index} data={watcher.watchers} name={`Asset Watchers_${index + 1}`}>
                                    <ExcelColumn label="Auction" value={(col) => watcher.auctionName ? watcher.auctionName : 'Buy Now'} />
                                    <ExcelColumn label="Name" value={(col) => `${col.firstName} ${col.lastName}`} />
                                    <ExcelColumn label="Email" value="email" />
                                    <ExcelColumn label="Mobile" value="mobile" />
                                </ExcelSheet>
                            ))}
                        </ExcelFile> :
                        null}
                    <Button onClick={refreshLoad}>Refresh</Button>
                </div>
            </h4>
            {
                (assetWatchers && assetWatchers.length === 0 &&
                    <NoResults />
                )
            }
            {
                assetWatchers && assetWatchers.map((watcher, index) => {
                    return (
                        <Accordion defaultActiveKey={`${index}`} key={`${index}`} className="p-2">
                            <Card>
                                <Accordion.Toggle as={Card.Header} onClick={() => toggleActive(`${index}`)} eventKey={`${index}`}>
                                    <Visible when={activeId === `${index}`}>
                                        <SvgComponent path="expand-more" className="more-svg" />
                                    </Visible>
                                    <Visible when={activeId !== `${index}`}>
                                        <SvgComponent path="arrow-next" className="next-svg" />
                                    </Visible>
                                    <Visible when={watcher.auctionName}>
                                        <strong> Auction: {watcher.auctionName}</strong>
                                    </Visible>
                                    <Visible when={!watcher.auctionName}>
                                        <strong> Buy Now </strong>
                                    </Visible>
                                    <div className='pull-right'>
                                        <strong>Total Watchers:{watcher.watchers.length} </strong>
                                    </div>
                                </Accordion.Toggle>
                                <Accordion.Collapse eventKey={`${index}`}>
                                    <Card.Body>
                                        <Table className="table-striped table-bordered mt-2">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Mobile</th>
                                                </tr>
                                            </thead>
                                            <tbody >
                                                {watcher.watchers && watcher.watchers.map((user, usrIdx) => {
                                                    return (
                                                        <tr key={usrIdx}>
                                                            <td>{user.firstName} {user.lastName}</td>
                                                            <td>{user.email}</td>
                                                            <td>{user.mobile}</td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Accordion.Collapse>
                            </Card>
                        </Accordion>
                    )
                })
            }
        </div >
    )
}

export default AssetWatchers;