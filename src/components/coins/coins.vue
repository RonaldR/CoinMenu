<template>
  <div class="coins">
    <table id="coinlist" class="coinlist">
      <tr>
        <th>
          Coin
        </th>
        <th class="right">
          24h%
        </th>
        <th class="right">
          <span class="currency" :class="{ active: currency === 'dollar' }" v-on:click="switchCurrency('dollar')">$</span>
          /
          <span class="currency" :class="{ active: currency === 'euro' }" v-on:click="switchCurrency('euro')">€</span>
          /
          <span class="currency" :class="{ active: currency === 'btc' }" v-on:click="switchCurrency('btc')">BTC</span>
        </th>
        <th class="right">
          Del
        </th>
      </tr>
      <tr v-for="coin in coins" :key="coin.id">
        <td class="coinlist__coin">
          <a v-bind:href="'https://coinmarketcap.com/currencies/' + coin.id" target="_blank">
            <img v-bind:src="'https://files.coinmarketcap.com/static/img/coins/16x16/' + coin.id + '.png'" />
            {{ coin.symbol }}
          </a>
        </td>
        <td class="coinlist__percent-change-24h right" :class="{ positive: coin.percent_change_24h >= 0, negative: coin.percent_change_24h < 0 }">
          {{ coin.percent_change_24h }}%
        </td>
        <td class="coinlist__price">
          <span v-if="currency === 'dollar'">
            ${{ parseFloat(coin.price_usd).toFixed(3) }}
          </span>
          <span v-if="currency === 'euro'">
            €{{ parseFloat(coin.price_eur).toFixed(3) }}
          </span>
          <span v-if="currency === 'btc'">
            {{ parseFloat(coin.price_btc).toFixed(8) }}
          </span>
        </td>
        <td class="coinlist__delete right">
          <a href="#" class="remove-link" v-on:click="remove(coin.symbol)">x</a>
        </td>
      </tr>
    </table>

    <label for="addcoins">Add your coin(s)</label>
    <br />
    <input id="addcoins" type="text" max="10" class="coin-add"
            @keyup.enter="addCoins" v-model="addcoin"
            placeholder="BTC or BTC,NEO,SMART" />

    <small class="refreshed">Last refresh: {{ refreshDate }}</small>
    <small class="fright"><router-link to="/about">about</router-link></small>
    <small class="coinmarketcap">Data: coinmarketcap.com</small>
  </div>
</template>

<script src="./controller.js"></script>
<style src="./style.scss" lang="scss" scoped></style>
