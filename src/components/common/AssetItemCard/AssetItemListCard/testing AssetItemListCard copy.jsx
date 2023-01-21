<Card
      className={`asset-item-list-card no-hover ${classes.join(" ")}`}
      onClick={(e) => handleClickOutside(e)}
    >
      <Card.Title>
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>{item.title}</Tooltip>}
        >
          <span className="text-truncate">{item.title}</span>
        </OverlayTrigger>
        <div className="asset-basic-details">
          <Visible when={_get(item, "transmission")}>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>{item?.transmission}</Tooltip>}
            >
              <div className="detail">
                <SvgComponent path="sync-alt" />
                {item?.transmission}
              </div>
            </OverlayTrigger>
          </Visible>
          <Visible when={_get(item, "odoMeter")}>
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip>
                  KM: {Number(item?.odoMeter).toLocaleString()}
                  {" Showing"}
                </Tooltip>
              }
            >
              <div className="detail">
                <SvgComponent path="direction-car" />
                KM: {Number(item?.odoMeter).toLocaleString()}
                {" Showing"}
              </div>
            </OverlayTrigger>
          </Visible>
          <Visible when={_get(item, "lotNo")}>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Lot: {item?.lotNo}</Tooltip>}
            >
              <div className="detail">
                <SvgComponent path="lot-no" />
                Lot: {item?.lotNo}
              </div>
            </OverlayTrigger>
          </Visible>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip>
                {item.assetSuburbState
                  ? _get(item, "assetSuburbState", "")
                  : `${_get(item, "city.name", "")}, ${_get(
                      item,
                      "state.name",
                      ""
                    )}`}
              </Tooltip>
            }
          >
            <div className="detail">
              <SvgComponent path="location" />
              {item.assetSuburbState
                ? _get(item, "assetSuburbState", "")
                : `${_get(item, "city.name", "")}, ${_get(
                    item,
                    "state.name",
                    ""
                  )}`}
            </div>
          </OverlayTrigger>
        </div>
      </Card.Title>
      <Card.Body className="asset-details-section">
        <AssetCardImages
          isLoggedIn={isLoggedIn}
          toggleLogin={toggleLogin}
          spinCar={item.spincar}
          image={item.assetImageUrl}
          totalImages={item.totalAssetImages}
          auctionNum={item?.auctionData?.auctionNum}
          consignmentNo={item?.consignmentNo}
          isWatchListed={item.isWatchListed}
          assetStatusClosed={assetStatusClosed}
          isExtended={item.isExtended}
          addToWatchlist={(data) =>
            onAddToWatchList({
              ...data,
              auctionId: item?.auctionData?.auctionId,
            })
          }
          assetId={item.assetId}
          auctionId={item?.auctionData?.auctionId}
          className="asset-image"
          status={item.status}
          onClick={openAssetDetails}
          spincarClick={(e) => onCardShowAction(e, "spin-car", item)}
          searchCrietria={searchCrietria}
          groupName={groupName}
          setDetailsAsset={setDetailsAsset}
        />
        <div className="asset-details">
          <div className="d-flex justify-content-between">
            <div className="asset-info">
              <div className="asset-details-cateogory">{item.title}</div>
              <div className="asset-details-description">
                {item.description}
              </div>
            </div>
            <Visible
              when={
                item.assetType !== ASSET_TYPE.BUY_NOW && !item.auctionData.isEOI
              }
            >
              <Card.Text as="div" className="time-remaining">
                <CountdownTimer
                  bonusTime={item.isExtended}
                  time={!assetStatusClosed ? item.datetimeClose : dayjs()}
                  onComplete={onCompleteTimer.bind(null, item)}
                />
              </Card.Text>
            </Visible>
          </div>
          <Row className={`detail-actions auction-type-${auctionType}`}>
            <Visible when={statusTag}>
              <div className="status-tag">
                <div className="label">{statusTag}</div>
                <div>
                  <SvgComponent path="gavel_black_24dp" />
                  <span className="date-tag"> {dateTag} </span>
                  <span>{timeTag}</span>
                </div>
              </div>
            </Visible>
            <div className="reserve-met-section">
              <Visible
                when={!item.auctionData.isEOI && item.showReserveOnSearch}
              >
                <p> {item.reserveMet ? "Reserve Met" : "Reserve Not Met"}</p>
                <ReserveMet percent={item.reservePercentage} />
              </Visible>
            </div>
            <div className="d-flex align-items-end">
              <Visible when={!item.auctionData.isEOI && !isInRoom(auctionType)}>
                {item.assetType === ASSET_TYPE.BUY_NOW ? (
                  <div className="buy-now">
                    <div className="current-bid">
                      <strong>{toAmount(item.listedPrice)}</strong>
                    </div>
                    <Button
                      className="btn-buy-now"
                      variant="warning"
                      disabled={item.status === ASSET_STATUS.UNDER_OFFER}
                      onClick={openAssetDetails}
                    >
                      <SvgComponent path="shopping-cart" />
                      {item.status === ASSET_STATUS.UNDER_OFFER
                        ? item.status
                        : ASSET_STATUS.BUY_NOW}
                    </Button>
                  </div>
                ) : closeTime <= now ||
                  item.currentBidAmount ||
                  item.startingBid ? (
                  <div className="current-bid">
                    {closeTime <= now || assetStatusClosed ? (
                      <strong>Bidding Closed</strong>
                    ) : item.currentBidAmount ? (
                      <span>
                        <span>Current Bid: </span>
                        <strong>{toAmount(item.currentBidAmount)}</strong>
                      </span>
                    ) : item.startingBid ? (
                      <span>
                        <span>Starting Bid: </span>
                        <strong>{toAmount(item.startingBid)}</strong>
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </Visible>
              <Visible when={item.auctionData.isEOI}>
                <DownloadAuctionDocuments
                  assetId={item.assetId}
                  auctionId={item.auctionData.auctionId}
                />
              </Visible>
              <div className="full-details">
                <Button onClick={openAssetDetails}>Full Details</Button>
              </div>
            </div>
          </Row>
        </div>
      </Card.Body>
      <Visible
        when={!item.auctionData.isEOI && item.assetType !== ASSET_TYPE.BUY_NOW}
      >
        <Card.Body className="asset-actions-section">
          <Visible
            when={
              !item.auctionData.isEOI &&
              item.assetType !== ASSET_TYPE.BUY_NOW &&
              isNotifyAllowed
            }
          >
            <NotifyMe
              assetId={item.assetId}
              container={notifyMeContainer}
              onNotifyMeToggle={(e) => onCardShowAction(e, "notifyme", item)}
              auctionId={item.auctionData.auctionId}
              notificationUpdate={notificationUpdate}
              notifiedUser={item.isNotified}
              view="horizontal"
              className={currentDetails === "notifyme" && "selected"}
              dataTimeClose={item.datetimeClose}
            />
          </Visible>
          <Button
            onClick={(e) => onCardShowAction(e, "bid-history", item)}
            className={`slt-dark ${
              currentDetails === "bid-history" && "selected"
            }`}
          >
            Bid History
          </Button>
          <Button
            onClick={(e) => onCardShowAction(e, "details", item)}
            className={`slt-dark ${currentDetails === "details" && "selected"}`}
          >
            Details
          </Button>
          {/* <Button
            onClick={(e) => onCardShowAction(e, "freight-cal", item)}
            className={`slt-dark ${
              currentDetails === "freight-cal" && "selected"
            }`}
          >
            Freight Cal.
          </Button> */}
          <Visible
            when={
              !item.auctionData.isEOI &&
              !assetStatusClosed &&
              !isInRoom(auctionType) &&
              startTime <= now &&
              closeTime >= now
            }
          >
            <div className="place-bid">
              <Button
                variant="warning"
                className={currentDetails === "placebid" && "selected"}
                onClick={(e) => onCardShowAction(e, "placebid", item)}
                block
              >
                Bid Now
              </Button>
              <Visible when={item.highestBidder}>
                <OverlayTrigger
                  placement="right"
                  overlay={
                    <Tooltip>You are currently the highest bidder.</Tooltip>
                  }
                >
                  <span className="highest-bidder-indicator">
                    <SvgComponent path="gavel" />
                  </span>
                </OverlayTrigger>
              </Visible>
            </div>
          </Visible>
          <Visible when={item?.displayJoinAuction && closeTime >= now}>
            <Button
              className="join-live-btn"
              variant="warning"
              onClick={joinLiveAuction}
            >
              <SvgComponent path="gavel" />
              Join Live
            </Button>
          </Visible>
          <Visible
            when={
              !item.auctionData.isEOI &&
              !assetStatusClosed &&
              isInRoom(auctionType) &&
              startTime > now
            }
          >
            <div className="place-bid">
              <Button
                variant="warning"
                className={currentDetails === "placebid" && "selected"}
                onClick={(e) => onCardShowAction(e, "placebid", item)}
              >
                Absentee Bid
              </Button>
            </div>
          </Visible>
        </Card.Body>
      </Visible>
    </Card>

