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

var USERNAME = 'TRINHNG'
var PASSWD = 'CUU9CHIN'
var HOST = 'SSGMES3.tuc.stglabs.ibm.com'

var MAX_QUERIES = 10;           // Query 10 times at most
var QUERY_INTERVAL = 2000;      // 2 seconds

var client = new Client();

	//	response.output.text = 'I understood your intention.';
	if (1) {

		if (1) {
			var sysmodName = 'BA55525';
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
			//submitJob2(client, JCLjob);
            submitJob(client, JCLjob);
        }


    }

/***********************************************************************
 * Functions
 ***********************************************************************/
 function submitJob(client, job) {
	var jcl = job.jcl.replace(/ADCDA/g, USERNAME);
	return client.submitJCL(jcl)
		.then(function (jobId) {
			console.log('Submitted ', job.jobName, jobId);
			console.log('Job ID:', jobId);
			client.getJobLog(sysmodName, jobId, 'x')
				.then(function (jobLog) {
                    console.log('Job log output:' + jobLog);
				})
			console.log('+++++++++++++++++++++');

			var deferred = Q.defer();
			setTimeout(function () {
				pollJCLJobStatus(deferred, client, job.jobName, jobId, MAX_QUERIES);
            }, QUERY_INTERVAL);



			return deferred.promise;
		});
	}

function QrySysmodCurrent(sysmodname) {
	var jcl = fs.readFileSync(path.join(__dirname, '/node_modules/zos-node-accessor/lib/JCL/QRYMOD1.jcl'), 'utf8');
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