import { observable, action, computed } from 'mobx';
import autobind from 'autobind-decorator';

const REFRESH_INTERVAL = 1000 * 60;
const API_URL = 'https://api.coinmarketcap.com/v1/ticker/?convert=EUR';
const VISIBLE_CURRENCIES = [
	'BTC',
	'ETH',
	'XRP',
	'DGB',
	'LTC'
];

export default class MarketStore {
	@observable allCurrencies = [];
	@observable currencies = [];
	@observable updatedAt = null;
	timer = null;

	@action.bound async startLoadingCurrencies() {
		const response = await fetch(API_URL);

		if (response.ok) {
			const json = await response.json();

			this.updatedAt = new Date();
			this.allCurrencies = json;
			this.currencies = this.allCurrencies.filter((currency) => VISIBLE_CURRENCIES.indexOf(currency.symbol) !== -1);

			this.timer = setTimeout(this.startLoadingCurrencies, REFRESH_INTERVAL);

			// TODO: Check the change and send a notification if Math.abs(percent_change_24h) > 10

			/*
			new Notification('Test', {
				body: 'This is something!',
			});
			*/
		}
	}

	stopLoadingCurrencies() {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
	}
}
