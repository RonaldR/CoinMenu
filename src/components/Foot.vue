<template>
    <footer class="footer">
        <small>
            <a @click="refresh()" class="refresh">
                <img src="@/assets/icons/refresh.svg" alt="refresh" :class="{loading}">
            </a>
            Updated at: {{ refreshDate }}
        </small>

        <small class="refreshed">
            Market cap:
            {{ totalMarketCap | currency('$', 0,
                { thousandsSeparator: '.', decimalSeparator: ',' })
            }}
        </small>

        <small>
            <router-link to="/about" class="about-link">about</router-link>
        </small>
    </footer>
</template>

<script>
import { apiKey, envUrl } from '../helpers';

export default {
    props: {
        refreshDate: {
            type: String,
            required: true,
        },
        loading: {
            type: Boolean,
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
            const url = `${envUrl()}v1/global-metrics/quotes/latest?convert=USD`;

            fetch(url, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CMC_PRO_API_KEY': apiKey(),
                },
            })
                .then(response => response.json())
                .then((response) => {
                    this.totalMarketCap =
                        response.data.quote.USD.total_market_cap;
                })
                .catch((error) => {
                    console.error(error);
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
    transition: all 0.2s ease-in-out;
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

@-moz-keyframes spin {
    100% {
        -moz-transform: rotate(360deg);
    }
}
@-webkit-keyframes spin {
    100% {
        -webkit-transform: rotate(360deg);
    }
}
@keyframes spin {
    100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
    }
}

.loading {
    -webkit-animation: spin 3s linear infinite;
    -moz-animation: spin 3s linear infinite;
    animation: spin 3s linear infinite;
}
</style>
