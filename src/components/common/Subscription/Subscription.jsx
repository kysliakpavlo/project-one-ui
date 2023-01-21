import React from "react";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Subscribe from "./Subscribe";
import Visible from "../Visible";
import { SUBSCRIPTION_SOURCE } from "../../../utils/constants";
import SvgComponent from "../SvgComponent";

import "./Subscription.scss";

const Subscription = ({ categories, locations, showMessage, showLogin, loggedIn, SFPage, subscribeToNewsLetter }) => {
	const [showPopup, setShowPopup] = useState(false);
	const handleClose = () => setShowPopup(false);
	const handleShow = (flag) => setShowPopup(flag);
	const [title, setTitle] = useState("");

	const sourceType = SUBSCRIPTION_SOURCE.NEWS_LETTER;
	return (
		<div className={!loggedIn && !SFPage ? (showLogin ? "backdrop footer-subscribe" : "footer-subscribe") : "footer-subscribe "}>
			<div className="container-fluid">
				<Visible when={!loggedIn && !SFPage}>
					<div className="row align-items--center">
						<div className="headline">
							<span className="footer__sub-headline">
								Subscribe to our newsletter and relevant upcoming{" "}
								auction alerts
							</span>
						</div>

						<div className="email-input ">
							<form className="form_subscribe d-flex">
								<div className="email-icon">
									{/* <SvgComponent path="email_white_24dp" /> */}
									<svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" fill="none" viewBox="0 0 27 27">
										<path stroke="#272E43" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.688" d="M1.688 5.344h23.625v16.875H1.688V5.344z"></path>
										<path
											stroke="#272E43"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="1.688"
											d="M24.931 5.963l-9.162 7.046a3.721 3.721 0 01-4.538 0L2.069 5.963"
										></path>
									</svg>
								</div>
								<div className="input_form">
									<input type="text" className="txtemail" onChange={(event) => setTitle(event.target.value)} name="txtEmail" placeholder="Email address" />
									<span className="span-btn">
										<Button variant="secondary" className="btn-subscribe" onClick={handleShow}>
											Subscribe
										</Button>
									</span>
								</div>
							</form>
							{
								<Visible when={showPopup}>
									<Subscribe
										show={showPopup}
										onClose={handleClose}
										onPopup={handleShow}
										locations={locations}
										categories={categories}
										showMessage={showMessage}
										email={title}
										sourceType={sourceType}
										subscribeToNewsLetter={subscribeToNewsLetter}
									/>
								</Visible>
							}
						</div>
					</div>
				</Visible>
			</div>
		</div>
	);
};
export default Subscription;
