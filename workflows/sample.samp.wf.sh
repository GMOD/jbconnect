# cmd <id> <jobid> <jobdata> <tmpdir> <outdir>
echo "> my.sample.wf.sh " $0 $1 $2 $3 $4 $5

# copy sample.gff3 to target dir
cp ./bin/sample.gff3 "$5/$2.gff3"

# extract value of CUSTOM_DATA
MYVALUE=$(awk -v k=CUSTOM_DATA -F: '/{|}/{next}{gsub(/^ +|,$/,"");gsub(/"/,"");if($1==k)print $2}' $3)

# add CUSTOM_DATA=MYVALUE as attribute to all features
sed -e "s/$/;CUSTOM_DATA=$MYVALUE/" -i "$5/$2.gff3"
