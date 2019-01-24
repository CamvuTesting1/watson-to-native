/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';
var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var AssistantV1 = require('watson-developer-cloud/assistant/v1'); // watson sdk
var app = express();

/**********************************************************************
 *  Variables for zos-node-accessor module 
 **********************************************************************/
var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');
var sinon = require('sinon');
var Q = require('q');
var Client = require('zos-node-accessor');

var USERNAME = 'PHAMCT'
var PASSWD = 'PHONGVU9'
var HOST = 'SSGMES3.tuc.stglabs.ibm.com'

var MAX_QUERIES = 10;           // Query 10 times at most
var QUERY_INTERVAL = 2000;      // 2 seconds

var client = new Client();

//Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json());
//Create the service wrapper
var assistant = new AssistantV1({
	version: '2018-07-10'
});
//Endpoint to be call from the client side
app.post('/api/message', function (req, res) {
	var workspace = process.env.WORKSPACE_ID || '<workspace-id>';
	if (!workspace || workspace === '<workspace-id>') {
		return res.json({
			'output': {
				'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/watson-developer-cloud/assistant-simple">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/watson-developer-cloud/assistant-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
			}
		});
	}
	//	var context = {};
	//	context.Usermod = '';
	var payload = {
		workspace_id: workspace,
		context: req.body.context || {},
		input: req.body.input || {}
	};
	var responseText = null;
	//	Send the input to the assistant service
	assistant.message(payload, function (err, data) {
		if (err) {
			return res.status(err.code || 500).json(err);
		}
		return res.json(updateMessage(payload, data));
	});
});
/**
 * Updates the response text using the intent confidence
 * @param {Object} input The request to the Assistant service
 * @param {Object} response The response from the Assistant service
 * @return {Object} The response with the updated message
 */

function updateMessage(input, response) {
	//	response.output.text = 'I understood your intention.';
	if (input.input.text) {
		//		input.context.Usermod = input.input.text;
		response.output.generic[0].text = 'Looking up ' + input.input.text + ' ...';
		response.context.UsermodStatus = 'Successfully installed ' + response.context.Usermod;
		console.log('Watson input:', input.input.text);
		console.log('Watson context MES1 :', response.context.MES1);
		console.log('Watson context MES2 :', response.context.MES2);
		console.log('Watson context MES3 :', response.context.MES3);
		console.log('Watson context Usermod PTF:', response.context.UsermodPTF);
		console.log('Watson context Usermod APAR 21:', response.context.UsermodAPAR);
		console.log('Watson context Usermod APAR 23:', response.context.UsermodAPAR23);
		console.log('Watson input:', input.input.text);

		// console.log('Watson output:', response.context); 
		console.log('SYSMOD name:', response.context.UsermodAPAR23);
		console.log('SYSMOD name:', sysmodName);

		// var expect = require('chai').expect;
		// var fs = require('fs');
		// var path = require('path');
		// var sinon = require('sinon');
		// var Q = require('q');
		// var Client = require('zos-node-accessor');

		// var USERNAME = 'PHAMCT' 
		// var PASSWD = 'PHONGVU9' 
		// var HOST = 'SSGMES3.tuc.stglabs.ibm.com' 

		// var MAX_QUERIES = 10;           // Query 10 times at most
		// var QUERY_INTERVAL = 2000;      // 2 seconds


		// var client = new Client();
		if (response.context.UsermodAPAR23) {
			var sysmodName = response.context.UsermodAPAR23;
			console.log('***************************************************');
			console.log('Connecting ...');
			client.connect({ user: USERNAME, password: PASSWD, host: HOST });
			// console.log('Run ALLOC job 1 ...');
			// var job1 = ALLOC(getDSNWithQuotes('NODEACC.TT3'));
			// submitJob(client, job1);
			// console.log('Run ALLOC job 2 ...');
			// var job2 = ALLOC(getDSNWithQuotes('NODEACC.TT4'));
			// submitJob(client, job2);
			// console.log('List Data set ...');
			// client.listDataset(getDSN('NODEACC.TT*'));
			// console.log('Delete Data set 1...');
			// client.deleteDataset(getDSNWithQuotes('NODEACC.TT3'));
			// console.log('Delete Data set 2...');
			// client.deleteDataset(getDSNWithQuotes('NODEACC.TT4'));
			// client.listDataset(getDSN('NODEACC.TT*'));

			console.log('Query...');
			var JCLjob = QrySysmodCurrent(sysmodName);
			// submitJob2(client, JCLjob);
			submitJob(client, JCLjob);

/***********************************************************************
 * Functions
 ***********************************************************************/
// function submitJob2(client, job) {
// 	var jcl = job.jcl;
// 	return client.submitJCL(jcl)
// 	.then(function (jobId) {
// 		console.log('Submitted ', job.jobName, jobId);
// 		client.getJobLog('BA55525Q', jobId, '6').then(function (log) {
// 			console.log('Job log output:' + log);
			
// 		});
// 		var deferred = Q.defer();
// 		setTimeout(function() {
// 			pollJCLJobStatus(deferred, client, job.jobName, jobId, MAX_QUERIES);
// 		}, QUERY_INTERVAL);
// 		return deferred.promise;
// 	});
// }

function submitJob(client, job) {
	var jcl = job.jcl.replace(/ADCDA/g, USERNAME);
	return client.submitJCL(jcl)
		.then(function (jobId) {
			console.log('Submitted ', job.jobName, jobId);
			console.log('Job ID:', jobId);
			client.getJobLog(sysmodName + 'Q', jobId, '6')
				.then(function (jobLog) {
					console.log('Job log output:' + jobLog);
					// console.log('111111111111111111111111111111111111111111');
					// console.log(jobLog.text);
					// console.log('111111111111111111111111111111111111111111');
					var fs = require('fs');
					fs.writeFile("/output/output.txt", jobLog, function (err) {
						if (err) {
							return console.log(err);
						}
					
					console.log("Jog log output was saved to file output.text.");
					
					}
					);


					var string=jobLog.toString();
					var linesArray = string.split('\r\n');
					for (var i = 0; i < linesArray.length; i++) {
						if (linesArray[i].indexOf('BA55525   TYPE            =') >= 0) {
						  while (linesArray[i].indexOf('NOW SET TO GLOBAL ZONE') < 0){
							console.log(linesArray[i]);
							i++;
						  }
						}}
				})
			console.log('+++++++++++++++++++++');

			var linesArray = fs.readFileSync('/output/output.txt', 'utf8').split('\r\n') 
			for (var i = 0; i < linesArray.length; i++) {
			  if (linesArray[i].indexOf('BA55525   TYPE            =') >= 0) {
				while (linesArray[i].indexOf('NOW SET TO GLOBAL ZONE') < 0){
				  console.log(linesArray[i]);
				  i++;
				}
			  }
			}
			  // res.json("iteration " + i);
			  // res.json('name:' + linesArray[i].name + linesArray[i].address);
			// }
			var deferred = Q.defer();
			setTimeout(function () {
				pollJCLJobStatus(deferred, client, job.jobName, jobId, MAX_QUERIES);
			}, QUERY_INTERVAL);
			return deferred.promise;
		});
	}
	
function QrySysmodCurrent(sysmodname) {
	var jcl = fs.readFileSync(path.join(__dirname, '/lib/JCL/QRYSYMOD1.jcl'), 'utf8');
	jcl = jcl.replace('__QRYSYMOD__', sysmodname+'Q');
	jcl = jcl.replace('__MSGCLASS__', 'H');
	jcl = jcl.replace('__SYSMODNAME__', sysmodname);
	return { jobName: sysmodname+'Q', jcl: jcl };
}

function QrySysmodInactive(sysmodname) {
	var jcl = fs.readFileSync(path.join(__dirname, '/lib/JCL/QRYSYMOD2.jcl'), 'utf8');
	jcl = jcl.replace('__QRYSYMOD__', sysmodname+'Q');
	jcl = jcl.replace('__MSGCLASS__', 'H');
	jcl = jcl.replace('__SYSMODNAME__', sysmodname);
	return { jobName: sysmodname+'Q', jcl: jcl };
}

function pollJCLJobStatus(deferred, client, jobName, jobId, timeOutCount) {
	if (timeOutCount === 0) {
		deferred.resolve(Client.RC_FAIL);
	}

	client.queryJob(jobName, jobId)
		.then(function (rc) {
			console.log(jobId, rc);
			if (rc === Client.RC_SUCCESS || rc === Client.RC_FAIL) {
				deferred.resolve({ jobName: jobName, jobId: jobId, rc: rc });
			} else {
				setTimeout(function () {
					pollJCLJobStatus(deferred, client, jobName, jobId, timeOutCount - 1);
				}, QUERY_INTERVAL);
			}
		});
}

			// function getDSN(name) {
			// 	return USERNAME.toUpperCase() + '.' + name;
			// }

			// function getDSNWithQuotes(name) {
			// 	return '\'' + USERNAME.toUpperCase() + '.' + name + '\'';
			// }
			
			// function ALLOC(dsn) {
			// 	var jcl = fs.readFileSync(path.join(__dirname, '../lib/JCL/ALLOC.jcl'), 'utf8');
			// 	jcl = jcl.replace('__MSGCLASS__', 'H');
			// 	jcl = jcl.replace('__DSN__', dsn);
			// 	jcl = jcl.replace('__SPACE__', '1,1');
			// 	jcl = jcl.replace('__UNIT__', 'TRACK');
			// 	jcl = jcl.replace('__BLKSIZE__', '1280');
			// 	jcl = jcl.replace('__LRECL__', '80');
			// 	jcl = jcl.replace('__DSORG__', 'PS');
			// 	jcl = jcl.replace('__RECFM__', 'F,B');
			// 	return { jobName: 'ALLOC', jcl: jcl };
			// }

			// function ALLOCPDS() {
			// 	var jcl = fs.readFileSync(path.join(__dirname, '../lib/JCL/ALLOCPDS.jcl'), 'utf8');
			// 	jcl = jcl.replace('__MSGCLASS__', 'H');
			// 	jcl = jcl.replace('__DSN__', '\'ADCDA.TESTALLP\'');
			// 	return { jobName: 'ALLOCPDS', jcl: jcl };
			// }

		}


	}

	if (!response.output) {
		response.output = {};
	} else {
		console.log('Watson replies (printing response.output.text):', response.output.text);
	//return response;
	}

	if (response.intents && response.intents[0]) {
		var intent = response.intents[0];
		//		Depending on the confidence of the response the app can return different messages.
		//		The confidence will vary depending on how well the system is trained. The service will always try to assign
		//		a class/intent to the input. If the confidence is low, then it suggests the service is unsure of the
		//		user's intent . In these cases it is usually best to return a disambiguation message
		//		('I did not understand your intent, please rephrase your question', etc..)
		if (intent.confidence >= 0.75) {
			responseText = 'I understood your intent was ' + intent.intent;
		} else if (intent.confidence >= 0.5) {
			responseText = 'I think your intent was ' + intent.intent;
		} else {
			responseText = 'I did not understand your intent';
		}
	}
	response.output.text = responseText;
	return response;
}

module.exports = app;

 