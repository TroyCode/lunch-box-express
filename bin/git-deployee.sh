#!/bin/bash
mkdir -p /opt
cd /opt

sudo yum -y update

# install nodejs
curl --silent --location https://rpm.nodesource.com/setup_6.x | sudo bash -
sudo yum install -y nodejs git 

# clone from github
git clone https://github.com/TroyCode/lunch-box-express.git
cd lunch-box-express

npm install

# env varibles
export db_host=''
export db_user=''
export db_password=''
export db_name=''

# Redirect 8888 to 3000
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8888

npm start