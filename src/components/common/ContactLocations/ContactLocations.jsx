// import React, { useState, useEffect } from "react";
import React, { useState } from "react";
import './ContactLocations.scss';
import SvgComponent from "../SvgComponent";





const ContactLocations = ( props ) => {

console.log('test props', props);


	return (
		<section className='contact-locations-wrap'>

			<div className='contact-locations'>

				<div className='contact-location'>
					<h3>{props.contactContent.section1Heading}</h3>
					<p>P: <a href={'tel:' + props.contactContent.section1PhoneNumber}>{props.contactContent.section1PhoneNumber}</a></p>
					<p><a href={'mailto:' + props.contactContent.section1Email}>{props.contactContent.section1Email}</a></p>
					<p>{props.contactContent.section1AdditionalField}</p>
					<p>{props.contactContent.section1Location}</p>
					<a href={props.contactContent.section1ContactButton} className='map-link'>View on map
						<span title="down-arrow">
							<SvgComponent path="down-arrow" />
						</span>
					</a>


				</div>


				{/* <div className='contact-location'>
					<h3>Newcastle</h3>
					<p>P: <a href="tel:0440404040">(02) 4028 0000</a></p>
					<a>Email</a>
					<p>ABN 17 091 324 480</p>
					<p>230 Old Maitland Road, Hexham NSW 2322</p>
					<a href="#" className='map-link'>View on Map
						<span title="down-arrow">
							<SvgComponent path="down-arrow" />
						</span>
					</a>

				</div>*/}

			</div>



		</section >
	)

}

export default ContactLocations;