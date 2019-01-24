'use strict';
// var expect = require('chai').expect;
var fs = require('fs');
// var path = require('path');
// var sinon = require('sinon');
// fs.readFile("../tmp/output.txt", 'utf8', function (err, data) {
//     if (err) throw err;
//     if (data.indexOf('BA55525') >= 0) {
//         console.log(data);
//     }
// });

// var lineReader = require('readline').createInterface({
//     input: require('fs').createReadStream('../tmp/output.txt')
//   });

//   lineReader.on('line', function (line) {
//       if (line.indexOf('BA55525') >= 0) {
//     console.log('Line from file that has BA55525:', line);}
//   });


// var linesArray = fs.readFileSync('../tmp/output.txt', 'utf8').split('\r\n') 

// for (var i = 0; i < linesArray.length; i++) {
//   if (linesArray[i].indexOf('BA55525   TYPE            =') >= 0) {
//     while (linesArray[i].indexOf('NOW SET TO GLOBAL ZONE') < 0){
//       console.log(linesArray[i]);
//       i++;
//     }
//   }
//   // res.json("iteration " + i);
//   // res.json('name:' + linesArray[i].name + linesArray[i].address);
// }


// var x = 10;
// console.log('1111111111111111111');
// function createFunction1() {
//   // var x = 20;
//   return new Function('return x;'); // this |x| refers global |x|
// }

// console.log('2222222222222222222');
// function createFunction2() {
//     var x = 20;
//     function f() {
//         return x; // this |x| refers local |x| above
//     }
//     return f;
// }

// var f1 = createFunction1();
// console.log(f1());          // 10
// var f2 = createFunction2();
// console.log(f2());          // 20
// console.log(x);          // 20

// var sysmodName = 'BA55054';
// var filePath = './output/' + sysmodName + '.txt';
// var linesArray = fs.readFileSync(filePath, 'utf8').split('\r\n')
// console.log('**************' + sysmodName + '***************************');
//Print output to console
// for (var i = 0; i < linesArray.length; i++) {
//   if (linesArray[i].indexOf('BA55054   TYPE            = APAR') >= 0) {
//     while (linesArray[i].indexOf('NOW SET TO GLOBAL ZONE') < 0) {
//       console.log(linesArray[i]);
//       i++;
//     }
//   }
// }

// console.log('*******************************************************');
// console.log('Printing out return text');
// console.log('*******************************************************');
// var linesArray = fs.readFileSync(filepath, 'utf8').split('\r\n')
// // var linesArray = fs.readFileSync('./output/output.txt', 'utf8').split('\r\n') 
// console.log('**************' + sysmodName + '***************************');
// for (var i = 0; i < linesArray.length; i++) {
//   if (linesArray[i].indexOf('BA55054   TYPE            = APAR') >= 0) {
//     while (linesArray[i].indexOf('NOW SET TO GLOBAL ZONE') < 0) {
//       console.log(linesArray[i]);
//       i++;
//     }
//   }
//   if (linesArray[i].indexOf('BA55025            NOT FOUND') >= 0) {
//     console.log(sysmodname + ' was not installed on this driver.');
//   }
// }

var jobLog = "1PAGE 0001  - NOW SET TO GLOBAL ZONE DATE 12/19/18  TIME 16:42:39  SMP/E 36.100  SMPLIST  OUTPUT          \r\n   \r\n   LIST SYSMOD(BA55492).                                                              \r\n1PAGE 0002  - NOW SET TO GLOBAL ZONE          DATE 12/19/18  TIME16:42:39  SMP/E 36.100  SMPLIST  OUTPUT                \r\n                                                \r\n GLOBAL   SYSMOD ENTRIES                                         \r\n                                  \r\n                           \r\n   NAME                                                                                                                  \r\n                                                                                    \r\n BA55492   TYPE            = APAR                \r\n           STATUS          = REC                                                                                         \r\n           REWORK          = 2018137                                                                         \r\n           DATE/TIME REC   = 18.347  13:18:20     \r\n           APPLY ZONE      = IPL320T                                                                                     \r\n           SREL   VER(001) = Z038                                                              \r\n           FMID   VER(001) = HDZ2230                                                                                     \r\n         PRE    VER(001) = UA93416                                                                                     \r\n           MOD             = IDCSS02                                                   \r\n           HOLDSYSTEM(INT) = RESTART(BA55492)                                                                            \r\n                                                                                                            \r\n1PAGE 0003  - NOW SET TO GLOBAL ZONE          DATE 12/19/18  TIME 16:42:39  SMP/E 36.100  SMPLIST  OUTPUT                \r\n                                                                                                                         \r\n LIST     SUMMARY REPORT FOR GLOBAL                                                                                      \r\n                             \r\n ENTRY-TYPE   ENTRY-NAME         STATUS                                                                                  \r\n                                                                                      \r\n SYSMOD       BA55492            STARTS ON PAGE 0002                  \r\n";
var sysmodName = "BA55492";
console.log("print------------");
// parseJoblog(jobLog, sysmodName)
  
//   .then(function printResult(sysmodName) {
//     var filePath = "./output/" + sysmodName + ".txt";
//     var linesArray = fs.readFileSync(filePath, 'utf8').split('\r\n')
//     console.log("before");
//     for (var i = 0; i < linesArray.length; i++) {
//       // Case that the sysmod has been installed in the system
//       if (linesArray[i].indexOf('TYPE            =') >= 0) {
//         while (linesArray[i].indexOf('NOW SET TO GLOBAL ZONE') < 0) {
//           console.log(linesArray[i]);
//           i++;
//         }
//       }
//       // Case that the sysmod has NOT been installed in the system
//       if (linesArray[i].indexOf('SYSMOD       ' + sysmodName + '            NOT FOUND') >= 0) {
//         console.log(linesArray[i]);
//       }

//     }
//     );
//   // printResult(sysmodName);

// one();
// two();
// three();
// parseJoblog(jobLog, sysmodName);
// printResult(sysmodName);


// function one(){setTimeout(function(){console.log("1111111111111"); 500}) }
// function two(){console.log("2222222222222");}
// function three(){console.log("33333333333333");}

// function doHW(subject,callback){
//   console.log('Starting my ' +subject+ ' homework.');
//   callback();
// }
// doHW('math', function(){console.log('Finish');});

printResult();

// function parseJoblog(jobLog, sysmodName) {
//   // var resultText = "=========================";
//   var filePath = "./output/" + sysmodName + ".txt";
//   fs.writeFile(filePath, jobLog, function (err) {
//     if (err) {
//       return console.log(err);
//     }
//     console.log("Jog log output was saved to file " + sysmodName + ".text.");
//   });
// }

function printResult() {
  // var filePath = "./output/" + sysmodName + ".txt";
  // var linesArray = fs.readFileSync(filePath, 'utf8').split('\r\n')
  var linesArray = jobLog.split(/\r\n/);
  var lineOutput=[];

  // for (var i = 0; i < linesArray.length; i++) {
  //   console.log(linesArray[i]);}
  for (var i = 0; i < linesArray.length; i++) {
    // Case that the sysmod has been installed in the system
    // console.log("inside");
    if (linesArray[i].indexOf('TYPE            =') >= 0) {
      while (linesArray[i].indexOf('NOW SET TO GLOBAL ZONE') < 0) {
        console.log(linesArray[i]);
        lineOutput.push(linesArray[i]);
        i++;
      }
    }
    // Case that the sysmod has NOT been installed in the system
    if (linesArray[i].indexOf('SYSMOD       ' + sysmodName + '            NOT FOUND') >= 0) {
      console.log(linesArray[i]);
      lineOutput.push(linesArray[i]);
      console.log("inside2");
    }
  }
  console.log("after");
  for (var i = 0; i < lineOutput.length; i++) {
  console.log("++++" +lineOutput[i]);}
  // return resultText;
}
