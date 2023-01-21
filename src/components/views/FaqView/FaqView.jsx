import React, { useState, useEffect } from 'react';
import _isEmpty from 'lodash/isEmpty';
import { setAppTitle } from '../../../utils/helpers';
import './FaqView.scss';
import Accordion from 'react-bootstrap/Accordion';

import Card from 'react-bootstrap/Card';

import Visible from '../../common/Visible';
import SvgComponent from '../../common/SvgComponent';

//Faq update
import { Stack, Skeleton } from '@mui/material';
import PageBanner from '../../common/PageBanner';
import Breadcrumb from '../../common/Breadcrumb';
import Container from 'react-bootstrap/Container';
import Tab from 'react-bootstrap/Tab';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import { getAdminConsoleAssets } from '../../../utils/api';
import { number } from 'yup/lib/locale';

const testFaq = (faq) => {
	if (faq.length > 0) {
		return true;
	} else {
		return false;
	}
};

const FaqView = ({ vendor, isLoading, setLoading, getContent }) => {
	//FAQ Object saved to state
	const [faq, setFaq] = useState([]);

	//Default Open Tab ID
	const [firstActiveKey, setFirstActiveKey] = useState();

	//FAQ object salesforce
	useEffect(() => {
		// console.log('run now');
		const t0 = performance.now();
		getContent({ contentType: 'faq' })
			.then((response) => {
				const t1 = performance.now();
				// console.warn(`Call to FAQ took ${t1 - t0} milliseconds.`);
				// console.log('About Us', response);
				setFaq(response);
				setLoading(false);
			})
			.catch((error) => {
				const t1 = performance.now();
				console.error(`Call to FAQ took ${t1 - t0} milliseconds.`);
				console.log('Error getting content: About Us');
				setLoading(false);
			});
	}, []);

	useEffect(() => {
		if (!_isEmpty(vendor)) {
			setAppTitle('FAQ', vendor.name);
		}
		setLoading(false);
	}, [vendor]);

	const pages = [{ label: 'Home', path: '/' }, { label: 'FAQ' }];

	const FaqSkeleton = () => {
		return (
			<>
				<Row>
					<Col sm={3}>
						<Stack
							spacing={1}
							sx={{ marginBottom: '40px' }}
						>
							<Skeleton
								variant="rectangular"
								height={40}
							/>
							<Skeleton
								variant="rectangular"
								height={40}
							/>
							<Skeleton
								variant="rectangular"
								height={40}
							/>
							<Skeleton
								variant="rectangular"
								height={40}
							/>
							<Skeleton
								variant="rectangular"
								height={40}
							/>
						</Stack>
					</Col>
					<Col sm={9}>
						<Stack spacing={1}>
							<Skeleton
								variant="rectangular"
								height={70}
							/>
							<Skeleton
								variant="rectangular"
								height={70}
							/>
							<Skeleton
								variant="rectangular"
								height={70}
							/>
							<Skeleton
								variant="rectangular"
								height={70}
							/>
							<Skeleton
								variant="rectangular"
								height={70}
							/>
						</Stack>
					</Col>
				</Row>
			</>
		);
	};

	const getNavItems = () => {
		let output = [];
		let unique = [
			...new Map(faq.map((item) => [item['sectionId'], item])).values(),
		];

		for (let i = 0; i < unique.length; i++) {
			if (i == 0) {
				setFirstActiveKey(unique[0].sectionId);
			}

			output.push(
				<Nav.Item>
					<div className="nav-wrap">
						<Nav.Link
							className="bg-grey"
							eventKey={unique[i].sectionId}
							key={i}
						>
							{unique[i].sectionTitle}
						</Nav.Link>
					</div>
				</Nav.Item>
			);
		}
		return output;
	};

	const getAccItems = (unique, i) => {
		let output = [];
		let count = 1; // accordion doesnt like 0, we use this to assign keys
		for (let y = 0; y < faq.length; y++) {
			if (unique[i] !== faq[y].sectionId) {
				continue;
			}

			output.push(
				<Card className="acc-card">
					<Accordion.Toggle
						className="acc-card-header"
						as={Card.Header}
						eventKey={count}
					>
						{faq[y].question}
						<SvgComponent path="down-arrow" />
					</Accordion.Toggle>

					<Accordion.Collapse
						as={Card.Header}
						eventKey={count}
					>
						<Card.Body className="acc-card-body">
							{faq[y].answer}
						</Card.Body>
					</Accordion.Collapse>
				</Card>
			);
			count++;
		}
		return output;
	};
	const getAcc = () => {
		let output = [];
		let unique = [
			...new Set(
				faq.map((obj) => {
					return obj['sectionId'];
				})
			),
		];

		for (let i = 0; i < unique.length; i++) {
			output.push(
				<Tab.Pane eventKey={unique[i]}>
					<Accordion defaultActiveKey={1}>
						{getAccItems(unique, i)}
					</Accordion>
				</Tab.Pane>
			);
		}

		return output;
	};

	const AccordionContainer = () => {
		console.log('faq obj = ', faq);

		return (
			<Tab.Container
				id="left-tabs-example"
				defaultActiveKey={firstActiveKey}
			>
				<Row>
					<Col sm={3}>
						<Nav
							variant="pills"
							className="flex-column"
						>
							{getNavItems()}
						</Nav>
					</Col>

					<Col sm={9}>
						<Tab.Content>{getAcc()}</Tab.Content>
					</Col>
				</Row>
			</Tab.Container>
		);
	};

	return (
		<>
			<PageBanner title={'FAQ'} />

			<Container>
				<Breadcrumb items={pages} />

				{isLoading && <FaqSkeleton />}
			</Container>

			<Container>{testFaq(faq) && <AccordionContainer />}</Container>
		</>
	);
};

export default FaqView;
