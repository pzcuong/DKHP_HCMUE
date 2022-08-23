const express = require('express'),
  bodyParser = require('body-parser'),
  request = require('request-promise'),
  fs = require('fs'),
  pug = require('pug'),
  input = require('input');

const MyFunction = require('./function.js')

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  fs.writeFileSync('./data/MaLop.html', '');
  fs.writeFileSync('./data/MonHoc.txt', '');
  let html = pug.renderFile('./data/index.pug');
  res.send(html);
})

app.post('/dangnhap', async (req, res) => { 
  let result = await MyFunction.LogIn(req.body.username, req.body.password);
  /* while (!result.isLogined) {
    console.log("Đang đăng nhập lại...");
    result = await MyFunction.LogIn();
  } */
  res.send(result);
})

app.get('/dangky', async (req, res) => {
  console.log(req.body);
  await fs.writeFileSync('./data/MonHoc.txt', req.body.MaMon);
  let resultDKHP = await MyFunction.StartDKHP();
  res.json(resultDKHP)
})

app.listen(3000, () => {
  console.log('server started');
});