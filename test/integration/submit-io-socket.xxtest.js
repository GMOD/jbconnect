var socketIOClient = require('socket.io-client');
var sailsIOClient = require('sails.io.js');

var io = sailsIOClient(socketIOClient);

io.sails.url = 'http://localhost:1337';


describe('socket request', function () {

    it ('/loginstate test', function (done) {
        io.socket.post('/auth/local', { identifier: 'juser', password: 'password' }, function (data, res) {
            console.log('login response data: ', data);
            console.log('login res headers: ', res.headers);
            console.log('login res status code: ', res.statusCode);
            assert.equal(res.statusCode, 200);

            io.socket.get('/loginstate', function serverResponded (data, res) {
              // body === JWR.body
              console.log('Sails responded with: ', data);
              console.log('with headers: ', res.headers);
              console.log('and with status code: ', res.statusCode);

              setTimeout(function() {
                  io.socket.disconnect();
                  done();
                  
              });
        });
            
        });
    });
//    it ('passport-local authentication should succeed if user and password valid', function (done) {
//
//        //var client = io.connect(server, options);
//        //let io = require('socket.io-client')(server,options);
//
//        //io.on('connect', function(data){
//            //console.log(">>> connect detected", data);
//
//            
//            io.socket.post('/auth/local', { identifier: 'juser', password: 'password' }, function (data, res) {
//                assert.equal(res.statusCode, 200);
//                done();  
//            });
//            
//            
//            
//            //done();
//        //});
//
//    });
});
