let getLines = function getLines (filename, lineCount, callback) {
  var fs = require('fs')
  let stream = fs.createReadStream(filename, {
    flags: "r",
    encoding: "utf-8",
    fd: null,
    mode: 438, // 0666 in Octal
    bufferSize: 64 * 1024
  });

  let data = "";
  let lines = [];
  stream.on("data", function (moreData) {
    data += moreData;
    lines = data.split("\n");
    // probably that last line is "corrupt" - halfway read - why > not >=
    if (lines.length > lineCount + 1) {
      stream.destroy();
      lines = lines.slice(0, lineCount); // junk as above
      callback(false, lines);
    }
  });

  stream.on("error", function () {
    callback("Error");
  });

  stream.on("end", function () {
    callback(false, lines);
  });

};

exports.ReadFiles = function(filename, lineCount, callback) {
  return getLines (filename, lineCount, callback)
};