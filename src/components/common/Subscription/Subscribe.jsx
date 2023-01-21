import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import Button from "react-bootstrap/Button";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import { MultiSelectField, TextField } from "../FloatingField";
import Row from "react-bootstrap/Row";
import _map from "lodash/map";
import { Form as FormikForm, Field, withFormik } from "formik";
import { MESSAGES, SUBSCRIPTION_SOURCE } from "../../../utils/constants";
import { CheckBoxField } from "../FormField";
import { Link } from "react-router-dom";
import Form from "react-bootstrap/Form";
import SvgComponent from "../SvgComponent";
import useWindowSize from "../../../hooks/useWindowSize";
import Visible from "../Visible";
import "./Subscription.scss";

const Subscribe = ({ categories, locations, show, onClose, onPopup, subscribeToNewsLetter }) => {
	categories = categories.filter((ele) => ele.groupName !== "All Categories");
	const locationOptions = _map(locations, (item) => ({
		key: item.name,
		label: item.name,
	}));
	const categoryOptions = _map(categories, (item) => ({
		key: item.groupName,
		label: item.groupName,
	}));
	const [isTermsAgreed, setIsTermsAgreed] = useState(true);
	const [showAcc, setShowAcc] = useState(true);
	const [width] = useWindowSize();

	useEffect(() => {
		let visited = localStorage["alreadyVisited"];
		if (!visited) {
			localStorage["alreadyVisited"] = true;
			onPopup(true);
		}
	}, []);

	const onChangeTermsAgreed = (e) => {
		setIsTermsAgreed(!isTermsAgreed);
	};

	const toggleActive = () => {
		setShowAcc(!showAcc);
	};

	return (
		<Visible when={show}>
			<div className="subscribe-modal">
				<Visible when={width >= 1024}>
					<header className="subscribe-header">
						Register for Auction Alerts
						<SvgComponent
							onClick={onClose}
							path="close"
						/>
					</header>
					<section className="subscribe-note">Be the first to know about upcoming auctions. Sign up now!</section>
					<section className="subscribe-form">
						<FormikForm
							noValidate
							autoComplete="off"
						>
							<div className="subscribe-modal__field">
								<Row>
									<Field
										className="mb-0"
										placeholder="Areas Of Interest"
										component={MultiSelectField}
										name="assetInterests"
										options={categoryOptions}
									/>
								</Row>
								<Row>
									<Field
										className="mb-0"
										placeholder="Location"
										component={MultiSelectField}
										name="location"
										options={locationOptions}
									/>
								</Row>
								<Row>
									<Field
										className="mb-0"
										placeholder="Email"
										component={TextField}
										name="email"
										className="FeildtxtEmail"
									/>
								</Row>
								<Row
									className="m-0"
									hidden
								>
									<Field
										component={CheckBoxField}
										type="switch"
										name="subscribeToNewsLetter"
										label="I want to be kept up to date with the latest stock and upcoming auctions"
									/>
								</Row>
								<Row className="m-0">
									<Form.Group controlId={`termsNconditions`}>
										<Form.Check
											value={true}
											name={`termsAgreed`}
											type="checkbox"
											checked={isTermsAgreed}
											onChange={onChangeTermsAgreed}
											label={
												<>
													<div className="accept">I have Read and Accepted </div>
													<Link
														to="/accept-terms-conditions"
														target="_blank"
														className="terms-link"
													>
														Terms and Conditions
													</Link>
													<div>
														<a
															href={window.location.origin + "/files/Slattery_Information_Security_Policy.pdf"}
															target="_blank"
														>
															View our Information Security Policy
														</a>
													</div>
												</>
											}
										/>
									</Form.Group>
								</Row>
								<Row className="m-0">
									<Button
										variant="success"
										className="btn-block"
										type="submit"
										disabled={!isTermsAgreed}
									>
										Subscribe
									</Button>
								</Row>
							</div>
						</FormikForm>
					</section>
				</Visible>
				<Visible when={width < 1024}>
					<Accordion>
						<Card>
							<Accordion.Toggle
								className="subscribe-header"
								as={Card.Header}
								onClick={toggleActive}
								eventKey="0"
							>
								Register for Auction Alerts
								<Visible when={showAcc}>
									<SvgComponent
										path="expand-more"
										className="more-svg"
									/>
								</Visible>
								<Visible when={!showAcc}>
									<SvgComponent
										onClick={onClose}
										path="close"
									/>
								</Visible>
							</Accordion.Toggle>
							<Accordion.Collapse eventKey="0">
								<Card.Body>
									<section className="subscribe-note">Be the first to know about upcoming auctions. Sign up now!</section>
									<section className="subscribe-form">
										<FormikForm
											noValidate
											autoComplete="off"
										>
											<div className="subscribe-modal__field">
												<Row>
													<Field
														className="mb-0"
														placeholder="Areas Of Interest"
														component={MultiSelectField}
														name="assetInterests"
														options={categoryOptions}
													/>
												</Row>
												<Row>
													<Field
														className="mb-0"
														placeholder="Location"
														component={MultiSelectField}
														name="location"
														options={locationOptions}
													/>
												</Row>
												<Row>
													<Field
														className="mb-0"
														placeholder="Email"
														component={TextField}
														name="email"
														className="FeildtxtEmail"
													/>
												</Row>
												<Row
													className="m-0"
													hidden
												>
													<Field
														component={CheckBoxField}
														type="switch"
														name="subscribeToNewsLetter"
														label="I want to be kept up to date with the latest stock and upcoming auctions"
													/>
												</Row>
												<Row className="m-0">
													<Form.Group controlId={`termsNconditions`}>
														<Form.Check
															value={true}
															name={`termsAgreed`}
															type="checkbox"
															checked={isTermsAgreed}
															onChange={onChangeTermsAgreed}
															label={
																<>
																	<div className="accept">I have Read and Accepted </div>
																	<Link
																		to="/accept-terms-conditions"
																		target="_blank"
																		className="terms-link"
																	>
																		Terms and Conditions
																	</Link>
																	<div>
																		<a
																			href={window.location.origin + "/files/Slattery_Information_Security_Policy.pdf"}
																			target="_blank"
																		>
																			View our Information Security Policy
																		</a>
																	</div>
																</>
															}
														/>
													</Form.Group>
												</Row>
												<Row className="m-0">
													<Button
														variant="success"
														className="btn-block"
														type="submit"
														disabled={!isTermsAgreed}
													>
														Subscribe
													</Button>
												</Row>
											</div>
										</FormikForm>
									</section>
								</Card.Body>
							</Accordion.Collapse>
						</Card>
					</Accordion>
				</Visible>
			</div>
		</Visible>
	);
};
export default withFormik({
	mapPropsToValues: ({ categoryId = [], stateId = [], email = "", sourceType }) => {
		return {
			email,
			termsAgreed: true,
			location: stateId,
			assetInterests: categoryId,
			subscribeNewsLetter: true,
			subscriptionSource: sourceType === SUBSCRIPTION_SOURCE.NEWS_LETTER ? sourceType : SUBSCRIPTION_SOURCE.FIRST_TIME_VISITOR,
		};
	},
	validationSchema: Yup.object().shape({
		email: Yup.string().required("Email Required").email("Invalid email"),
	}),
	handleSubmit: (values, { props, ...formikProps }) => {
		props
			.subscribeToNewsLetter(values)
			.then((res) => {
				props.onClose();
				props.showMessage({
					message: MESSAGES.THANKS_SUBSCRIBE,
				});
			})
			.catch((err) => {
				props.showMessage({
					message: err.message,
				});
			});
	},
})(Subscribe);
