import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import * as Yup from 'yup';
import ProfileDetails from './ProfileDetails';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import SvgComponent from '../../SvgComponent';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Button from 'react-bootstrap/Button';
import _map from 'lodash/map';
import _lower from 'lodash/lowerCase';
import { Form as FormikForm, withFormik } from 'formik';
import { Field } from 'formik';
import { TextField, SelectField, AddressSearchField } from '../../FormField';
import ScrollToError from '../../ScrollToError';
import validator from '../../../../utils/validator';
import { scrollToTop } from '../../../../utils/helpers';
import { DEF_COUNTRY, MESSAGES, SOCKET } from '../../../../utils/constants';
import Westpac from './Westpac';
import Modal from 'react-bootstrap/Modal';
import Visible from '../../Visible';

import './ProfileForm.scss';

let ShowModal;
let formikHandleSubmit;
let singleUseToken;
const ProfileForm = ({
  values,
  loadCountries,
  showMessage,
  setFieldValue,
  locations,
  errors,
  countries,
  isValid,
  submitCount,
  sendOtp,
  isEmailExist,
  verifyOtp,
  updateProfile,
  setLoading,
  loggedInUser,
  saveUserToken,
  profile,
}) => {
  const location = useLocation();

  useEffect(() => {
    loadCountries();
    setTimeout(() => {
      if (location && location.search.includes('onComplete')) {
        scrollToTop(
          document.querySelector('#credit-card')?.offsetTop - 50 || 0
        );
      }
    }, 100);
  }, []);
  return (
    <FormikForm
      className="registration-form"
      noValidate
      autoComplete="off"
    >
      <Card className="no-hover">
        <Card.Body className="px-md-5 py-3">
          <ProfileDetails
            values={values}
            errors={errors}
            isValid={isValid}
            locations={locations}
            countries={countries}
            showMessage={showMessage}
            submitCount={submitCount}
            setFieldValue={setFieldValue}
            sendOtp={sendOtp}
            verifyOtp={verifyOtp}
            isEmailExist={isEmailExist}
            updateProfile={updateProfile}
            loggedInUser={loggedInUser}
            saveUserToken={saveUserToken}
            profile={profile}
          />
        </Card.Body>
      </Card>
      <ScrollToError />
    </FormikForm>
  );
};

const CardForm = ({ profile, handleSubmit, setLoading, publishKey }) => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  ShowModal = setShow;
  formikHandleSubmit = handleSubmit;
  return (
    <>
      {profile.cardInfo === null && (
        <FormikForm
          className="registration-form card-form"
          noValidate
          autoComplete="off"
        >
          <Row
            id="credit-card"
            className="cards-wrap-inline"
          >
            <Card
              className={`card-block no-card-details ${
                false ? 'editCard-bg' : 'defaultCard-bg'
              }`}
            >
              {' '}
              <Card.Header
                className={` border-0 px-3 header-style ${
                  false ? 'editCard-bg' : 'defaultCard-bg'
                }`}
              >
                <div>Payment Information </div>
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Add</Tooltip>}
                >
                  <h6 className="title">
                    <Button
                      type="submit"
                      className="custom-btn-svg"
                    >
                      <SvgComponent path="add" />
                    </Button>
                  </h6>
                </OverlayTrigger>
              </Card.Header>
              <Card.Body className="no-card-details">
                <div className="block-data">
                  {' '}
                  <div className="no-detail">
                    No credit card details present
                  </div>{' '}
                </div>
                <div className="block-data">
                  <img
                    style={{ width: '50px', marginRight: '10px' }}
                    src={window.location.origin + `/assets/mastercard.png`}
                  />
                  <img
                    style={{ width: '50px', marginRight: '10px' }}
                    src={window.location.origin + `/assets/visa.png`}
                  />
                </div>
              </Card.Body>
            </Card>
          </Row>
          <ScrollToError />
        </FormikForm>
      )}
      {profile.cardInfo !== null && (
        <FormikForm
          className="registration-form card-form"
          noValidate
          autoComplete="off"
        >
          <Row
            id="credit-card"
            className="cards-wrap-inline"
          >
            <Col>
              <Card
                className={`card-block ${
                  false ? 'editCard-bg' : 'defaultCard-bg'
                }`}
              >
                <Card.Header
                  className={` border-0 px-3 header-style ${
                    false ? 'editCard-bg' : 'defaultCard-bg'
                  }`}
                >
                  <div>Payment Information </div>
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Edit</Tooltip>}
                  >
                    <h6 className="title">
                      <Button
                        type="submit"
                        className="custom-btn-svg"
                      >
                        <SvgComponent path="edit_black_24dp" />
                      </Button>
                    </h6>
                  </OverlayTrigger>
                </Card.Header>
                <Card.Body>
                  <div className="block-data">
                    {' '}
                    <div className="detail-personal">Name</div>{' '}
                    <div className="data-section">
                      {profile && profile.cardInfo?.cardholderName}
                    </div>
                  </div>
                  <div className="block-data">
                    <div className="detail-personal">Credit Card No.</div>{' '}
                    <div className="data-section">
                      {profile &&
                        profile.cardInfo?.cardNumber.match(/.{1,4}/g).join(' ')}
                    </div>
                  </div>
                  <div className="block-data">
                    <div className="detail-personal">Expiry</div>{' '}
                    <div className="data-section">
                      {profile && profile.cardInfo?.expiryMonth} /{' '}
                      {profile && profile.cardInfo?.expiryYear}
                    </div>
                  </div>
                  <div className="block-data">
                    <div className="detail-personal">CCV</div>{' '}
                    <div className="data-section">{profile && '***'}</div>
                  </div>
                  {profile && (
                    <img
                      style={{ width: '50px' }}
                      src={
                        window.location.origin +
                        `/assets/${profile.cardInfo?.cardScheme?.toLowerCase()}.png`
                      }
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <ScrollToError />
        </FormikForm>
      )}
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Credit card details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Westpac
            setLoading={setLoading}
            handleCreditcardModel={handleCreditcardModel}
            label="Save card"
            publishableKey={publishKey}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

const ShippingForm = ({
  values,
  loadCountries,
  setFieldValue,
  locations,
  updateShipping,
  countries,
  showMessage,
  profile,
}) => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  useEffect(() => {
    loadCountries();
  }, []);

  const { shippingCountry } = values;
  const [shippingAddress, setShippingAddress] = useState(false);

  const editIconClick = (block) => {
    if (block === 'ShippingAddress') {
      setShippingAddress(true);
    }
  };

  const cancelShippingAddress = () => {
    setFieldValue('shippingCity', profile.shippingCity);
    setFieldValue('shippingState', profile.shippingState);
    setFieldValue('shippingStreet', profile.shippingStreet);
    setFieldValue('shippingCountry', profile.shippingCountry);
    setFieldValue('shippingPostalCode', profile.shippingPostalCode);
    setShippingAddress(false);
  };

  let filteredLocation = locations.filter(
    (location) => location.name.toLowerCase() !== 'national'
  );

  const locationOptions = _map(filteredLocation, (location) => ({
    key: location.name,
    label: location.name,
  }));

  const onChooseShippingAddress = useCallback(
    async (addressObj) => {
      const { address, city, state, stateCode, country, postalCode } =
        addressObj;
      const stateObj = locationOptions.find(
        (item) =>
          _lower(item.key) === _lower(stateCode) ||
          _lower(item.label) === _lower(stateCode)
      );
      await setFieldValue('shippingCity', city);
      await setFieldValue('shippingState', stateObj?.key || state || '');
      await setFieldValue('shippingStreet', address);
      await setFieldValue('shippingCountry', country);
      await setFieldValue('shippingPostalCode', postalCode);
    },
    [values]
  );

  const onCountryChange = (e) => {
    setFieldValue('shippingCountry', e.target.value);
    setFieldValue('shippingState', '');
  };

  const updateShippingAddress = () => {
    const {
      shippingCity,
      shippingCountry,
      shippingPostalCode,
      shippingState,
      shippingStreet,
    } = values;
    if (
      shippingCity !== '' &&
      shippingCountry !== '' &&
      shippingPostalCode !== '' &&
      shippingState !== '' &&
      shippingStreet !== ''
    ) {
      updateShipping(values)
        .then((res) => {
          showMessage({ message: res.message });
          setShippingAddress(false);
        })
        .catch((err) => {
          showMessage({ message: err.message, type: 'error' });
        });
    }
  };

  return (
    <>
      <FormikForm
        className="registration-form card-form"
        noValidate
        autoComplete="off"
      >
        <Row className="cards-wrap-inline">
          <Col>
            <Card
              className={`card-block ${
                shippingAddress ? 'editCard-bg' : 'defaultCard-bg'
              }`}
            >
              <Card.Header
                className={` border-0 px-3 header-style ${
                  shippingAddress ? 'editCard-bg' : 'defaultCard-bg'
                }`}
              >
                <div>Shipping Address Details</div>
                <div className="icon-block">
                  <Visible when={shippingAddress}>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Cancel</Tooltip>}
                    >
                      <h6 className="title">
                        <SvgComponent
                          path="close"
                          onClick={() => cancelShippingAddress()}
                        />
                      </h6>
                    </OverlayTrigger>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Save</Tooltip>}
                    >
                      <h6 className="title">
                        <SvgComponent
                          path="save_black_24dp"
                          onClick={() => updateShippingAddress()}
                        />
                      </h6>
                    </OverlayTrigger>
                  </Visible>
                  <Visible when={!shippingAddress}>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Edit</Tooltip>}
                    >
                      <h6 className="title">
                        <SvgComponent
                          path="edit_black_24dp"
                          onClick={() => editIconClick('ShippingAddress')}
                        />
                      </h6>
                    </OverlayTrigger>
                  </Visible>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="block-data">
                  <div className="detail-personal">Address </div>
                  <div className="data-section">
                    {shippingAddress ? (
                      <div>
                        <Field
                          component={AddressSearchField}
                          placeholder="Shipping Address"
                          name="shippingStreet"
                          country={shippingCountry}
                          countries={countries}
                          onAddressSelect={onChooseShippingAddress}
                          required
                        />
                      </div>
                    ) : (
                      values.shippingStreet
                    )}
                  </div>
                </div>
                <div className="block-data">
                  {' '}
                  <div className="detail-personal">Suburb/City</div>{' '}
                  <div className="data-section">
                    {shippingAddress ? (
                      <div>
                        <Field
                          component={TextField}
                          placeholder="Suburb/City"
                          name="shippingCity"
                          required
                        />
                      </div>
                    ) : (
                      values.shippingCity
                    )}
                  </div>
                </div>
                <div className="block-data">
                  <div className="detail-personal">State</div>{' '}
                  <div className="data-section">
                    {shippingAddress ? (
                      <div>
                        {values.shippingCountry === DEF_COUNTRY ? (
                          <Field
                            component={SelectField}
                            options={locationOptions}
                            placeholder="State"
                            name="shippingState"
                            label="State"
                            required
                          />
                        ) : (
                          <Field
                            component={TextField}
                            placeholder="State"
                            name="shippingState"
                            required
                          />
                        )}
                      </div>
                    ) : (
                      values.shippingState
                    )}
                  </div>
                </div>
                <div className="block-data">
                  <div className="detail-personal">Country</div>
                  <div className="data-section">
                    {shippingAddress ? (
                      <div>
                        <Field
                          component={SelectField}
                          options={countries}
                          onChange={onCountryChange}
                          placeholder="Select the country"
                          name="shippingCountry"
                          required
                        />
                      </div>
                    ) : (
                      values.shippingCountry
                    )}
                  </div>
                </div>
                <div className="block-data">
                  <div className="detail-personal">PostCode</div>
                  <div className="data-section">
                    {shippingAddress ? (
                      <div>
                        <Field
                          component={TextField}
                          placeholder="Postcode"
                          name="shippingPostalCode"
                          required
                        />
                      </div>
                    ) : (
                      values.shippingPostalCode
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <ScrollToError />
      </FormikForm>
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
const messageId = 'registratioMsg';
const registrationApiCallback = (req, props) =>
  req
    .then((res) => {
      props.onUpdate && props.onUpdate(res);
      props.showMessage({
        messageId,
        type: 'success',
        message: res.message,
      });
      props.validateLogin();
    })
    .catch((err) => {
      props.showMessage({
        messageId,
        type: 'warning',
        autohide: false,
        message: err.message,
      });
    });

const FormikProfile = withFormik({
  mapPropsToValues: ({ mediaInfo, profile }) => {
    // const accountInfo = profile?.accountInfo && profile?.accountInfo[0];
    return {
      accountId: profile?.accountId || '',
      firstName: profile?.firstName || mediaInfo?.firstName || '',
      lastName: profile?.lastName || mediaInfo?.lastName || '',
      company: profile?.company || '',
      dealerLicense: profile?.dealerLicense || '',
      email: profile?.email || mediaInfo?.email || '',
      confirmEmail: profile?.email || mediaInfo?.email || '',
      password: '',
      confirmPassword: '',
      billingCountry: profile?.billingCountry || '',
      billingStreet: profile?.billingStreet || '',
      billingCity: profile?.billingCity || '',
      billingState: profile?.billingState || '',
      billingPostalCode: profile?.billingPostalCode || '',
      phone: profile?.phone || '',
      mobile: profile?.mobile || '',
      driversLicense: profile?.driversLicense || '',
      mobileVerified: profile ? true : false,
      sentOtp: profile ? true : false,
      receiveAlertsPromotions: profile?.receiveAlertsPromotions || false,
    };
  },
  validationSchema: Yup.object().shape({
    firstName: Yup.string()
      .required('First Name Required')
      .max(40, 'Max 40 chars'),
    lastName: Yup.string().required('Last Name Required'),
    email: Yup.string().required('Email Required').email('Invalid email'),
    confirmEmail: Yup.string()
      .required('Confirm Email Required')
      .oneOf([Yup.ref('email'), null], 'Email must match'),
    password: Yup.string()
      .required('Password is Required')
      .matches(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[-!$%^&*()_+|~=`{}\\[\]:(\/);<>?,.@#'"])[A-Za-z\d-!$%^&*()_+|~=`{}\\[\]:(\/);<>?,.@#'"]{8,}$/,
        'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character'
      ),
    confirmPassword: Yup.string()
      .required('Confirm Password is Required')
      .oneOf([Yup.ref('password'), null], 'Passwords must match'),
    billingStreet: Yup.string().required('Address is Required'),
    billingCity: Yup.string().required('Suburb is Required'),
    billingState: Yup.string().required('State is Required'),
    billingPostalCode: Yup.number().required('PostCode is Required'),
    billingCountry: Yup.string().required('Country is Required'),
    driversLicense: Yup.string().required('Drivers License is Required'),
    mobile: Yup.string()
      .required('Mobile is required')
      .when(['billingCountry'], {
        is: (billingCountry) => billingCountry === DEF_COUNTRY,
        then: Yup.string().matches(
          validator.regEx.phone,
          'Invalid Mobile Number'
        ),
        otherwise: Yup.string()
          .matches(validator.regEx.nonLocalPhone, 'Invalid Mobile Number')
          .max(40, 'Invalid Mobile Number'),
      }),
    phone: Yup.string().when(['billingCountry'], {
      is: (billingCountry) => billingCountry === DEF_COUNTRY,
      then: Yup.string().matches(validator.regEx.phone, 'Invalid Phone Number'),
      otherwise: Yup.string()
        .matches(validator.regEx.nonLocalPhone, 'Invalid Phone Number')
        .max(40, 'Invalid Phone Number'),
    }),
  }),
  handleSubmit: (values, { props, ...formikProps }) => {
    const { mobileVerified, sentOtp, otp, socialAccount, ...payload } = values;

    props.removeMessage(messageId);
    if (payload.billingCountry === DEF_COUNTRY && !mobileVerified) {
      props.showMessage({
        messageId,
        message: MESSAGES.MOBILE_VERIFICATION,
      });
    } else {
      registrationApiCallback(props.updateProfile(payload), props);
    }
  },
})(ProfileForm);

const FormikCard = withFormik({
  mapPropsToValues: ({ profile }) => {
    return {
      // registerCard: true,
      // accountId: profile?.accountId || '',
      // cardNumber: "",
      // cardName: "",
      // expiryDate: "",
      // cvc: "",
      // acceptTerms: profile ? true : false,
      // receiveAlertsPromotions: profile?.receiveAlertsPromotions || false
    };
  },
  validationSchema: Yup.object().shape({
    // cardName: Yup.string().required('Name on Card is Required'),
    // cardNumber: Yup.number().required('Card Number is Required')
    //     .integer('Card Number must be a number'),
    // cvc: Yup.number().required('CVC is Required')
    //     .integer('CVC must be a number'),
    // expiryDate: Yup.string().required('Expiry Month is Required'),
    // acceptTerms: Yup.bool().oneOf([true], 'Accept Terms & Conditions is required')
  }),
  handleSubmit: (values, { props, ...formikProps }) => {
    const { profile, socket } = props;
    props.removeMessage(messageId);
    if (!singleUseToken) {
      handleCreditcardModel(singleUseToken);
    } else {
      registrationApiCallback(
        props.updateCard({
          singleUseTokenId: singleUseToken,
        }),
        props
      );
      singleUseToken = null;
    }
  },
})(CardForm);

const FormikShipping = withFormik({
  mapPropsToValues: ({ profile }) => {
    return {
      accountId: profile?.accountId || '',
      shippingCountry: profile?.shippingCountry || '',
      shippingStreet: profile?.shippingStreet || '',
      shippingCity: profile?.shippingCity || '',
      shippingState: profile?.shippingState || '',
      shippingPostalCode: profile?.shippingPostalCode || '',
    };
  },
  validationSchema: Yup.object().shape({
    shippingStreet: Yup.string().required('Shipping Address is Required'),
    shippingCity: Yup.string().required('Shipping Suburb is Required'),
    shippingState: Yup.string().required('Shipping State is Required'),
    shippingPostalCode: Yup.number().required('Shipping PostCode is Required'),
    shippingCountry: Yup.string().required('Shipping Country is Required'),
  }),
  handleSubmit: (values, { props, ...formikProps }) => {
    const { mobileVerified, sentOtp, otp, socialAccount, ...payload } = values;

    props.removeMessage(messageId);

    registrationApiCallback(props.updateProfile(payload), props);
  },
})(ShippingForm);

export default (props) => {
  return (
    <React.Fragment>
      <FormikProfile {...props} />
      <Row className="lastRow">
        <Col className="cards-wrap-inline">
          <FormikCard {...props} />
        </Col>
        <Col className="cards-wrap-inline ">
          <FormikShipping {...props} />
        </Col>
      </Row>
    </React.Fragment>
  );
};
