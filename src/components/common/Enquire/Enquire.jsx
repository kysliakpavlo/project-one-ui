import React from "react";
import * as Yup from "yup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Form as FormikForm, Field, withFormik } from "formik";
import { TextField } from "../FloatingField";
import { CheckBoxField } from "../FormField";
import validator, { requiredString } from "../../../utils/validator";
import { SUBSCRIPTION_SOURCE, MESSAGE, MESSAGES } from "../../../utils/constants";
import "./Enquire.scss";

const Enquire = ({ show, onClose }) => {
	return (
		<Modal size="sm" show={show} onHide={onClose} className="enquire-form">
			<Modal.Header closeButton>
				<Modal.Title className="text-center">Have a question?</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<FormikForm noValidate autoComplete="off">
					<Row>
						<Col sm={12}>
							<p className="desc">Contact your friendly Slattery Auctions team today.</p>
						</Col>
						<Col sm={12}>
							<Field component={TextField} label="First Name" placeholder="" name="firstName" required />
						</Col>
						<Col sm={12}>
							<Field component={TextField} label="Last Name" placeholder="" name="lastName" required />
						</Col>
						<Col sm={12}>
							<Field component={TextField} label="Email" placeholder="" name="email" required />
						</Col>
						<Col sm={12}>
							<Field component={TextField} label="Phone / Mobile" placeholder="" name="phone" required />
						</Col>
						<Col sm={12}>
							<Field component={TextField} name="comments" label="Comments" fieldAs="textarea" rows={6} required />
						</Col>
						<Col sm={12}>
							<Field
								component={CheckBoxField}
								type="switch"
								className="txt-news"
								name="subscribeNewsLetter"
								label="I want to be kept up to date with the latest stock and upcoming auctions"
								required
							/>
						</Col>
						<Col sm={12} className="submit-btn">
							<Button className="btn btn-primary btn-submit" type="submit">
								Submit
							</Button>
						</Col>
					</Row>
				</FormikForm>
			</Modal.Body>
		</Modal>
	);
};

export default withFormik({
	mapPropsToValues: ({ loggedInUser, asset }) => {
		const { firstName = "", lastName = "", email = "", mobile: phone = "" } = loggedInUser || {};
		const { assetId } = asset || {};
		const recordType = asset?.auctionData?.isEOI ? "EOI" : "General";
		const state = asset.state.name;
		const assetInterest = asset?.assetCategory?.categoryGroup?.groupName ? asset?.assetCategory?.categoryGroup?.groupName : "";
		return {
			firstName,
			lastName,
			email,
			phone,
			state,
			comments: "",
			subscribeNewsLetter: true,
			assetId,
			recordType,
			assetInterest,
			subscriptionSource: SUBSCRIPTION_SOURCE.ENQUIRY,
		};
	},
	validationSchema: Yup.object().shape({
		firstName: validator.name,
		lastName: validator.name,
		email: validator.email,
		phone: validator.phone,
		comments: validator.requiredString("Please provide information about query"),
	}),
	handleSubmit: (values, { props, ...formikProps }) => {
		console.log("hei");
		props.submitAssetEnquire(values).then(
			(res) => {
				props.onClose();
				props.showMessage({ message: MESSAGES.ENQUIRY_SUBMIT });
			},
			(err) => {
				props.showMessage({ message: err.message, type: "error" });
			}
		);
	},
})(Enquire);
