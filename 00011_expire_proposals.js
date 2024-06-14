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
    //  STEP 1 Change status of all proposals Expired. 
    let exp_proposals  = await getProposalsExpired()

    if (exp_proposals == null || exp_proposals.length < 1 )
    {
    console.log (cdate.toLocaleString()+":S00011:INFO: 0 EXIT  No NEW proposal expired ") ; 
    process.exit()
    }
    else 
    {
    console.log (cdate.toLocaleString()+":S00011:INFO: Proposal expired  "+exp_proposals.length) ; 
    let prop_ids = await exp_proposals.map(val => val.id )
    console.log (cdate.toLocaleString()+":S00011:INFO:  proposal expired { "+prop_ids+" }") ; 
    
    process.exit()
    }

} 
catch (e)
{
  console.log(cdate.toLocaleString()+":S00010:CATCH ERROR PROCESS EXIT:"+e);
  process.exit()
}


}

//************************************************** 
//*********    FUNCTIONS             *************** 
//************************************************** 
// GET DATA FORM DB
async function  getProposalsExpired()
{
  const { Client } = require('pg')
  const client = new Client(conn_data)
  await client.connect()
 
      const sql_calendars  = " UPDATE proposal SET status = 500  WHERE status=1 AND  ( CURRENT_TIMESTAMP  >=  timestamp + interval '1 day' * proposal_days   ) RETURNING * ;      "  
  //  const sql_calendars  = "SELECT * FROM  appointment_cancelled   " ;   DATE 'date_2' - DATE 'date_1'
  
  //console.log ("QUERY GET CALENDAR = "+sql_calendars);
  const res = await client.query(sql_calendars) 
  client.end() 
  return res.rows ;
}



