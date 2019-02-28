
const _ = require("lodash");
const chai = require('chai')
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const server = 'http://localhost:1337';

        
    // this preserves session data for subsequent calls
    agent = chai.request.agent(server);

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
			console.log ("login error",err.status);
			return;
		}
		console.log(res.body);
		
		agent
		.get("/democleanup")
		.end((err,res) => {
			if (err) {
				console.log ("democleanup error",err.status);
				return;
			}
			console.log(res.body);
			
		});
		
	});




