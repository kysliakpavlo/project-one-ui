import React, { useState } from "react";
import BSBreadcrumb from "react-bootstrap/Breadcrumb";
import { useHistory, useLocation } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Visible from "../Visible";
import SearchBar from "../SearchBar";
import SvgComponent from "../SvgComponent";
import SearchFilters from "../SearchFilters";
import {
  filterToChips,
  fromUrlString,
  removeNumber,
  toUrlString,
} from "../../../utils/helpers";

import "./RefineSearch.scss";

const RefineSearch = ({
  className,
  loggedInUser,
  state,
  showMessage,
  toggleLogin,
  onBack,
  onApply,
  showSaveSearch,
  savedSearch,
  saveSearchLabel,
}) => {
  const location = useLocation();
  const history = useHistory();
  const [filteredObj, setFilteredObj] = useState(state.filteredObj);

  const onChangeFilters = (filteredObj) => {
    setFilteredObj(filteredObj);
  };

  const removeSelection = (item) => {
    if (item.type === "filter") {
      const data = filteredObj[item.key];
      const updated = data.filter((i) => i.name !== item.name);
      onChangeFilters({ ...filteredObj, [item.key]: updated });
    } else if (item.type === "url") {
      const queryObj = fromUrlString(location.search.split("?")[1]);
      delete queryObj[item.key];
      history.replace(`/search-results?${toUrlString(queryObj)}`);
    }
  };

  const { search } = location;
  const filterListArray = filterToChips(filteredObj, search, state.filters);

  return (
    <Container className={`${className} refine-search-container`}>
      <SearchBar location={location} searchCrietria={state.searchCrietria} />
      <BSBreadcrumb className="breadcrumb-container">
        <BSBreadcrumb.Item onClick={onBack}>Back</BSBreadcrumb.Item>
      </BSBreadcrumb>
      <div className="selected-filters">
        <p>Search Filters: </p>
        {filterListArray.map((item) => (
          <div className="filtered-list" key={item.name}>
            {removeNumber(item.name).trim("")}
            <span onClick={() => removeSelection(item)}>
              <SvgComponent
                className="close-icon-svg"
                path="close_black_24dp"
              />
            </span>
          </div>
        ))}
      </div>
      <Visible when={state.searchResults}>
        <Row>
          <Col xs={12}>
            <SearchFilters
              filters={state.filters}
              showMessage={showMessage}
              toggleLogin={toggleLogin}
              filteredObj={filteredObj}
              loggedInUser={loggedInUser}
              onChangeFilters={onChangeFilters}
              showSaveSearch={showSaveSearch}
              savedSearch={savedSearch}
              saveSearchLabel={saveSearchLabel}
            />
          </Col>
        </Row>
        <div className="apply-filters">
          <Button onClick={() => onApply(filteredObj)}>Update Filters</Button>
        </div>
      </Visible>
    </Container>
  );
};

export default RefineSearch;
