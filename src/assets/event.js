
let forProd = true;
function decide(obj){
    return (forProd) ? obj.prod : obj.local;
}
export default  {
    getMeta: decide({local:'https://api.myjson.com/bins/za8ot',prod:'http://www.hobse.com/demo/index.php/customer/billreport/metaList'}),
    getGroupList: decide({local:'https://api.myjson.com/bins/v002d',prod:'http://www.hobse.com/demo/index.php/customer/billreport/groupDetail'}),
    getDetailsList: decide({local:'https://api.myjson.com/bins/12z7kl',prod:'http://www.hobse.com/demo/index.php/customer/billreport/filterDetail'}),
    getBillPage: decide({local:'http://localhost',prod:'http://www.hobse.com/demo/index.php/admin/reports/bookingusersdetailsdisplay/'}),
    getReport: decide({local:'http://localhost',prod:'http://www.hobse.com/demo/index.php/customer/invoice/getReport'}),
    getReportPdf: 'http://www.hobse.com/demo/index.php/customer/invoice/getReportPdf',
    getAttach: 'http://www.hobse.com/demo/index.php/admin/booking/billListBoth/',
    getTravel: 'http://www.hobse.com/demo/index.php/customer/booking/resstatus.html?vid='
}


//'http://www.hobse.com/demo/index.php/admin/reports/bookingusersdetailsdisplay/' booking pdf