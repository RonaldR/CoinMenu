<template>
  <div>
    Settings

    <label for="addcoins">Add your coin(s)</label>
    <br />
    <input id="addcoins" type="text" class="coin-add"
            @keyup.enter="addCoins" v-model="addcoin"
            placeholder="BTC or BTC,NEO,SMART" />

    <div class="statusLabel">
      {{ statusLabel }}
    </div>

    <a href="#" @click="deleteList()">Clear your coinlist</a>
    <br />

    <router-link to="/">Go back</router-link>
  </div>
</template>

<script>
export default {
  name: 'settings',
  data() {
    return {
      'statusLabel': ''
    }
  },
  methods: {
    addCoins: function() {
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
        localStorage.setItem('personalCoinList', JSON.stringify(personalCoinList));

        // clear input
        this.addcoin = '';

        // refresh coin list
        //this.$parent.getCoins();

        this.statusLabel = 'Added: ' + coinsToAdd;
      }
    },
    deleteList: function() {
      localStorage.removeItem('personalCoinList');
      this.statusLabel = 'List cleared';
    }
  }
}
</script>

<style scoped>
.statusLabel {
  margin: 24px 0;
}
</style>
