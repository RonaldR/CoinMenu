<template>
  <div class="coins">
    <table id="coinlist" class="coinlist">
      <tr>
        <th>
          Coin
        </th>
        <th>
          $
        </th>
        <th>
          €
        </th>
        <th>
          BTC
        </th>
        <th>
          24%
        </th>
        <th>
          x
        </th>
      </tr>
      <tr v-for="coin in coins" :key="coin.id">
        <td>
          <a v-bind:href="'https://coinmarketcap.com/currencies/' + coin.id" target="_blank">{{ coin.symbol }}</a>
        </td>
        <td>
          $ {{ parseFloat(coin.price_usd).toFixed(3) }}
        </td>
        <td>
          € {{ parseFloat(coin.price_eur).toFixed(3) }}
        </td>
        <td>
          {{ coin.price_btc }}
        </td>
        <td class="percent-change-24h" :class="{ positive: coin.percent_change_24h >= 0, negative: coin.percent_change_24h < 0 }">
          {{ coin.percent_change_24h }}%
        </td>
        <td>
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
    <small class="coinmarketcap">Data: coinmarketcap.com</small>
  </div>
</template>

<script src="./controller.js"></script>
<style src="./style.css" scoped></style>
