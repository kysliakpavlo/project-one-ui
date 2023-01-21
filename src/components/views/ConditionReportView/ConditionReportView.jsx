import React, { useState } from 'react';
import './ConditionReportView.scss';

const ConditionReportView = ({ generateConditionReport }) => {
    const [plotterNumbers, setPlotterNumbers] = useState("");
    const [category, setCategory] = useState("");
    const [subcategory, setSubcategory] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [image, setImage] = useState();
    const callAPI = (key) => {
        generateConditionReport({
            assetType: category,
            assetSubType: subcategory,
            plotters: plotterNumbers.split(',').map(x => { return parseInt(x) }),
            imageUrl: imageUrl
        }).then((res) => {
            setImage(res.result.image);
        }).catch(err => {
        })
    }

    return (
        <div className="container" >
            <br></br>
            <br></br>
            <h1>Condition Report</h1>
            <br></br>
            <div className="form-group">
                <label className="form-label">Plotter Numbers</label>
                <input
                    type="text"
                    className="form-control"
                    value={plotterNumbers}
                    onChange={e => setPlotterNumbers(e.target.value)}
                    placeholder="1,2,3,4,5....."
                />
            </div>
            <div className="form-group">
                <label className="form-label">Category</label>
                <input
                    type="text"
                    className="form-control"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="Car"
                />
            </div>
            <div className="form-group">
                <label className="form-label">Sub-Category</label>
                <input
                    type="text"
                    className="form-control"
                    value={subcategory}
                    onChange={e => setSubcategory(e.target.value)}
                    placeholder="Sedan"
                />
            </div>
            <div className="form-group">
                <label className="form-label">Image Url</label>
                <input
                    type="text"
                    className="form-control"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    placeholder="http://google.com/"
                />
            </div>
            <br></br>
            <button className="btn btn-primary btn-block" onClick={callAPI}>Generate Image</button>
            <br></br>
            <br></br>
            <img src={image} className="imageCSS" />
        </div>
    )
}

export default ConditionReportView;