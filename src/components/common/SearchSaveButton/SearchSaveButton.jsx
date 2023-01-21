import React, { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import _map from 'lodash/map';
import _isEmpty from 'lodash/isEmpty';
import _isEqual from 'lodash/isEqual';
import _isArray from 'lodash/isArray';
import Button from 'react-bootstrap/Button';
import SvgComponent from '../SvgComponent';
import './SearchSaveButton.scss';

const SearchSaveButton = ({
  loggedInUser,
  toggleLogin,
  filteredObj,
  onChangeFilters,
  showSaveSearch,
  savedSearch,
}) => {
  const ref = useRef(null);
  const location = useLocation();
  const [show, setShow] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [target, setTarget] = useState(null);
  const [disableSearch, setDisableSearch] = useState(false);
  const [searchName, setSearchName] = useState(savedSearch?.name);

  const handleClick = (event) => {
    if (!loggedInUser) {
      toggleLogin();
    } else {
      setShow(!show);
      show && setDisableSearch(false);
      if (!show) {
        setTarget(event.target);
      }
      setSearchName(searchName);
    }
  };

  const isSelected = (option, selected) => {
    return selected
      ? selected.some((item) => item.val.includes(option.itemId[0]))
      : false;
  };

  const onChangeFilter = (item, filter) => {
    if (item.searchKey) {
      if (loggedInUser) {
        const value = filteredObj[item.searchKey];

        let slugValue = filteredObj[filter.slug] || [];
        if (!value) {
          slugValue.push({ name: item.filterHeader, value: item.searchKey });
        } else {
          slugValue = slugValue.filter((val) => val.name !== item.filterHeader);
        }
        onChangeFilters({
          ...filteredObj,
          [filter.slug]: slugValue,
          [item.searchKey]: !value,
        });
      } else {
        toggleLogin(true, () => onChangeFilter(item, filter));
      }
    } else {
      let updated = filteredObj[filter.searchKey] || [];
      if (isSelected(item, updated)) {
        updated = updated.filter((i) => {
          if (_isArray(i.val)) {
            return i.val.sort().join() !== item.itemId.sort().join();
          } else {
            return i.val !== item.itemId.join();
          }
        });
      } else {
        updated.push({
          name: item.name,
          val: filter.searchKey === 'categoryId' ? item.itemId : item.itemId[0],
        });
      }
      onChangeFilters({ ...filteredObj, [filter.searchKey]: updated });
    }
  };

  return (
    <div className="search-filters">
      {showSaveSearch && (
        <Button
          className="custom-btn-bg"
          variant="primary"
          size="sm"
          onClick={handleClick}
          block
        >
          <SvgComponent
            path="save_white_24dp"
            style={{ pointerEvents: 'none' }}
          />
          {savedSearch?.label}
        </Button>
      )}
    </div>
  );
};

export default SearchSaveButton;
