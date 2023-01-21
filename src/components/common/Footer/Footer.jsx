import React, { useEffect, useState } from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, useHistory } from 'react-router-dom';
import { toUrlString, preventEvent } from '../../../utils/helpers';
import dayjs from 'dayjs';
import { stringify } from 'qs';
import './Footer.scss';
import SvgComponent from '../SvgComponent';

const Footer = ({ isLoggedIn, showLogin, toggleLogin, footerVendorLogo }) => {
	const history = useHistory();
	const path = history.location.pathname;
	const [pathName, setPathName] = useState(false);
	const currentYear = dayjs().format('YYYY');

	useEffect(() => {
		setPathName(
			history.location.pathname.split('/').includes('bidder-history') ||
				history.location.pathname.split('/').includes('buyer-card') ||
				history.location.pathname.split('/').includes('watchers')
		);
	}, [path]);

	const handleClick = (category, event) => {
		const obj = stringify({ assetType: category, title: category });
		history.push(`/search-results?${obj}`);
	};
	const navigateToMyaccount = () => {
		history.push(`/my-account/active-bid`);
	};
	const myAccountClick = (e) => {
		preventEvent(e);
		if (isLoggedIn) {
			history.push(`/my-account/active-bid`);
		} else {
			toggleLogin(true, () => navigateToMyaccount());
		}
	};

	return (
		<div className={showLogin ? 'backdrop app-footer' : 'app-footer'}>
			{!pathName ? (
				<div className="footer">
					<Nav>
						<div className="l-footer">
							<Navbar.Brand
								as={Link}
								to={'/'}
								alt="slattery"
							>
								{/* <img
									className="footerLogo"
									src={
										window.location.origin +
										'/assets/footer-logo.png'
									}
									alt="slattery logo"
								/> */}
								<img
									className="footerLogo"
									src={
										footerVendorLogo
											? footerVendorLogo
											: 'Auctions'
									}
									alt="slattery logo"
								/>
							</Navbar.Brand>
							{/* <p>
                Slattery Auctions Australia has become the most dynamic auction
                house and valuation practice in Australia. Their diversity,
                flexibility, experience and broad spectrum of specialities has
                set them apart from larger bulk handling competitors.
              </p> */}
						</div>
						<ul className="m-footer">
							<li>
								<ul className="box">
									<li>
										<h1 className="quick-links">
											Quick Links
										</h1>
									</li>
									<li className="footer-header">
										<Link
											onClick={(event) =>
												myAccountClick(event)
											}
											to="/#"
											alt="myAccount"
										>
											My Account
										</Link>
									</li>
									<li
										onClick={(event) =>
											handleClick('Buy Now', event)
										}
										className="footer-header"
									>
										<a> Buy </a>
									</li>
									{/* <li className="footer-header">
                    <Link to="/auctions" alt="auctions">
                      Auctions
                    </Link>
                  </li> */}
									{/* <li className="footer-header">
                    <Link
                      to="/expression-of-interest"
                      alt="expressionOfInterest"
                    >
                      Expression of Interest
                    </Link>
                  </li> */}
									{/* <li className="footer-header">
                    <Link to="/valuations" alt="valuations">
                      Valuations
                    </Link>
                  </li> */}
									<li className="footer-header">
										<Link
											to="/sell-with-us"
											alt="sellWithUs"
										>
											Sell With Us
										</Link>
									</li>

									<li className="footer-header">
										<Link
											to="/about-us"
											alt="aboutUs"
										>
											About Us
										</Link>
									</li>

									{/* <li className="footer-header">
                    <Link to="/sitemap" alt="SiteMap">
                      Site Map
                    </Link>
                  </li> */}
									<li className="footer-header">
										<Link
											to="/news"
											alt="news"
										>
											News
										</Link>
									</li>
								</ul>
							</li>
							<li className="right-link">
								<ul className="box">
									<li className="footer-header">
										<Link to="/contact-us">Contact Us</Link>
									</li>
									<li className="footer-header">
										<Link to="/faq">FAQ</Link>
									</li>
									<li className="footer-header">
										<Link to="/privacy-policy">
											Privacy Policy
										</Link>
									</li>
									<li className="footer-header">
										<Link to="/accept-terms-conditions">
											Terms & Conditions
										</Link>
									</li>
									<li className="footer-header">
										<a
											href={
												window.location.origin +
												'/files/Slattery_Information_Security_Policy.pdf'
											}
											target="_blank"
										>
											Information Security
										</a>
									</li>
									{/* <li className="footer-header">
                    <Link to="/quarterly-reports">Reports</Link>
                  </li> */}
									<li className="footer-header">
										{/* <Link to="/transport">Transport Calculator</Link> */}
									</li>
								</ul>
							</li>
							<li className="r-footer">
								<ul className="media-box">
									<li>
										<ul>
											<li>
												<p className="footer__header">
													{' '}
													Secure Transactions
												</p>
											</li>
											<li>
												<img
													alt="mastercard"
													width="50px"
													height="32px"
													src={
														window.location.origin +
														'/assets/mastercard.png'
													}
												/>{' '}
												<img
													alt="visa"
													width="50px"
													height="32px"
													src={
														window.location.origin +
														'/assets/visa.png'
													}
												/>
											</li>
										</ul>
									</li>
									<li>
										{' '}
										<ul>
											<li>
												<p className="footer__header">
													Follow Us
												</p>
											</li>
											<li className="footer-icons effect">
												<a
													rel="noopener"
													aria-label="slattery-facebook"
													href="https://www.facebook.com/slatteryauctions/"
													target="_blank"
													className="fa-facebook"
												>
													<SvgComponent path="facebook-svgrepo-com"></SvgComponent>
												</a>
												<a
													rel="noopener"
													aria-label="slattery-twitter"
													href="https://twitter.com/SlatteryAU"
													target="_blank"
													className="fa-twitter"
												>
													<SvgComponent path="twitter-svgrepo-com"></SvgComponent>
												</a>
												<a
													rel="noopener"
													aria-label="slattery-linkedin"
													href="https://www.linkedin.com/company/slattery-auctions-australia-pty-ltd/"
													target="_blank"
													className="fa-linkedin"
												>
													<SvgComponent path="linkedin-svgrepo-com"></SvgComponent>
												</a>
												<a
													rel="noopener"
													aria-label="slattery-youtube"
													href="https://www.youtube.com/user/SlatteryAuctionsAU"
													target="_blank"
													className="fa-youtube"
												>
													<SvgComponent path="youtube-svgrepo-com"></SvgComponent>
												</a>
											</li>
										</ul>
									</li>
								</ul>
							</li>
						</ul>
					</Nav>
				</div>
			) : (
				<></>
			)}
			<div className="b-footer">
				<p className="divCopyright">
					© Copyright {currentYear}. All rights reserved Slattery
					Auctions Australia
				</p>
			</div>
		</div>
	);
};

export default Footer;
