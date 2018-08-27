module.exports = {

    // if complete, returns complete(true,jobData)
    // if error, returns complete(0,err)
    waitForJobComplete(jobId,complete) {

        let loop = setInterval(function() {
            agent.get("/job/get?id="+jobId)
              .set('content-type','application/json; charset=utf-8')
              .end((err,res,body) => {
                  if (err) 
                     return complete(0,err);

                  //console.log(res.body);
                  var job = res.body;
                  console.log("job %s status = %s",jobId,job[0].state);
                  if (job[0].id !== jobId)
                      return complete(0,"job "+jobId+" does not exist");

                  if (job[0].state === "complete"){
                      clearInterval(loop);
                      console.log("complete job data",job[0])
                      return complete(true,job[0]);
                  }
                  else if (job[0].state === "error"){
                      clearInterval(loop);
                      console.log("*** error job data",job[0]);
                      return complete(0,"job completed in error");
                  }
              });
        },3000);
    }
}
