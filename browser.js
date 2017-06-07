
// init
getData();

setInterval(function(){
  getData();
}, 15000);

// get the coin json from coinmarketcap
function getData() {
  var request = new XMLHttpRequest();
  request.open('GET', 'https://api.coinmarketcap.com/v1/ticker/?convert=EUR', true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      var data = JSON.parse(request.responseText);
      setData(data);
    }
  };
  request.send();
};

// create table
function setData(data) {
  var firstRow = '<tr><th>Coin</th><th>$</th><th>&euro;</th><th>% (24h)</th></tr>';
  document.getElementById('table').innerHTML = firstRow;

  // show the first 6 from top coins
  for(i in data) {
    if (i > 5) {
      break;
    }

    var obj = data[i];
    createRow(obj)
  }

  // add digibyte
  var obj = _.find(data, function(obj) { return obj.id == 'digibyte' });
  createRow(obj);
}

// helper
function createRow(obj) {
  var row = '<tr title="' + obj['name'] + '">';
    row += '<th class="coin-title"><img src="https://files.coinmarketcap.com/static/img/coins/16x16/' + obj['id'] + '.png" class="icon">' + obj['symbol'] + '</th>';
    row += '<td>' + parseFloat(obj['price_usd']).toFixed(3) + '</td>';
    row += '<td>' + parseFloat(obj['price_eur']).toFixed(3) + '</td>';
    row += '<td class="' + ((parseFloat(obj["percent_change_24h"]) > 0) ? 'green' : 'red') +  '">' + parseFloat(obj['percent_change_24h']).toFixed(3) + '%</td>';
    row += '</tr>';

    document.getElementById('table').insertAdjacentHTML('beforeend', row);
}
