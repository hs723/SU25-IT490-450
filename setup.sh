#/bin/bash

update_system() {
    sudo apt update
    sudo apt upgrade -y
}
install_php() {
    sudo apt install php -y
}
install_rabbitmq() {
    sudo apt install -y rabbitmq-server

    sudo systemctl enable rabbitmq-server
    sudo systemctl start rabbitmq-server
}
install_composer() {
    sudo apt install composer -y
}
install_nano() {
    sudo apt install nano
}
