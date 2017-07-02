import 'babel-polyfill';
import 'whatwg-fetch';

import React, { Component } from 'react';
import injectSheet from 'react-jss';
import { Provider, observer } from 'mobx-react';

import Settings from './containers/settings/index.js';
import Overview from './containers/overview/index.js';

import MarketStore from './stores/market.js';
import RouterStore from './stores/router.js';

const routerStore = new RouterStore();
const marketStore = new MarketStore();

const stores = {
	routerStore,
	marketStore,
};

@injectSheet({
	'@global': {
		body: {
			margin: 0,
			padding: 0,
			fontSize: '16px',
			// backgroundColor: '#4BAAE9',
			fontFamily: 'Avenir Next, -apple-system, ".SFNSText-Regular", "San Francisco", "Roboto", "Segoe UI", "Helvetica Neue", "Lucida Grande", sans-serif',
		},
	},
})
@observer
export default class App extends Component {
	componentDidMount() {
		marketStore.startLoadingCurrencies();
	}

	componentWillUnmount() {
		marketStore.stopLoadingCurrencies();
	}

	render() {
		const {
			route,
		} = routerStore;

		return (
			<Provider {...stores}>
				{(() => {
					switch (route) {
						default:
							return <Overview />;

						case 'settings':
							return <Settings />;
					}
				})()}
			</Provider>
		);
	}
}
