<template>
  <div class="about">
    <router-link to="/" class="back-button"><img src="../assets/icons/back.svg" /></router-link>

    <div class="about-content">
      <div class="about__title-wrapper">
        <div class="about__title-logo">
          <img src="../assets/logo.svg" />
        </div>
        <div class="about__title">
          CoinMenu
        </div>
      </div>

      <br />

      <div class="credits">
        <div class="credits__column">
          <div class="credits__title">
            CREATED BY
          </div>
          <div class="credits__name">
            Ronald Runia
          </div>
        </div>
        <div class="credits__column">
          <div class="credits__title">
            DESIGNED BY
          </div>
          <div class="credits__name">
            Bob van Aubel
          </div>
        </div>
      </div>

      <br />
      <p>
        <a href="https://github.com/RonaldR/CoinMenu" target="_blank">
          If you like the app you can show your appreciation by leaving a star on the github repo or donating some crypto 😉🚀 
           <br /><br />
          You can also contribute to the project by doing a pull request.
        </a>
        <br />
      </p>

      <br />
      <p>
        <small class="coinmarketcap">Data: coinmarketcap.com ❤️</small>
        <br />
        <small class="coinmarketcap">App idea by: Martijn de Haan</small>
        <br />
      </p>
    </div>
  </div>
</template>


<script>
export default {
  name: 'about'
}
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

.credits {
  width: 100%;
}

.credits__column {
  width: 49%;
  display: inline-block;
}

.credits__title {
  color: #2E8DFF;
  font-size: 12px;
}
</style>
