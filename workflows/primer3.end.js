/*
 * complete primer3 processing 
 * primer3.end.js <jobDataFile> <primer3.out> <prier3.gff3>
 */

// convert output file to 

const fs = require('fs-extra');
const jblib = require('../api/services/jbutillib');
const util = require('./primer3.utils');
const replaceall = require ('replaceall');
var iniParser = require("config-ini-parser").ConfigIniParser;
let getopt = require('node-getopt');


let options= [
    ['h','help', 'display this help']
];

let opt = new getopt(options);
opt.parseSystem();
let argv = opt.parsedOption.argv;

console.log('> primer3.end',argv[0],argv[1],argv[2]);

try {
    console.log("cwd",process.cwd());
    // insert sequence into primer3 template
    let jobdata = JSON.parse(fs.readFileSync(argv[0], 'utf8'));

    let seq = util.parseSeqData(jobdata.region);
    let start = parseInt(util.getRegionStart(jobdata.region),10);   // todo: use wider int

    console.log(start,seq);

    let primer3out = fs.readFileSync(argv[1], 'utf8');
    primer3out = primer3out.replace('=\n','');  // remove list terminator

    console.log('out',primer3out);

    parser = new iniParser();
    parser.parse(primer3out); 

    let pairs = parseInt(parser.get("", "PRIMER_PAIR_NUM_RETURNED"),10);
    console.log("PRIMER_PAIR_NUM_RETURNED",pairs);


    let gff = "";
    for(let i=0;i<pairs;i++) {
        let lval = parser.get("", "PRIMER_LEFT_"+i).split(',');
        let rval = parser.get("", "PRIMER_RIGHT_"+i).split(',');
        

        gff +=  seq.seq + '\t'
                + "primer3" + '\t'
                + "primer" + '\t'
                + (0+start+parseInt(lval[0],10)) +'\t'
                + (0+start+parseInt(rval[1],10)+parseInt(rval[0],10)) +'\t'
                + ".\t.\t.\t"
                + 'ID=PRIMER_PAIR_'+i + ';Name=PRIMER_PAIR_'+i + '\t'
                + '\n';
        gff +=  seq.seq + '\t'
                + "primer3" + '\t'
                + "primer" + '\t'
                + (0+start+parseInt(lval[0],10)) +'\t'
                + (0+start+parseInt(lval[1],10)+parseInt(lval[0],10)) +'\t'
                + ".\t.\t.\t"
                + 'ID=PRIMER_LEFT_'+i
                    +';Parent=PRIMER_PAIR_'+i 
                    +';Name=PRIMER_LEFT_'+i +'\t'
                + '\n';
        gff +=  seq.seq + '\t'
                + "primer3" + '\t'
                + "primer" + '\t'
                + (0+start+parseInt(rval[0],10)) + '\t'
                + (0+start+parseInt(rval[1],10)+parseInt(rval[0],10)) + '\t'
                + ".\t.\t.\t"
                + 'ID=PRIMER_RIGHT_'+i
                    +';Parent=PRIMER_PAIR_'+i 
                    +';Name=PRIMER_RIGHT_'+i + '\t'
                + '\n';

        //console.log('primer '+i,
        //    seq.seq,start+parseInt(lval[0],10), start+parseInt(lval[1],10)+parseInt(lval[0],10), 
        //    seq.seq,start+parseInt(rval[0],10), start+parseInt(rval[1],10)+parseInt(rval[0],10)
        //);

        fs.writeFileSync(argv[2],gff);
    }

    //fs.writeFileSync(argv[2],parser);
    process.exit(0);
}
catch(err) {
    console.error(err);
    process.exit(1);
}

