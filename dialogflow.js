exports.convertFormat = (data, filmeOuSerie, categoria) => {
  
  var producer = require('./producer');
  var filtered = data;
  var text = "<speak><p><s>Parece que nossos Garimpeiros ainda não encontraram nada parecido.</s> <s>Para receber uma nova indicação diga <emphasis level=\"none\">Recomendação.</emphasis></s></p></speak>";
  console.log('Filme ou Série: ' + filmeOuSerie);
  console.log('Categoria: ' + categoria);
  console.log('Recomendações sem filtro: ' + filtered.length);
  if(filmeOuSerie != "tanto faz")
  {
    filtered = filtered.filter(recomendation => recomendation[1] === filmeOuSerie);
  }
  console.log('Recomendações com filtro de filme: ' + filtered.length);
  if(categoria != "tanto faz")
  {
    filtered = filtered.filter(recomendation => recomendation[2] === categoria);
  }
  console.log('Recomendações com filtro final: ' + filtered.length);
  if(filtered.length > 0)
  {
    text = filtered[Math.floor(Math.random()*filtered.length)][3];
    var nome = filtered[Math.floor(Math.random()*filtered.length)][0];
    producer.produceRecommendation(nome, text, filmeOuSerie, categoria);
  }
  return {
    fulfillmentText: text
  };
};