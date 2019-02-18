<template>
    <div id="app">
        <transition name="fade">
            <router-view></router-view>
        </transition>
    </div>
</template>

<style lang="scss">
html,
body {
    font-size: 14px;
}

body {
    margin: 0 16px;
    background: rgba(21, 21, 21, 0.93);
}

* {
    box-sizing: border-box;
}

#app {
    font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica,
        Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #fff;
    margin-top: 0;
}

a {
    color: #fff;
    text-decoration: none;
    cursor: pointer;
}

th,
td {
    text-align: left;

    &:last-child {
        padding-right: 0;
    }
}

th {
    color: #888888;
    font-weight: normal;
    padding: 12px 8px 12px 0;
}

td {
    padding: 4px 8px 4px 0;
    vertical-align: top;
}

.center {
    text-align: center;
}

.right {
    text-align: right !important;
}

.fright {
    float: right;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s linear;
}

.fade-enter-active {
    transition-delay: 0.2s;
}

.fade-enter,
.fade-leave-active {
    opacity: 0;
}
</style>
