var Airtable = require('airtable');
var base = new Airtable({apiKey: 'keyJ4Js36MW5Ks62z'}).base('appNzUHozcjfp0ePG');

base('Jobs & Opportunities').select({
    // Selecting the first 3 records in Grid view:
    maxRecords: 999,
    view: "Open Opportunities"
}).eachPage(function page(records, fetchNextPage) {
    // This function (`page`) will get called for each page of records.

    records.forEach(function(record) {
        console.log('{\n"title":'+' "' + record.get('Opportunity Name') + ' " ' + ',\n"Key": '+' " ' + record.get('Key')+ ' " ' +
        	',\n"StartDate": '+' " ' + record.get('Public Start Date')+' " ' +
        	',\n"CloseDate": '+' " ' + record.get('Public Close Date')+'",' );
        	 console.log('}');//+ '"' + ',\n"Interactions": ' + '"' + record.get('Interactions')+ '"' + ',\n"Exhibition": ' + '"' + record.get('Exhibition')
});

    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
    fetchNextPage();

}, function done(err) {
    if (err) { console.error(err); return; }
});