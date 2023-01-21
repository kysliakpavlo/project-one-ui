import React, { useEffect, useState } from "react";
import "./TextImagePanel.scss";



const TextImagePanel = ({ imageOrder, button, description, heading, image }) => {

    const [imageSide, setImageSide] = useState('left');


    useEffect(() => {
        setImageSide(imageOrder);
    }, [imageSide]);



    const ImageElem = () => {
        return (
            <div className="col-md-6 px-5">
                <div>
                    <img src={image} />
                </div>
            </div>
        )
    }

	const createMarkup= (data) => {
		return {__html: data}
	}

    return (
        <div className="container textImagePanel">
            <div className="row">

                {/* Toggle image left or right column */}
                {imageSide == 'left' ? <ImageElem /> : ''}

                <div className="col-md-6 px-5 ">
					{ heading && <h2>{heading}</h2>}
					{description && <div  dangerouslySetInnerHTML={createMarkup(description)} ></div>}
                </div>

                {imageSide == 'right' ? <ImageElem /> : ''}

            </div>
        </div>

    )
};

export default TextImagePanel;

