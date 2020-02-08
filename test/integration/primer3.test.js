const approot = require('app-root-path');
const tlib = require(approot+'/test/share/test-lib');
const chai = require('chai')
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const server = 'http://localhost:1337';
const expect = chai.expect;
const assert = chai.assert;

describe('Primer3 integration test', function(){
    this.timeout(240000);
    it('login', function(done) {
        
        //let app = sails.hooks.http.app;
        agent = chai.request.agent(server);

        agent
          .post('/auth/local?next=/jbrowse')
          .set('content-type', 'application/x-www-form-urlencoded; application/json; charset=utf-8')
          .send({
              'identifier':'juser',
              'password':'password',
              'submit':'login'
          })
          .type('form')
          .end((err,res) => {
                expect(res).to.have.status(200);
        
                agent
                  .get('/loginstate')
                  .set('content-type','application/json; charset=utf-8')
                  .end((err,res) => {
                     console.log('/loginstate body',res.body);
                     expect(res).to.have.status(200, '/loginstate status 200');
                     expect(res.body.loginstate).to.equal(true, 'login state true');
                     expect(res.body.user.username).to.equal('juser','login username is juser');

                     done();
                  });
          });
    });
    it('primer3 get_workflows api',function(done) {
        let conf = sails.config.globals.jbrowse.services;

        agent
            .get('/service/exec/get_workflows:workflow?dataset=sample_data/json/volvox&module=JBPrimer3')
            .set('content-type','application/json; charset=utf-8')
            .end((err,res) => {
                expect(res).to.have.status(200, '/get_workflows api status 200');
                let data = res.body;
                //console.log("return data: ",data);
                expect(data.length).to.not.equal(0,'get_workflow returns array > 0');
                expect(data[0].id).to.equal('primer3.p3.wf.sh','id[0] is not primer3.p3.wf.js');
                done();
            });
    });
    describe('submit primer3 test', function(){
        it('should submit primer3', function(done) {
            let conf = sails.config.globals.jbrowse.services;
            let isGalaxy = (conf.galaxyService && conf.galaxyService.enable===true) ? true : false;

            let ds = Dataset.Resolve('sample_data/json/volvox');      
            
            let testWorkflow = 'primer3.p3.wf.sh';
            let testRegion = ">ctgA ctgA:7294..7962 length=669\n"+
            'aactccagcgtgcttagtgcaggcggagaacgtccgttcagtggtgcgtgctttatttttcaatctgacccgacctgc\n'+
            'gctcaagggttgcaagttgttgtgcgcccgagtaataggcgactcgtcgcaatgggtctggtacattgcattttcatc\n'+
            'ggtacggcgcttcataaagtgcggcaaatttctcaccccagtactcatgtttatagggtatcaggacccgaagcttct\n'+
            'ctgttccaaagaaatgtactgtttggctcccctgtccatattggaggtagatcacttgtggattatgcaatgaatgaa\n'+
            'tgaaagtttggtgctccccaccggggcgctctcaaagagagtgagctaaatttgaacatttaaattgctattccaacc\n'+
            'cggagtcctgaccggaacagtaatgaaacttcaaccatgccggacagactagaagaagggaaagttgcttgtatatgg\n'+
            'gagtaaaaatgatgttggtgccgtaatggtgccggaagtgactatagagcatgtcgtgacgcaccggtaggcagtgct\n'+
            'ataatcgtatgtccttcaggcgccgccggacctacgaagctgaaattagacaccggcacactagccccgtcagcgacg\n'+
            'gtgcgcggccgctgccctgcagcgaatggggctaacacgcataaa';


            agent
            .post('/job/submit')
            .send({
                'service': 'workflow',
                'dataset':ds.path,
                'region': testRegion,
                'workflow':testWorkflow,
                'trackData': {
                    'testtrack':true
                }
            })
            .end((err,res) => {
                    console.log('/job/submit status',res.status);
                    expect(res).to.have.status(200);
                    console.log('/job/submit body',res.body);
                    let jobId = res.body.jobId;
                    console.log("Job id=",jobId);
                    
                    tlib.waitForJobComplete(jobId,function(complete,data){
                        
                        expect(complete).to.equal(true);
                        expect(data.state).to.equal('complete','job should be completed');
                        
                        expect(data.data.track,"should have a result track").to.not.be.undefined;

                        let trackLabel = data.data.track.label;
                        let lkey = trackLabel+'|'+ds.id;
                        console.log("lkey = ",lkey);
                        
                        //done();
                        
                        agent.get("/track/get?lkey="+lkey)
                        .set('content-type','application/json; charset=utf-8')
                        .end((err,res,body) => {
                            let trackData = res.body[0];
                            console.log("track data",trackData);
                            
                            expect(res).to.have.status(200,'/track/get status 200');
                            expect(trackData.trackData.jblast).to.equal(1,'the new track jblast field should be 1');
                            expect(trackData.trackData.label).to.equal(trackLabel,'track label verify '+trackLabel);
                            expect(trackData.lkey).to.equal(trackLabel+'|'+ds.id,'lkey verify'+trackData.lkey);

                            done();
                        });
                    });
            });
        });
    });
});