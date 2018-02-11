# Deploys the project artifact to the www root

#!/bin/sh
rm -rf /var/www/html/*
cp target/Pelotas-assembly.tar.gz /var/www/html
cd /var/www/html
tar -zxvf Pelotas-assembly.tar.gz
rm Pelotas-assembly.tar.gz
