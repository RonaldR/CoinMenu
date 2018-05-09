<template>
  <div class="coins">
    <div class="header">
      <div class="header__logo-title">
        <img src="../assets/logo.svg" class="header__logo" />
        <span class="header__title">Coin menu</span>
      </div>

      <div class="header__currency-switcher">
        <span class="currency" :class="{ active: currency === 'dollar' }" @click="currency = 'dollar'">USD</span>
        <span class="currency" :class="{ active: currency === 'euro' }" @click="currency = 'euro'">EUR</span>
      </div>

      <div class="header__edit-button">
        <a @click="toggleEditMode()" :class="{ editMode }">{{ editButtonLabel }}</a>
      </div>
    </div>

    <table id="coinlist" class="coinlist">
      <tr>
        <transition name="fade">
          <th class="coinlist__delete" v-if="editMode"></th>
        </transition>
        <th>Coin</th>
        <th>Holding</th>
        <th class="right">Latest price</th>
        <th class="right">24h %</th>
      </tr>
      <tablerow v-for="(coin, index) in coins" :key="index" :index="index" :coin="coin" :currency="currency" :editMode="editMode" />
    </table>

    <transition name="fade">
      <addcoin v-if="editMode" />
    </transition>

    <foot :refresh-date="refreshDate" />
  </div>
</template>

<script>
import axios from 'axios';
import moment from 'moment';
import tablerow from '@/components/Tablerow';
import foot from '@/components/Foot';
import addcoin from '@/components/Addcoin';

export default {
  name: 'home',
  components: {
    tablerow,
    foot,
    addcoin,
  },
  computed: {
    editButtonLabel() {
      return this.editMode ? 'Done' : 'Edit';
    }
  },
  data() {
    return {
      coins: [],
      refreshDate: '',
      currency: 'dollar',
      editMode: false,
      coinData: []
    };
  },
  methods: {
    getCoins() {
      // coinmarketcap api url
      let url = 'https://api.coinmarketcap.com/v2/ticker/?convert=EUR';

      const personalCoinList = this.$store.getters.getPersonalCoinList;

      // if no personal coin list, get the top 10
      if (!personalCoinList || personalCoinList.length < 1) {
        url += '&limit=10';
      } else {
        url += '&limit=2000';
      }

      // fetch the data
      axios.get(url)
        .then((response) => {
          this.coins = null; // clear list

          // timeout to async it more
          setTimeout(() => {
            this.coinData = response.data.data;
            // data is object, convert to array
            this.coinData = Object.values(this.coinData);
            // sort on rank.
            this.coinData.sort(function(a, b) {
                return a.rank - b.rank;
            });

            if (!personalCoinList || personalCoinList.length < 1) {
              this.coins = this.coinData;

              // If there is no personal coin list yet
              // we simply create a personalCoinList from the top 10.
              this.$store.commit('createCoinList', this.coins);
            } else {
              // filter the coins in the personal list
              this.reloadCoins();
            }

            // update the date
            this.refreshDate = moment().format('DD-MM-YYYY HH:mm:ss');
          });
        })
        .catch((error) => {
          console.log(error);
          this.coins = null; // reset on error
        });
    },
    reloadCoins() {
      this.coins = this.$store.getters.getCoinListWithHoldings(this.coinData);
    },
    toggleEditMode() {
      this.editMode = !this.editMode;
      this.getCoins();
    },
  },
  mounted() {
    this.getCoins();
  },
};
</script>

<style lang="scss" scoped>
th {
  font-size: 12px;
}

td {
  font-size: 14px;
}

.coinlist {
  margin-top: 54px;
  margin-bottom: 16px;
  width: 100%;
}

.currency {
  cursor: pointer;
  color: #777;
  transition: all .2s ease-in-out;
  position: relative;
  margin-left: 16px;
  font-size: 12px;

  &:after {
    content: '';
    transition: all .2s ease-in-out;
    position: absolute;
    bottom: -20px;
    left: 0;
    width: 100%;
    height: 0;
    background: transparent;
  }

  &:hover,
  &.active {
    color: #fff;

    &:after {
      content: '';
      height: 2px;
      background: #2E8DFF;
    }
  }

  &.active {
    cursor: default;
  }
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px 14px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.12);
  background: rgba(21,21,21,.93);
}

.header__logo-title {
  display: flex;
  align-items: center;
}

.header__logo {
  margin-right: 12px;
}

.header__edit-button {
  a {
    transition: all .2s ease-in-out;
    display: inline-block;
    background: #353535;
    color: white;
    padding: 5px 8px;
    border-radius: 3px;
    min-width: 50px;
    text-align: center;

    &.editMode {
      background: #2E8DFF;
    }
  }
}
</style>
