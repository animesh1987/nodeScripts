'use strict';

var start = new Date();
var productId = [9300683501803, 9350763592825]; /*9310386002156, 9300633268978*/
var productIdString = '(9300683501803, 9350763592825)';
var mssql = require('mssql');
var database = 'Grocery';
var _ = require('underscore');
var selectedStore = 'Woolworths';
var async = require('async');
var config = {
    user: 'sa',
    server: 'localhost',
    password: 'Hb1400f?',
    database: database
};

var sameStoreQuery = 'with e1 as\n                    (\n                        SELECT [PRODUCT_UPC_ID], price_type, price, row_number() over (partition by [PRODUCT_UPC_ID] order by price) as rn\n                        FROM\n                        (\n                            SELECT [PRODUCT_UPC_ID], [WOOLWORTHS_STD_RATE],[WOOLWORTHS_SPCL_RATE]\n                            FROM DETAIL_RETAILER_PRICING_LIST\n                        ) p\n\n                        UNPIVOT\n\n                        (price FOR price_type IN\n                            ([WOOLWORTHS_STD_RATE],[WOOLWORTHS_SPCL_RATE])\n                        ) AS unpvt\n                    )\n                    select PRODUCT_UPC_ID, price, price_type\n                    from e1\n                    where  [PRODUCT_UPC_ID] IN ' + productIdString + ' and rn = 1';

var mainQuery = 'with e1 as\n                    (\n                        SELECT [PRODUCT_UPC_ID], price_type, price, row_number() over (partition by [PRODUCT_UPC_ID] order by price) as rn\n                        FROM\n                        (\n                            SELECT [PRODUCT_UPC_ID], [WOOLWORTHS_STD_RATE],[WOOLWORTHS_SPCL_RATE],\n                            [COLES_STD_RATE],[COLES_SPCL_RATE],[ALDI_STD_RATE],[ALDI_SPCL_RATE]\n                            FROM DETAIL_RETAILER_PRICING_LIST\n                        ) p\n\n                        UNPIVOT\n\n                        (price FOR price_type IN\n                            ([WOOLWORTHS_STD_RATE],[WOOLWORTHS_SPCL_RATE],[COLES_STD_RATE],[COLES_SPCL_RATE],[ALDI_STD_RATE],[ALDI_SPCL_RATE])\n                        ) AS unpvt\n                    )\n                    select PRODUCT_UPC_ID, price, price_type\n                    from e1\n                    where  [PRODUCT_UPC_ID] IN ' + productIdString + ' and rn = 1';

mssql.connect(config, function (err) {
    if (err) console.log(err);

    var request = new mssql.Request();

    request.query(sameStoreQuery, function (err, result) {
        if (err) console.log(err);

        console.log(result);

        console.log((new Date() - start) / (1000 * 60));

        process.exit();
    });
});

//# sourceMappingURL=groceryGetter-compiled.js.map