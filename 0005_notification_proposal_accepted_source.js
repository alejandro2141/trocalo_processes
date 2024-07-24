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
//Step 1, Get all EMails request Recover appointments taken
try { 
html_template = await readHTMLFile(__dirname+"/0005_notification_proposal_accepted_source.html")
//  STEP 1 Get New Proposals NOT YET notified to SOURCE. 
let proposals  = await getProposals()

if (proposals == null || proposals.length < 1 )
{
  console.log (cdate.toLocaleString()+":S0005:INFO: 0 EXIT  No NEW Proposals to Notify Destination ") ; 
  process.exit()
}

// STEP 1.1 filter to get only id users
let user_ids = await proposals.map(val => [val.user_id_creator, val.user_id_destination] )
console.log("id users:"+user_ids)

//  STEP 2 USERS  
let users  = await getUsers(user_ids)
console.log("users:"+users)
// STEP 2.1 Get emails

let emails = await users.map(val => val.email)


  if ( proposals != null && proposals.length > 0 )
  {
    console.log (cdate.toLocaleString()+":S0005:INFO: notification_new_proposal_source :"+JSON.stringify(emails) )

      // CYCLE TROUGH EMAIL list 
      for (let i = 0; i < proposals.length ; i++) {
          let user_creator = users.filter( us =>  us.id == proposals[i].user_id_creator ) 
          let user_destination = users.filter( us =>  us.id == proposals[i].user_id_destination ) 

          let register = { 
                  'email' : user_creator[0].email , 
                  'message' : "<h1></h1>"
              }

          register.message = await buildHtmlMessage( html_template , proposals[i] , user_creator , user_destination )
          email_invitation_list.push(register)       
        } //END FOR CYCLE 

      for (let i = 0; i < email_invitation_list.length ; i++)
        {
          console.log("email to be send to:"+JSON.stringify(email_invitation_list[i])+"  "  )
          await sendmail(email_invitation_list[i])
        }

  }// end if eamil_list 
  else {
  console.log (cdate.toLocaleString()+":S0005:INFO: 0 EXIT ")
  process.exit()
  }


} 
catch (e)
{
  console.log(cdate.toLocaleString()+":S0005:CATCH ERROR PROCESS EXIT:"+e);
  process.exit()
}


}

//************************************************** 
//*********    FUNCTIONS             *************** 
//************************************************** 
// GET DATA FORM DB
async function  getProposals()
{
  const { Client } = require('pg')
  const client = new Client(conn_data)
  await client.connect()
 
      const sql_calendars  = "UPDATE proposal SET notification_accepted_proposal_source  = true  WHERE status = 100  AND ( notification_accepted_proposal_source IS NULL OR  notification_accepted_proposal_source = false )  RETURNING * ; "  
  //  const sql_calendars  = "SELECT * FROM  appointment_cancelled   " ;  
  
  //console.log ("QUERY GET CALENDAR = "+sql_calendars);
  const res = await client.query(sql_calendars) 
  client.end() 
  return res.rows ;
}

// GET EMAILS 
async function  getUsers(ids)
{
  const { Client } = require('pg')
  const client = new Client(conn_data)
  await client.connect()
 
      const sql_query  = "SELECT * FROM user_created  WHERE id IN ("+ids+") ;  " ;  
  //  const sql_calendars  = "SELECT * FROM  appointment_cancelled   " ;  
  
  console.log ("QUERY = "+sql_query);
  const res = await client.query(sql_query) 
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
       console.log(cdate.toLocaleString()+":S0005:INFO:EMAILS to send:"+data.email.toLowerCase() )

       
        transporter.sendMail(
          {            
            //from: "Registro_Horapo_"+Math.floor(Math.random()* (1000 - 1) + 1)+"@horapo.com",
            from: "noreply@reusar.cl",
            to: data.email.toLowerCase()  ,
            subject: 'Reusar - Tu propuesta de cambio fue aceptada',
            html: data.message ,
            ses: {
              // optional extra arguments for SendRawEmail
            },
          },
          (info) => {
            console.log(cdate.toLocaleString()+":S0005:INFO:"+info);
          }
        );
       
  }

async function readHTMLFile(path) {
  const html_data = await fs.readFileSync(path,{encoding:'utf8', flag:'r'});
  return html_data
}

async function buildHtmlMessage(html, proposal, user_creator, user_destination){

  console.log("----------- build HTML building proposal:"+JSON.stringify(proposal) )
  console.log("----------- build HTML building user crator:"+JSON.stringify(user_creator ) )
  console.log("----------- build HTML building user destination:"+JSON.stringify(user_destination ) )

  //1st build app list
  apps_html = new String()
 
  let proposal_title = proposal.title
  let creator_user_name = user_creator[0].names+" "+user_creator[0].last_name1  
  let destination_user_name = user_destination[0].names+" "+user_destination[0].last_name1  
  
  let aux = await html.replace(/\[FRONT_HOST\]/g,FRONT_HOST).replace(/\[PROPOSAL_TITLE\]/g,proposal_title).replace(/\[USER_CREATOR\]/g, creator_user_name ).replace(/\[USER_DESTINATION\]/g, destination_user_name )
  //let aux = await html.replace(/\[FRONT_HOST\]/g,FRONT_HOST)
  return aux
}



