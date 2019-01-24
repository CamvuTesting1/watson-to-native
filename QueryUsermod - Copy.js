/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 */
'use strict';
var express 	= require('express'); // app server
var bodyParser 	= require('body-parser'); // parser for post requests

/**********************************************************************
 *  Variables for zos-node-accessor module 
 **********************************************************************/
var expect 	= require('chai').expect;
var fs 		= require('fs');
var path 	= require('path');
var sinon 	= require('sinon');
var Q 		= require('q');
var Client 	= require('zos-node-accessor');

var USERNAME 	= 'phamct'
var PASSWD 		= 'phongvu1'
var HOST 		= 'SSGMES3.tuc.stglabs.ibm.com'

var MAX_QUERIES = 1;          	// Query 10 times at most
var QUERY_INTERVAL = 2000;     	// 2 seconds
var client = new Client();
 
// QueryUserMods("UA97849");

// call QueryUmod action, call done with (error, result data)
function QueryUserMods(queryUmodfAction, callback) {

	var sysmodName = queryUmodfAction.parameters.UsermodPTF;
	var _client;
	var JCLjob = QrySysmodCurrent(sysmodName);
	console.log("---------After calling QrySysmodCurrent---- print JCLjob:  \n" + JCLjob);
    client.connect({user: USERNAME, password: PASSWD, host: HOST})
		.then(function (client) {
			//console.log("returning from client.connect....");
			_client = client;
				if (client.connected) {
					console.log('Connected to...', HOST);
					//return "Hello World conneted OK";
					//callback(null, "connection OK 1111");
					return client;
				} else {
					console.log('Failed to connect to', HOST);
					//return "Hello World conneted failed";
				}
			//console.log("Hello World rejected OK");
			//callback(null,"Connection failed...1234..");
			return Q.reject('Failed to connect to', HOST);
		} ) ;

	return SubmitQueryUsermod(client, JCLjob, callback);
}	// end: QueryUserMods

		
function SubmitQueryUsermod(client, JCLjob, callback) {

	submitJob(client, JCLjob).then(function (result) {
		
		console.log('SubmitQueryUsermod: '+result.jobName+' JobID...'+result.jobId);

		client.getJobLog(result.jobName, result.jobId, '7')
			.then(function (jobLog) {
					console.log('getJobLog: Job log output:' + jobLog);
					client.close();
					console.log('<=======================CLOSE CONNECTION=========================>');
					//jobLog = "getJoblog callback..."
					callback(null, jobLog);
					//return jobLog;	
			} )  
			} ).catch(function(err) { 
					console.log('QueryUserModsa(queryUmodfAction): returned an error');
					console.dir(error);
					callback(JSON.stringify(error.jobLog));
			}	)	;	 
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

	// function QrySysmodCurrent(sysmodname) {
	// 	var jcl = fs.readFileSync(path.join(__dirname, '/lib/JCL/QRYSYMOD1.jcl'), 'utf8');
	// 	console.log ("--- inside QrySysmodCurrent---- print jcl: \n"+ jcl);
	// 	jcl = jcl.replace('__QRYSYMOD__', sysmodname+'Q');
	// 	jcl = jcl.replace('__MSGCLASS__', 'H');
	// 	jcl = jcl.replace('__SYSMODNAME__', sysmodname);
	// 	return { jobName: sysmodname+'Q', jcl: jcl };
	// }

	function QrySysmodCurrent(sysmodname) {
		var jcl = "//__QRYSYMOD__ JOB ,NOTIFY=&SYSUID,CLASS=A,MSGLEVEL=(1,1),MSGCLASS=__MSGCLASS__ \n" +
		"//LISTMOD  EXEC SMPE \n" +                                                   
		"//SMPCSI   DD DISP=SHR,DSN=SMPE.&SYSR1..CSI \n" +                             
		"//SMPLOGA  DD DUMMY \n"+                                         
		"//SMPLOG   DD SYSOUT=* \n"+                                                 
		"//SMPLIST  DD SYSOUT=* \n"+                                                 
		"//SMPCNTL  DD * \n"       +                                                 
		"  SET BDY(GLOBAL) . \n"   +                                                 
		"  LIST SYSMOD(__SYSMODNAME__). \n"                                        
		
		jcl = jcl.replace('__QRYSYMOD__', sysmodname+'Q');
		jcl = jcl.replace('__MSGCLASS__', 'H');
		jcl = jcl.replace('__SYSMODNAME__', sysmodname);
		return { jobName: sysmodname+'Q', jcl: jcl };
	}


module.exports = {
	action: QueryUserMods
}
