import React, { useState, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import SvgComponent from "../SvgComponent";
import _map from "lodash/map";
import _isEmpty from "lodash/isEmpty";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Tooltip from "react-bootstrap/Tooltip";
import Collapse from "react-bootstrap/Collapse";
import ToggleButton from "react-bootstrap/ToggleButton";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import { Form as FormikForm, Field, withFormik } from "formik";
import { TextField, SelectField } from "../FloatingField";
import { preventEvent } from "../../../utils/helpers";
import _isArray from "lodash/isArray";
import { stringify } from "qs";
import "./PredictiveSearchBar.scss";
import Visible from "../Visible";

import PredictiveSearchResults from "../../common/PredictiveSearchResults";

const PredictiveSearchBar = ({
  categories,
  locations,
  auctionTypes,
  values,
  setValues,
  setFieldValue,
  loadSubCategories,
  loadManufacturers,
  loadModels,
  searchValues,
  setSearchValues,
  isAdvSearchOpen,
  setAdvancedSearchState,
  isOpen,
  hideClose,
}) => {
  // Set to true by default:
  const [open, setOpen] = useState(false);
  const [enableField, setEnableField] = useState({});
  const [subCategories, setSubCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [models, setModels] = useState([]);
  const [onChangeReset, setOnChangeReset] = useState(false);
  const [cssApplied, setCssApplied] = useState(false);
  const {
    category,
    searchQuery,
    subCategory,
    auctionType,
    listLocation,
    manufacturer,
    showAdvanced,
  } = values;

  let advSearch = {};

  // console.log('is Open variable ' + isOpen);
  // useEffect(() => {
  // 	isOpen == false ? setOpen(false) : '';
  // }, []);

  const handleAucTypeChange = (val) => {
    setFieldValue("auctionType", val);
  };

  const handleSelectAll = (e) => {
    preventEvent(e);
    if (auctionType.length === auctionTypes.length) {
      setFieldValue("auctionType", []);
    } else {
      setFieldValue(
        "auctionType",
        auctionTypes.map((item) => item.recordTypeId)
      );
    }
  };

  useEffect(() => {
    if (isAdvSearchOpen || showAdvanced) {
      applyCssOnClick();
    }
  }, [isAdvSearchOpen, showAdvanced]);

  useEffect(() => {
    // console.log("IS OPEN", isOpen);
    setOpen(isOpen);
  }, []);

  const handleClick = () => {
    setValues({
      ...values,
      category: "",
      subCategory: "",
      manufacturer: "",
      model: "",
      listLocation: "",
      auctionType: [],
      isAdvSearchOpen: false,
    });
    setCssApplied(false);
    setAdvancedSearchState(false);
    // history.push(`/redirect/search-results`);
  };

  const applyCssOnClick = () => {
    setOpen(!open);
    setCssApplied(true);
  };

  useEffect(() => {
    setTimeout(() => {
      setOnChangeReset(true);
    }, 3000);
    return () => {
      setSearchValues({});
    };
  }, []);

  useEffect(async () => {
    if (!_isEmpty(category) && category !== "all") {
      const subCategories = await loadSubCategories(category);
      setSubCategories(subCategories);
      setEnableField((enableField) => ({ ...enableField, subCategory: true }));
    } else {
      setSubCategories([]);
      setEnableField((enableField) => ({ ...enableField, subCategory: false }));
    }
    setManufacturers([]);
    setModels([]);
    if (onChangeReset)
      setValues({ ...values, model: "", manufacturer: "", subCategory: "" });
  }, [category, categories]);

  useEffect(async () => {
    if (!_isEmpty(subCategory)) {
      const manufacturers = await loadManufacturers(subCategory);
      setManufacturers(manufacturers);
      setEnableField((enableField) => ({ ...enableField, manufacturer: true }));
    } else {
      setManufacturers([]);
      setEnableField((enableField) => ({
        ...enableField,
        manufacturer: false,
      }));
    }
    setModels([]);
    if (onChangeReset) setValues({ ...values, manufacturer: "", model: "" });
  }, [subCategory]);

  useEffect(async () => {
    if (!_isEmpty(manufacturer) || !_isEmpty(subCategory)) {
      const models = await loadModels(manufacturer, subCategory);
      setModels(models);
      setEnableField((enableField) => ({ ...enableField, model: true }));
    } else {
      setModels([]);
      setEnableField((enableField) => ({ ...enableField, model: false }));
    }
    if (onChangeReset) setFieldValue("model", "");
  }, [manufacturer, subCategory]);

  const isFormEmpty =
    _isEmpty(category) &&
    !searchQuery &&
    !listLocation &&
    auctionType.length === 0;

  const categoryOptions = _map(categories, (category) => ({
    key: category.categoryGroupId,
    label: category.groupName,
  }));

  const subCategoryOptions = _map(subCategories, (subCategory) => ({
    key: subCategory.recordTypeId,
    label: subCategory.name,
  }));

  const locationOptions = _map(locations, (listLocation) => ({
    key: listLocation.stateId,
    label: listLocation.name,
  }));

  const manufacturerOptions = _map(manufacturers, (manufacturer) => ({
    key: manufacturer,
    label: manufacturer,
  }));
  const modelOptions = _map(models, (model) => ({ key: model, label: model }));
  const history = useHistory();

  const navigationClick = (event) => {
    let { auctionType, ...options } = values;
    if (auctionType && auctionType.length) {
      options["auctionType"] = auctionType
        .filter((item) => item !== "Buy Now")
        .join();
      options["assetType"] = auctionTypes
        .filter((item) => auctionType.includes(item.recordTypeId))
        .map((item) => item.assetType)
        .join();
    }
    options["buyingMethod"] = "All";
    options["showAdvanced"] = true;
    if (options.category === "all") {
      delete options.category;
    }
    const query = stringify(options);
    history.push(`/redirect/search-results?${query}`);
  };

  const advancedQuery = () => {
    let { auctionType, ...options } = values;
    if (auctionType && auctionType.length) {
      options["auctionType"] = auctionType
        .filter((item) => item !== "Buy Now")
        .join();
      options["assetType"] = auctionTypes
        .filter((item) => auctionType.includes(item.recordTypeId))
        .map((item) => item.assetType)
        .join();
    }
    options["buyingMethod"] = "All";
    options["showAdvanced"] = true;
    if (options.category === "all") {
      delete options.category;
    }
    advSearch = stringify(options);
    // history.push(`/redirect/search-results?${query}`);
  };

  const onEnter = (event) => {
    if (event.keyCode === 13) {
      navigationClick();
    }
  };

  const advancedTooltip = (props) => (
    <Tooltip {...props}>
      {isFormEmpty
        ? "Please enter a Keyword or Select a Category/ Location/ Item Type"
        : "Click to Search"}
    </Tooltip>
  );

  const onChangeQuery = async (event) => {
    const { id, value } = event.target;
    advancedQuery();
    setFieldValue(id, value);
    await setSearchValues({ ...searchValues, [id]: value });
  };

  let classes = [];
  classes.push("gx-1");
  classes.push("search_by_keyword_row");
  classes.push("search_by_keyword");
  classes.push("mobile_view_css");
  open && classes.push("isOpen");




  return (
    <div className="search-bar predictiveSearchBar">
      <section>
        <FormikForm
          noValidate
          autoComplete="off"
          onKeyUp={onEnter}
        >
          <div className={classes.join(" ")}>
            <div className={"tablet-advanced-search"}>
              {/* ATLAS - Predictive Search */}
              <div
                className={`predictiveSearchBar__searchField`}
                id="predictiveSearchBar"
              >
                <PredictiveSearchResults
                  searchQuery={searchQuery}
                  values={values}
                  auctionTypes={auctionTypes}
                />
                <Field
                  className={`white ${!open && "mb-0"}`}
                  component={TextField}
                  name="searchQuery"
                  onChange={onChangeQuery}
                  // label='Search our inventory by keyword'
                  placeholder="Search our inventory by keyword"
                />
                <SvgComponent
                  path="search"
                  color="white"
                  size="sm"
                  className="search-icon"
                />
              </div>
            </div>
            {open && (
              <div className="ml-0">
                <Field
                  component={SelectField}
                  name="category"
                  // label='Category'
                  className={`white ${!open && "mb-0"}`}
                  placeholder="Select Category"
                  options={categoryOptions}
                />
              </div>
            )}
            <Visible when={!open}>
              <Button
                size="sm"
                variant="link"
                className="search__advanced text-center predictiveSearchBar__advancedSearch"
                onClick={() => applyCssOnClick()}
              >
                Advanced
              </Button>
            </Visible>
          </div>
          <Collapse in={open}>
            <div className="">
              <Row className="gx-1 mobile_view_css tab_view_css predictiveSearchBar__rowTwo">
                <Col
                  sm="3"
                  className="mobile-field-margin"
                >
                  <Field
                    className="white"
                    component={SelectField}
                    name="subCategory"
                    // label='Sub Category'
                    placeholder="All Sub Categories"
                    options={subCategoryOptions}
                    disabled={!enableField.subCategory}
                  ></Field>
                </Col>
                <Col
                  sm="3"
                  className="mobile-field-margin wm-92"
                >
                  <Field
                    className="white"
                    component={SelectField}
                    name="manufacturer"
                    // label='Manufacturer'
                    placeholder="Select Manufacturer"
                    options={manufacturerOptions}
                    disabled={!enableField.manufacturer}
                  />
                </Col>

                <Col
                  sm="3"
                  className="mobile-field-margin"
                >
                  <Field
                    className="white"
                    component={SelectField}
                    name="model"
                    // label='Model'
                    placeholder="Select Model"
                    options={modelOptions}
                    disabled={!enableField.model}
                  />
                </Col>

                <Col
                  sm="3"
                  className="mobile-field-margin"
                >
                  <Field
                    className="white"
                    component={SelectField}
                    name="listLocation"
                    // label='Location'
                    placeholder="All Locations"
                    options={locationOptions}
                  />
                </Col>
              </Row>
              <div className="mobile_view_css tab_view_css">
                {/* <Col sm='3' className='mobile-field-margin'>
                                    <Field
                                        className='white'
                                        component={SelectField}
                                        name='model'
                                        label='Model'
                                        placeholder='Select Model'
                                        options={modelOptions}
                                        disabled={!enableField.model}
                                    />
                                </Col> */}
                {/* <Col sm='3' className='item-types-align'>
                                    <ToggleButtonGroup type='checkbox' name='auctionType' value={auctionType} onChange={handleAucTypeChange}>
                                        <ToggleButton
                                            className={auctionType.length === auctionTypes.length ? "btn active btn-light" : "btn btn-light"}
                                            variant='light'
                                            id='checkAll'
                                            value='All'
                                            onClick={handleSelectAll}
                                        >
                                            All
                                        </ToggleButton>
                                        {auctionTypes &&
                                            auctionTypes.map((item) => (
                                                <ToggleButton variant='light' key={item.recordTypeId} value={item.recordTypeId}>
                                                    {item.label}
                                                </ToggleButton>
                                            ))}
                                    </ToggleButtonGroup>
                                </Col> */}
                <div className={`${cssApplied && "tablet-search-btn"}`}>
                  <OverlayTrigger
                    placement="top"
                    overlay={advancedTooltip}
                  >
                    <div className="predictiveSearchBar__submit">
                      <Button
                        variant="warning"
                        disabled={isFormEmpty}
                        className={`form-control bg-color-btn ${
                          cssApplied && "tablet-search-btn"
                        }`}
                        onClick={navigationClick}
                      >
                        <span>Search</span>
                      </Button>
                      <Visible when={!hideClose}>
                        <div className="close-btn-icon">
                          <Button
                            variant="link"
                            className="search__advanced text-center close-link"
                            onClick={() => {
                              setOpen(!open);
                              handleClick();
                            }}
                          >
                            Close
                          </Button>
                        </div>
                      </Visible>
                    </div>
                  </OverlayTrigger>
                </div>
              </div>
            </div>
          </Collapse>
        </FormikForm>
      </section>
    </div>
  );
};
export default withFormik({
  mapPropsToValues: ({
    searchCrietria,
    categories = [],
    searchValues,
    auctionType = [],
    category = "",
  }) => {
    const showAdvanced =
      (categories &&
        categories.find(
          (item) =>
            item.categoryGroupId === searchCrietria?.categoryId ||
            item.categoryGroupId === category
        )) ||
      (searchCrietria?.showAdvanced && searchCrietria.showAdvanced);
    searchCrietria?.assetType &&
      searchCrietria?.assetType.split(",").map((ele) => {
        ele === "Buy Now" && auctionType.push(ele);
      });
    searchCrietria?.auctionTypeId &&
      searchCrietria?.auctionTypeId.split(",").map((ele) => {
        auctionType.push(ele);
      });

    auctionType = [...new Set(auctionType)];
    const isMobile = window.innerWidth < 768;
    return {
      showAdvanced:
        !isMobile &&
        !!(
          showAdvanced ||
          searchCrietria?.subCategoryId ||
          searchCrietria?.stateId ||
          searchCrietria?.model ||
          searchCrietria?.make
        ),
      searchQuery: searchValues?.searchQuery || searchCrietria?.keyword || "",
      category: searchCrietria?.categoryId || category || "",
      subCategory: searchCrietria?.subCategoryId || "",
      listLocation: searchCrietria?.stateId || "",
      model: searchCrietria?.model || "",
      manufacturer: searchCrietria?.make || "",
      auctionType: auctionType || searchCrietria?.assetType || "",
    };
  },
  handleSubmit: (values, { props, ...formikProps }) => {},
})(PredictiveSearchBar);
