<template>
    <div class="addcoins-wrapper">
        <img class="icon" src="../assets/icons/add.svg">
        <input
            id="addcoins"
            type="text"
            class="addcoin-input"
            @keyup.enter="addCoins"
            v-model="addcoin"
            placeholder="BTC or BTC,NEO,SMART"
        >
    </div>
</template>

<script>
export default {
    data() {
        return {
            addcoin: "" // v-model
        };
    },
    methods: {
        addCoins() {
            // get coin from input
            const coinsToAdd = this.addcoin.toUpperCase();
            if (coinsToAdd.length > 1) {
                this.$store.commit("addCoins", coinsToAdd);

                // clear input
                this.addcoin = "";

                // refresh coin list in parent component
                this.$parent.getCoins();
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.addcoins-wrapper {
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    width: 100%;
    margin-top: 8px;
    position: relative;

    .icon {
        content: "";
        position: absolute;
        left: 2px;
        top: 50%;
        transform: translateY(-50%);
        display: inline-block;
        width: 16px;
        height: 16px;
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
