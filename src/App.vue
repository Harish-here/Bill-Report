<template>
  <div id="app" class='flex'>
    <div class='w25'>
      <Panel :list='listData' :activeMeta='active' @getReport='report' @hadDate='setFilterDate' @getBillGroup='billGroup' @getBillList='billList'  @back='backs'  @hadFilter='setGroupFilter' />
    </div>
    
    <div class='w25' v-if='billVisible'>
      <Panel :activeMeta='activeGroup' @getReport='report' @getBill='get' @hadFilter='setListFilter' :list='{meta:[],group: [],details:listDetails}'/>
    </div>
    <div class='w50' v-if='billData !== null'>
       <div class='fl w100 pa2 br-gray'>
          Bill Details
          <div class='flex fr items-baseline w-20'> 
            <a v-if='bid !== null' :href='"http://www.hobse.com/demo/index.php/customer/invoice/pdf?bid="+bid'>
              <i class="fa fa-print fr cursor" title='Print the Bill'></i>
            </a>
            <a @click='getAttach' data-toggle='modal'  data-target='.myModal2'>View Attachments</a>
            <i v-if='reportData !== null' @click='getPdf' class="fa fa-print cursor" title='Print the Bill'></i>
          </div>
        </div>
       <div class='fl w100 y-flow h-100 pa3' style='height:500px;border-right:1px solid #e7e7e7;'  v-html='billData'>
       </div>
    </div>
    <!-- modal -->
    <div class="modal right fade myModal2"  tabindex="-1" role="dialog" aria-labelledby="myModalLabel2">
	<div class="modal-dialog" role="document" style='width:35%;'>
			<div class="modal-content">

			<div class="modal-header fl w100">
				<div class='fl w100 p2-4'>
				<button type="button" class="close pab" data-dismiss="modal" aria-label="Close" style='right:0;top:2px;'><span class='f22' aria-hidden="true">&times;</span></button>
				<div class="modal-title f18" id="myModalLabel2">Attachemnts</div>
				
				</div>
			</div>

			<div id='modalContent' class="modal-body fl w100">
				<ul>
          <li class="fl w-50" v-for='i in ImgHolder' :key='i.imageId'>
            <a href='http://www.hobse.com/demo/public_html/images/hobse_logo.png' data-lightbox='image1' data-title='bill'>
              <img class='img img-responsive' width="100" height="100" src='http://www.hobse.com/demo/public_html/images/hobse_logo.png'  />
            </a>
            
          </li>
          <li v-if='ImgHolder.length === 0'>No Attachments found</li>
        </ul>

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
      ImgHolder: [{}]
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
        // console.log(e.message);
        alert('Sorry, something went wrong Try again later');
      };
    },
    getAttach: function(){
      const self = this;
      $.post(api.getAttach,{bid:self.bid}).done(function(data){
       self.ImgHolder = JSON.parse(data);
      }).fail(x => alert('Sorry, something went wrong Try again later'));
    }

  },
  created(){
    const self = this;
    $.get(api.getMeta).done(function(data){
      self.tryNcatch(function(){
        self.listMeta = (typeof data === 'object') ? data : JSON.parse(data);
       })   
    });
  }
};
</script>

<style src='./assets/basic.css'>


</style>
