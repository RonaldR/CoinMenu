<template>
  <div class="addcoins-wrapper">
    <input id="addcoins" type="text" class="addcoin-input"
            @keyup.enter="addCoins" v-model="addcoin"
            placeholder="BTC or BTC,NEO,SMART" />
  </div>
</template>

<script>
export default {
  name: 'addcoin',
  data() {
    return {
      addcoin: '' // v-model
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

        // refresh coin list in parent component
        this.$parent.getCoins();
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.addcoins-wrapper {
  border-top: 1px solid rgba(255,255,255,0.12);
  width: 100%;
  margin-top: 8px;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    display: inline-block;
    width: 16px;
    height: 16px;
    background: url(../assets/icons/add.svg) no-repeat center;
  }
}

.addcoin-input {
  background: transparent;
  width: 100%;
  padding: 16px 16px 16px 32px;
  border: 0;
  outline: none;
  color: white;
  font-size: 14px;
}
</style>
