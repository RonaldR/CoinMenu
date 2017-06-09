import React, { Component } from 'react';
import injectSheet from 'react-jss';
import { inject, observer } from 'mobx-react';
import Heading from '../../components/heading/index.js';
import Currency from '../../components/currency/index.js';

@injectSheet({
	//
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
				<div>Loading...</div>
			);
		}

		return (
			<div>
				{currencies.map((currency) => {
					return (
						<Currency key={currency.symbol} currency={currency} />
					);
				})}

				<p>Updated at {updatedAt.toString()}</p>
			</div>
		);
	}
}
