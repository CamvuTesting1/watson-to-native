/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 */
'use strict';
var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests

/**********************************************************************
 *  Variables for zos-node-accessor module 
 **********************************************************************/
var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');
var sinon = require('sinon');
var Q = require('q');
var Client = require('zos-node-accessor');
var Paratree = require('paratree');

var USERNAME = 'phamct'
var PASSWD = 'phongvu2'
// var HOST 		= 'SSGMES2.tuc.stglabs.ibm.com'

var MAX_QUERIES = 10;          	// Query 10 times at most
var QUERY_INTERVAL = 2000;     	// 2 seconds
var client = new Client();

// QueryUserMods("UA97849");

// call QueryUmod action, call done with (error, result data)
function QueryUserMods(queryUmodfAction, callback) {
	var sysmodName = queryUmodfAction.parameters.usermodName;
	var HOST = queryUmodfAction.parameters.systemIP;
	var _client;
	var JCLjob = QrySysmodCurrent(sysmodName);
	console.log(sysmodName + '++++++++++++++++++++++++++++++++++++++++++++++++++++');
	console.log(HOST + '+++++++++++++++++++++++++++++++++++++++++++++');
	client.connect({ user: USERNAME, password: PASSWD, host: HOST })
		.then(function (client) {
			_client = client;
			if (client.connected) {
				console.log('Connected to...', HOST);
				return client;
			} else {
				console.log('Failed to connect to', HOST);
			}
			return Q.reject('Failed to connect to', HOST);
		});

	return SubmitQueryUsermod(client, JCLjob, callback);
}	// end: QueryUserMods


function SubmitQueryUsermod(client, JCLjob, callback) {

	submitJob(client, JCLjob).then(function (result) {

		console.log('SubmitQueryUsermod: ' + result.jobName + ' JobID...' + result.jobId);

		client.getJobLog(result.jobName, result.jobId, '6')
			.then(function (jobLog) {
				// console.log('getJobLog: Job log output:' + jobLog);
				client.close();
				console.log('<=======================CLOSE CONNECTION=========================>');

				/* This is a quick way to find a word in the sentence and print the sentence.*/
				// const para = new Paratree(jobLog);
				// console.log('para.sentences:' + para.sentences.text)
				// console.log('\npara parsing sentence : \n')
				// para.sentences.forEach(sentence => {
				// 	var index1 = sentence.text.indexOf('TYPE            =');
				// 	var index2 = sentence.text.indexOf('STATUS          =');
				// 	var array = [];
				// 	var indexNotFound = sentence.text.indexOf('NOT FOUND');
				// 	if (indexNotFound > -1) {
				// 		console.log('Found setence => ' + sentence.text);
				// 		callback(null, sentence.text);
				// 	}
				// 	if (index1 > -1) {
				// 		console.log('Found setence1 => ' + sentence.text);
				// 		array.push(sentence.text);
				// 	}
				// 	// 	if(index2 > -1 ) {
				// 	// 		console.log('Found setence2 => '+sentence.text);	
				// 	// 		array.push(sentence.text);	
				// 	// }		
				// 	console.log('Array: ' + array);
				// 	callback(null, array);
				// });

				callback(null, parsing(jobLog));

			})
	}).catch(function (err) {
		console.log('QueryUserModsa(queryUmodfAction): returned an error');
		console.dir(error);
		callback(JSON.stringify(error.jobLog));
	});
}

/***********************************************************************
 * Functions
 ***********************************************************************/
function submitJob(client, job) {
	var jcl = job.jcl.replace(/ADCDA/g, USERNAME);
	return client.submitJCL(jcl)
		.then(function (jobId) {
			console.log('Submitted: ', job.jobName, jobId);
			var deferred = Q.defer();
			setTimeout(function () {
				pollJCLJobStatus(deferred, client, job.jobName, jobId, MAX_QUERIES);
			}, QUERY_INTERVAL);
			return deferred.promise;
		});
}

function pollJCLJobStatus(deferred, client, jobName, jobId, timeOutCount) {
	if (timeOutCount === 0) {
		console.log('SetTimeout=0 now...');
		deferred.resolve(Client.RC_FAIL);
	}
	client.queryJob(jobName, jobId)
		.then(function (rc) {
			console.log(jobId, rc);		// JOBxxxxx Success or Failing
			if (rc === Client.RC_SUCCESS || rc === Client.RC_FAIL) {
				if (rc == Client.RC_SUCCESS) {
					console.log('pollJCLJobStatus->RC:' + rc);
				}
				deferred.resolve({ jobName: jobName, jobId: jobId, rc: rc });

			} else {
				setTimeout(function () {
					pollJCLJobStatus(deferred, client, jobName, jobId, timeOutCount - 1);
				}, QUERY_INTERVAL);
			}
		});
}

function QrySysmodCurrent(sysmodname) {
	var jcl = fs.readFileSync(path.join(__dirname, '/lib/JCL/QRYSYMOD1.jcl'), 'utf8');
	jcl = jcl.replace('__QRYSYMOD__', sysmodname + 'Q');
	jcl = jcl.replace('__MSGCLASS__', 'H');
	jcl = jcl.replace('__SYSMODNAME__', sysmodname);
	return { jobName: sysmodname + 'Q', jcl: jcl };
}

function parsing(jobString) {
	var linesArray = jobString.split(/\r?\n/);
	for (var i = 0; i < linesArray.length; i++) {
		console.log("-----" + linesArray[i]);
	}

	var lineOutput = [];
	for (var i = 0; i < linesArray.length; i++) {
		// Case that the sysmod has been installed in the system
		if (linesArray[i].indexOf('TYPE            =') >= 0) {
			while (linesArray[i].indexOf('NOW SET TO GLOBAL ZONE') < 0) {
				console.log("++++++++" + linesArray[i]);
				lineOutput.push(linesArray[i]);
				i++;
			}
		}
		// Case that the sysmod has not been installed in the system
		if (linesArray[i].indexOf('NOT FOUND') >= 0) {
			console.log("++++++++" + linesArray[i]);
			lineOutput.push(linesArray[i]);
		}

	}
	var textResult = lineOutput.join('<br>');

	return textResult;
}

module.exports = {
	action: QueryUserMods
}
