import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import _map from "lodash/map";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Form as FormikForm, withFormik } from "formik";
import { MESSAGES, SUBSCRIPTION_SOURCE } from "../../../../utils/constants";

import "./MarketingSubscription.scss";

const Form = ({
  setLoading,
  showMessage,
  locations,
  categories,
  values,
  ...props
}) => {
  const [stateSelected, setStateSelected] = useState([]);
  const [categoriesSelected, setCategoriesSelected] = useState([]);
  const [optSelect, setOptSelect] = useState(true);
  const [optState, setOptState] = useState(false);
  const [optAllCate, setOptAllCate] = useState(
    categoriesSelected.length === 6 &&
      categoriesSelected.some((ele) =>
        props.profileInfo?.assetInterests?.includes(ele)
      )
  );

  categories = categories.filter((ele) => ele.key !== "All");
  useEffect(() => {
    if (props.isValidating) {
      props.handleSubmit();
    }
    setStateSelected(
      props.profileInfo?.location?.length > 0
        ? props.profileInfo.location.split(";")
        : []
    );
    setCategoriesSelected(
      props.profileInfo?.assetInterests?.length > 0
        ? props.profileInfo.assetInterests.split(";")
        : []
    );
    setOptSelect(props.profileInfo?.personHasOptedOutOfEmail);
    if (!props.profileInfo?.subscribeNewsLetter) {
      setCategoriesSelected([]);
      setStateSelected([]);
      setOptState(true);
    }
    if (!props.profileInfo?.personHasOptedOutOfEmail) {
      setOptState(true);
    }
    setLoading(false);
  }, [values]);
  const lastLocations = [2, 5, 8];

  const onChangeStates = () => {
    setOptSelect((optSelect) => !optSelect);
    if (!optSelect) {
      setCategoriesSelected([]);
      setStateSelected([]);
      setOptState(false);
      setOptAllCate(false);
    } else {
      setOptState(true);
    }
  };

  const deselectStatesOrCateg = (type, val) => {
    const cloneState =
      type === "state" ? [...stateSelected] : [...categoriesSelected];
    const indexVal = cloneState.indexOf(val);
    if (indexVal > -1) {
      cloneState.splice(indexVal, 1);
      type === "state"
        ? setStateSelected(cloneState)
        : setCategoriesSelected(cloneState);
    }
  };

  const selectAllCategory = () => {
    let cateArray = [];
    if (!optAllCate) {
      categories.map((ele) => {
        ele.key !== "All Categories" && cateArray.push(ele.key);
      });
      setCategoriesSelected(cateArray);
    } else {
      setCategoriesSelected([]);
    }
    setOptAllCate(!optAllCate);
  };

  const updateSubscription = () => {
    props
      .subscribeToNewsLetter({
        email: values.email,
        location: stateSelected,
        assetInterests: categoriesSelected,
        subscribeNewsLetter: optSelect,
        personHasOptedOutOfEmail: optSelect,
        subscriptionSource: SUBSCRIPTION_SOURCE.MARKETING_PREFERENCES,
      })
      .then((res) => {
        showMessage({
          message:
            res.message === "Success"
              ? MESSAGES.SUBSCRIPTION_SUCCESS
              : MESSAGES.SUBSCRIPTION_FAILURE,
        });
      })
      .catch((err) => {
        showMessage({ message: err.message });
      });
  };

  return (
    <FormikForm className="marketing-subscription">
      <Row>
        <Col className="col-custom">
          <Card>
            <Card.Header>
              <div className="title-pref">Marketing Preferences</div>
              <div className="location-list">
                <div className={`label-block-css opt-all-css`}>
                  <label className="">Opt-out of all</label>
                </div>
                <div className={`custom-control custom-switch opt-out-toggle `}>
                  <div></div>
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id={`Opt-out`}
                    checked={optSelect}
                    onClick={onChangeStates}
                    readOnly
                  />
                  <label
                    className="custom-control-label"
                    htmlFor={`Opt-out`}
                  ></label>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="location-card">
              <p>Select Location(s)</p>
              <div className="state-list">
                {locations?.length > 1 &&
                  locations.map((state, index) => (
                    <div key={index} className="location-list">
                      <div className="label-block-css">
                        <label className="">{state.label}</label>
                      </div>
                      <div
                        className={`custom-control custom-switch  ${
                          lastLocations.includes(index) ? "last-inputs" : ""
                        }`}
                      >
                        <div></div>

                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id={`${state.key}`}
                          checked={stateSelected.includes(state.label)}
                          onClick={() =>
                            stateSelected.includes(state.label)
                              ? deselectStatesOrCateg("state", state.label)
                              : setStateSelected([
                                  ...stateSelected,
                                  state.label,
                                ])
                          }
                          disabled={!optState}
                          readOnly
                        />
                        <label
                          className="custom-control-label"
                          htmlFor={`${state.key}`}
                        ></label>
                      </div>
                    </div>
                  ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col className="col-custom mar-top">
          <Card className="categories-block">
            <Card.Header>Categories</Card.Header>
            <Card.Body>
              <div className="categories-list">
                {categories &&
                  categories.map((state, index) => (
                    <div key={index} className="location-list">
                      {state.label !== "All Categories" ? (
                        <>
                          <div className={`label-block-css`}>
                            <label className="">{state.label}</label>
                          </div>
                          <div className={`custom-control custom-switch`}>
                            <div></div>
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              id={`${state.key}`}
                              checked={
                                categoriesSelected.length > 0 &&
                                categoriesSelected.includes(state.label)
                              }
                              onClick={() =>
                                categoriesSelected.includes(state.label)
                                  ? deselectStatesOrCateg("categ", state.label)
                                  : setCategoriesSelected([
                                      ...categoriesSelected,
                                      state.label,
                                    ])
                              }
                              disabled={!optState}
                              readOnly
                            />
                            <label
                              className="custom-control-label"
                              htmlFor={`${state.key}`}
                            ></label>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={`label-block-css`}>
                            <label className="">{state.label}</label>
                          </div>
                          <div className={`custom-control custom-switch`}>
                            <div></div>
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              id={`${state.key}`}
                              checked={
                                optAllCate || categoriesSelected.length === 6
                              }
                              onClick={() => selectAllCategory()}
                              disabled={!optState}
                              readOnly
                            />
                            <label
                              className="custom-control-label"
                              htmlFor={`${state.key}`}
                            ></label>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
              </div>
              <div className="subscribeBtn">
                <Button className="btn-align" onClick={updateSubscription}>
                  Update Subscription
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </FormikForm>
  );
};

const WithFormikForm = withFormik({
  mapPropsToValues: ({ profileInfo }) => {
    return {
      firstName: profileInfo.firstName || "",
      lastName: profileInfo.lastName || "",
      email: profileInfo.email || "",
      subscribe: profileInfo.subscribeNewsLetter || false,
      states: profileInfo.location ? profileInfo.location.split(";") : [],
      categories: profileInfo.assetInterests
        ? profileInfo.assetInterests.split(";")
        : [],
    };
  },
  validationSchema: Yup.object().shape({}),
})(Form);

const MarketingSubscription = (props) => {
  const [profileInfo, setProfileInfo] = useState(null);

  const locationOptions = _map(props.locations, (item) => ({
    key: item.name,
    label: item.name,
  }));
  const categoryOptions = _map(props.categories, (item) => ({
    key: item.groupName,
    label: item.groupName,
  }));
  useEffect(() => {
    props.getAccount().then((res) => {
      setProfileInfo(res.result);
    });
  }, [setProfileInfo]);

  if (!profileInfo) {
    return null;
  }

  return (
    <WithFormikForm
      {...props}
      locations={locationOptions}
      categories={categoryOptions}
      profileInfo={profileInfo}
      setLoading={props.setLoading}
    />
  );
};

export default MarketingSubscription;
