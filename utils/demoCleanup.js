
const _ = require("lodash");
const chai = require('chai')
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const server = 'http://localhost:1337';

        
    // this preserves session data for subsequent calls
    let agent = chai.request.agent(server);


    agent
	.post('/auth/local?next=/loginstate')
	.set('content-type', 'application/x-www-form-urlencoded; application/json; charset=utf-8')
	.send({
	  'identifier':'juser',
	  'password':'password',
	  'submit':'login'
	})
	.type('form')
	.end((err,res,body) => {
		if (err) {
			console.log ("login error",err.code);
			if (err.code === 'ECONNREFUSED') 
				console.log('Is jbconnect running?');
			return;
		}
		console.log(res.body);
		
		agent
		.post("/util/democleanup")
		.end((err,res,body) => {
			if (err) {
				console.log ("democleanup error",err.code);
				return;
			}
			if (res.status !== 200)
			//console.log('err',err);
			console.log('/democleanup status',res.status);
			
		});
		
	});




