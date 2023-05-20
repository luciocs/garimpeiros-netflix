const fs = require('fs');
const {google} = require('googleapis');

function getDataFromSpreadsheet(tabName, startCell, endCell) {
  return new Promise((resolve, reject) => {
    console.log('getDataFromSpreadsheet', typeof content);

    const sheets = google.sheets({version: 'v4', auth: process.env.SPREADSHEET_API_KEY});

    sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${tabName}!${startCell}:${endCell}`,
    }, (err, res) => {
      if (err) reject('The API returned an error: ' + err);

      const rows = res.data.values;

      resolve(rows);
    });
  });
}

function saveDataToSpreadsheet(filmeOuSerie, categoria) {
  return new Promise((resolve, reject) => {
    console.log('saveDataToSpreadsheet', typeof content);    
   
    const https = require('https')

    const data = JSON.stringify({
        filmeOuSerie: filmeOuSerie,
        categoria: categoria,
        data: (new Date()).toLocaleString()
    })

    const options = {
      hostname: 'hooks.zapier.com',
      port: 443,
      path: '/hooks/catch/241629/x7g1jh/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }

    const req = https.request(options, (res) => {
      console.log(`statusCode: ${res.statusCode}`)

      res.on('data', (d) => {
        process.stdout.write(d)
      })
    })

    req.on('error', (error) => {
      console.error(error)
    })

    req.write(data)
    req.end()
    
  });
}

exports.getDataFromSpreadsheet = getDataFromSpreadsheet;
exports.saveDataToSpreadsheet = saveDataToSpreadsheet;