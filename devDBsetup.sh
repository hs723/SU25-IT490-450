#!/usr/bin/env bash

sudo apt update
sudo apt upgrade
sudo apt install zip
sudo apt install php
sudo apt install nano
sudo apt install composer
sudo apt install net-tools

sudo useradd hs723
sudo useradd cjs77
sudo useradd hc477
sudo useradd jams374
sudo useradd ry26

sudo apt install openssh-server
sudo systemctl enable openssh-server
sudo systemctl start openssh-server

sudo install php
sudo apt install php-mysql php-curl php-json php-mbstring php-xml php-zip php-gd

sudo apt install mysql-server
sudo systemctl enable mysql
sudo systemctl start mysql

wget https://github.com/MattToegel/IT490/archive/refs/heads/master.zip
unzip master.zip
cd IT490-master/
composer update

curl -fsSL https://tailscale.com/install.sh | sh && sudo tailscale up --auth-key=tskey-auth-k8SBY3JL2m11CNTRL-c2Z9y2oUipckWRYU3ZRhpcya3fX4msDvS \  --hostname=dev-db-404notfounders