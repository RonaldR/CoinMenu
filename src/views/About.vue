<template>
    <div class="about">
        <div class="github-buttons">
            <a
                @click="openExternalLink('https://github.com/RonaldR/CoinMenu/subscription')"
                target="_blank"
                class="github-buttons__button github-buttons__button--watch"
            >
                <img src="@/assets/github-watch.png">
            </a>
            <a
                @click="openExternalLink('https://github.com/RonaldR/CoinMenu')"
                target="_blank"
                class="github-buttons__button github-buttons__button--star"
            >
                <img src="@/assets/github-star.png">
            </a>
        </div>

        <router-link to="/" class="back-button">
            <img src="@/assets/icons/back.svg">
        </router-link>

        <div class="about-content">
            <div class="about__title-wrapper">
                <div class="about__title-logo">
                    <img src="../assets/logo.svg">
                </div>
                <div class="about__title">Coin menu
                    <span class="about__version">{{ version }}</span>
                </div>
            </div>

            <br>
            <p>
                <a
                    @click="openExternalLink('https://github.com/RonaldR/CoinMenu')"
                    target="_blank"
                >If you like the app you can show your appreciation by leaving a star on the github repo or donating some crypto 😉🚀
                    <br>
                    <br>You can also contribute to the project by doing a pull request.
                </a>
                <br>
            </p>

            <ul class="donations">
                <li class="donations__list-item">
                    <span class="donations__label">BTC</span>
                    <a
                        v-clipboard:copy="`13xB6FVUfDRJfDuUCqWnZzaStaMXSbiHgp`"
                        class="donations__address"
                    >
                        13xB6FVUfDRJfDuUCqWnZzaStaMXSbiHgp
                        <img
                            src="@/assets/icons/copy.svg"
                            class="donations__copy-icon"
                            alt="copy"
                        >
                    </a>
                </li>
                <li class="donations__list-item">
                    <span class="donations__label">ETH</span>
                    <a
                        v-clipboard:copy="`0xf774c2148235d20FD5E6c22b86BBd78A1f5E872F`"
                        class="donations__address"
                    >
                        0xf774c2148235d20FD5E6c22b86BBd78A1f5E872F
                        <img
                            src="@/assets/icons/copy.svg"
                            class="donations__copy-icon"
                            alt="copy"
                        >
                    </a>
                </li>
                <li class="donations__list-item">
                    <span class="donations__label">LTC</span>
                    <a
                        v-clipboard:copy="`LM2GNo5koDWfJAuidw8dXCLuTEoHLhMQhQ`"
                        class="donations__address"
                    >
                        LM2GNo5koDWfJAuidw8dXCLuTEoHLhMQhQ
                        <img
                            src="@/assets/icons/copy.svg"
                            class="donations__copy-icon"
                            alt="copy"
                        >
                    </a>
                </li>
            </ul>

            <br>

            <div class="credits">
                <div class="credits__column">
                    <div class="credits__title">CREATED BY</div>
                    <div class="credits__name">Ronald Runia</div>
                </div>
                <div class="credits__column">
                    <div class="credits__title">DESIGNED BY</div>
                    <div class="credits__name">Bob van Aubel</div>
                </div>
                <div class="credits__column">
                    <div class="credits__title">APP IDEA</div>
                    <div class="credits__name">Martijn de Haan</div>
                </div>
                <div class="credits__column">
                    <div class="credits__title">DATA</div>
                    <div class="credits__name">coinmarketcap.com ❤️</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import mixins from "@/mixins";

export default {
    mixins: [mixins],
    data() {
        return {
            version: require("../../package.json").version
        };
    },
    created() {
        if (window.electronRemote) {
            window.electronRemote.getCurrentWindow().setSize(600, 480, true);
        }
    },
    destroyed() {
        if (window.electronRemote) {
            window.electronRemote.getCurrentWindow().setSize(500, 400, true);
        }
    }
};
</script>

<style lang="scss" scoped>
.about {
    font-size: 14px;
}

.back-button {
    width: 24px;
    height: 24px;
    display: block;
    background: #353535;
    border-radius: 3px;
    text-align: center;
    margin: 12px 0 0 8px;
    padding-top: 5px;
}

.github-buttons {
    float: right;
}

.github-buttons__button {
    margin-left: 8px;
    width: 76px;
    display: inline-block;

    img {
        width: 100%;
    }

    &--star {
        width: 62px;
    }
}

.about-content {
    padding: 24px;
}

.about__title-wrapper {
    display: flex;
    align-items: center;
}

.about__title-logo {
    margin-right: 8px;

    img {
        width: 22px;
        height: 32px;
    }
}

.donations {
    margin: 32px 0 24px 0;
    padding: 0;

    li {
        list-style: none;
        margin: 0;
    }

    .donations__address {
        margin-left: 8px;
        padding: 3px 4px;
        border-radius: 3px;
        background: #2e8dff;
        transition: all 0.2s ease-in-out;

        &:hover {
            background: lighten(#2e8dff, 10%);
        }

        &:active {
            background: darken(#2e8dff, 10%);
        }
    }

    .donations__list-item {
        margin: 16px 0;
    }

    .donations__label {
        display: inline-block;
        width: 40px;
    }

    .donations__copy-icon {
        margin: 0 8px;
    }
}

.credits {
    width: 100%;
}

.credits__column {
    width: 32%;
    display: inline-block;
    margin-bottom: 24px;
}

.credits__title {
    color: #2e8dff;
    font-size: 12px;
}

.footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>
