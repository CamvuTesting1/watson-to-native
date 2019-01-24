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

var USERNAME = 'PHAMCT'
var PASSWD = 'PHONGVU9'
var HOST = 'SSGMES3.tuc.stglabs.ibm.com'

var MAX_QUERIES = 1;          	// Query 10 times at most
var QUERY_INTERVAL = 2000;     	// 2 seconds
var QueryJobOutput;
var myjobID;
var client = new Client();
 
	//	response.output.text = 'I understood your intention.';
	// if (1) {
		 
	// 	if (1) {
			var sysmodName = 'BA55054';
			console.log('Connecting ...');
			client.connect({ user: USERNAME, password: PASSWD, host: HOST });
			 
			console.log('Query...');
			var JCLjob = QrySysmodCurrent(sysmodName);
			//submitJob(client, JCLjob);


			 
			submitJob(client, JCLjob).then(function (result) {
				console.log('submitJob returned...GetJobLog: '+sysmodName+'Q  JobID...'+result.jobId);	
				
				client.getJobLog(sysmodName+'Q', result.jobId, '6')
				.then(function (jobLog) {
					console.log('Job log output:' + jobLog);
				})  
				
				done();
				expect(result.rc).to.be.equal(Client.RC_SUCCESS);
				}).catch(function(err) {
				done(err);
			});
			
			
 
    //     }
	// }

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
				if(rc==Client.RC_SUCCESS) {
					console.log('pollJCLJobStatus->RC:'+rc);
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
	jcl = jcl.replace('__QRYSYMOD__', sysmodname+'Q');
	jcl = jcl.replace('__MSGCLASS__', 'H');
	jcl = jcl.replace('__SYSMODNAME__', sysmodname);
	return { jobName: sysmodname+'Q', jcl: jcl };
}

function QrySysmodInactive(sysmodname) {
	var jcl = fs.readFileSync(path.join(__dirname, '../lib/JCL/QRYSYMOD2.jcl'), 'utf8');
	jcl = jcl.replace('__QRYSYMOD__', sysmodname+'Q');
	jcl = jcl.replace('__MSGCLASS__', 'H');
	jcl = jcl.replace('__SYSMODNAME__', sysmodname);
	return { jobName: sysmodname+'Q', jcl: jcl };
}


 