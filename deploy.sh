#!/bin/bash

appName=4006app
host=167.99.83.62

tar czf $appName.tar.gz *.js *.json views *.pub *.key
tsocks scp $appName.tar.gz pertti@$host:~
rm $appName.tar.gz
# remote
tsocks ssh pertti@$host<<'ENDSSH'
# variable uuesti, remote jaoks
appName=4006app
rm -rf $appName
mkdir $appName
tar xzf $appName.tar.gz -C $appName
rm $appName.tar.gz
cd $appName
yarn install
pm2 start $appName
ENDSSH