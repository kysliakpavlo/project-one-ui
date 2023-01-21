import React, { useEffect, useRef, useState, useCallback } from "react";
import _isEmpty from "lodash/isEmpty";
import { Link } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Accordion from "react-bootstrap/Accordion";
import Container from "react-bootstrap/Container";
import Visible from "../../common/Visible";
import ContactUs from "../../common/ContactUs";
import PredictiveSearchBar from "../../common/PredictiveSearchBar";
import SvgComponent from "../../common/SvgComponent";
import { setAppTitle } from "../../../utils/helpers";
import { DEFAULT_IMAGE } from "../../../utils/constants";
import { constructImageUrl } from "../../../utils/helpers";
import { useHistory } from "react-router-dom";

import "./CareerView.scss";

const CareerView = ({ vendor }) => {
  const [activeId, setActiveId] = useState("0");
  const history = useHistory();
  useEffect(() => {
    if (!_isEmpty(vendor)) {
      setAppTitle("Careers", vendor.name);
    }
  }, [vendor]);

  const lifeAtSlatteryRef = useRef();
  const workWithUsRef = useRef();
  const registerRef = useRef();
  const pillarsRef = useRef();
  const bottomRef = useRef();

  const scrollToSection = (key) => {
    if (key === "lifeAtSlatteryRef") {
      if (lifeAtSlatteryRef.current) {
        lifeAtSlatteryRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    } else if (key === "workWithUsRef") {
      if (workWithUsRef.current) {
        workWithUsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    } else if (key === "registerRef") {
      if (registerRef.current) {
        registerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    } else if (key === "pillarsRef") {
      if (pillarsRef.current) {
        pillarsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  };

  const toggleActive = (id) => {
    if (activeId === id) {
      setActiveId(null);
    } else {
      setActiveId(id);
    }
  };
  const [playing, setPlaying] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);

  const togglePlaying = useCallback(() => {
    const videos = document.querySelectorAll("video");
    setPlaying((playing) => {
      if (!playing) {
        videos[0].play();
      } else {
        videos[0].pause();
      }
      return !playing;
    });
  }, [setPlaying]);
  return (
    <div className="career-view">
      <div className="careers">
        <img
          src={DEFAULT_IMAGE}
          onLoad={(e) =>
            constructImageUrl(
              window.location.origin + "/careers/shutterstock_1139707214.jpg",
              e.target
            )
          }
          //src={window.location.origin + '/careers/shutterstock_1139707214.jpg'}
        />
        <div className="searchBars">
          <PredictiveSearchBar />
        </div>
        <div className="image-overlay"> </div>

        <div className="career-text">
          <h3>
            <strong>Careers</strong>
          </h3>
          <p>
            Ready to take on an opportunity and explore your career options with
            Slattery’s? We are always looking for passionate, service minded
            people to join our family. View available jobs below or submit an
            expression of interest to see where you can make a difference in our
            organisation.
          </p>
          <Link
            className="view-jobs"
            to={{ pathname: "https://www.seek.com.au/slattery-auctions-jobs" }}
            target="_blank"
          >
            <Button type="button">View Jobs</Button>
          </Link>
        </div>
      </div>
      <Container>
        <div className="sections row">
          <div className="section-img">
            <img
              src={DEFAULT_IMAGE}
              onLoad={(e) =>
                constructImageUrl(
                  window.location.origin + "/careers/iStock-477576202.jpg",
                  e.target
                )
              }
              // src={process.env.PUBLIC_URL + '/careers/iStock-477576202.jpg'}
            />
            <div className="image-overlay"></div>
            <div className="section-text">
              <h4>
                <strong>Life at Slattery's Auctions</strong>
              </h4>
              <p>Discover what it's like to work at Slattery</p>
              <Button
                type="button pos"
                onClick={() => scrollToSection("lifeAtSlatteryRef")}
              >
                Read More
              </Button>
            </div>
          </div>
          <div className="section-img">
            <img
              src={DEFAULT_IMAGE}
              onLoad={(e) =>
                constructImageUrl(
                  window.location.origin +
                    "/careers/shutterstock_1209528874.jpg",
                  e.target
                )
              }
              // src={process.env.PUBLIC_URL + '/careers/shutterstock_1209528874.jpg'}
            />
            <div className="image-overlay"></div>
            <div className="section-text">
              <h4>
                <strong>Work with Us</strong>
              </h4>
              <p>Your rewarding career starts here</p>
              <Button
                className="btn-pos pos"
                type="button"
                onClick={() => scrollToSection("workWithUsRef")}
              >
                Read More
              </Button>
            </div>
          </div>
          <div className="section-img">
            <img
              src={DEFAULT_IMAGE}
              onLoad={(e) =>
                constructImageUrl(
                  window.location.origin +
                    "/careers/shutterstock_785526430.jpg",
                  e.target
                )
              }
              // src={process.env.PUBLIC_URL + '/careers/shutterstock_785526430.jpg'}
            />
            <div className="image-overlay"></div>
            <div className="section-text">
              <h4>
                <strong>Our Pillars</strong>
              </h4>
              <p>We support and empower every employee</p>
              <Button
                className="btn-pos pos1"
                type="button"
                onClick={() => scrollToSection("pillarsRef")}
              >
                Read More
              </Button>
            </div>
          </div>
        </div>
        <Card className="m-3" ref={lifeAtSlatteryRef}>
          <Card.Body>
            <div className="row section-cards">
              <div className="col-md-6 col-xs-12 p-3">
                <img
                  src={DEFAULT_IMAGE}
                  onLoad={(e) =>
                    constructImageUrl(
                      window.location.origin +
                        "/careers/shutterstock_1139707214.jpg",
                      e.target
                    )
                  }
                  // src={process.env.PUBLIC_URL + '/careers/shutterstock_1139707214.jpg'}
                />
              </div>
              <div className="col-md-6 col-xs-12 p-3">
                <h3>
                  <strong>LIFE AT SLATTERY’S</strong>
                </h3>
                <p>
                  Slattery’s is a proudly independent and family-owned business.
                  Since 2000, we have become an industry leading auction and
                  valuation practice. With five sites across Australia, we
                  specialise in automotive, road transport, earthmoving, mining,
                  marine, and aviation asset advisory and disposal services. Our
                  diversity, flexibility and specialist experience have set us
                  apart from our larger, bulk handling competitors, and clients
                  appreciate our transparency, honesty, and integrity.
                  <br />
                  In our over 20 years of business, we have grown into an
                  organisation big enough to provide flexible, tailored, and
                  expert services whilst retaining our ability to develop and
                  build all of our client relationships.
                  <br />
                  At Slattery’s we encourage authentic engagement in community
                  and work life in order to build and foster strong team
                  networks. Our results are achieved through our great team. Our
                  mantra is ‘Leave it with Us’ as we are invested in working
                  together to make things happen.
                </p>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card className="m-3" ref={workWithUsRef}>
          <Card.Body>
            <div className="row section-cards">
              <div className="col-md-6 col-xs-12p-3">
                <h3>
                  <strong>WORK WITH US</strong>
                </h3>
                <p>
                  Across all of our sites we offer a wide range of roles between
                  the variety of in house departments and specialties that we
                  provide. This includes Auction Operations, Business Support,
                  Sales, Valuations and Asset Advisory, Insolvency and
                  Recoveries, Marketing, Human Resources, Finance, and IT.
                  <br />
                  We understand that everyone has to start somewhere in the
                  workforce and at Slattery’s our Valuations Cadetships as well
                  as opportunities for traineeships/apprenticeships and on the
                  job training means we are committed to finding, training and
                  keeping the best people for the job. We are committed to
                  providing meaningful career paths for our team members and
                  ensuring that they have the skills, knowledge and experience
                  to be successful.
                  <br />
                  We offer rewarding careers for outstanding professionals,
                  ongoing learning and development opportunities, a
                  collaborative and inclusive culture, and flexible and agile
                  work practices that focus on our people's wellbeing to drive
                  innovation and entrepreneurship. Come as you are - At
                  Slattery's we are proud to be an Equal Employment Opportunity
                  employer that values diversity relating to sex, gender, sexual
                  orientation, culture, veteran and disability status, race, or
                  religion. We are committed to building a team that represents
                  a variety of backgrounds, perspectives, and skills. The more
                  inclusive we are, the better our work will be.
                </p>
              </div>
              <div className="col-md-6 col-xs-12 p-3">
                <img
                  src={DEFAULT_IMAGE}
                  onLoad={(e) =>
                    constructImageUrl(
                      window.location.origin +
                        "/careers/2019-Slattery-Conference-2117.jpg",
                      e.target
                    )
                  }
                  // src={process.env.PUBLIC_URL + '/careers/2019-Slattery-Conference-2117.jpg'}
                />
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card className="m-3" ref={registerRef}>
          <Card.Body>
            <div className="row section-cards">
              <div className="col-md-6 col-xs-12 p-3">
                <img
                  src={DEFAULT_IMAGE}
                  onLoad={(e) =>
                    constructImageUrl(
                      window.location.origin + "/workWithUs.jpg",
                      e.target
                    )
                  }
                  // src={process.env.PUBLIC_URL + '/workWithUs.jpg'}
                />
              </div>
              <div className="col-md-6 col-xs-12 p-3">
                <h3>
                  <strong>Register Your Details</strong>
                </h3>
                <p>
                  Register your details with us for any future opportunities.
                  Simply download our application form{" "}
                  <a
                    href={`${process.env.PUBLIC_URL}/careers/EmploymentApplicationForm.pdf`}
                    target="_blank"
                    download
                  >
                    here
                  </a>{" "}
                  and forward it to{" "}
                  <a href="mailto:hr@slatteryauctions.com.au">
                    hr@slatteryauctions.com.au.{" "}
                  </a>
                  We will keep your details on record and be in touch if
                  anything comes up.
                </p>
                <Button className="download-btn">
                  <a
                    href={`${process.env.PUBLIC_URL}/careers/EmploymentApplicationForm.pdf`}
                    target="_blank"
                    download
                  >
                    Download Application
                  </a>
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        <div className="row m-3 accordion-cards" ref={pillarsRef}>
          <h3>
            <strong>Our Pillars</strong>
          </h3>

          <Accordion defaultActiveKey="0">
            <Card className="m-2">
              <Accordion.Toggle
                as={Card.Header}
                eventKey="0"
                onClick={() => toggleActive("0")}
              >
                <h4>
                  <Visible when={activeId === "0"}>
                    <SvgComponent path="expand-more" />
                  </Visible>
                  <Visible when={activeId !== "0"}>
                    <SvgComponent path="navigate_next" />
                  </Visible>
                  <strong className="pl-2">Innovation</strong>
                </h4>
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="0">
                <Card.Body>
                  <div className="row p-3">
                    <div className="col-md-6 col-xs-12">
                      <img
                        src={DEFAULT_IMAGE}
                        onLoad={(e) =>
                          constructImageUrl(
                            window.location.origin +
                              "/careers/iStock-477576202.jpg",
                            e.target
                          )
                        }
                        // src={process.env.PUBLIC_URL + '/careers/iStock-477576202.jpg'}
                      />
                    </div>
                    <div className="col-md-6 col-xs-12 text-indent">
                      At Slattery’s we strive for a culture of continuous
                      improvement for our processes, data, detail, and people
                      and client development. We are always looking to
                      understand our current practices and considering methods
                      of improvement.
                    </div>
                  </div>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card className="m-2">
              <Accordion.Toggle
                as={Card.Header}
                eventKey="1"
                onClick={() => toggleActive("1")}
              >
                <h4>
                  <Visible when={activeId === "1"}>
                    <SvgComponent path="expand-more" />
                  </Visible>
                  <Visible when={activeId !== "1"}>
                    <SvgComponent path="navigate_next" />
                  </Visible>
                  <strong className="pl-2">Relationships</strong>
                </h4>
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="1">
                <Card.Body>
                  <div className="row p-3">
                    <div className="col-md-6 col-xs-12">
                      <img
                        src={DEFAULT_IMAGE}
                        onLoad={(e) =>
                          constructImageUrl(
                            window.location.origin +
                              "/careers/shutterstock_1209528874.jpg",
                            e.target
                          )
                        }
                        // src={process.env.PUBLIC_URL + '/careers/shutterstock_1656553012.jpg'}
                      />
                    </div>
                    <div className="col-md-6 col-xs-12 text-indent">
                      Slattery’s employees constantly use their knowledge and
                      experience to educate and challenge themselves, staff and
                      peers. We recognise that internal and external
                      relationships are a big part of who we are, why we come to
                      work and why clients choose us.
                    </div>
                  </div>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card className="m-2">
              <Accordion.Toggle
                as={Card.Header}
                eventKey="2"
                onClick={() => toggleActive("2")}
              >
                <h4>
                  <Visible when={activeId === "2"}>
                    <SvgComponent path="expand-more" />
                  </Visible>
                  <Visible when={activeId !== "2"}>
                    <SvgComponent path="navigate_next" />
                  </Visible>
                  <strong className="pl-2">Expertise</strong>
                </h4>
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="2">
                <Card.Body>
                  <div className="row p-3">
                    <div className="col-md-6 col-xs-12">
                      <img
                        src={DEFAULT_IMAGE}
                        onLoad={(e) =>
                          constructImageUrl(
                            window.location.origin +
                              "/careers/iStock-1207928621.jpg",
                            e.target
                          )
                        }
                        // src={process.env.PUBLIC_URL + '/careers/iStock-1207928621.jpg'}
                      />
                    </div>
                    <div className="col-md-6 col-xs-12 text-indent">
                      A key aspect of why we thrive at Slattery’s is consistent
                      delivery of quality service. This service is provided by
                      teams of experts who are focused on growing in their roles
                      and helping others to do the same.
                    </div>
                  </div>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card className="m-2">
              <Accordion.Toggle
                as={Card.Header}
                eventKey="3"
                onClick={() => toggleActive("3")}
              >
                <h4>
                  <Visible when={activeId === "3"}>
                    <SvgComponent path="expand-more" />
                  </Visible>
                  <Visible when={activeId !== "3"}>
                    <SvgComponent path="navigate_next" />
                  </Visible>
                  <strong className="pl-2">Fun</strong>
                </h4>
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="3">
                <Card.Body>
                  <div className="row p-3">
                    <div className="col-md-6 col-xs-12">
                      <img
                        src={DEFAULT_IMAGE}
                        onLoad={(e) =>
                          constructImageUrl(
                            window.location.origin +
                              "/careers/shutterstock_1656553012.jpg",
                            e.target
                          )
                        }
                        // src={process.env.PUBLIC_URL + '/careers/shutterstock_1656553012.jpg'}
                      />
                    </div>
                    <div className="col-md-6 col-xs-12 text-indent">
                      At Slattery’s we infuse fun into our work life which is
                      consistently promoted in workplace activities. We actively
                      promote authentic engagement in the workplace and
                      encourage all employees to take part.
                    </div>
                  </div>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card className="m-2">
              <Accordion.Toggle
                as={Card.Header}
                eventKey="4"
                onClick={() => toggleActive("4")}
              >
                <h4>
                  <Visible when={activeId === "4"}>
                    <SvgComponent path="expand-more" />
                  </Visible>
                  <Visible when={activeId !== "4"}>
                    <SvgComponent path="navigate_next" />
                  </Visible>
                  <strong className="pl-2">Service</strong>
                </h4>
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="4">
                <Card.Body>
                  <div className="row p-3">
                    <div className="col-md-6 col-xs-12">
                      <img
                        src={DEFAULT_IMAGE}
                        onLoad={(e) =>
                          constructImageUrl(
                            window.location.origin +
                              "/careers/Service_section.jpg",
                            e.target
                          )
                        }
                        // src={process.env.PUBLIC_URL + '/careers/Service_section.jpg'}
                      />
                    </div>
                    <div className="col-md-6 col-xs-12  text-indent">
                      Our staff are aware of people and client needs internally
                      and externally and are always looking for ways to promote
                      innovative ideas. At Slattery’s we actively critique ideas
                      in search of areas of improvement.
                    </div>
                  </div>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          </Accordion>
        </div>

        <div className="div__video" ref={bottomRef}>
          <video
            loop
            muted={videoMuted}
            className="w-100"
            poster="https://static.slatteryauctions.com.au/wp-content/uploads/2020/12/aboutus.png"
          >
            <source
              src="https://static.slatteryauctions.com.au/wp-content/uploads/2022/10/slattery_corp_480.mp4"
              type="video/mp4"
            />
            <source
              src="https://static.slatteryauctions.com.au/wp-content/uploads/2020/12/aboutus.webm"
              type="video/webm"
            />
          </video>
          <div className="video-control">
            <span
              className="play-pause-control"
              onClick={() => togglePlaying()}
            >
              <SvgComponent path={playing ? "pause" : "play"} />
            </span>
            <span
              className="volume-control"
              onClick={() => setVideoMuted(!videoMuted)}
            >
              <SvgComponent path={videoMuted ? "volume-off" : "volume-up"} />
            </span>
          </div>
        </div>
        <ContactUs isCareersPage={true} history={history} />
      </Container>
    </div>
  );
};

export default CareerView;
