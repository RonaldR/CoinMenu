import React, { Component } from 'react';
import injectSheet from 'react-jss';
import { inject, observer } from 'mobx-react';
import Heading from '../../components/heading/index.js';
import Currency from '../../components/currency/index.js';

@injectSheet({
	loadIcon: {
		position: 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)'
	},
	refreshed: {
		fontSize: '.5rem',
		padding: '1rem'
	}
})
@inject('marketStore')
@observer
export default class Settings extends Component {
	render() {
		const {
			currencies,
			updatedAt,
		} = this.props.marketStore;
		const {
			classes,
		} = this.props;

		if (currencies.length === 0) {
			return (
				<div className={classes.loadIcon}><img src="./src/images/loading.svg" alt="Loading..." /></div>
			);
		}

		return (
			<div>
				{currencies.map((currency) => {
					return (
						<Currency key={currency.symbol} currency={currency} />
					);
				})}

				<p className={classes.refreshed}>
					Updated at {updatedAt.toString()}
					<br />
					Data from: http://coinmarketcap.com (api)
				</p>
			</div>
		);
	}
}
