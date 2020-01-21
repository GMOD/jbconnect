# cmd <id> <jobid> <jobdata> <tmpdir> <outdir>
echo "> primer3.wf " $0 $1 $2 $3 $4 $5

# create primer3 config record from jobdata
node ./workflows/primer3.prep.js $3 "$4/$2.rec"

# process primer3
/home/ericiam/primer3/src/primer3_core < "$4/$2.rec" > "$4/$2.out"

# translate primer3 output to gff3 in target directory
node ./workflows/primer3.end.js $3 "$4/$2.out" "$5/$2.gff3"