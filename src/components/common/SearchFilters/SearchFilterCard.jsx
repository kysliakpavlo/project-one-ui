import React from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Accordion from "react-bootstrap/Accordion";
import { removeNumber } from "../../../utils/helpers";
import SvgComponent from "../SvgComponent";

const SearchFilterCard = ({ filter, selected, onChange, isOpen }) => {
  const selectedFilters = (item) => {
    onChange(item, filter);
  };

  const isSelected = (option) => {
    if (selected) {
      return selected.some((item) => item.val.includes(option));
    } else {
      return false;
    }
  };
  // selected ? selected.some((item) => item.val.includes(option)) : false;
  const isSelectedAssetype = (option) => {
    return selected
      ? selected.some((item) => item.value === option.searchKey)
      : false;
  };

  return (
    <Card>
      <Accordion.Toggle
        as={Card.Header}
        eventKey={filter.searchKey || filter.slug}
        className={isOpen ? "active" : ""}
      >
        <div>{filter.filterHeader}</div>
        <SvgComponent path="arrow-next" />
      </Accordion.Toggle>
      <Accordion.Collapse eventKey={filter.searchKey || filter.slug}>
        <Card.Body>
          <Form>
            {filter.subMenu.map((menu) => (
              <div className="checkbox-custom-css" key={menu.slug || menu.name}>
                {menu.filterHeader ? (
                  <Form.Check
                    isValid
                    custom
                    type="checkbox"
                    id={menu.slug}
                    key={menu.slug}
                    onChange={() => selectedFilters(menu)}
                    label={removeNumber(menu.filterHeader).trim("")}
                    checked={isSelectedAssetype(menu)}
                  />
                ) : (
                  <>
                    <Form.Check
                      isValid
                      custom
                      type="checkbox"
                      id={`${menu.name}-${menu.itemId}`}
                      key={`${menu.name}-${menu.itemId}`}
                      onChange={() => selectedFilters(menu)}
                      label={removeNumber(menu.name).trim("")}
                      checked={isSelected(menu?.itemId && menu.itemId[0])}
                    />
                  </>
                )}
              </div>
            ))}
          </Form>
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
};

export default SearchFilterCard;
