// import React, { useState, useEffect } from "react";
import './PageBanner.scss';

const PageBanner = ({ title, subHeading }) => {
	//Banner Image
	let image = 'car_in_field.png';

	//Button
	let text = 'Submit a listing';
	let home = window.location.origin;
	let link = '/sell-with-us';
	// Notext for post page
	let noText = false;

	switch (title) {
		case 'About Us':
			image = 'car_in_field_about.jpg';
			text = '';
			link = '';
			break;
		case 'Sell With Us':
			image = 'car_in_field.jpg';
			link = '/sell-with-us#formSection';
			break;
		case 'Contact Us':
			image = 'car_in_field_contact.jpg';
			text = '';
			break;
		case 'FAQ':
			image = 'red-car-highway.png';
			text = 'Contact Us';
			link = '/contact-us';
			break;
		case 'News':
			image = 'happy-driver.png';
			text = '';
			link = '';
			break;
		case 'Post':
			image = 'lady-driving-car.png';
			text = '';
			link = '';
			noText = true;
			break;
		default:
			image = 'car_in_field.jpg';
	}

	return (
		<section>
			<div
				className="PageBanner"
				style={{
					backgroundImage:
						'linear-gradient(90deg, var(--cta-color-1) -9%, rgba(255, 255, 255, 0) 65%),' +
						'url(' +
						window.location.origin +
						'/assets/' +
						image +
						')',
					backgroundPosition: 'center',
					backgroundSize: 'cover',
					backgroundRepeat: 'no-repeat',
				}}
			>
				{noText ? (
					''
				) : (
					<div className="container-xxl">
						<div className="PageBanner__container">
							{title && (
								<div className="PageBanner__content">
									<div className="PageBanner__content-wrapper">
										<h2>{title}</h2>
										{subHeading ? (
											subHeading
										) : (
											<p>Subheading goes along here</p>
										)}

										{text ? (
											<a
												href={home + link}
												className="btn btn-primary btn-submit btn btn-primary"
											>
												{' '}
												{text}{' '}
											</a>
										) : (
											''
										)}
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</section>
	);
};

export default PageBanner;
