import React, { useState, useEffect } from "react";
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
import "./SearchBar.scss";
import Visible from "../Visible";

const SearchBar = ({
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
}) => {
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

  const onChangeQuery = async (e) => {
    const { id, value } = e.target;
    await setSearchValues({ ...searchValues, [id]: value });
    setFieldValue(id, value);
  };

  return (
    <div className="search-bar">
      <section className="search-home">
        <FormikForm noValidate autoComplete="off" onKeyUp={onEnter}>
          <Row
            className={`search_by_keyword_row ${cssApplied && "search_by_keyword"
              } ${cssApplied && "mobile_view_css"}` }
          >           
           <Visible when={!open}>
            <Col
              xs
              sm="10"
              className={`${cssApplied && "tablet-advance-search"} d-flex`}
            >
              <Field
                className={`black ${!open && "mb-0"}`}
                component={TextField}
                name="searchQuery"
                onChange={onChangeQuery}
                label="Search our inventory by keyword"
              />
              <Button
                variant="warning"
                disabled={isFormEmpty}
                className="form-control bg-color-btn search-icon-wrap"
                onClick={navigationClick}
              >
                <SvgComponent
                  path="search"
                  color="black"
                  size="sm"
                  className="search-icon"
                />
              </Button>
            </Col>
            </Visible>

            <Visible when={open}>
            <Col
              xs
              md="9"
              className={`${cssApplied && "tablet-advance-search"}`}
            >
              <Field
                className={`black ${!open && "mb-0"}`}
                component={TextField}
                name="searchQuery"
                onChange={onChangeQuery}
                label="Search our inventory by keyword"
              />      
              {/* <Button
                variant="warning"
                disabled={isFormEmpty}
                className="form-control bg-color-btn"
                onClick={navigationClick}
              >
                <SvgComponent
                  path="search"
                  color="black"
                  size="sm"
                  className="search-icon"
                />
              </Button> */}

            </Col>
            </Visible>
            
            {open && (
              <Col xs  md="3" className="ml-0">
                <Field
                  component={SelectField}
                  name="category"
                //   label="Category"
                  className={`black ${!open && "mb-0"}`}
                  placeholder="Select Category"
                  options={categoryOptions}
                />
              </Col>
            )}
            {/* <Visible when={!open}>
              <Col xs="4" sm="3">
                <Button
                  variant="warning"
                  disabled={isFormEmpty}
                  className="form-control bg-color-btn"
                  onClick={navigationClick}
                >
                  <SvgComponent
                    path="search"
                    color="white"
                    size="sm"
                    className="search-icon"
                  />
                  <span>Search</span>
                </Button>
              </Col>
            </Visible> */}
            <Visible when={!open}>
              <Col sm="2" className="search_advanced_div">
                <Button
                  size="sm"
                  variant="link"
                  className="search__advanced text-center"
                  onClick={() => applyCssOnClick()}
                >
                  Advanced
                </Button>
              </Col>
            </Visible>
          </Row>
          <Collapse in={open}>
            <div className="">
              <Row className="mobile_view_css tab_view_css">
                <Col sm="3" className="mobile-field-margin">
                  <Field
                    className="black"
                    component={SelectField}
                    name="subCategory"
                    // label="Sub Category"
                    placeholder="All Sub Categories"
                    options={subCategoryOptions}
                    disabled={!enableField.subCategory}
                  ></Field>
                </Col>
                <Col sm="3" className="mobile-field-margin">
                  <Field
                    className="black"
                    component={SelectField}
                    name="listLocation"
                    // label="Location"
                    placeholder="All Locations"
                    options={locationOptions}
                  />
                </Col>
                <Col sm="3" className="mobile-field-margin wm-92">
                  <Field
                    className="black"
                    component={SelectField}
                    name="manufacturer"
                    // label="Manufacturer"
                    placeholder="Select Manufacturer"
                    options={manufacturerOptions}
                    disabled={!enableField.manufacturer}
                  />
                </Col>
                <Col sm="" className="mobile-field-margin">
                  <Field
                    className="black"
                    component={SelectField}
                    name="model"
                    // label="Model"
                    placeholder="Select Model"
                    options={modelOptions}
                    disabled={!enableField.model}
                  />
                </Col>
              </Row>
              <Row className="mobile_view_css tab_view_css justify-content-center">
                {/* <Col sm="5" className="mobile-field-margin">
                  <Field
                    className="black"
                    component={SelectField}
                    name="model"
                    label="Model"
                    placeholder="Select Model"
                    options={modelOptions}
                    disabled={!enableField.model}
                  />
                </Col>
                <Col sm="3" className="item-types-align">
                  <ToggleButtonGroup
                    type="checkbox"
                    name="auctionType"
                    value={auctionType}
                    onChange={handleAucTypeChange}
                  >
                    <ToggleButton
                      className={
                        auctionType.length === auctionTypes.length
                          ? "btn active btn-light"
                          : "btn btn-light"
                      }
                      variant="light"
                      id="checkAll"
                      value="All"
                      onClick={handleSelectAll}
                    >
                      All
                    </ToggleButton>
                    {auctionTypes &&
                      auctionTypes.map((item) => (
                        <ToggleButton
                          variant="light"
                          key={item.recordTypeId}
                          value={item.recordTypeId}
                        >
                          {item.label}
                        </ToggleButton>
                      ))}
                  </ToggleButtonGroup>
                </Col> */}
                <Col
                  sm="4"
                  className={`${cssApplied && "search-btn-css-apply"}`}
                >
                  <OverlayTrigger placement="top" overlay={advancedTooltip}>
                    <Button
                      variant="warning"
                      disabled={isFormEmpty}
                      className={`form-control bg-color-btn  cta-color-1 ${cssApplied && "tablet-search-btn"
                        }`}
                      onClick={navigationClick}
                    >
                      <span>Search</span>
                      {/* <i>
                        <SvgComponent
                          path="search"
                          color="black"
                          size="sm"
                          className="search-icon"
                        />
                      </i> */}
                    </Button>
                  </OverlayTrigger>
                  
                </Col>
                <Collapse in={open}>
                  <Button
                    size="sm"
                    variant="link"
                    className="search__advanced text-center close-link"
                    onClick={() => {
                      setOpen(!open);
                      handleClick();
                    }}
                  >
                    Close
                    {/* <SvgComponent path="close" /> */}
                  </Button>
                </Collapse>
              </Row>
              {/* <Row className="close-btn-icon">

              </Row> */}
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
  handleSubmit: (values, { props, ...formikProps }) => { },
})(SearchBar);
