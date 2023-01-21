import React, { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import * as Yup from "yup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Form as FormikForm, Field, withFormik } from "formik";
import { GOOGLE_RECAPTCHA_SITE_KEY, MESSAGES } from "../../../utils/constants";
import { TextField, SelectField } from "../FormField";
import ScrollToError from "../ScrollToError";
import validator from "../../../utils/validator";
import "./FinancialEnquiry.scss";

const FinancialEnquiry = ({
  setFieldValue,
  locations,
  handleSubmit,
}) => {
  const [validAmount, setValidAmount] = useState(false);
  const businessDuringOptions = [
    { key: "New", label: "New" },
    { key: "Less than 2 years", label: "Less than 2 years" },
    { key: "Greater than 2 years", label: "Greater than 2 years" },
    { key: "Not applicable", label: "Not applicable" },
  ];

  const creditDefaultOptions = [
    { key: "", label: "Select" },
    { key: "Yes", label: "Yes" },
    { key: "No", label: "No" },
  ];

  const residenceOptions = [
    { key: "Own", label: "Own" },
    { key: "Making Mortgage payments", label: "Making Mortgage payments" },
    { key: "Renting", label: "Renting" },
    { key: "Boarding", label: "Boarding" },
  ];

  const locationOptions = locations.map((state) => ({
    key: state.name,
    label: state.name,
  }));

  const onChangeCaptcha = (a, b, c) => {
    setFieldValue("captcha", true);
  };

  const onErrorCaptcha = (a, b, c) => {
    setFieldValue("captcha", false);
  };

  const handleFunction = (e) => {
    const value = e.target.value.replace(/\$|,/g, "").trim(" ");
    if (parseInt(value)) {
      setFieldValue(
        "borrowAmount",
        parseInt(value).toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
        })
      );
    } else {
      setFieldValue("borrowAmount", "");
    }
    setValidAmount(parseInt(value) >= 15000 ? false : true);
  };
  return (
    <FormikForm className="financial-enquiry" noValidate autoComplete="off">
      <Card className="no-hover my-3">
        <Card.Header className="bg-white border-0 px-3">
          Finance Enquiry Form
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Field
                component={TextField}
                name="suppliedName"
                label="Your Name*"
                placeholder="Your Name"
              />
            </Col>
            <Col md={6}>
              <Field
                component={TextField}
                name="companyName"
                maxLength={20}
                label="Full Name of Business(including trading name if applicable)*"
                placeholder="Full Name of Business(including trading name if applicable)"
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Field
                component={TextField}
                name="email"
                label="Email*"
                placeholder="Email"
              />
            </Col>
            <Col md={6}>
              <Field
                component={TextField}
                name="phone"
                label="Best Contact Number*"
                placeholder="Best Contact Number"
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Field
                component={SelectField}
                options={businessDuringOptions}
                name="businessDurationRegistered"
                label="How long has your business been registered for GST purposes?*"
              />
            </Col>
            <Col md={6}>
              <Field
                component={SelectField}
                options={creditDefaultOptions}
                name="creditDefaults"
                label="Have you had any credit defaults in the past seven years?*"
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Field
                component={SelectField}
                options={residenceOptions}
                name="residence"
                label="Residence*"
              />
            </Col>
            <Col md={6}>
              <Field
                component={TextField}
                name="borrowAmount"
                label="How much Would you like to borrow?*"
                placeholder="How much Would you like to borrow?"
                onKeyUp={handleFunction}
                isInvalid={validAmount}
                helper={
                  <span className={validAmount ? "wrong-msg" : "right-msg"}>
                    Please enter a number greater than or equal to{" "}
                    <strong>$15,000</strong>.
                  </span>
                }
              />
            </Col>
          </Row>
          <Field
            component={TextField}
            name="equipmentsToPurchase"
            label="What assets are you looking at purchasing?*"
            placeholder="What assets are you looking at purchasing?"
            fieldAs="textarea"
            rows={4}
          />
          <Row>
            <Col md={6}>
              <Field
                component={SelectField}
                options={locationOptions}
                name="state"
                placeholder="Select"
                label="The Slattery location you are purchasing from?*"
              />
            </Col>
     
          </Row>
          <ReCAPTCHA
            className="mb-4 mt-4"
            sitekey={GOOGLE_RECAPTCHA_SITE_KEY}
            onChange={onChangeCaptcha}
            onErrored={onErrorCaptcha}
          />
          <Button variant="primary" type="submit" onClick={handleSubmit}>
            Submit
          </Button>
        </Card.Body>
      </Card>
      <ScrollToError />
    </FormikForm>
  );
};

export default withFormik({
  mapPropsToValues: () => {
    return {
      suppliedName: "",
      companyName: "",
      phone: "",
      email: "",
      businessDurationRegistered: "New",
      creditDefaults: "",
      borrowAmount: "",
      residence: "Own",
      equipmentsToPurchase: "",
      state: "",
      // number: '',
      captcha: false,
    };
  },
  validationSchema: Yup.object().shape({
    suppliedName: validator.name,
    companyName: validator.name,
    phone: validator.phone,
    email: validator.email,
    businessDurationRegistered: validator.requiredString(
      "Business duration is required"
    ),
    creditDefaults: validator.requiredString("Credit defaults required"),
    borrowAmount: validator.requiredCurrency("Borrow amount is required"),
    residence: validator.requiredString("Residence is required"),
    equipmentsToPurchase: validator.requiredString("Enter what type of asset you are looking to purchase. Make, model, consignment number will help."),
    state: validator.requiredString("State is required"),
    // number: validator.requiredNumber('Number is required'),
    captcha: validator.requiredCaptcha,
  }),
  handleSubmit: (values, { props, ...formikProps }) => {
    values.borrowAmount = parseInt(values.borrowAmount.replace(/\$|,/g, ""));
    props
      .submitFinancingEnquire({
        ...values,
        number: values.number || null,
      })
      .then(
        (res) => {
          props.onSubmit(res);
          props.showMessage({ message: MESSAGES.ENQUIRY_SUBMIT });
        },
        (err) => {
          props.showMessage({ message: err.message });
        }
      );
  },
})(FinancialEnquiry);
