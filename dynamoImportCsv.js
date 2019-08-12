var fs = require('fs');
var parse = require('csv-parse');
var async = require('async');
const AWS = require('aws-sdk');
const dynamodbDocClient = new AWS.DynamoDB({ region: "us-east-1" });
const argv = require('minimist')(process.argv.slice(2));

console.log(argv.sourceCsv);
console.log(argv.destDynamo);

if (!argv.sourceCsv) {
  console.log("You must specify source csv file path");
  process.exit(1);
}

if (!argv.destDynamo) {
  console.log("You must specify a destination dynamo table");
  process.exit(1);
}



//var csv_filename = "./eyf-practice-entry-dynamo.csv";

var csv_filename = argv.sourceCsv;
var dyanmoTable = argv.destDynamo;


rs = fs.createReadStream(csv_filename);
parser = parse({
    columns : true,
    delimiter : ','
}, function(err, data) {
    var split_arrays = [], size = 25;
    //console.log('Data: ', data);
    while (data.length > 0) {

        //split_arrays.push(data.splice(0, size));
        let cur25 = data.splice(0, size)
        let item_data = []

        for (var i = cur25.length - 1; i >= 0; i--) {
            //console.log(`cur25 value: %j`, cur25[i]);
          const this_item = {
            "PutRequest" : {
              "Item": {
                // your column names here will vary, but you'll need do define the type
                "catapult_id": {
                  "S": cur25[i]['catapult_id']
                },
                "year_month": {
                  "N": cur25[i]['year_month']
                },
                "entry": {
                  "N": cur25[i]['entry']
                },
                // "update_timestamp": {
                //   "S": cur25[i]['update_timestamp']
                // },
                "user_name": {
                  "S": cur25[i]['user_name']
                }
              }
            }
          };
          item_data.push(this_item)
        }
        split_arrays.push(item_data);
    }

    //console.log(`Split Array %j`, split_arrays);
    data_imported = false;
    chunk_no = 1;



    async.eachSeries(split_arrays, (item_data, callback) => {
        let RequestItems = {};
        RequestItems[dyanmoTable] = item_data
        const params = {RequestItems};
        // const params = {
        //     RequestItems: {
        //         'eyf-plan-entry-dynamo-lmannur' : item_data
        //     }
        // }
        dynamodbDocClient.batchWriteItem(params, function(err, res, cap) {
            if (err === null) {
                console.log('Success chunk #' + chunk_no);
                data_imported = true;
            } else {
                console.log(err);
                console.log('Fail chunk #' + chunk_no);
                data_imported = false;
            }
            chunk_no++;
            callback();
        });

    }, () => {
        // run after loops
        console.log('all data imported....');

    });

});
rs.pipe(parser);
