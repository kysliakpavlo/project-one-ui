import React, { useCallback } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import ListGroup from "react-bootstrap/ListGroup";
import SocialButton from "../LoginModal/SocialButton";
import { FACEBOOK_APP_ID, GOOGLE_CLIENT_ID } from "../../../utils/constants";
import "./RegisterVia.scss";
import SvgComponent from "../SvgComponent";

const RegisterVia = ({ onChoose }) => {
  const onSelect = useCallback((res) => {
    switch (res?.provider) {
      case "facebook":
        return onChoose("FACEBOOK", res.profile);
      case "google":
        return onChoose("GOOGLE", res.profile);
      default:
        return onChoose("EMAIL", null);
    }
  });

  return (
    <Container className="register-via">
      <Card className="m-auto p-3 text-center">
        <ListGroup variant="flush">
          <ListGroup.Item>
            <Button
              variant="outline-primary"
              className="social-btn social-btn-email"
              size="sm"
              block
              onClick={onSelect}
            >
              <div className="social-btn-content">
                <SvgComponent path="gmail-logo" />
                <span>Sign up with Email</span>
              </div>
            </Button>
          </ListGroup.Item>
          <ListGroup.Item>
            <SocialButton
              block
              size="sm"
              provider="facebook"
              className="social-btn-facebook"
              appId={FACEBOOK_APP_ID}
              variant="outline-primary"
              onLoginSuccess={onSelect}
            >
              <SvgComponent path="facebook" />
              <span>Sign up with Facebook</span>
            </SocialButton>
          </ListGroup.Item>
          <ListGroup.Item>
            <SocialButton
              block
              size="sm"
              provider="google"
              className="social-btn-google"
              appId={GOOGLE_CLIENT_ID}
              variant="outline-primary"
              onLoginSuccess={onSelect}
            >
              <SvgComponent path="google-logo" />
              <span>Sign up with Google</span>
            </SocialButton>
          </ListGroup.Item>
        </ListGroup>
      </Card>
    </Container>
  );
};

export default RegisterVia;
