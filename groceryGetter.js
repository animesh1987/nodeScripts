let start = new Date();
const productId = [9300683501803, 9350763592825];/*9310386002156, 9300633268978*/
const productIdString = '(9300683501803, 9350763592825, 9312691642911, 9312691533462 )';
const mssql = require('mssql');
const database = 'Grocery';
const _ = require('underscore');
const selectedStore = 'Woolworths';
const async = require('async');
const config = {
    user: 'sa',
    server: 'localhost',
    password: 'Hb1400f?',
    database: database
};

function fetchPrice(record){
    return record.price;
}

let sumPrice = function(a, b){
    return a + b;
}

let sameStoreQuery = `with e1 as
                    (
                        SELECT [PRODUCT_UPC_ID], price_type, price, row_number() over (partition by [PRODUCT_UPC_ID] order by price) as rn
                        FROM
                        (
                            SELECT [PRODUCT_UPC_ID], [WOOLWORTHS_STD_RATE],[WOOLWORTHS_SPCL_RATE]
                            FROM DETAIL_RETAILER_PRICING_LIST
                        ) p

                        UNPIVOT

                        (price FOR price_type IN
                            ([WOOLWORTHS_STD_RATE],[WOOLWORTHS_SPCL_RATE])
                        ) AS unpvt
                    )
                    select PRODUCT_UPC_ID, price, price_type
                    from e1
                    where  [PRODUCT_UPC_ID] IN ${productIdString} and rn = 1`;

let mainQuery = `with e1 as
                    (
                        SELECT [PRODUCT_UPC_ID], price_type, price, row_number() over (partition by [PRODUCT_UPC_ID] order by price) as rn
                        FROM
                        (
                            SELECT [PRODUCT_UPC_ID], [WOOLWORTHS_STD_RATE],[WOOLWORTHS_SPCL_RATE],
                            [COLES_STD_RATE],[COLES_SPCL_RATE],[ALDI_STD_RATE],[ALDI_SPCL_RATE]
                            FROM DETAIL_RETAILER_PRICING_LIST
                        ) p

                        UNPIVOT

                        (price FOR price_type IN
                            ([WOOLWORTHS_STD_RATE],[WOOLWORTHS_SPCL_RATE],[COLES_STD_RATE],[COLES_SPCL_RATE],[ALDI_STD_RATE],[ALDI_SPCL_RATE])
                        ) AS unpvt
                    )
                    select PRODUCT_UPC_ID, price, price_type
                    from e1
                    where  [PRODUCT_UPC_ID] IN ${productIdString} and rn = 1`;

let queries = [{query: sameStoreQuery, queryType: 'sameStore'}, {query: mainQuery, queryType: 'BestPrice'}];

let tasks = [];

mssql.connect(config, (err)=>{
    if (err) console.log(err);

    let request = new mssql.Request();

    _.each(queries, (query)=>{
        tasks.push(function (callback) {
            request.query(query.query, (err, result)=>{
                if (err) { callback(err); return;}
                callback(null, {records: result.recordset, resultType: query.queryType});
            })
        })
    });

    async.parallel(tasks, (err, results)=>{
        if (err) { console.log(err); return;}

        _.each(results, (result)=>{
            console.log(result.resultType);
            console.log('Total Price', result.records.map(fetchPrice).reduce(sumPrice, 0));
            console.log('----------------------------');
        });

        console.log('-------------------------------');
        console.log( 'Result Fetched In: ', (new Date() - start) / (1000 * 60));

        process.exit()
    });

});
