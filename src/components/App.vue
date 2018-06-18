<template>
  <div class="fl w100 h-full">
    <div class='fl w25'>
      <Panel :list='listData' :activeMeta='active' @getReport='report' @hadDate='setFilterDate' @getBillGroup='billGroup' @getBillList='billList'  @back='backs'  @hadFilter='setGroupFilter' />
    </div>
    
    <div class='fl w25' v-if='billVisible'>
      <Panel :activeMeta='activeGroup' @getReport='report' @getBill='get' @hadFilter='setListFilter' :list='{meta:[],group: [],details:listDetails}'/>
    </div>
    <div class='fl w50' v-if='billData !== null'>
       <div class='fl w100 p10-20 br-gray'>Bill Details 
        <a v-if='bid !== null' :href='"http://www.hobse.com/demo/index.php/customer/invoice/pdf?bid="+bid'><i class="fa fa-print fr cursor" title='Print the Bill'></i></a>
        <i v-if='reportData !== null' @click='getPdf' class="fa fa-print fr cursor" title='Print the Bill'>
        </div>
       <div class='fl w100 y-flow h-100 p10-20' style='height:500px;border-right:1px solid #e7e7e7;'  v-html='billData'>
       </div>
    </div>  
    
  </div>
</template>

<script>
import  api from './event.js'
import Panel from './Panel.vue'

export default {
  name: "app",
  components: { Panel },
  computed: {
    listData(){
      const self = this;
      if(self.view === 'meta'){
        return {meta: self.listMeta,group: [],details: []}
      }else{
        return {meta: self.listMeta,group: self.listGroup,details: []}
      }
    }
  },
  data() {
    return {
      listMeta: [],
      listDetails: [],
      listGroup: [],
      view:'meta',
      active: {},
      activeGroup: {},
      billVisible: false,
      activeGroupFilter: {},
      groupDate: {},
      activeListFilter: {},
      billData: null,
      bid:null,
      reportData:null
    }
  },
  methods: {
    backs: function(){
      this.view = 'meta',
      this.billVisible = false;
      this.activeGroup = {};
      this.billData = null;
      this.bid = null;
      this.reportData = null;
    },
    somethingWentWrong: function(){
      alert('Sorry, something went wrong Please try again!');
    },
    createCSV: function(JSONData, ReportTitle, ShowLabel){
      //snippet from third party to create CSV
      var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
    
    var CSV = '';    
    //Set Report title in first row or line
    
    CSV += ReportTitle + '\r\n\n';

    //This condition will generate the Label/Header
    if (ShowLabel) {
        var row = "";
        
        //This loop will extract the label from 1st index of on array
        for (var index in arrData[0]) {
            
            //Now convert each value to string and comma-seprated
            row += index + ',';
        }

        row = row.slice(0, -1);
        
        //append Label row with line break
        CSV += row + '\r\n';
    }
    
    //1st loop is to extract each row
    for (var i = 0; i < arrData.length; i++) {
        var row = "";
        
        //2nd loop will extract each column and convert it in string comma-seprated
        for (var index in arrData[i]) {
            row += '"' + arrData[i][index] + '",';
        }

        row.slice(0, row.length - 1);
        
        //add a line break after each row
        CSV += row + '\r\n';
    }

    if (CSV == '') {        
        alert("Invalid data");
        return;
    }   
    
    //Generate a file name
    var fileName = "Billing_Report_";
    //this will remove the blank-spaces from the title and replace it with an underscore
    fileName += ReportTitle.replace(/ /g,"-");   
    
    //Initialize file format you want csv or xls
    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
    
    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension    
    
    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");    
    link.href = uri;
    
    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = fileName + ".csv";
    
    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    },

    getPdf: function(){ const self = this;
      window.open(api.getReportPdf+'?sample='+JSON.stringify(self.reportData));
    },
    getList: function(data,callBack){
      const self = this;
      if(data.hasOwnProperty('url') && data.hasOwnProperty('param') && typeof callBack === 'function'){
       
          $.post(data.url,data.param).done(function(rec){
             callBack(rec)
            });
        
      }else{
        return false
      }
    },
    formateDate: function(date) {
        var monthNames = [
          "January", "February", "March",
          "April", "May", "June", "July",
          "August", "September", "October",
          "November", "December"
        ];

        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();

        return day + ' ' + monthNames[monthIndex] + ' ' + year;
      },
    report: function(data){//getting the consolidated report
    const self = this;
      
      if(data.label === 'group') {
        self.createCSV(data.data,'Report based on '+self.active.groupName+' '+self.formateDate(data.date.from.toString())+' - '+self.formateDate(data.date.to.toString()),true);
      }else{
        if(data.data[0]['bills'] !== undefined){
            data.data.forEach(function(x){
              self.createCSV(x.bills,'Report based on '+x.groupName+'('+self.active.groupName+') ',true)
            });
        }else{
          self.createCSV(data.data,'Report based on '+self.activeGroup.groupName+' ',true)
        }
      }
      
      
    },
    billList: function(data){ //getting the bill list based on the group
    const self = this;
    self.billData = null;
      this.getList({url:api.getDetailsList,param:{data: data,meta: self.active,filter: self.activeGroupFilter}},function(recData){
        self.tryNcatch(function(){
          self.listDetails = JSON.parse(recData);
          self.activeGroup = data;
          self.billVisible = true;
        })
      });
      
      },
    billGroup: function(data){ //gettin the group list
      const self = this;
        this.getList({url:api.getGroupList,param:data},function(recData){
           self.tryNcatch(function(){
             self.listGroup = JSON.parse(recData);  
             self.active = data;
             self.view = 'group';
           });      
        });

       },
    get: function(data){
      const self = this;
      this.getList({url: api.getBillPage+data.bookingId+'/1',param:{id:''}},function(recData){
         self.reportData = null;
        self.billData = recData;
        self.bid = data.bookingId;
      });
    },
    setFilterDate: function(data){
      const self = this;
      this.billVisible = false;
      this.billData = null;
      let sendData = Object.assign(self.active,data.filterDate);
        if(this.listGroup.length > 0){
              this.getList({url:api.getGroupList,param:sendData},function(recData){
                  self.tryNcatch(function(){
                    self.listGroup = JSON.parse(recData);  
                   // self.active = data;
                    self.view = 'group';
                  });      
                });
        }
      },
    setGroupFilter: function(data){
      const self = this;
      this.activeGroupFilter = data.filterData;//settig the group filter
      let combineFilter = Object.assign(data.filterData,data.filterDate);
      if(data.active.hasOwnProperty('groupName')){
        this.getList({url:api.getDetailsList,param:{data: data.active,meta: self.active,filter: combineFilter}},function(recvData){ 
          //setting the bill list
              self.listDetails = JSON.parse(recvData); 
        });
      }
    },
    setListFilter: function(data){//fire ajx only when list is already there
       this.activeListFilter = data;
    },
    tryNcatch: function(func){//error catching block
      try{
        func();
      }catch(e){
        console.log(e.message);
        alert('Sorry, something went wrong in the backend Try again later');
      };
    }

  },
  created(){
    const self = this;
    $.get(api.getMeta).done(function(data){
      self.tryNcatch(function(){
        self.listMeta = JSON.parse(data);
       })   
    });

    //  $.get(api.getGroupList).done(function(data){
    //     self.listGroup = data;
    // });

    // $.get(api.getDetailsList).done(function(data){
    //     self.listDetails = data;
    // });
  }
};
</script>

<style>
body{ padding:0;margin: 0; }
/* ------- RFP style -------- */
/* normalization */
*{ font-family: sans-serif;font-size:12px; }
hr{ margin-bottom:0px !important; }
nav a{ text-decoration: none; display: block;padding-left: 10px;color:#337a74;}
nav div:hover{ color:#fff;background-color:#009688;text-decoration: none;}
nav a:visited{text-decoration: none;}

nav div .fa{font-size: 22px;}
ul,li{padding: 0px;margin: 0px;list-style: none;}
hr{ margin-bottom:0px !important; }
/* -- layout ------*/
.fl{ float : left ; display : inline;}
.fr{ float : right; display : inline;}

.w10{ width : 10%; }
.w15{width : 15%;}
.w20{width : 20%;}
.w25{width : 25%;}
.w30{width : 30%;}
.w40{width : 40%;}
.w70{width : 70%;}
.w33{width: 33.33%;}
.w75{ width : 75%; }
.w80{ width : 80%; }
.w90{ width : 90%; }
.w50{ width : 50%; }
.w60{ width : 60%; }
.w100{ width : 100%; }
.h-fix{height:380px;}
.h-head{height: 110px;}
.h-75{height: 75vh; }
.h-60{height: 60vh; }
.z-500{ z-index: 5000; }
.y-flow{overflow-y : auto;}
.h-100{height: 100%;}
.h-full{height: 80vh;}
.di{ display : inline !important;}
.dib{ display : inline-block !important;}
.db{ display: block !important; }
.dbNo{ display: none !important;}
.pab{ position: absolute; }
.pa{ position: relative; }
.top-right-0{ top:0;right:0; }
.hide{ visibility: hidden; }

/** font */
.roboto{font-family: 'Roboto', sans-serif;font-size:21px;}
/* ---- atomic  -----*/
.pl-25{padding-left:25px; }
.mr-67{margin-right: 67px;}
.pl-40{padding-left:40px;}
.cursor{cursor: pointer;}
.trans{ transition: 0.3s; }
.opa{opacity: .4;}
.br-l{background-color: #fafafa !important;}
.u{text-decoration: underline;}
.card{box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);}
.panel-shadow{-webkit-box-shadow:0 0 30px 0 rgba(0,0,0,.1);box-shadow: 0 0 30px 0 rgba(0,0,0,.1);}
.trans{-moz-transition: all .2s ease;transition: all .2s ease;}
.br-clr{border:1px solid #e7e7e7;}
.br-none{border-left:none;border-right:none}
.br-none-top{border-top:none;border-bottom:none}
.br-white{border: 1px solid #fff;outline: none;}
.br-gray{border: 1px solid #e1e1e1;outline: none;}
/* ---- padding  -----*/
.p2-4{padding: 2px 4px;}
.p5-10{ padding:5px 10px; }
.p20-40{ padding:20px 40px; }
.p10-20{padding : 10px 20px;}


/* ---- component  -----*/
.tb{ border-left: none; border-right: none;border-top:none; border-bottom:none; cursor: pointer;}
/* .tb:hover{border-bottom: 3px solid #ddd; cursor: pointer;} */
.tb--active{ border-top: 3px solid #4285f4; color: #4285f4; }
.tb-v--active{ border-left:3px solid #4285f4; color: #4285f4; }
/* .tb-v--active:hover,.tb--active:hover{background-color: #fff;} */

/* ---- color  -----   */
.bg-drk{ background-color: #fff;}
.hover{ background-color: #50617c; }
.act{background-color: #009688; color:#fff;}
.bg-ddd{ background-color:#f3f6f7; }
.bg-dd{ background-color: #fff; }
.bg-green{background-color:green !important;}
.orange{ color: orange !important; }
.reds{ color:#e74c3c !important;}
.green{ color:green !important; }
.bl{ color:black !important;}
.white{color:#fff;}
.gray{color: lightgray !important;}
.bg-gray{background-color: #f3f3f3;}
.blue{color: #4285f4 !important;}
.bg-high{background-color: #f9f9f9;}
.teal{color:#009688 !important;}
.bg-teal{background-color:#009688 !important;}
.bg-acc{background-color: #e7ffeb;}


/* font / text */
.center{ text-align : center !important; }
.al-left{ text-align:left; }
.al-right{ text-align:right; }
.b6{ font-weight: 600 !important; }
.b5{ font-weight: 500 !important; }
.b3{ font-weight: 300 !important; }
.f10{ font-size: 10px; }
.f11{ font-size: 11px; }
.f12{ font-size: 12px; }
.f14{ font-size: 14px; }
.f16{ font-size: 16px; }
.f18{ font-size: 18px;}
.f22{ font-size: 22px; }


/* Ghost btn*/
.btn-ghost{
	border: 1px solid #009688;
	color:#009688;
	background-color: #fff;
}
.btn-ghost:hover{
	background-color: #00b19f;
	color:#fff;
}
.act:hover{
	background-color: #00b19f;
	color:#fff;
}

.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}
</style>