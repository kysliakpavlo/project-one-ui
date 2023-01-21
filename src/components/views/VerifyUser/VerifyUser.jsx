import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";

const VerifyUser = ({
  match,
  isLoggedIn,
  saveUserToken,
  verifyEmail,
  setLoading,
  reSendEmail,
}) => {
  const [status, setStatus] = useState("Verifing user...");
  const [showSignIn, setShowSignIn] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const { token } = match.params;

  useEffect(() => {
    if (!isLoggedIn) {
      verifyEmail({ token })
        .then((res) => {
          setUserInfo(res);
          setShowSignIn(true);
          setShowResend(false);
          setStatus(res.message);
        })
        .catch((err) => {
          setUserInfo(null);
          setShowSignIn(false);
          setShowResend(err.error?.isExpired);
          setStatus(err?.message || JSON.stringify(err));
        });
    } else {
      setStatus(
        "You are logged in as another user, please logout and click on same link again"
      );
    }
    setLoading(false);
  }, [token, isLoggedIn]);

  const continueToLogin = () => {
    saveUserToken(userInfo);
  };

  const resendVerification = () => {
    reSendEmail({ token: token })
      .then((res) => {
        setUserInfo(res);
        setShowResend(false);
        setStatus(res.message);
      })
      .catch((err) => {
        setUserInfo(null);
        setShowResend(err.isExpired);
        setStatus(err?.message || JSON.stringify(err));
      });
  };

  return (
    <Container>
      <Card className="my-3">
        <Card.Header>User Verification</Card.Header>
        <Card.Body className="p-3">
          <p>
            {status}
            {showSignIn && (
              <span>
                <span>, Click</span>
                <Link to={"/my-account"} onClick={continueToLogin}>
                  {" "}
                  Continue{" "}
                </Link>
                <span>to navigate to Home Page</span>
              </span>
            )}
            {showResend && (
              <span>
                <span>, </span>
                <Button variant="link" onClick={resendVerification}>
                  {" "}
                  Click here{" "}
                </Button>
                <span>to resend Verification Link</span>
              </span>
            )}
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default VerifyUser;
