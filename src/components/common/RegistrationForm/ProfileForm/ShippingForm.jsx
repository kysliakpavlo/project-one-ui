import React, { useCallback, useState, useEffect } from "react";
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

const ShippingForm = ({
  values,
  errors,
  loadCountries,
  countries,
  locations,
  setFieldValue,
}) => {
  const { shippingCountry } = values;
  let filteredLocation = locations.filter(
    (location) => location.name.toLowerCase() !== "national"
  );
  const locationOptions = _map(filteredLocation, (location) => ({
    key: location.name,
    label: location.name,
  }));

  const [address, setAddress] = useState(false);

  const editIconClick = (block) => {
    if (block === "Address") {
      setAddress(true);
    }
  };

  const cancelAddress = () => {
    setAddress(false);
  };

  const updateAddress = () => {};

  const onChooseAddress = useCallback(
    async (addressObj) => {
      const { address, city, state, stateCode, country, postalCode } =
        addressObj;
      const stateObj = locationOptions.find(
        (item) =>
          _lower(item.key) === _lower(stateCode) ||
          _lower(item.label) === _lower(stateCode)
      );
      await setFieldValue("shippingCity", city);
      await setFieldValue("shippingState", stateObj?.key || state || "");
      await setFieldValue("shippingStreet", address);
      await setFieldValue("shippingCountry", country);
      await setFieldValue("shippingPostalCode", postalCode);
    },
    [values]
  );

  const onCountryChange = (e) => {
    setFieldValue("shippingCountry", e.target.value);
    setFieldValue("shippingState", "");
  };

  useEffect(() => {
    loadCountries();
  }, []);

  return (
    <>
      <Card
        className={`card-block ${address ? "editCard-bg" : "defaultCard-bg"}`}
      >
        <Card.Header
          className={` border-0 px-3 header-style ${
            address ? "editCard-bg" : "defaultCard-bg"
          }`}
        >
          <div>Shipping Address Details</div>
          <div className="icon-block">
            <Visible when={address}>
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Cancel</Tooltip>}
              >
                <h6 className="title">
                  <SvgComponent path="close" onClick={() => cancelAddress()} />
                </h6>
              </OverlayTrigger>
              <OverlayTrigger placement="top" overlay={<Tooltip>Save</Tooltip>}>
                <h6 className="title">
                  <SvgComponent
                    path="save_black_24dp"
                    onClick={() => updateAddress()}
                  />
                </h6>
              </OverlayTrigger>
            </Visible>
            <Visible when={!address}>
              <OverlayTrigger placement="top" overlay={<Tooltip>Edit</Tooltip>}>
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
                    name="shippingStreet"
                    country={shippingCountry}
                    countries={countries}
                    onAddressSelect={onChooseAddress}
                    required
                  />
                </div>
              ) : (
                values.shippingStreet
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
            <div className="detail-personal">State</div>{" "}
            <div className="data-section">
              {address ? (
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
              {address ? (
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
              {address ? (
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
    </>
  );
};

export default ShippingForm;
