<template>
  <footer class="footer">
    <small>
      <a @click="refresh()" class="refresh"><img src="../assets/icons/refresh.svg" /></a>
      Updated at: {{ refreshDate }}
    </small>

    <small class="refreshed">
      Market cap:
      {{ totalMarketCap | currency('$', 0, { thousandsSeparator: '.', decimalSeparator: ',' }) }}
    </small>

    <small>
      <router-link to="/about" class="about-link"> about </router-link>
    </small>
  </footer>
</template>

<script>
import axios from 'axios';

export default {
  name: 'foot',
  props: {
    refreshDate: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      totalMarketCap: {},
    };
  },
  methods: {
    refresh() {
      // refresh the coin data (on click)
      this.$parent.getCoins();
      this.getGlobalData();
    },
    getGlobalData() {
      // get global coin data like the total market cap
      axios.get('https://api.coinmarketcap.com/v2/global/')
        .then((response) => {
          this.totalMarketCap = response.data.data.quotes.USD.total_market_cap;
        })
        .catch((error) => {
          console.log(error);
          this.totalMarketCap = null; // reset
        });
    },
  },
  mounted() {
    this.getGlobalData();
  },
};
</script>

<style lang="scss" scoped>
.coin-add {
  width: 300px;
  padding: 8px;
}

.refreshed,
.coinmarketcap {
  display: block;
}

.refresh img {
  display: inline-block;
  transition: all .2s ease-in-out;
  transform: rotate(0);
  margin-right: 8px;
  position: relative;
  top: 2px;

  &:hover {
    transform: rotate(90deg);
  }

  &:active {
    transform: rotate(180deg);
  }
}

.about-link {
  color: #888;
}

.footer {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding: 16px 0;
  color: #888;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
