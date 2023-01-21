import React from "react";
import './BuyerCard.scss';

class BuyerCard extends React.Component {
    state = {
        auctionDetails: {},
        auctionId: null,
        loggedInUser: null,
        user: null
    }
    componentDidMount() {
        if (this.props.auctionId) {
            this.setState({ auctionId: this.props.auctionId, loggedInUser: this.props.loggedInUser }, () => {
                this.getAuctionInfo(this.state.auctionId);
                this.getUserAccount();
            })
        }
    }
    getAuctionInfo = (auctionId) => {
        this.props.getAuctionDetails(auctionId).then(res => {
            if (res.result) {
                this.setState({ auctionDetails: res.result }, () => {
                    // window.print();
                });
            }
        })
    }

    getUserAccount = () => {
        this.props.getAccount().then(res => {
            if (res.result) {
                const user = res.result;
                user.address = `${user?.billingStreet},${user?.billingCity},${user?.billingState},${user?.billingCountry},${user?.billingPostalCode}`
                this.setState({ user });
            }
        })
    }

    render() {
        const { auctionDetails, user } = this.state;
        return (
            <div className='buyer-card row m-0 p-2'>
                <div className='contanct-info col-5'>
                    <h1 className='buyer-number'>{auctionDetails.accountAlias?.alias}</h1>
                    <div className='contact-details'>
                        <div>Auction Number: {auctionDetails?.auctionNum}</div>
                        <div>Name: {user?.firstName}</div>
                        <div>Phone: {user?.mobile}</div>
                        <div>Email: {user?.email}</div>
                        <div>Address: {user?.address}</div>
                    </div>
                </div>
                <div className='terms-conditions col-7'>
                    <div className='buyer-number'><h3><strong>Buyer Number: {auctionDetails.accountAlias?.alias}</strong></h3></div>
                    <div><strong>Terms & Condition - {auctionDetails.auctionNum}</strong></div>
                    <p>
                        By signing this form,I confirm that i have read,understood,and agree to be bound by these terms and conditions displayed at auction site
                        and available online at https://www.slatteryauctions.com.au/(terms & Conditions)
                    </p>
                    <p>
                        I understand that Slattery Auctions Australia Pty Ltd, Slattery Auctions Victoria Pty Ltd, Slattery Auctions Queensland Pty Ltd and Slattery
                        Auctions WA Pty Ltd (Slattery Auctions) are Auctioneers acting as agents for the seller and that any dispute is between the purchaser and
                        the seller as stipulated in the Terms and Conditions.
                    </p>
                    <p>
                        I understand that Slattery Auctions disclaims all express or implied representations,warranties,guarantees and conditions, including but not
                        limited to any implied warranties or conditions of merchantability,quality, accuracy.completeness fitness for a particular purpose,title, and
                        non-infringement with respect to all items at their auctions.
                    </p>
                    <p>
                        I agree to pay Slattery Auctions a buyer's premium pursuant to the Terms and Conditions and as advertised by Slattery Auctions prior to their
                        auctions.
                    </p>
                    <p>
                        By completing and signing the registration, I agree that I will be responsible for taking, and will take all information supplied for or in
                        connection with the goods and/or their operation/use into consideration, prior to operating/using the goods and any failure to do so and any
                        damage, loss or liability to the goods and/or their operation/use shall be mine and my responsibility solely. I acknowledge and agree that I
                        will carry out or cause to be carried out a detailed health, safety, hazard, and compliance review of the goods prior to operating/using the
                        goods. I acknowledge,accept, and agree that all risk in connection with and responsibility for the goods,their operation/use the safety of
                        persons, and the safe operation/use of the goods is and shall be solely mine upon completion of the auction of the goods.
                    </p>
                    <p>
                        Slattery Auctions may contact you from time to time to notify you of upcoming auctions and other information that we feel may be of
                        interest.
                    </p>
                    <p>
                        If you do not wish to be contacted, please tick this box<input className='ml-1' type='checkbox' />
                    </p>
                    <p>
                        ANY ITEM NOT PAID FOR BY THE DUE DATE STATED ON THE CATALOGUE WILL ATTRACT A 1% PER DAY LATE PAYMENT CHARGE. ANY ITEM NOT
                        COLLECTED WITHIN 24 HOURS OF SALE WILL ATTRACT COSTS FOR RELOCATION AND STORAGE TO BY PAID BY THE PURCHASER PRIOR TO
                        COLLECTING THE LOT.
                    </p>
                    <p>Signature:_______________________________ on {(new Date().getMonth() + 1) + '/' + new Date().getDate() + '/' + new Date().getFullYear()}</p>
                </div>
            </div>
        )
    }
}

export default BuyerCard;