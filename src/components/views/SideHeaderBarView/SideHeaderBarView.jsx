import React from "react";
import "./SideHeaderBarView.scss";
import Nav from "react-bootstrap/Nav";
import Card from "react-bootstrap/Card";
import Accordion from "react-bootstrap/Accordion";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link } from "react-router-dom";
import { stringify } from "qs";
import SearchBox from "../../common/SearchBox";
import ListGroup from "react-bootstrap/ListGroup";
import Visible from "../../common/Visible";
import SvgComponent from "../../common/SvgComponent";

export default class SideHeaderBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      style: "menu",
      menuStatus: "close",
      domBody: document.body.style.overflow,
      defaultActiveKey: "1",
      chevron: {},
      showingHamburger: true,
      showingClose: false,
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    switch (this.state.menuStatus) {
      case "open":
        this.setState({
          menuStatus: "close",
          style: "menu",
          domBody: (document.body.style.overflow = "scroll"),
          defaultActiveKey: "1",
          chevron: "fa-chevron-down",
          showingClose: false,
          showingHamburger: true,
        });
        break;
      case "close":
        this.setState({
          menuStatus: "open",
          style: "menu active",
          domBody: (document.body.style.overflow = "hidden"),
          defaultActiveKey: "1",
          showingHamburger: false,
          showingClose: true,
        });
        break;
      default:
        break;
    }
    if (this.state.showingHamburger) {
      this.props.setSideBar(true);
    } else {
      this.props.setSideBar(false);
    }
  }
  handleAccordionClick = (groupName, index) => {
    const { chevron } = this.state;
    this.setState({
      chevron: { ...chevron, [groupName]: !chevron[groupName] },
      defaultActiveKey: index,
    });
  };
  render() {
    const { loggedInUser, liveNotificationOpen, isPublicConsole, width } =
      this.props;
    const { chevron, menuStatus, showingHamburger, showingClose } = this.state;
    const myAccountClick = () => {
      liveNotificationOpen(false);
      document.body.style.overflow = "";
      this.setState({
        menuStatus: "close",
        style: "menu",
        domBody: (document.body.style.overflow = "scroll"),
        defaultActiveKey: "1",
        chevron: "fa-chevron-down",
        showingClose: false,
        showingHamburger: true,
      });
    };
    return (
      <div className="sidebar-menu">
        <div className="sidebar-div">
          {/* {showingHamburger ? (
            <div className="hamburger-menu" onClick={this.handleClick}>
              <SvgComponent path="menu" />
            </div>
          ) : null}
          {showingClose ? (
            <div className="close-menu" onClick={this.handleClick}>
              <SvgComponent path="close" />
            </div>
          ) : null}
          <Link
            onClick={(e) => myAccountClick(e)}
            to="/"
            className="image-block"
            aria-label="slattery-logo"
          >
            {" "}
            <img
              alt="slattery-logo"
              
              // Change to be dynamic
              src={window.location.origin + "/ev-green-logo.svg"}
              width="170"
              height="35"
              className="d-inline-block align-top"
            />{" "}
          </Link> */}
          <Link
            onClick={(e) => myAccountClick(e)}
            to="/"
            className=" ml-3"
            aria-label="slattery-logo"
          >
            {" "}
            <img
              alt="slattery-logo"

              // Change to be dynamic
              src={window.location.origin + "/ev-green-logo.svg"}
              width="170"
              height="35"
              className="d-inline-block align-top"
            />{" "}
          </Link>
          <Nav.Item
            className="div-sellwithus"
            onClick={(e) => myAccountClick(e)}
          >
            {/* <Link
              to="/sell-with-us"
              type="button"
              className="btn btn-outline-warning"
            >
              <span> Sell With Us</span>
            </Link> */}
            <Visible when={!loggedInUser}>
              <button
                tabIndex="0"
                type="button"
                onClick={this.props.handleloginClick}
                className="btn btn-secondary"
              >
                <span>Sign in / Join</span>
              </button>
            </Visible>
          </Nav.Item>
          <Nav.Item
            className="header-buttons"
            onClick={(e) => myAccountClick(e)}
          >
            <Link
              to="/sell-with-us"
              type="button"
              className="sell-btn btn btn-outline-warning"
            >
              <span> Sell</span>
            </Link>
            <Visible when={!loggedInUser}>
              <button
                tabIndex="0"
                type="button"
                onClick={this.props.handleloginClick}
                className="reg-btn btn btn-primary"
              >
                <span>Sign In / Join</span>
              </button>
            </Visible>
            <Visible when={loggedInUser}>
              <NavDropdown
                onClick={(e) => myAccountClick(e)}
                id="collasible-nav-dropdown"
                className="dropdown-panel"
                title={
                  <SvgComponent
                    path="account_circle"
                    aria-label="account-mobile"
                  />
                }
                id="basic-nav-dropdown-account-mobile"
              >
                <NavDropdown.Item as={Link} to="/my-account/active-bid">
                  My Account
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/my-account/active-bid">
                  Active Bids
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/my-account/watchlist">
                  Watchlist
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/my-account/recently-viewed">
                  Recently Viewed
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/my-account/items-won">
                  Items Won
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/my-account/referred-assets">
                  Referred Assets
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/my-account/payment-history">
                  Payments
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/my-account/saved-searches">
                  Saved Searches
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/my-account/profile">
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/my-account/preferences">
                  Preferences
                </NavDropdown.Item>
                <NavDropdown.Item onClick={this.props.doLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Visible>
          </Nav.Item>
          <Visible when={loggedInUser}>
            <Nav.Item
              className={`Pfl-tab ${isPublicConsole && width < 1024 ? "position-relative" : ""
                }`}
            >
              {loggedInUser && loggedInUser.profilePicURL ? (
                <img
                  className="img img-fluid profile-pic"
                  src={loggedInUser.profilePicURL}
                />
              ) : (
                <SvgComponent path="account_circle" />
              )}
              <NavDropdown
                onClick={(e) => myAccountClick(e)}
                className="dropdown-panel"
                title={`${loggedInUser && loggedInUser.firstName} ${loggedInUser && loggedInUser.lastName
                  ? loggedInUser.lastName
                  : ""
                  }`}
                id="basic-nav-dropdown-account-tablet"
              >
                <NavDropdown.Item as={Link} to="/my-account/active-bid">
                  My Account
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/my-account/active-bid">
                  Active Bids
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/my-account/watchlist">
                  Watching
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/my-account/recently-viewed">
                  Recently Viewed
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/my-account/items-won">
                  Items Won
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/my-account/referred-assets">
                  Referred Assets
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/my-account/payment-history">
                  Payments
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/my-account/saved-searches">
                  Saved Searches
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/my-account/profile">
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/my-account/preferences">
                  Preferences
                </NavDropdown.Item>
                <NavDropdown.Item onClick={this.props.doLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav.Item>
          </Visible>
          <div className={this.state.style}>
            {menuStatus === "open" && (
              <div>
                {this.props.NavLinks.map(
                  ({ url, groupName, subMenu }, index) => (
                    <Accordion key={groupName} defaultActiveKey="1">
                      {subMenu && subMenu.length > 0 ? (
                        <Card className="menu-items">
                          <Accordion.Toggle as={Card.Header} eventKey="0">
                            {groupName}
                            <SvgComponent
                              path={
                                chevron[groupName]
                                  ? "angle-up-solid"
                                  : "angle-down-solid"
                              }
                              onClick={() =>
                                this.handleAccordionClick(groupName, index)
                              }
                            ></SvgComponent>
                            {/* <i className={`fa ${chevron[groupName] ? 'fa-chevron-up' : 'fa-chevron-down'}`} onClick={() => this.handleAccordionClick(groupName, index)}></i> */}
                          </Accordion.Toggle>
                          <Accordion.Collapse eventKey="0">
                            <Card.Body>
                              {subMenu.map(
                                ({ url, groupName, subSubMenu }, index) => (
                                  <div key={groupName}>
                                    {subSubMenu && subSubMenu.length > 0 ? (
                                      <Card
                                        className={
                                          subMenu[index].groupIdentifier ===
                                            "Asset"
                                            ? "side-menu-header"
                                            : subMenu[index].groupIdentifier ===
                                              "Auctions"
                                              ? "side-menu-header1"
                                              : "side-menu-header2"
                                        }
                                      >
                                        <Card.Body>
                                          <Nav.Item onClick={this.handleClick}>
                                            <NavDropdown.Item
                                              as={Link}
                                              to={url}
                                            >
                                              {groupName}
                                            </NavDropdown.Item>
                                          </Nav.Item>
                                          {subSubMenu &&
                                            subSubMenu.map((item) => (
                                              <ListGroup.Item>
                                                {subMenu[index]
                                                  .groupIdentifier ===
                                                  "Asset" && (
                                                    <Nav.Item
                                                      className="asset-div"
                                                      onClick={this.handleClick}
                                                    >
                                                      <Link
                                                        to={
                                                          `/redirect/search-results?${stringify({ category: item.headerAssetTypeId, buyingMethod: "All", title: item.groupName })}`
                                                        }
                                                        key={item.categoryTitle}
                                                        onClick={(event) =>
                                                          this.props.onClickcallback(
                                                            item.groupName,
                                                            "Asset",
                                                            item.headerAssetTypeId,
                                                            event
                                                          )
                                                        }
                                                      >
                                                        {item.groupName}
                                                      </Link>
                                                    </Nav.Item>
                                                  )}
                                                {subMenu[index]
                                                  .groupIdentifier ===
                                                  "Auctions" && (
                                                    <Nav.Item
                                                      className="auction-div"
                                                      onClick={this.handleClick}
                                                    >
                                                      <Link
                                                        key={item.groupName}
                                                        to="/auctions"
                                                        onClick={(event) =>
                                                          this.props.onClickcallback(
                                                            item.groupName,
                                                            "Auctions",
                                                            item.categoryIdString,
                                                            event
                                                          )
                                                        }
                                                      >
                                                        {item.groupName}
                                                      </Link>
                                                    </Nav.Item>
                                                  )}
                                                {subMenu[index]
                                                  .groupIdentifier ===
                                                  "others" && (
                                                    <Nav.Item
                                                      className="auction-div"
                                                      onClick={this.handleClick}
                                                    >
                                                      <Link
                                                        key={item.groupName}
                                                        onClick={(event) =>
                                                          this.props.onClickcallback(
                                                            item.groupName,
                                                            "",
                                                            item.categoryIdString,
                                                            event
                                                          )
                                                        }
                                                      >
                                                        {item.groupName}
                                                      </Link>
                                                    </Nav.Item>
                                                  )}
                                              </ListGroup.Item>
                                            ))}
                                        </Card.Body>
                                      </Card>
                                    ) : (
                                      <Nav.Item>
                                        <Link
                                          to={url}
                                          onClick={this.handleClick}
                                        >
                                          {groupName}
                                        </Link>
                                      </Nav.Item>
                                    )}
                                  </div>
                                )
                              )}
                            </Card.Body>
                          </Accordion.Collapse>
                        </Card>
                      ) : (
                        <Card>
                          <Accordion.Toggle as={Card.Header} eventKey="0">
                            <Link onClick={this.handleClick} to={url}>
                              {groupName}
                            </Link>
                          </Accordion.Toggle>
                        </Card>
                      )}
                    </Accordion>
                  )
                )}
              </div>
            )}
          </div>

          {showingClose ? (
            <div className="close-menu" onClick={this.handleClick}>
              <SvgComponent path="close" />
            </div>
          ) : null}

          <Visible when={menuStatus === "close"}>
            <SearchBox />
          </Visible>
          {showingHamburger ? (
            <div className="hamburger-menu" onClick={this.handleClick}>
              <SvgComponent path="menu" />
            </div>
          ) : null}

        </div>
      </div >
    );
  }
}
