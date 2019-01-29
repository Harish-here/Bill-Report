<template>
  <div id="app" class='flex'>
    <div class='' style='width:18%'>
      <Panel :list='{meta:listMeta,group: [],details: []}'
             :activeMeta='active' 
             ActiveView='meta'
             @hadDate='setFilterDate' 
             @getBillGroup='billGroup'
             @getBillList='billList'  
             @back='backs'
             @EmitDate='setDate'  
             @hadFilter='setGroupFilter' />
    </div>
    <div class='w35' v-if='view == "group"'>
      <Panel :list='{meta:[],group: listGroup,details: []}'
             :activeMeta='active' 
             ActiveView='group'
             @getReport='report'
             @hadDate='setFilterDate' 
             @getBillGroup='billGroup'
             @getBillList='billList'  
             @back='backs'  
             @hadFilter='setGroupFilter' />
    </div>
    
    <div style='width:47%' v-if='billVisible'>
      <Panel :activeMeta='activeGroup'
             :ActiveMetaData='active'
             :ActiveMetaDataList='listMeta'
             ActiveView='details' 
             @getReport='report' 
             @getBill='get'
             @GetAttachments='getAttach' 
             @GroupEmitted='setGroupFilter' 
             :list='{meta:[],group: [],details:listDetails}'/>
    </div>
    <!-- Bill html -->
    <div class='w50' v-if='false'>
       <div class='fl w100 pa2 br-gray b6 f12'>
          Bill Details
          <div class='flex fr items-baseline w-40'>
            <div class='fl w-50'>
              <a @click='getAttach' data-toggle='modal'  data-target='.myModal2' class='self-start'>View Attachments</a>
              <i v-if='reportData !== null' @click='getPdf' class="fa fa-print cursor" title='Print the Bill'></i>
            </div>
            <div class='fr w-40'> 
              <a target='_blank' v-if='bid !== null' :href='"http://www.hobse.com/demo/index.php/customer/invoice/pdf/"+bid' class='self-end'>
                <i class="fa fa-file-pdf-o cursor" title='Print the Bill'></i>
                Get as PDF
              </a>
            </div>

          </div>
        </div>
       <div class='fl w100 y-flow h-100 pa3' style='height:540px;border-right:1px solid #e7e7e7;'   v-html='billData'>
       </div>
    </div>
    <!-- modal -->
    <div class="modal right fade myModal2"  tabindex="-1" role="dialog" aria-labelledby="myModalLabel2">
      <div class="modal-dialog" role="document" >
          <div class="modal-content">

          <div class="modal-header">
            <div class='p2-4'>
              <button type="button" class="close pab" data-dismiss="modal" aria-label="Close" style='right:0;top:2px;'><span class='f22' aria-hidden="true">&times;</span></button>
              <div class="modal-title f18" id="myModalLabel2" >
                <!-- <span v-if='billData != null'>Travel Voucher</span> -->
                <span >Uploaded Bills</span>
              </div>
            </div>
          </div>

          <div id='bill-approv' class="modal-body">
          </div>

          </div><!-- modal-content -->
      </div><!-- modal-dialog -->
    </div> <!-- modal end -->

    <div class="modal right fade" id='approval'  tabindex="-1" role="dialog" aria-labelledby="approval">
      <div class="modal-dialog" role="document" style='width:70% !important;'>
          <div class="modal-content">

          <div class="modal-header">
            <div class='p2-4'>
              <button type="button" class="close pab" data-dismiss="modal" aria-label="Close" style='right:0;top:2px;'><span class='f22' aria-hidden="true">&times;</span></button>
              <div class="modal-title f16" >
                Travel Voucher
              </div>
            </div>
          </div>

          <div id='' class="modal-body">
              <div id='bill-area' class='pa2' v-if='billData != null' v-html='billData'></div>
          </div>

          </div><!-- modal-content -->
      </div><!-- modal-dialog -->
    </div> <!-- modal end -->  
    
  </div>
</template>

<script>
import api from './assets/event'
import Panel from './components/Panel.vue'

export default {
  name: 'App',
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
      reportData:null,
      ImgHolder: {},
      ImgHotels: [],
      ImgCorp: [],
      activeFrom: '',
      activeTo: '',
      currentMeta: {},
      currentGroup:{},
      activeDateType: 'booking'
    }
  },
  methods: {
    setDate: function(data){
      this.activeFrom = data.from;
      this.activeTo = data.to;
    },
    backs: function(){
      this.view = 'meta',
      this.billVisible = false;
      this.activeGroup = {};
      this.billData = null;
      this.bid = null;
      this.reportData = null;
      this.activeGroupFilter = {};
    },
    download: function(f,p){
      download(f,p)
    },
    somethingWentWrong: function(){
      alertify.error('Services currently unavailable due to network issues. Please Refresh the page or login again');
    },
    createCSV: function(JSONData, ReportTitle, ShowLabel){
      //snippet from third party to create CSV
      var arrData = typeof JSONData !== 'object' ? JSON.parse(JSONData) : JSONData;
    
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
      // alertify.message('Fetching the data..');
      if(data.hasOwnProperty('url') && data.hasOwnProperty('param') && typeof callBack === 'function'){
       
          $.post(data.url,data.param).done(function(rec){
             callBack(rec);
            //  alertify.dismissAll();
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
      let meta = self.currentMeta.groupName;
      if(data.from == 'group') {
        //to get correct CSV format
        let JSONarr = data.data.map(x => {
            let c ={};
            c[meta] = x.groupName;
            c['Total'] = x.total;
            c['Paid'] = x.paid;
            c['Pending'] = x.pending;
            return c
        });
        self.createCSV(JSONarr,'Report-based-on-'+self.currentMeta.groupName+'_'+self.formateDate(self.activeFrom)+'-'+self.formateDate(self.activeTo),true);
      }else{
        if(data.data[0]['bills'] !== undefined){
          let group = self.currentGroup.groupName;
          let meta = self.currentMeta.groupName;
          let filter = self.activeGroupFilter.groupName;
          let JSONarr = data.data.map(y => {
            let Arr = y.bills.map(b => {
                  let c = {};
                  c[meta] = group;
                  c[filter] = y.groupName;
                  c['Traveller'] = b.customerName;
                  c['Voucher_No'] = b.bookingVoucherId;
                  c['Total'] = b.total;
                  c['Paid'] = b.paid
                  c['Pending'] = b.pending;
                  c['Booking_Date'] = b.date;
                  return c
            });
              return Arr
          });
            let final = [];
          for(let u=0;u < JSONarr.length;u++){
            final = final.concat(JSONarr[u]);
          }


            // data.data.forEach(function(x){
              self.createCSV(final,'Report-based-on-'+group+'('+meta+')'+'_'+self.formateDate(self.activeFrom)+'-'+self.formateDate(self.activeTo),true)
            // });
        }else{
          let group = self.currentGroup.groupName;
          let JSONarr = data.data.map(x => {
            let c = {};
            c['Traveller'] = x.customerName;
            c['Voucher_No'] = x.bookingVoucherId;
            c['Total'] = x.total;
            c['Paid'] = x.paid
            c['Pending'] = x.pending;
            c['Booking_Date'] = x.date;
            return c
          });
          self.createCSV(JSONarr,'Report-based-on-'+self.currentGroup.groupName+'('+self.currentMeta.groupName+')_'+self.formateDate(self.activeFrom)+'-'+self.formateDate(self.activeTo),true)
        }
      }
      
      
    },
    billList: function(data){ //getting the bill list based on the group
    const self = this;
    self.billData = null;
    self.billVisible = false;
    this.activeGroupFilter = {};
      this.getList({url: global_base_url+api.getDetailsList,param:{data: data,meta: self.active,filter: self.activeGroupFilter}},function(recData){
        self.tryNcatch(function(){
          self.listDetails = JSON.parse(recData.trim());
          self.activeGroup = data;
          delete data.to;delete data.from;
          self.currentGroup = data;
          self.billVisible = true;
        })
      });
      
      },
    billGroup: function(data){ //gettin the group list

      const self = this;
      self.view = '';
      self.activeGroupFilter = {};
      this.billVisible = false;
      this.activeDateType = data.DateType;
      console.log(data);
      // this.backs();
        this.getList({url: global_base_url+api.getGroupList,param:data},function(recData){
           self.tryNcatch(function(){
             self.listGroup = JSON.parse(recData.trim());  
             self.active = data;
             self.view = 'group';
             self.currentMeta = data;
           });      
        });

       },
    get: function(data){
      const self = this;
      $.get(global_base_url + api.getTravel + data.bookingVoucherId + '&hsid=&nid=ZpSa').done(function(recData){
         self.reportData = null;
        self.billData = recData;
        self.bid = data.bookingVoucherId;
        
        // $(function(){
        $('#approval').modal('show');
      });
    },
    setFilterDate: function(data){
      const self = this;
      this.billVisible = false;
      this.billData = null;
      let sendData = Object.assign(data.active,data.filterDate);
      self.activeFrom = new Date(Number(data.filterDate.from)*1000);
      self.activeTo = new Date(Number(data.filterDate.to)*1000);
      self.activeDateType = data.filterDate.DataType;
        if(this.listGroup.length > 0){
              this.getList({url: global_base_url + api.getGroupList,param:sendData},function(recData){
                  self.tryNcatch(function(){
                    self.listGroup = JSON.parse(recData.trim());  
                   self.active = data.active;
                    self.view = 'group';
                  });      
                });
        }
      },
    setGroupFilter: function(data){
      const self = this;
      this.activeGroupFilter = data.filterData;//settig the group filter
      let date = {to:self.activeFrom,from: self.activeFrom};
      let combineFilter = Object.assign(data.filterData,data.filterDate,date);
      // self.activeDateType = data.filterDate.DateType;
      if(data.active.hasOwnProperty('groupName')){
              // self.listDetails = [];
        this.getList({url: global_base_url + api.getDetailsList,param:{data: data.active,meta: self.active,filter: combineFilter}},function(recvData){ 
          //setting the bill list
              self.listDetails = JSON.parse(recvData.trim());
              // self.activeGroupFilter = {}
              self.billVisible =  false;//for recompute of the properties
              self.billVisible =  true;
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
        // console.log(e.message);
        alertify.error('Services currently unavailable due to network issues. Please Refresh the page or login again');
      };
    },
    getAttach: function(id){
      const self = this;
      
      $.get(global_base_url + api.getModal+id+'/approval').done(function(data){
        $('#bill-approv').empty();
        $('#bill-approv').append(data);
        $('.myModal2').modal('show');
      }).fail(x => alertify.error('Services currently unavailable due to network issues. Please Refresh the page or login again'));
    }

  },
  created(){
    const self = this;
    $.get(global_base_url + api.getMeta).done(function(data){
      self.tryNcatch(function(){
        self.listMeta = (typeof data === 'object') ? data : JSON.parse(data);
       })   
    });
  }
};
</script>

<style src='./assets/basic.css'>


</style>
