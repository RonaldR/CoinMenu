import React, { Component } from 'react';
import injectSheet from 'react-jss';
import numeral from 'numeral';
import classNames from 'classnames';

@injectSheet({
	currency: {
		overflow: 'hidden',
		marginLeft: '1rem',
		padding: '.5rem 1rem .5rem 0',
		borderBottom: '1px solid rgba(0, 0, 0, 0.25)',
		display: 'flex',
		alignItems: 'center'
	},

	name: {
		fontSize: '1rem',
		fontWeight: 600,
		width: '45%',
		display: 'flex',
		alignItems: 'center'
	},

	icon: {
		width: '16px',
		height: '16px',
		marginRight: '.7rem',
	},

	euro: {
		fontSize: '0.75rem',
		marginBottom: '0.5rem',
	},

	price: {
		fontWeight: 600,
		fontSize: '1.4rem',
		flex: '1',
    textAlign: 'right'
	},

	percentage: {
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
				<div className={classes.name} title={currency.name}>
					<img className={classes.icon} src={`https://files.coinmarketcap.com/static/img/coins/32x32/${currency.id}.png`} />
					{currency.symbol}
				</div>
				<div className={percentageClass}>{currency.percent_change_24h > 0 ? '+' : ''}{numeral(currency.percent_change_24h).format('0,0.00')}%</div>
				<div className={classes.price} title={numeral(currency.price_usd).format('0,0.000')}><span className={classes.euro}>&euro;</span>{numeral(currency.price_eur).format('0,0.000')}</div>
			</div>
		);
	}
}
