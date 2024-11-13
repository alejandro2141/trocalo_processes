//****************************************************  
//     SEND INVITATION  
//****************************************************

/*
// SCRIPT REQUIRE set {home} .aws/credentials 
[default]
aws_access_key_id = 
aws_secret_access_key = 
*/

require(__dirname+'/config_backend_process');

//let environment = "http://localhost:3000"
//let template ="./email_appointments_recover.html"
let html_template = new String() 
let specialties = new Array() 
let locations = new Array() 
let today = new Date()
today.setHours(0,0,0,0)

const { Pool, Client } = require('pg')
let email_invitation_list = new Array() 
var fs = require('fs');
//global variables 
let cdate=new Date()
let conn_data = {
  user: 'trocalo_user',
  host: '127.0.0.1',
  database: 'trocalodb',
  password: 'trocalo_pass',
  port: 5432,
    }
//************************

let response = main();


//************************************************** 
//*********    MAIN()  ASYNC           *************** 
//************************************************** 
async function  main()
{

try { 

html_template = await readHTMLFile(__dirname+"/0008_notification_recover_password.html")
//  STEP 1 Get appointments require recover appointments taken
let emails = await getEmailsRecover()

/*
// STEP 2 Get User Names 
let users_ids = emails.map( item => ( item.user_id )  )   ;  
console.log ("USER ID LIST :"+users_ids)

let user_names_list = await getUserNames(users_ids)
console.log ("USER NAMES LIST :"+ JSON.stringify(user_names_list) )
*/

if (emails != null && emails.length > 0 )
{
  console.log (cdate.toLocaleString()+":S0008:INFO:SEND RECOVER PASSWORD EMAILS: "+JSON.stringify(emails) )

    // WHILE  STEP 2 Get all appointments registered for each email
    for (let i = 0; i < emails.length ; i++) {
        
        let register = { 
                'email' : emails[i].email , 
                'message' : "<h1></h1>", 
                'subject' : "REUSAR.CL Restablecer tu Contraseña "
             }
        register.message = await buildHtmlMessage(html_template,emails[i].email)
        email_invitation_list.push(register)       
      } //END FOR CYCLE 

     for (let i = 0; i < email_invitation_list.length ; i++)
      {
        console.log("S0008:INFO email Recover Passwd to be send to :"+JSON.stringify(email_invitation_list[i])+"  "  )
         await sendmail(email_invitation_list[i])
      }

}// end if eamil_list 
else {
console.log (cdate.toLocaleString()+":S0008:INFO: 0 EXIT ")
process.exit()
}


} 
catch (e)
{
  console.log(cdate.toLocaleString()+":S0008:CATCH ERROR PROCESS EXIT:"+e);
  process.exit()
}


}

//************************************************** 
//*********    FUNCTIONS             *************** 
//************************************************** 
// GET DATA FORM DB
async function  getEmailsRecover()
{
  const { Client } = require('pg')
  const client = new Client(conn_data)
  await client.connect()
 
      const sql_emails  = "UPDATE user_reset_password SET sent = true WHERE sent = false  RETURNING * ;   " ;  
  //  const sql_calendars  = "SELECT * FROM  appointment_cancelled   " ;  
  
  //console.log ("QUERY GET CALENDAR = "+sql_calendars);
  const res = await client.query(sql_emails) 
  client.end() 
  return res.rows ;
}


// END GET DATA FORM DB

async function sendmail(data)
  {

    let nodemailer = require("nodemailer");
        let aws = require("@aws-sdk/client-ses");
        let { defaultProvider } = require("@aws-sdk/credential-provider-node");
        
        const ses = new aws.SES({
          apiVersion: "2010-12-01",
          region: "us-east-2",
          defaultProvider,
        });

        // create Nodemailer SES transporter
        let transporter = nodemailer.createTransport({
          SES: { ses, aws },
        });
        
       // console.log(" Sending Email data :"+JSON.stringify(data))

        
        // send some mail
       console.log(cdate.toLocaleString()+":S0008:INFO:EMAILS  recover Password to send:"+data.email.toLowerCase() )

       
        transporter.sendMail(
          {            
            //from: "Registro_Horapo_"+Math.floor(Math.random()* (1000 - 1) + 1)+"@horapo.com",
            from: "noreply@reusar.cl",
            to: data.email.toLowerCase()  ,
            subject: data.subject ,
            html: data.message ,
            
            ses: {
              // optional extra arguments for SendRawEmail
            },
          },
          (info) => {
            console.log(cdate.toLocaleString()+":S0008:INFO:"+info);
          }
        );
        
   

  }

/*
async function getUserNames(ids)
{
  const { Client } = require('pg')
  const client = new Client(conn_data)
  await client.connect()
 
      const sql_users  = "SELECT id, names , last_name1, last_name2 FROM user_created WHERE id IN ("+ids+")  ;   " ;  
  //  const sql_calendars  = "SELECT * FROM  appointment_cancelled   " ;  
  
  //console.log ("QUERY GET CALENDAR = "+sql_calendars);
  const res = await client.query(sql_users) 
  client.end() 
  return res.rows ;
}
*/

async function readHTMLFile(path) {
  const html_data = await fs.readFileSync(path,{encoding:'utf8', flag:'r'});
  return html_data
}

async function buildHtmlMessage(html,email){
  let aux = await html.replace(/\[FRONT_HOST\]/g,FRONT_HOST)
  return aux
}



