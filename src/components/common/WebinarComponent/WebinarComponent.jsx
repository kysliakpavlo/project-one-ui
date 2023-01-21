import React, { useEffect, useRef } from 'react';
import IframeComm from "react-iframe-comm";
import Modal from 'react-bootstrap/Modal'
import Button from "react-bootstrap/Button";
import './WebinarComponent.scss'

const Webinar = ({ webKey, showOtherVideo, closeWebinar }) => {
    const url = webKey ? webKey : '';
    const attributes = {
        src: url,
        width: "100%",
        height: `${window.innerHeight}`,
        class: "webinar-frame",
        frameBorder: 1, // show frame border just for fun...
    };
    const divRef = useRef(null);
    // the postMessage data you want to send to your iframe
    // it will be send after the iframe has loaded
    const postMessageData = "hello iframe";
    // parent received a message from iframe
    const onReceiveMessage = () => {
    };

    const handleClose = () => {
        closeWebinar()
    }

    useEffect(() => {
        divRef.current.scroll({ top: 300, behavior: 'smooth' });
    }, []);

    return <div className="">
        <Modal show={showOtherVideo} onHide={handleClose} >
            <Modal.Header closeButton>
                <Modal.Title>Live Audio</Modal.Title>
            </Modal.Header>
            <Modal.Body id="webinarModal" ref={divRef}>
                <div className="iframe-block">
                    <IframeComm
                        attributes={attributes}
                        postMessageData={postMessageData}
                        handleReceiveMessage={onReceiveMessage}
                    />
                </div></Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    </div>
}

export default Webinar;