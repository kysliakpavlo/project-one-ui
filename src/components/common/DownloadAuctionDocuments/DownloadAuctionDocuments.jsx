import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Visible from "../Visible";
import Form from "react-bootstrap/Form";
import _findIndex from "lodash/findIndex";
import _isEmpty from "lodash/isEmpty";
import Modal from "react-bootstrap/Modal";
import SvgComponent from "../SvgComponent";
import { preventEvent } from "../../../utils/helpers";

import "./DownloadAuctionDocuments.scss";
import { MESSAGES } from "../../../utils/constants";

const DownloadAuctionDocuments = (props) => {
    const [auctionDocuments, setAuctionDocuments] = useState([]);
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [invoiceDocuments, setInvoiceDocuments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [iOS, setIos] = useState(false);
    const handleClose = () => {
        setSelectedDocuments([]);
        setShowModal(false);
    };

    useEffect(() => {
        setAuctionDocuments(props.documents);
        setIos(/^(iPhone|iPad|iPod)/.test(navigator.platform));
    }, [props.documents, props.isCatalogue, props.isEOI]);

    const downloadDocument = (e) => {
        preventEvent(e);
        if ((props.isCatalogue || props.isEOI) && auctionDocuments && auctionDocuments.length) {
            if (auctionDocuments.length > 1) {
                setShowModal(true);
            } else if (auctionDocuments.length === 1) {
                const link = document.createElement("a");
                link.href = auctionDocuments[0].imageUrl;
                link.download = auctionDocuments[0].name;
                link.target = "_blank";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } else {
            setSelectedDocuments([]);
            const params = {};
            if (props.auctionId) params.auctionId = props.auctionId;
            if (props.assetId) params.assetId = props.assetId;
            props.getAuctionDocuments(params).then((res) => {
                if (!_isEmpty(res.result)) {
                    setAuctionDocuments(res.result);
                    if (res.result.length > 1) {
                        setShowModal(true);
                    } else if (res.result.length === 1) {
                        const link = document.createElement("a");
                        link.href = res.result[0].imageUrl;
                        link.download = res.result[0].name;
                        link.target = "_blank";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                } else {
                    props.showMessage({ message: MESSAGES.NO_DOCUMENT, type: "warning" });
                }
            });
        }
    };
    const downloadInvoiceDocument = () => {
        setInvoiceDocuments([]);
        const params = {};
        if (props.auctionId) params.auctionId = props.auctionId;
        if (props.assetId) params.assetId = props.assetId;
        if (props.consignmentNo) params.consignmentNo = props.consignmentNo;
        if (props.auctionNum) params.auctionNum = props.auctionNum;
        props.getAssetInvoice(params).then((res) => {
            if (res.result !== null) {
                setInvoiceDocuments(res.result);
                const link = document.createElement("a");
                link.href = res.result?.documentUrl;
                link.download = res.result?.name;
                link.target = "_blank";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                props.showMessage({ message: MESSAGES.NO_DOCUMENT, type: "warning" });
            }
        });
    };
    const downloadMultiple = () => {
        let tempDocs = [...auctionDocuments];
        tempDocs.forEach((item) => {
            item.checked = false;
        });
        setAuctionDocuments(tempDocs);
        selectedDocuments &&
            selectedDocuments.forEach((doc) => {
                const link = document.createElement("a");
                link.href = doc.imageUrl;
                link.key = doc.assetImageId;
                link.download = doc.name;
                link.target = "_blank";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        handleClose();
    };

    const handleInputChange = (doc) => {
        doc.checked = !doc.checked;
        let tempDocs = [...auctionDocuments];
        const docIndex = _findIndex(tempDocs, { assetImageId: doc.assetImageId });
        tempDocs[docIndex] = doc;
        setAuctionDocuments(tempDocs);
        if (selectedDocuments.length) {
            const index = _findIndex(selectedDocuments, {
                assetImageId: doc.assetImageId,
            });
            if (index > -1 && !doc.checked) {
                selectedDocuments.splice(index, 1);
                setSelectedDocuments(selectedDocuments);
            } else if (doc.checked) {
                selectedDocuments.push(doc);
                setSelectedDocuments(selectedDocuments);
            }
        } else {
            if (doc.checked) {
                selectedDocuments.push(doc);
                setSelectedDocuments(selectedDocuments);
            }
        }
    };
    const downloadSingleDocument = (doc) => {
        const link = document.createElement("a");
        link.href = doc.imageUrl;
        link.key = doc.assetImageId;
        link.download = doc.name;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    return (
        <div className="download-auction-documents">
            <Visible when={props.invoice}>
                <Button className="btn-primary-color" onClick={downloadInvoiceDocument}>
                    {/* <SvgComponent path="pic-as-pdf" /> */}
                    {"Invoice"}
                </Button>
            </Visible>
            <Visible when={!props.auctionNum && !props.invoice}>
                <Button className="btn-primary-color" onClick={downloadDocument}>
                    {/* <SvgComponent path="pic-as-pdf" /> */}
                    {props.isEOI ? "Download" : props.label ? props.label : "Document Download"}
                </Button>
            </Visible>
            <Visible when={props.auctionNum && !props.invoice}>
                <Button  className="" onClick={downloadDocument}>
                    {/* <SvgComponent path="file_download" /> */}
                    Download Catalogue 
                </Button>
            </Visible>
            <Visible when={showModal}>
                <Modal size="sm" show={showModal} onHide={handleClose} onClick={preventEvent} dialogClassName="documents-download">
                    <Modal.Header closeButton>
                        <Modal.Title>Select Documents to Download</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="show-grid">
                        <p className="download-text">Please select the documents you wish to download.</p>
                        <Form>
                            {auctionDocuments &&
                                auctionDocuments.map((doc) => {
                                    return (
                                        <div className="checkbox-custom-css" onClick={(e) => handleInputChange(doc)} key={`doc_${doc.assetImageId}`}>
                                            {iOS ? (
                                                <div className="document-block">
                                                    <span className="document-name">{doc.name}</span>
                                                    <Button onClick={(e) => downloadSingleDocument(doc)}> Download</Button>
                                                </div>
                                            ) : (
                                                <Form.Check type="checkbox" custom id={`doc_${doc.assetImageId}`}>
                                                    <Form.Check.Input type="checkbox" checked={doc.checked} value={true} readOnly name={`doc_${doc.assetImageId}`} isValid />
                                                    <Form.Check.Label>{doc.name}</Form.Check.Label>
                                                </Form.Check>
                                            )}
                                        </div>
                                    );
                                })}
                        </Form>
                        <Visible when={!iOS}>
                            <div className="download-btn">
                                <Button onClick={downloadMultiple}> Download</Button>
                            </div>
                        </Visible>
                    </Modal.Body>
                </Modal>
            </Visible>
        </div>
    );
};

export default DownloadAuctionDocuments;
