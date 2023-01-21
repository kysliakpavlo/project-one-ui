import React, { useEffect, useState } from "react";
import _map from "lodash/map";
import _filter from "lodash/filter";
import _get from "lodash/get";
import _isFunction from "lodash/isFunction";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import { Form as FormikForm, Field, withFormik } from "formik";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import NoResults from "../../common/NoResults";
import EnquireForm from "../EnquireForm";
import { SelectField } from "../../common/FloatingField";
import Visible from "../../common/Visible";
import StaticHeader from "../StaticHeader";

import "./TransportCalculators.scss";
import SvgComponent from "../SvgComponent";

const Component = ({
  cities,
  assetTypeList,
  values,
  onCalculate,
  transportFee,
  showMessage,
}) => {
  const [toCitiesOptions, setToCitiesOptions] = useState([]);
  const [fromCitiesOptions, setFromCitiesOptions] = useState([]);
  const [show, setShow] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (cities && cities.length) {
      setFromCitiesOptions(
        _map(cities, (item) => ({ key: item.cityId, label: item.name }))
      );
      setToCitiesOptions(
        _map(cities, (item) => ({ key: item.cityId, label: item.name }))
      );
    }
  }, [cities]);

  const resetForm = (event) => {
    values.assetType = "";
    values.fromLocation = "";
    values.toLocation = "";
    setShow(false);
  };
  const showSuccessMessage = () => {
    setShowSuccess(true);
  };
  const onSubmit = (event) => {
    if (_isFunction(onCalculate)) {
      onCalculate(values);
    }
    setShow(true);
  };
  const onChange = (e) => {
    values.fromLocation = e.target.value;
    values.toLocation = "";
    const index = e.nativeEvent.target.selectedIndex;
    const label = e.nativeEvent.target[index].text;
    let toCities = _filter(
      fromCitiesOptions,
      (item) => item.key !== e.target.value
    );
    if (label !== "All") {
      const distanceArr = [
        { key: `Metro ${label} < 25Km`, label: `Metro ${label} < 25Km` },
        { key: `Metro ${label} > 25Km`, label: `Metro ${label} > 25Km` },
      ];
      toCities = distanceArr.concat(toCities);
    }
    setToCitiesOptions(toCities);
  };

  const assetTypeOptions = _map(assetTypeList, (item) => ({
    key: item.recordTypeId,
    label: item.name,
  }));
  return (
    <div className="div-cal">
      <StaticHeader header="Transport Calculator" />
      <div className="div-trans-cal-desc">
        <p className="p-desc">Slattery Freight Services</p>
        <p className="b-head">Slattery Auctions is here to help</p>
        <p className="p-desc-help">
          When you buy from Slattery Auctions we aim to deliver the best
          customer service in the industry. A part of this service is delivering
          an easy flexible transport solution to meet your needs. We’ll have
          your vehicle delivered to the closest Slattery location for you to
          collect or direct to your door.
        </p>
      </div>
      <div className="div-calcultor">
        <p className="p-cal">Transport Calculator</p>
        <p className="p-cost">
          Quickly calculate transport costs with our online transport calculator
          and let Slattery organise the delivery of your Asset.
        </p>
        <p className="p-dis">
          <b>Disclaimer:</b> Slattery Auctions' transport calculator applies
          only to the transportation of standard passenger sedans, wagons and
          light commercial vehicles, with no modifications, that have been
          purchased from Slattery Auctions. * Please note: All distances are
          calculated from the Slattery Auctions location at which the vehicle is
          purchased.
        </p>
        <div className="transport-calc">
          <FormikForm noValidate autoComplete="off">
            <Card className="p-3">
              <div className="row">
                <Field
                  component={SelectField}
                  name="assetType"
                  label="AssetType"
                  placeholder="All"
                  options={assetTypeOptions}
                  className="dropdown col-md-3"
                />
                <Field
                  component={SelectField}
                  name="fromLocation"
                  label="From Location"
                  placeholder="All"
                  onChange={onChange}
                  options={fromCitiesOptions}
                  className="dropdown col-md-4"
                />
                <Field
                  component={SelectField}
                  name="toLocation"
                  label="To Location"
                  placeholder="All"
                  options={toCitiesOptions}
                  className="dropdown col-md-4"
                />
              </div>
            </Card>
            {show ? (
              <div className="row my-3 mx-0">
                <Card className="col-12 overflow-auto">
                  {transportFee && transportFee.length === 0 && <NoResults />}
                  <Visible when={transportFee && transportFee.length}>
                    <Table bordered size="sm">
                      <thead>
                        <tr>
                          <th>From Location</th>
                          <th>To Location</th>
                          <th>Approx. Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transportFee &&
                          transportFee.map((transport) => {
                            return (
                              <tr key={transport.transportFeeId}>
                                <td> {_get(transport.fromCity, "name")}</td>
                                <td>
                                  {" "}
                                  {_get(transport.toCity, "name") ||
                                    transport.distance}
                                </td>
                                <td>{transport.approximatePrice}</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </Table>
                  </Visible>
                </Card>
              </div>
            ) : null}
            <div className={show ? "div-btns btn-show" : "div-btns"}>
              <Button type="submit" className="btn-reset" onClick={resetForm}>
                Reset
              </Button>
              <Button
                variant="primary"
                type="submit"
                onClick={onSubmit}
                className="btn-cal"
              >
                Calculate
              </Button>
            </div>
          </FormikForm>
        </div>
      </div>
      <div className="div-enquire">
        {!showSuccess ? (
          <div className="div-enquire-form">
            <EnquireForm
              showMessage={showMessage}
              updateSuccesMessage={showSuccessMessage}
              enquireLocation="Transport Enquire"
            ></EnquireForm>
          </div>
        ) : (
          <div className="divSuccessmsg">
            <h2 className="">Success</h2>
            <SvgComponent path="check_circle_black" />
            <p>
              We have successfully placed your request. Our team member will get
              in touch with you for further details.
            </p>
          </div>
        )}
      </div>
      <div className="div-contacts">
        <div className="div-pickup">
          <p className="p-pickup-desc">Pickup Options</p>
          <p className="pickup-descs">
            Buyers are welcome to collect their items directly from our branches
            or the location of the auction within the defined pickup timeframe.
            We offer COVID safe pickups from all branches and can recommend
            COVID Safe transport operators.
          </p>
          <img
            className="pick-up-img"
            height="100px"
            width="100px"
            src={window.location.origin + "/assets/covid-safe-logo.png"}
          />
        </div>
        <div className="div-get-in-touch">
          <p className="p-getintouch">Get in Touch</p>
          <p className="p-contact">
            For specialised assets, we can still investigate freight services
            but they may not be available for some items.
            <br />
            <br />
            To check if your asset can be sent via freight please contact our
            friendly team <b>transport@SlatteryAuctions.com.au</b> or
            <Link to="/contact-us"> call your local branch. </Link>
            Additional charges may apply.
          </p>
          <Link
            to="/contact-us"
            type="button"
            className="btn btn-primary btn-contct"
          >
            <span> Contact Us</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
const TransportCalculators = withFormik({
  mapPropsToValues: ({
    assetType = "",
    fromLocation = "",
    toLocation = "",
  }) => {
    return {
      assetType,
      fromLocation,
      toLocation,
    };
  },
})(Component);
export default TransportCalculators;
