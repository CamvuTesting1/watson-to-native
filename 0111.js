submitJob(client, JCLjob).then(function (result) {	
    console.log('SubmitQueryUsermod: '+result.jobName+' JobID...'+result.jobId);
    client.getJobLog(result.jobName, result.jobId, '7')
        .then(function (jobLog) {
                console.log('getJobLog: Job log output:' + jobLog);
                client.close();
                console.log('<=======================CLOSE CONNECTION=========================>');

                /* This is a quick way to find a word in the sentence and print the sentence.*/
                const para = new Paratree(jobLog);
                console.log('\npara parsing sentence : \n')
                para.sentences.forEach(sentence => {
                    var index = sentence.text.indexOf('THE HIGHEST RETURN CODE ');	
                    if(index > -1 ) {
                        console.log('Found setence => '+sentence.text);	
                        callback(null, sentence.text);	
                    }		
                });

        } )  
        } ).catch(function(err) { 
                console.log('QueryUserModsa(queryUmodfAction): returned an error');
                console.dir(error);
                callback(JSON.stringify(error.jobLog));
        }	)	;	 
}