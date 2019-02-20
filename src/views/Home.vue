<template>
    <div class="coins">
        <div class="header">
            <div class="header__logo-title">
                <img src="@/assets/logo.svg" alt="logo" class="header__logo">
                <span class="header__title">Coin menu</span>
            </div>

            <div class="header__currency-switcher">
                <span
                    class="currency"
                    :class="{ active: currency === 'dollar' }"
                    @click="currency = 'dollar'"
                >
                    USD
                </span>
                <!-- <span
                    class="currency"
                    :class="{ active: currency === 'euro' }"
                    @click="currency = 'euro'"
                >
                    EUR
                </span>-->
            </div>

            <div class="header__edit-button">
                <a @click="toggleEditMode()" :class="{ editMode }">
                    {{ editButtonLabel }}
                </a>
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
            <tablerow
                v-for="(coin, index) in coins"
                :key="index"
                :index="index"
                :coin="coin"
                :currency="currency"
                :editMode="editMode"
            />
        </table>

        <transition name="fade">
            <addcoin v-if="editMode"/>
        </transition>

        <foot :refresh-date="refreshDate" :loading="loading" />
    </div>
</template>

<script>
import tablerow from "@/components/Tablerow";
import foot from "@/components/Foot";
import addcoin from "@/components/Addcoin";
import { format } from 'date-fns';

import { apiKey, envUrl } from "../helpers";

export default {
    components: {
        tablerow,
        foot,
        addcoin
    },
    computed: {
        editButtonLabel() {
            return this.editMode ? "Done" : "Edit";
        }
    },
    data() {
        return {
            coins: [],
            refreshDate: "",
            currency: "dollar",
            editMode: false,
            coinData: [],
            loading: true
        };
    },
    methods: {
        getCoins() {
            this.loading = true;

            let url = `${envUrl()}v1/cryptocurrency/listings/latest?convert=USD`;

            const personalCoinList = this.$store.getters.getPersonalCoinList;
            // if no personal coin list, get the top 10
            if (!personalCoinList || personalCoinList.length < 1) {
                url += "&limit=10";
            } else {
                url += "&limit=5000";
            }

            fetch(url, {
                headers: {
                    origin: "http://localhost",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CMC_PRO_API_KEY": apiKey()
                }
            })
                .then(response => response.json())
                .then(response => {
                    // TODO: fix this and timeout
                    this.coins = null; // clear list

                    // timeout, because.... ?
                    setTimeout(() => {
                        this.coinData = response.data;
                        // data is object, convert to array
                        this.coinData = Object.values(this.coinData);
                        // sort on rank.
                        this.coinData.sort((a, b) => a.cmc_rank - b.cmc_rank);

                        if (!personalCoinList || personalCoinList.length < 1) {
                            this.coins = this.coinData;

                            // If there is no personal coin list yet
                            // we simply create a personalCoinList from the top 10.
                            this.$store.commit("createCoinList", this.coins);
                        } else {
                            // filter the coins in the personal list
                            this.reloadCoins();
                        }

                        // update the date
                        this.refreshDate = format(new Date(), 'DD-MM-YYYY HH:mm:ss');

                        this.loading = false;
                    });
                })
                .catch(error => {
                    console.log(error);
                    this.coins = null; // reset on error
                    this.loading = false;
                });
        },
        reloadCoins() {
            this.coins = this.$store.getters.getCoinListWithHoldings(
                this.coinData
            );
        },
        toggleEditMode() {
            this.editMode = !this.editMode;
            this.getCoins();
        }
    },
    mounted() {
        this.getCoins();
    }
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
    transition: all 0.2s ease-in-out;
    position: relative;
    margin-left: 16px;
    font-size: 12px;

    &:after {
        content: "";
        transition: all 0.2s ease-in-out;
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
            content: "";
            height: 2px;
            background: #2e8dff;
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
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(21, 21, 21, 0.93);
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
        transition: all 0.2s ease-in-out;
        display: inline-block;
        background: #353535;
        color: white;
        padding: 5px 8px;
        border-radius: 3px;
        min-width: 50px;
        text-align: center;

        &.editMode {
            background: #2e8dff;
        }
    }
}
</style>
