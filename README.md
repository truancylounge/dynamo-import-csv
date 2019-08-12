#Usage:
#node dynamoImportCsv.js
node dynamoImportCsv.js --sourceCsv=eyf-plan-entry-dynamo.csv --destDynamo=eyf-plan-entry-dynamo-lmannur

## Description
Module used to copy a csv export into a dynamo table. 
Step1: (a) Export csv file from aws console
       (b) To export the entire table run the following command, 
       aws dynamodb scan --table-name eyf-plan-entry-dynamo-qa --query "Items[*].[catapult_id.S,year_month.N,entry.N,update_timestamp.S,user_name.S,achievement_status.S]" --output json | jq -r '.[] | @csv' > eyf-plan-entry-dynamo.csv
       The above command will give u the entire data set not just the first 100 entries. We may have to add the column header to the csv dump.
Step2: Modify dynamoImportCsv.js file to change the source csv file and also modify the Table Name and Column Names 
Step3: Run the command node dynamoImportCsv.js 
