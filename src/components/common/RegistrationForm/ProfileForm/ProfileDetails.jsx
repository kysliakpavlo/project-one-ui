import React, { useCallback, useState } from "react";
import _map from "lodash/map";
import _lower from "lodash/lowerCase";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { Field } from "formik";
import {
  TextField,
  SelectField,
  AddressSearchField,
  PasswordStrengthField,
} from "../../FormField";
import SvgComponent from "../../../common/SvgComponent";
import { DEF_COUNTRY } from "../../../../utils/constants";
import Visible from "../../Visible";

const ProfileDetails = ({
  values,
  errors,
  countries,
  locations,
  setFieldValue,
  showMessage,
  sendOtp,
  verifyOtp,
  updateProfile,
  loggedInUser,
  saveUserToken,
  profile,
}) => {
  const { billingCountry, mobile, otp } = values;
  let filteredLocation = locations.filter(
    (location) => location.name.toLowerCase() !== "national"
  );
  const locationOptions = _map(filteredLocation, (location) => ({
    key: location.name,
    label: location.name,
  }));

  const [personal, setPersonal] = useState(false);
  const [login, setLogin] = useState(false);
  const [address, setAddress] = useState(false);
  const [contact, setContact] = useState(false);

  const editIconClick = (block) => {
    if (block === "personal") {
      setPersonal(true);
    } else if (block === "Login") {
      setLogin(true);
    } else if (block === "Address") {
      setAddress(true);
    } else if (block === "Contact") {
      setContact(true);
    }
  };

  const updateProfileInfo = (type) => {
    values.confirmEmail = values.email;
    if (
      type === "password" &&
      values.password === "" &&
      values.confirmPassword === ""
    ) {
      setLogin(true);
    } else {
      if (loggedInUser?.role.includes("Vendor;Buyer")) {
        setFieldValue("firstName", loggedInUser?.name);
        setFieldValue("lastName", loggedInUser?.name);
      }
      updateProfile(values).then((res) => {
        loggedInUser.firstName = values.firstName;
        loggedInUser.lastName = values.lastName;
        loggedInUser.email = values.email;
        loggedInUser.phone = values.phone;
        loggedInUser.mobile = values.mobile;
        let userDetails = {};
        userDetails.result = loggedInUser;
        saveUserToken(userDetails);
        showMessage({ type: "success", message: res.message });
        setPersonal(false);
        setAddress(false);
        setContact(false);
        setLogin(false);
        //  onUpdate();
      });
    }
  };
  const cancelLogin = () => {
    setLogin(false);
  };
  const cancelPersonal = () => {
    setFieldValue("firstName", profile.firstName);
    setFieldValue("lastName", profile.lastName);
    setFieldValue("company", profile.company);
    setFieldValue("driversLicense", profile.driversLicense);
    setFieldValue("dealerLicense", profile.dealerLicense);
    setPersonal(false);
  };

  const cancelContact = () => {
    setFieldValue("phone", profile.phone);
    setFieldValue("mobile", profile.mobile);
    setContact(false);
  };
  const cancelAddress = () => {
    setFieldValue("billingCity", profile.billingCity);
    setFieldValue("billingState", profile.billingState);
    setFieldValue("billingStreet", profile.billingStreet);
    setFieldValue("billingCountry", profile.billingCountry);
    setFieldValue("billingPostalCode", profile.billingPostalCode);
    setAddress(false);
  };

  const onSendOtp = useCallback(() => {
    setFieldValue("mobileVerified", false);
    if (mobile) {
      sendOtp({ mobile })
        .then((res) => {
          showMessage({ type: "success", message: res.message });
          setFieldValue("sentOtp", true);
        })
        .catch((err) => {
          showMessage({ type: "warning", message: err.message });
          setFieldValue("sentOtp", false);
        });
    }
  }, [mobile]);

  const onVerifyOtp = useCallback(() => {
    if (otp) {
      verifyOtp({ mobile, otp })
        .then((res) => {
          showMessage({ type: "success", message: res.message });
          setFieldValue("mobileVerified", true);
        })
        .catch((err) => {
          setFieldValue("mobileVerified", false);
          showMessage({ type: "warning", message: err.message });
        });
    }
  }, [mobile, otp]);

  const onChangeMobile = useCallback(() => {
    setFieldValue("mobileVerified", false);
    setFieldValue("otp", "");
  }, []);

  const onChooseAddress = useCallback(
    async (addressObj) => {
      const { address, city, state, stateCode, country, postalCode } =
        addressObj;
      const stateObj = locationOptions.find(
        (item) =>
          _lower(item.key) === _lower(stateCode) ||
          _lower(item.label) === _lower(stateCode)
      );
      await setFieldValue("billingCity", city);
      await setFieldValue("billingState", stateObj?.key || state || "");
      await setFieldValue("billingStreet", address);
      await setFieldValue("billingCountry", country);
      await setFieldValue("billingPostalCode", postalCode);
    },
    [values]
  );

  const onCountryChange = (e) => {
    setContact(true);
    setFieldValue("billingCountry", e.target.value);
    setFieldValue("billingState", "");
  };

  return (
    <>
      <Row className="cards-wrap-inline">
        <Col>
          <Card
            className={`card-block ${
              personal ? "editCard-bg" : "defaultCard-bg"
            }`}
          >
            <Card.Header
              className={` border-0 px-3 header-style ${
                personal ? "editCard-bg" : "defaultCard-bg"
              }`}
            >
              <div>Personal Details</div>
              <div className="icon-block">
                <Visible when={personal}>
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Cancel</Tooltip>}
                  >
                    <h6 className="title">
                      <SvgComponent
                        path="close"
                        onClick={() => cancelPersonal()}
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
                        onClick={() => updateProfileInfo()}
                      />
                    </h6>
                  </OverlayTrigger>
                </Visible>
                <Visible when={!personal}>
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Edit</Tooltip>}
                  >
                    <h6 className="title">
                      <SvgComponent
                        path="edit_black_24dp"
                        onClick={() => editIconClick("personal")}
                      />
                    </h6>
                  </OverlayTrigger>
                </Visible>
              </div>
            </Card.Header>
            <Card.Body>
              {loggedInUser?.role.includes("Vendor;Buyer") ? (
                <div className="block-data">
                  <div className="detail-personal">Name </div>
                  <div className="data-section">
                    <div>{loggedInUser?.name}</div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="block-data">
                    <div className="detail-personal">First Name </div>
                    <div className="data-section">
                      {personal ? (
                        <div>
                          <Field
                            component={TextField}
                            placeholder="First Name"
                            name="firstName"
                          />
                        </div>
                      ) : (
                        values.firstName
                      )}
                    </div>
                  </div>
                  <div className="block-data">
                    {" "}
                    <div className="detail-personal">Last Name</div>{" "}
                    <div className="data-section">
                      {personal ? (
                        <div>
                          <Field
                            component={TextField}
                            placeholder="Last Name"
                            name="lastName"
                          />
                        </div>
                      ) : (
                        values.lastName
                      )}
                    </div>
                  </div>
                </>
              )}

              <div className="block-data">
                <div className="detail-personal">Company</div>{" "}
                <div className="data-section">
                  {personal ? (
                    <div>
                      <Field
                        component={TextField}
                        placeholder="company"
                        name="company"
                      />
                    </div>
                  ) : (
                    values.company
                  )}
                </div>
              </div>
              <div className="block-data">
                <div className={`detail-personal `}>Drivers License </div>
                <div className="data-section">
                  {personal ? (
                    <div>
                      <Field
                        component={TextField}
                        placeholder="driversLicense"
                        name="driversLicense"
                      />
                    </div>
                  ) : (
                    values.driversLicense
                  )}
                </div>
              </div>
              <div className="block-data">
                <div className="detail-personal">Dealer License</div>
                <div className="data-section">
                  {personal ? (
                    <div>
                      <Field
                        component={TextField}
                        placeholder="dealerLicense"
                        name="dealerLicense"
                      />
                    </div>
                  ) : (
                    values.dealerLicense
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card
            className={`card-block ${login ? "editCard-bg" : "defaultCard-bg"}`}
          >
            <Card.Header
              className={` border-0 px-3 header-style ${
                login ? "editCard-bg" : "defaultCard-bg"
              }`}
            >
              <div>Login Details</div>
              <div className="icon-block">
                <Visible when={login}>
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Cancel</Tooltip>}
                  >
                    <h6 className="title">
                      <SvgComponent
                        path="close"
                        onClick={() => cancelLogin()}
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
                        onClick={() => updateProfileInfo("password")}
                      />
                    </h6>
                  </OverlayTrigger>
                </Visible>
                <Visible when={!login}>
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Edit</Tooltip>}
                  >
                    <h6 className="title">
                      <SvgComponent
                        path="edit_black_24dp"
                        onClick={() => editIconClick("Login")}
                      />
                    </h6>
                  </OverlayTrigger>
                </Visible>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="block-data">
                {/* {login ? <div><Field component={TextField} placeholder="email" name="email" /></div> : values.email} */}
                <div className="detail-personal">Email Address </div>
                <div className="data-section">{values.email}</div>
              </div>
              {/* <div className="block-data"> <div className="detail-personal">Password</div> <div className="data-section">{'***********'}</div></div> */}
              <div className="block-data password-check">
                {" "}
                <div className="detail-personal">Password</div>{" "}
                <div className="data-section">
                  {login ? (
                    <div>
                      <Field
                        component={PasswordStrengthField}
                        placeholder="Password"
                        name="password"
                        type="password"
                      />
                    </div>
                  ) : (
                    `********`
                  )}
                </div>
              </div>
              {login && (
                <div className="block-data">
                  {" "}
                  <div className="detail-personal">Confirm Password</div>{" "}
                  <div className="data-section">
                    {" "}
                    <div>
                      <Field
                        component={TextField}
                        placeholder="Confirm Password"
                        type="password"
                        name="confirmPassword"
                      />
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="cards-wrap-inline">
        <Col>
          <Card
            className={`card-block ${
              address ? "editCard-bg" : "defaultCard-bg"
            }`}
          >
            <Card.Header
              className={` border-0 px-3 header-style ${
                address ? "editCard-bg" : "defaultCard-bg"
              }`}
            >
              <div>Address Details</div>
              <div className="icon-block">
                <Visible when={address}>
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Cancel</Tooltip>}
                  >
                    <h6 className="title">
                      <SvgComponent
                        path="close"
                        onClick={() => cancelAddress()}
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
                        onClick={() => updateProfileInfo()}
                      />
                    </h6>
                  </OverlayTrigger>
                </Visible>
                <Visible when={!address}>
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Edit</Tooltip>}
                  >
                    <h6 className="title">
                      <SvgComponent
                        path="edit_black_24dp"
                        onClick={() => editIconClick("Address")}
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
                  {address ? (
                    <div>
                      <Field
                        component={AddressSearchField}
                        placeholder="Address"
                        name="billingStreet"
                        country={billingCountry}
                        countries={countries}
                        onAddressSelect={onChooseAddress}
                        required
                      />
                    </div>
                  ) : (
                    values.billingStreet
                  )}
                </div>
              </div>
              <div className="block-data">
                {" "}
                <div className="detail-personal">Suburb/City</div>{" "}
                <div className="data-section">
                  {address ? (
                    <div>
                      <Field
                        component={TextField}
                        placeholder="Suburb/City"
                        name="billingCity"
                        required
                      />
                    </div>
                  ) : (
                    values.billingCity
                  )}
                </div>
              </div>
              <div className="block-data">
                <div className="detail-personal">State</div>{" "}
                <div className="data-section">
                  {address ? (
                    <div>
                      {values.billingCountry === DEF_COUNTRY ? (
                        <Field
                          component={SelectField}
                          options={locationOptions}
                          placeholder="State"
                          name="billingState"
                          label="State"
                          required
                        />
                      ) : (
                        <Field
                          component={TextField}
                          placeholder="State"
                          name="billingState"
                          required
                        />
                      )}
                    </div>
                  ) : (
                    values.billingState
                  )}
                </div>
              </div>
              <div className="block-data">
                <div className="detail-personal">Country</div>
                <div className="data-section">
                  {address ? (
                    <div>
                      <Field
                        component={SelectField}
                        options={countries}
                        onChange={onCountryChange}
                        placeholder="Select the country"
                        name="billingCountry"
                        required
                      />
                    </div>
                  ) : (
                    values.billingCountry
                  )}
                </div>
              </div>
              <div className="block-data">
                <div className="detail-personal">PostCode</div>
                <div className="data-section">
                  {address ? (
                    <div>
                      <Field
                        component={TextField}
                        placeholder="Postcode"
                        name="billingPostalCode"
                        required
                      />
                    </div>
                  ) : (
                    values.billingPostalCode
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card
            className={`card-block ${
              contact ? "editCard-bg" : "defaultCard-bg"
            }`}
          >
            <Card.Header
              className={` border-0 px-3 header-style ${
                contact ? "editCard-bg" : "defaultCard-bg"
              }`}
            >
              <div>Contact Details </div>
              <div className="icon-block">
                <Visible when={contact}>
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Cancel</Tooltip>}
                  >
                    <h6 className="title">
                      <SvgComponent
                        path="close"
                        onClick={() => cancelContact()}
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
                        onClick={() => updateProfileInfo()}
                      />
                    </h6>
                  </OverlayTrigger>
                </Visible>
                <Visible when={!contact}>
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Edit</Tooltip>}
                  >
                    <h6 className="title">
                      <SvgComponent
                        path="edit_black_24dp"
                        onClick={() => editIconClick("Contact")}
                      />
                    </h6>
                  </OverlayTrigger>
                </Visible>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="block-data">
                {" "}
                <div className="detail-personal">Phone No.</div>{" "}
                <div className="data-section">
                  {contact ? (
                    <div>
                      <Field
                        component={TextField}
                        placeholder="Phone"
                        name="phone"
                      />
                    </div>
                  ) : (
                    values.phone
                  )}
                </div>
              </div>
              <div className="block-data">
                <div className="detail-personal">Mobile No.</div>
                <div className="data-section">
                  {contact ? (
                    <div>
                      <Field
                        component={TextField}
                        placeholder="Phone"
                        name="mobile"
                        onKeyDown={onChangeMobile}
                      />
                      {values.mobileVerified || errors.mobile ? null : (
                        <span className="text-danger">
                          Requires Verification
                        </span>
                      )}
                    </div>
                  ) : (
                    values.mobile
                  )}
                </div>
              </div>
              {values.billingCountry === DEF_COUNTRY ? (
                <>
                  {contact && (
                    <div className="block-data ">
                      <div className="detail-personal">Verification Code</div>{" "}
                      <div className="data-section code-verify">
                        {contact ? (
                          <div>
                            <Field
                              component={TextField}
                              disabled={
                                values.mobileVerified || !values.sentOtp
                              }
                              placeholder="Verification Code"
                              name="otp"
                              label="Verification Code"
                              required
                            />
                          </div>
                        ) : (
                          ""
                        )}
                      </div>
                      <div className="OtpCode">
                        <Button onClick={onSendOtp}>Send Code</Button>
                      </div>
                    </div>
                  )}
                  <div className="block-data ">
                    <div className="detail-personal"></div>
                    {contact ? (
                      <div className="data-section verify">
                        <Button
                          disabled={values.mobileVerified}
                          onClick={onVerifyOtp}
                        >
                          Verify Mobile
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </>
              ) : null}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ProfileDetails;
