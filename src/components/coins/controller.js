import axios from 'axios';
import moment from 'moment';

let interval = null;

export default {
  name: 'coins',
  data() {
    return {
      coins: [],
      refreshDate: '',
      addcoin: '',
      currency: 'dollar'
    }
  },
  methods: {
    addCoins: function(event) {
      // get coin from input
      const coinsToAdd = this.addcoin.toUpperCase();
      if(coinsToAdd.length > 1) {
        // get localStorage
        let personalCoinList = JSON.parse(localStorage.getItem("personalCoinList"));

        // add to list
        if (personalCoinList) {
          personalCoinList = personalCoinList.concat(coinsToAdd.split(","));
        } else {
          personalCoinList = coinsToAdd.split(",");
        }

        // remove duplicates
        personalCoinList = personalCoinList.filter(function(item, pos) {
            return personalCoinList.indexOf(item) == pos;
        });

        // save to localStorage
        localStorage.setItem("personalCoinList", JSON.stringify(personalCoinList));

        // clear input
        this.addcoin = '';

        // refresh coin list
        this.getCoins();
      }
    },
    getCoins: function() {
      let url = 'https://api.coinmarketcap.com/v1/ticker/?convert=EUR';
      const personalCoinList = JSON.parse(localStorage.getItem("personalCoinList"));

      if (!personalCoinList || personalCoinList.length < 1) {
        url += '&limit=10';
      }

      axios.get(url)
        .then((response) => {
          const coinData = response.data;

          if (!personalCoinList || personalCoinList.length < 1) {
            this.coins = coinData;
          } else {
            this.coins = coinData.filter(item => personalCoinList.indexOf(item.symbol) !== -1);
          }

          this.refreshDate = moment().format('DD-MM-YYYY, hh:mm:ss');
        })
        .catch((error) => {
          console.log(error);
          this.coins = null;
        });
    },
    remove: function(symbol) {
      console.log('remove:',symbol);
      let personalCoinList = JSON.parse(localStorage.getItem("personalCoinList"));
      let index = personalCoinList.indexOf(symbol);
      if (index > -1) {
        delete personalCoinList[ index ];
        localStorage.setItem("personalCoinList", JSON.stringify(personalCoinList));

        // refresh coin list
        this.getCoins();
      }
    },
    switchCurrency: function(currency) {
      this.currency = currency;
    }
  },
  mounted() {
    this.getCoins();

    // refresh every 60 sec
    clearInterval(interval);
    interval = setInterval(() => {
      this.getCoins();
    }, 60000);
  }
};
