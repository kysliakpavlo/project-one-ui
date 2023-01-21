import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Form as FormikForm, Field, withFormik } from "formik";
import validator from "../../../utils/validator";
import ScrollToError from "../ScrollToError";
import { DEF_COUNTRY, MESSAGES, SOCKET } from "../../../utils/constants";
import { CheckBoxField } from "../FormField";
import RegistrationDetails from "./RegistrationDetails";
import Modal from "react-bootstrap/Modal";
import "./RegistrationForm.scss";
import Westpac from "./ProfileForm/Westpac";
import { values } from "lodash";
import Visible from "../Visible";
import SvgComponent from "../SvgComponent";

let ShowModal;
let formikHandleSubmit;
let singleUseToken;
const RegistrationForm = ({
    values,
    loadCountries,
    showMessage,
    setFieldValue,
    setFieldError,
    locations,
    errors,
    countries,
    isValid,
    submitCount,
    sendOtp,
    verifyOtp,
    isEmailExist,
    isMobileExist,
    setLoading,
    handleSubmit,
    publishKey,
}) => {
    const { accountId } = values;
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    ShowModal = setShow;
    formikHandleSubmit = handleSubmit;
    useEffect(() => {
        loadCountries();
        setLoading(false);
        singleUseToken = null;
    }, []);

    return (
        <>
            <FormikForm className="registration-form" noValidate autoComplete="off">
                <Card className="no-hover">
                    <Card.Body className="px-md-5 py-3">
                        <RegistrationDetails
                            values={values}
                            errors={errors}
                            countries={countries}
                            locations={locations}
                            setFieldValue={setFieldValue}
                            setFieldError={setFieldError}
                            showMessage={showMessage}
                            sendOtp={sendOtp}
                            verifyOtp={verifyOtp}
                            isEmailExist={isEmailExist}
                            isMobileExist={isMobileExist}
                            submitCount={submitCount}
                            isValid={isValid}
                        />

                        <Row>
                            <Col xs={12}>
                                <Field
                                    name="registerCard"
                                    component={CheckBoxField}
                                    label="Register credit card now? You will need to have a registered credit card before placing a bid."
                                />
                            </Col>
                            <Col xs={12}>
                                <Field component={CheckBoxField} name="receiveAlertsPromotions" label="I want to be kept up to date with the latest stock and upcoming auctions" />
                            </Col>
                            <Col xs={12}>
                                <Field
                                    component={CheckBoxField}
                                    name="acceptTerms"
                                    type="checkbox"
                                    required
                                    className="terms-checkBox"
                                    label={
                                        <span>
                                            I have Read and Accepted Terms{" "}
                                            <a href={window.location.origin + "/accept-terms-conditions"} target="_blank" className="terms">
                                                (Click here to View Terms and Conditions)
                                            </a>
                                            <div>
                                                <a href={window.location.origin + "/files/Slattery_Information_Security_Policy.pdf"} target="_blank">
                                                    Click here to view our Information Security Policy
                                                </a>
                                            </div>
                                        </span>
                                    }
                                />
                            </Col>
                        </Row>
                        <Button variant="primary" type="submit" id="register-button">
                            {!accountId ? "Register" : "Update Account"}
                        </Button>
                    </Card.Body>
                </Card>
                <ScrollToError />
            </FormikForm>
            <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Credit card details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Westpac setLoading={setLoading} handleCreditcardModel={handleCreditcardModel} label="Continue registeration" publishableKey={publishKey} />
                </Modal.Body>
            </Modal>
        </>
    );
};

const handleCreditcardModel = (token) => {
    if (!token) {
        ShowModal(true);
    } else {
        ShowModal(false);
        singleUseToken = token;
        formikHandleSubmit();
    }
};
const messageId = "registratioMsg";

const registrationApiCallback = (req, props) =>
    req
        .then((res) => {
            props.onRegister && props.onRegister(res);
            props.showMessage({
                messageId,
                type: "success",
                message: res.message,
                autohide: false,
            });
        })
        .catch((err) => {
            props.showMessage({
                messageId,
                type: "warning",
                message: err.message,
            });
        });

export default withFormik({
    mapPropsToValues: ({ mediaInfo, profile, countries }) => {
        const accountInfo = profile?.accountInfo && profile?.accountInfo[0];
        const defaultCountry = countries?.find((element) => element.label === "Australia");
        return {
            accountId: profile?.accountId || "",
            firstName: profile?.firstName || mediaInfo?.firstName || "",
            lastName: profile?.lastName || mediaInfo?.lastName || "",
            company: profile?.company || "",
            dealerLicense: profile?.dealerLicense || "",
            email: profile?.email || mediaInfo?.email || "",
            confirmEmail: profile?.email || mediaInfo?.email || "",
            password: "",
            confirmPassword: "",
            billingCountry: profile?.billingCountry || defaultCountry?.label || "Australia",
            billingStreet: profile?.billingStreet || "",
            billingCity: profile?.billingCity || "",
            billingState: profile?.billingState || "",
            billingPostalCode: profile?.billingPostalCode || "",
            phone: profile?.phone || "",
            mobile: profile?.mobile || "",
            driversLicense: profile?.driversLicense || "",
            registerCard: true,
            acceptTerms: profile ? true : false,
            socialAccount: accountInfo?.socialAccount || mediaInfo?.provider || "",
            socialId: accountInfo?.socialId || mediaInfo?.id || "",
            mobileVerified: profile ? true : false,
            sentOtp: profile ? true : false,
            receiveAlertsPromotions: profile?.receiveAlertsPromotions || false,
        };
    },
    validationSchema: Yup.object().shape({
        firstName: Yup.string().required("First Name Required").max(40, "Max 40 chars"),
        lastName: Yup.string().required("Last Name Required"),
        email: Yup.string().required("Email Required").email("Invalid email"),
        confirmEmail: Yup.string()
            .required("Confirm Email Required")
            .oneOf([Yup.ref("email"), null], "Email must match"),
        password: Yup.string().when(["accountId", "socialId"], {
            is: (accountId, socialId) => !accountId && !socialId,
            then: Yup.string()
                .required("Password Required")
                .matches(
                    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[-!$%^&*()_+|~=`{}\\[\]:(\/);<>?,.@#'"])[A-Za-z\d-!$%^&*()_+|~=`{}\\[\]:(\/);<>?,.@#'"]{8,}$/,
                    "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character"
                ),
        }),
        confirmPassword: Yup.string().when(["accountId", "socialId"], {
            is: (accountId, socialId) => !accountId && !socialId,
            then: Yup.string()
                .required("Confirm Password Required")
                .oneOf([Yup.ref("password"), null], "Passwords must match"),
        }),
        billingStreet: Yup.string().required("Address is Required"),
        billingCity: Yup.string().required("Suburb is Required"),
        billingState: Yup.string().required("State is Required"),
        billingPostalCode: Yup.number().required("PostCode is Required"),
        billingCountry: Yup.string().required("Country is Required"),
        driversLicense: Yup.string().required("Drivers License is Required"),
        mobile: Yup.string()
            .required("Mobile is required")
            .when(["billingCountry"], {
                is: (billingCountry) => billingCountry === DEF_COUNTRY,
                then: Yup.string().matches(validator.regEx.phone, "Invalid Mobile Number"),
                otherwise: Yup.string().matches(validator.regEx.nonLocalPhone, "Invalid Mobile Number").max(40, "Invalid Mobile Number"),
            }),
        phone: Yup.string().when(["billingCountry"], {
            is: (billingCountry) => billingCountry === DEF_COUNTRY,
            then: Yup.string().matches(validator.regEx.phone, "Invalid Phone Number"),
            otherwise: Yup.string().matches(validator.regEx.nonLocalPhone, "Invalid Phone Number").max(40, "Invalid Phone Number"),
        }),
        acceptTerms: Yup.bool().oneOf([true], "Accept Terms & Conditions is required"),
    }),
    handleSubmit: (values, { props, ...formikProps }) => {
        const { mobileVerified, sentOtp, otp, socialAccount, ...payload } = values;

        props.removeMessage(messageId);
        if (payload.billingCountry === "Australia" && !mobileVerified) {
            props.showMessage({
                messageId,
                type: "error",
                message: MESSAGES.MOBILE_VERIFICATION,
            });
        } else {
            if (values.registerCard && !singleUseToken) {
                handleCreditcardModel(null);
            } else if (values.registerCard && singleUseToken) {
                registrationApiCallback(
                    props.postRegister({
                        ...payload,
                        singleUseTokenId: singleUseToken,
                        socialAccount: socialAccount === "EMAIL" ? "" : socialAccount,
                    }),
                    props
                );
            } else {
                registrationApiCallback(
                    props.postRegister({
                        ...payload,
                        socialAccount: socialAccount === "EMAIL" ? "" : socialAccount,
                    }),
                    props
                );
            }
        }
    },
})(RegistrationForm);
