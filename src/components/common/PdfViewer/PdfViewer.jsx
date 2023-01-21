import React, { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf';
import SvgComponent from '../SvgComponent';

import './PdfViewer.scss';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PdfViewer = ({ pdf }) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1);
    const [customScale, setCustomScale] = useState(false);

    function onPageLoad(page) {
        if (!customScale) {
            const parentDiv = document.querySelector('.pdf-viewer')
            let pageScale = parentDiv.clientWidth / page.originalWidth
            if (scale !== pageScale) {
                setScale(pageScale);
            }
        }
    }

    const onPrevClick = () => {
        if (pageNumber > 1) {
            setPageNumber(pageNumber - 1)
        }
    }

    const onNextClick = () => {
        if (pageNumber < numPages) {
            setPageNumber(pageNumber + 1)
        }
    }

    const zoomIn = (e) => {
        setScale(scale + .1);
        setCustomScale(true)
    }

    const zoomOut = (e) => {
        setScale(scale - .1);
        setCustomScale(true)
    }

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    return (
        <>
            <div className="pdf-controls">
                <div className="zoom-controls">
                    <span className="pull-left zoom-in" onClick={(e) => { zoomIn(e) }}><SvgComponent path="zoom_in"></SvgComponent></span>
                    <span className="pull-left zoom-out" onClick={(e) => { zoomOut(e) }}><SvgComponent path="zoom_out"></SvgComponent></span>
                </div>

                <span className={pageNumber === 1 ? "span-prev disabled" : "span-prev"} onClick={onPrevClick}><SvgComponent path="arrow-prev"></SvgComponent></span>
                <span className="totalPages"> {pageNumber} \ {numPages}</span>
                <span className={pageNumber === numPages ? "span-next disabled" : "span-next"} onClick={onNextClick}><SvgComponent path="arrow-next" ></SvgComponent></span>
                {/* <div className="print-controls">
                    <span className="pull-right print" onClick={(e) => { print(e) }}><SvgComponent path="print"></SvgComponent></span>
                </div> */}
            </div>
            <div className="pdf-viewer">
                <Document file={{ url: pdf }} onLoadSuccess={onDocumentLoadSuccess}>
                    <Page scale={scale} key={`page_${pageNumber}`} pageNumber={pageNumber} onLoadSuccess={(page) => onPageLoad(page)}>
                    </Page>
                </Document>
            </div>
            <div className="pdf-controls">
                <div className="zoom-controls">
                    <span className="pull-left zoom-in" onClick={(e) => { zoomIn(e) }}><SvgComponent path="zoom_in"></SvgComponent></span>
                    <span className="pull-left zoom-out" onClick={(e) => { zoomOut(e) }}><SvgComponent path="zoom_out"></SvgComponent></span>
                </div>

                <span className={pageNumber === 1 ? "span-prev disabled" : "span-prev"} onClick={onPrevClick}><SvgComponent path="arrow-prev"></SvgComponent></span>
                <span className="totalPages"> {pageNumber} \ {numPages}</span>
                <span className={pageNumber === numPages ? "span-next disabled" : "span-next"} onClick={onNextClick}><SvgComponent path="arrow-next" ></SvgComponent></span>
                {/* <div className="print-controls">
                    <span className="pull-right print" onClick={(e) => { print(e) }}><SvgComponent path="print"></SvgComponent></span>
                </div> */}
            </div>
        </>
    );
};

export default PdfViewer;