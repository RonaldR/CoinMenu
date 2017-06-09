import React, { Component } from 'react';
import injectSheet from 'react-jss';
import numeral from 'numeral';
import classNames from 'classnames';

@injectSheet({
	currency: {
		overflow: 'hidden',
		marginLeft: '1rem',
		padding: '1rem 1rem 1rem 0',
		borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
	},

	name: {
		float: 'left',
		fontSize: '1.25rem',
		fontWeight: 400,
	},

	euro: {
		display: 'inline-block',
		fontSize: '0.75rem',
		marginBottom: '0.5rem',
	},

	price: {
		float: 'right',
		fontWeight: 600,
		fontSize: '1.5rem',
	},

	percentage: {
		float: 'right',
		color: '#333',
		fontWeight: 500,
	},

	positive: {
		color: '#21DC15',
	},

	negative: {
		color: '#DC1515',
	},
})
export default class Currency extends Component {
	render() {
		const {
			currency,
			classes,
		} = this.props;

		const percentageClass = classNames(classes.percentage, {
			[classes.positive]: currency.percent_change_24h > 0,
			[classes.negative]: currency.percent_change_24h < 0,
		})

		return (
			<div className={classes.currency}>
				<div className={classes.name}>{currency.symbol} {currency.name}</div>
				<div className={classes.price}><span className={classes.euro}>&euro;</span>{numeral(currency.price_eur).format('0,0.000')}</div>
				<div className={percentageClass}>{currency.percent_change_24h > 0 ? '+' : ''}{numeral(currency.percent_change_24h).format('0,0.00')}%</div>
			</div>
		);
	}
}
