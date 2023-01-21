import "./SearchBox.scss";
import { useHistory } from "react-router-dom";
import ShowOnScroll from "./ShowOnScroll";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Visible from "../Visible";
import { preventEvent } from "../../../utils/helpers";
import SvgComponent from "../SvgComponent";
import { stringify } from "qs";

const SearchBox = ({
  searchValues,
  isLoggedIn,
  setSearchValues,
  setAdvancedSearchState,
  ...others
}) => {
  const isVisible = ShowOnScroll(57);
  const history = useHistory();

  const navigationClick = () => {
    const query = stringify({ searchQuery: searchValues.searchQuery });
    history.push(`/search-results?${query}`);
  };

  const onEnter = (event) => {
    if (event.keyCode === 13) {
      navigationClick();
    }
  };

  const advSearch = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    setAdvancedSearchState(true);
  };

  const onChange = (e) => {
    const { value, name } = e.target;
    setSearchValues({
      ...searchValues,
      [name]: value,
    });
  };

  return (
    <Visible when={isVisible} className="hide-search-bar">
      <Form
        noValidate
        autoComplete="off"
        onSubmit={preventEvent}
        onKeyUp={onEnter}
      >
        <Form.Group
          className={
            isLoggedIn
              ? "searchbox search-box has-addon whitehighlight-cell"
              : "search-box has-addon white"
          }
          controlId="header-search-input"
        >
          <Row>
            <Col xs sm="6">
              <input
                type="text"
                placeholder="Search our inventory by keyword"
                className="searchInput"
                name="searchQuery"
                value={searchValues.searchQuery ? searchValues.searchQuery : ""}
                onChange={onChange}
              />
            </Col>
            <Col xs="4" sm="2">
              <Button
                variant="warning"
                className="form-control bg-color-btn"
                onClick={navigationClick}
              >
                <SvgComponent path="search" />
                <span>Search </span>
              </Button>
            </Col>
            <Col>
              <Button
                size="sm"
                variant="link"
                onClick={() => advSearch()}
                className="search_advanced text-center"
              >
                Advanced Search
              </Button>
            </Col>
          </Row>
        </Form.Group>
      </Form>
    </Visible>
  );
};

export default SearchBox;
