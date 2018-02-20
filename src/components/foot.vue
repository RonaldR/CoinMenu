<template>
  <footer class="footer">
    <small class="refreshed">
      Total market cap:
      {{ globalData.total_market_cap_usd | currency('$', 0, { thousandsSeparator: '.', decimalSeparator: ',' }) }}
    </small>
    <small>
      <a href="#" @click="refresh()" class="refresh"><img src="../assets/icons/refresh.svg" /></a>
      Last update: {{ refreshDate }}</small>

    <small class="fright"> <router-link to="/about"> about </router-link> </small>
  </footer>
</template>

<script>
import axios from 'axios';

export default {
  name: 'foot',
  props: {
    'refreshDate': {
      type: String,
      required: true
    }
  },
  data() {
    return {
      globalData: {}
    }
  },
  methods: {
    refresh: function() {
      // refresh the coin data (on click)
      this.$parent.getCoins();
      this.getGlobalData();
    },
    getGlobalData: function() {
      // get global coin data like the total market cap
      axios.get('https://api.coinmarketcap.com/v1/global/?convert=EUR')
        .then((response) => {
          this.globalData = response.data;
        })
        .catch((error) => {
          console.log(error);
          this.globalData = null; // reset
        });
    }
  },
  mounted() {
    this.getGlobalData();
  }
}
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

.footer {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding: 16px 0;
  color: #888;
}
</style>
