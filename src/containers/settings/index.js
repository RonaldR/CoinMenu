import React, { Component } from 'react';
import injectSheet from 'react-jss';
import { inject, observer } from 'mobx-react';
import Heading from '../../components/heading/index.js';

@injectSheet({
	label: {
		display: 'block',
		fontSize: '0.75rem',
		color: '#fff',
		padding: '0 1rem',
	},

	input: {
		outline: 'none',
		padding: '0.5rem 1rem',
		fontSize: '1rem',
		border: 0,
		borderRadius: 4,
		fontWeight: 500,
	},
})
@inject('marketStore')
@observer
export default class Settings extends Component {
	render() {
		const {
			allCurrencies,
			updatedAt,
		} = this.props.marketStore;
		const {
			classes,
		} = this.props;

		return (
			<div>
				<Heading>Cryptocoins</Heading>
				<Heading></Heading>

				{allCurrencies.map((currency) => {
					console.log(currency);

					return (
						<div>
							<label className={classes.label}>{currency.symbol}</label>
							<input className={classes.input} type="number" />
						</div>
					);
				})}
			</div>
		);
	}
}
