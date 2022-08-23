const express = require('express'),
  bodyParser = require('body-parser'),
  request = require('request-promise'),
  fs = require('fs'),
  input = require('input');

let jar = request.jar();

var headers = {
  'sec-ch-ua': '" Not;A Brand";v="99", "Microsoft Edge";v="91", "Chromium";v="91"',
  Accept: 'application/json, text/javascript; q=0.01',
  'X-Requested-With': 'XMLHttpRequest',
  'sec-ch-ua-mobile': '?0',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36 Edg/91.0.864.59',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  'Sec-Fetch-Site': 'same-origin',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Dest': 'empty',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cookie': 'ASP.NET_SessionId=jubwwigd2lb12cpnxocxn4f4; BNI_persistence=000000000000000000000000d8c910ac0000bb01; BNES_ASP.NET_SessionId=9UWEw6hQSU4U7fd9DDTaPnKvnD1k5+cTuhp19EPRtLLeDj+WWAaaQMEu9Ex4MupVr4iEkMNqU3kw/2kTNx6mK00jb76ADqyM8uJjXN+cuGcESAfGyzrQ1w=='
}

async function LogIn(username, password) {
  var options = {
    url: 'https://dkhp.hcmue.edu.vn/Login',
    headers: headers,
    form: {
      username: username,
      password: password
    },
    jar: jar
  };
  
  let isLogined = false;
  await request.post(options)
    .then((data) => {
      if(data.includes(username))
        isLogined = true;
    })
    .catch((err) => {
      console.log("Code đăng nhập: ", err.statusCode);
      if(err.statusCode == 302)
        isLogined = true;
    });
  
  return isLogined;
}

exports.LogIn = LogIn

let HideValues;

async function Start() {
  const MaMon = getLines("./data/MonHoc.txt");
  let result = {};
  console.log(MaMon.length);
  for (let i=0; i<MaMon.length-1;) 
    try {
      var re = new RegExp(/\w+/g)
      MaMon[i] = MaMon[i].match(re);
      
      await GetTKBDKHP(MaMon[i]).then(function(data) {
        fs.writeFileSync('./data/MaLop.html', data);
      })
      
      console.log(`Đang đăng kí môn "${MaMon[i]}"`)
      
      await ExtractData(MaMon[i+1]);
      console.log(HideValues[2]);
      await StartDKHP(HideValues[2])
        .then(function(data) {
          console.log(data);
          i += 1;
          result[data.Obj1] = data.Msg;
        })
        .catch(function(error) {
          console.log(error);
        })
    } catch (error) {
      console.log(error);
      result[error] = error;
    };

  return result;
}

exports.StartDKHP = Start

async function GetTKBDKHP(MaMH) {
  var options = {
    url: `https://dkhp.hcmue.edu.vn/DangKyHocPhan/DanhSachLopHocPhan?id=${MaMH}&registType=KH`,
    headers: headers,
    jar: jar
  }
  return request(options, (req, res, body) => {
    return res.statusCode;
  });
}

function getLines(filename) {
  const data = fs.readFileSync(filename,
    { encoding: 'utf8', flag: 'r' });
  let lines = data.split("\n");
  return lines;
};

async function ExtractData(MaMH) {
  const lines = getLines("./data/MaLop.html");
  console.log(`"${MaMH}"`)
  for (let i = 0; lines[i] != null; i++) 
    if (lines[i].includes(MaMH)) {
      var re1 = new RegExp(/(\"(.*?)\")+/)
      HideValues = lines[i + 4].match(re1);
      break;
    }
}

async function StartDKHP(HideValue) {
  var options = {
    url: `https://dkhp.hcmue.edu.vn/DangKyHocPhan/DangKy?Hide=${HideValue}|&acceptConflict=true&classStudyUnitConflictId=&RegistType=KH`,
    headers: headers,
    json: true,
    jar: jar
  }
  return request.get(options);
}
