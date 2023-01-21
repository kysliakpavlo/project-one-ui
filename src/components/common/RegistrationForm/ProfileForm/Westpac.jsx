import React, { useEffect } from "react";
import $ from "jquery";

const Westpac = ({ setLoading, handleCreditcardModel, label, publishableKey }) => {
    useEffect(() => {
        const payButton = document.getElementById("pay");
        let creditCardFrame = null;

        const tokenCallback = function (err, data) {
            if (err) {
                console.error("Error getting token: " + err.message);
            } else {
                // TODO: send token to server with ajax
                handleCreditcardModel(data.singleUseTokenId);
            }
            creditCardFrame.destroy();
            creditCardFrame = null;
        };

        payButton.onclick = function () {
            payButton.disabled = true;
            creditCardFrame.getToken(tokenCallback);
        };

        const createdCallback = function (err, frame) {
            if (err) {
                console.error("Error creating frame: " + err.message);
            } else {
                // Save the created frame for when we get the token
                creditCardFrame = frame;
            }
        };

        const options = {
            // TODO: Replace {publishableApiKey} with your key
            publishableApiKey: publishableKey,
            tokenMode: "callback",
            onValid: function () {
                payButton.disabled = false;
            },
            onInvalid: function () {
                payButton.disabled = true;
            },
            style: {
                "div.payway-card": {
                    "border-radius": "4px",
                    height: `${window.screen.width < 767 ? "280px !important" : "220px !important"}`,
                },
                ".payway-card input": { color: "#202020" },
                ".payway-card select": { color: "#202020" },
            },
            layout: "wide",
        };
        window.payway.createCreditCardFrame(options, createdCallback);
        setLoading(false);
    }, []);

    return (
        <>
            <div id="payway-credit-card" className="payway-card-block"></div>

            <br />

            <button id="pay" disabled className="pay-button">
                {label}
            </button>
        </>
    );
};

export default Westpac;
