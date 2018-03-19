<template>
  <tr>
    <transition name="fade">
      <td class="coinlist__delete" v-if="editMode">
        <a class="remove-link" @click="remove(coin.symbol)">
          <img src="../assets/icons/remove.svg" />
        </a>
      </td>
    </transition>

    <td class="coinlist__coin-short">
      <a @click="openExternalLink('https://coinmarketcap.com/currencies/' + coin.id)" target="_blank">
        {{ coin.symbol }}
        <small class="coinlist__coin">
          {{ coin.name }}
        </small>
      </a>
    </td>

    <td class="coinlist__holding">
      <div v-if="! editMode && coinList[index].holding">
        <div class="coinlist__holding-price">
          <span v-if="currency === 'dollar'">
            {{ coinList[index].holding * coin.price_usd | currency('$', 2, { thousandsSeparator: '.', decimalSeparator: ',' }) }}
          </span>

          <span v-if="currency === 'euro'">
            {{ coinList[index].holding * coin.price_eur | currency('€', 2, { thousandsSeparator: '.', decimalSeparator: ',' }) }}
          </span>
        </div>

        <div class="coinlist__holding-amount">
          {{ coinList[index].holding }}
        </div>
      </div>

      <input v-if="editMode" type="number"  step="0.1"
            class="coinlist__holding-input"
            v-model="coinList[index].holding"
            @keyup="saveHolding()"
            placeholder="Add the amount your holding" />
    </td>

    <td class="coinlist__price">
      <span v-if="currency === 'dollar'">
        {{ coin.price_usd | currency('$', 2, { thousandsSeparator: '.', decimalSeparator: ',' }) }}
        <small class="coinlist__btc-price">
          {{ coin.price_btc | currency('', 8, { thousandsSeparator: '.', decimalSeparator: ',' }) }}
        </small>
      </span>
      <span v-if="currency === 'euro'">
        {{ coin.price_eur | currency('€', 2, { thousandsSeparator: '.', decimalSeparator: ',' }) }}
        <small class="coinlist__btc-price">
          {{ coin.price_btc | currency('', 8, { thousandsSeparator: '.', decimalSeparator: ',' }) }}
        </small>
      </span>
    </td>

    <td class="coinlist__percent-change-24h right"
        :class="{ positive: coin.percent_change_24h >= 0, negative: coin.percent_change_24h < 0 }">
      {{ coin.percent_change_24h }}%
      <img src="../assets/icons/positive.svg" v-if="coin.percent_change_24h >= 0" />
      <img src="../assets/icons/negative.svg" v-if="coin.percent_change_24h < 0" />
    </td>
  </tr>
</template>

<script>
import mixins from '../mixins';

export default {
  name: 'tablerow',
  props: {
    coins: {
      type: Array,
      required: true,
    },
    coin: {
      type: Object,
      required: true,
    },
    index: {
      required: true
    },
    currency: {
      type: String,
      required: true,
    },
    editMode: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    coinList () {
      return this.$store.getters.getPersonalCoinList; // v-model for holding amount
    }
  },
  mixins: [mixins],
  methods: {
    remove(symbol) {
      // filter out the coin to remove
      this.$store.commit('removeCoin', symbol);

      this.$parent.getCoins();
    },
    saveHolding() {
      // save the holding model
      localStorage.setItem('personalCoinList', JSON.stringify(this.coinList));
    }
  },
  created() {
    // set coinlist model for holding input
    this.coinList = this.$store.getters.getPersonalCoinList;
  },
};
</script>

<style lang="scss" scoped>
.coinlist__coin {
  display: block;
  color: #888;
  font-size: 14px;
}

td {
  line-height: 1.4;
}

.coinlist__price {
  text-align: right;
  min-width: 92px;
}

.coinlist__percent-change-24h {
  position: relative;
  padding-right: 24px;

  img {
    content: '';
    position: absolute;
    top: 8px;
    right: 6px;
    display: block;
    width: 14px;
    height: 14px;
    background-size: contain;
  }

  &.positive {
    color: #00CA7F;
  }
  &.negative {
    color: #FF504F;
  }
}

.coinlist__btc-price {
  display: block;
  color: #888;
  font-size: 14px;
}

.coinlist__holding-amount {
  color: #888;
}

.coinlist__holding-input {
  background: transparent;
  border: 0;
  color: #fff;
  padding: 6px 0;
  width: 100%;
  outline: none;
  font-size: 13px;
}

.remove-link {
  color: red;
  text-decoration: none;
  position: relative;
  top: 2px;
}
</style>
