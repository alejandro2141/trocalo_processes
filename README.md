# trocalo_processes

1.- nodemailer require configuration
~/.aws/credentials

2.- in credentials file you have to provide aws or email provided credentials
[default]
aws_access_key_id = ZX6HYCD6WJ....
aws_secret_access_key = 6P/yLDoQuVy....
 
# CRON PROCESSES REQUIRED FOR BACKEND


#CRON PROCESS FOR INTERCAMBIAR
#/home/ubuntu/trocalo_processes
#/home/ubuntu/.nvm/versions/node/v18.14.0/bin/node

*/1 * * * * /home/ubuntu/.nvm/versions/node/v18.14.0/bin/node /home/ubuntu/trocalo_processes/0001_register_send_email_confirmation.js  >> /var/log/intercambiarlog/last.log
*/1 * * * * /home/ubuntu/.nvm/versions/node/v18.14.0/bin/node /home/ubuntu/trocalo_processes/0002_notification_new_proposal_source.js  >> /var/log/intercambiarlog/last.log
*/1 * * * * /home/ubuntu/.nvm/versions/node/v18.14.0/bin/node /home/ubuntu/trocalo_processes/0003_notification_new_proposal_destination.js  >> /var/log/intercambiarlog/last.log
*/1 * * * * /home/ubuntu/.nvm/versions/node/v18.14.0/bin/node /home/ubuntu/trocalo_processes/0004_notification_proposal_accepted_destination.js  >> /var/log/intercambiarlog/last.log
*/1 * * * * /home/ubuntu/.nvm/versions/node/v18.14.0/bin/node /home/ubuntu/trocalo_processes/0005_notification_proposal_accepted_source.js  >> /var/log/intercambiarlog/last.log
*/1 * * * * /home/ubuntu/.nvm/versions/node/v18.14.0/bin/node /home/ubuntu/trocalo_processes/0006_notification_proposal_accepted_source.js  >> /var/log/intercambiarlog/last.log
*/1 * * * * /home/ubuntu/.nvm/versions/node/v18.14.0/bin/node /home/ubuntu/trocalo_processes/0007_notification_proposal_inTransfer_source.js  >> /var/log/intercambiarlog/last.log
*/1 * * * * /home/ubuntu/.nvm/versions/node/v18.14.0/bin/node /home/ubuntu/trocalo_processes/00011_expire_proposals.js  >> /var/log/intercambiarlog/last.log
*/1 * * * * /home/ubuntu/.nvm/versions/node/v18.14.0/bin/node /home/ubuntu/trocalo_processes/00012_expire_proposals_accepted.js  >> /var/log/intercambiarlog/last.log