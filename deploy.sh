#!/bin/bash

appName=4006app

tar czf $appName.tar.gz *.js *.json views
tsocks scp $appName.tar.gz pertti@188.166.168.161:/home/pertti/
rm $appName.tar.gz
# remote
tsocks ssh pertti@188.166.168.161 <<'ENDSSH'
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