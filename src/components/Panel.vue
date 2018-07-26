<template>
  <div id="panel" class='pa flex flex-column trans' :class='{"panel-shadow":list.details.length > 0}'>
    <div class='pa2 tc br-clr h-hea' :class='{"br-none":list.details.length > 0}' >
      <div class='flex items-stretch'>
        <button class='btn btn-default btn-xs' v-if='ActiveView === "group"' @click='pushFilter'>
          <i class="fa fa-chevron-left f4" aria-hidden="true"></i>
        </button>
        <span class='_flx_full f4'>
            {{ (ActiveView !== "meta") ?  activeMeta.groupName : "Billing Report" }}
            <i  v-if='ActiveView === "group" || ActiveView === "details"' title='export this as report' @click='getReport' class="fa fa-file-text-o pa1 f4 cursor" aria-hidden="true"></i>
        </span>
        
      </div>
      <!--datepicker -->
      <div class='pa1 tc' v-if='ActiveView === "group" || ActiveView === "meta"'>
        <datepicker @input='setDate' calendar-class='w200' wrapper-class='di' input-class=' w40 btn btn-default btn-xs'	 v-model='filterDate.from'></datepicker> 
        <div class='di w20 gray p5-10'>to</div>
        <datepicker  @input='setDate' calendar-class='w200' wrapper-class='di' input-class='w40 btn btn-default btn-xs'	 v-model='filterDate.to' :disabled-dates='{to: filterDate.from}'></datepicker> 

      </div>
       <!-- Number of transction label -->
      <div class='pa1 tc' v-if='ActiveView === "details"'>
        
          Number of transactions - 
          {{ (list.details.length > 0 && 
               !list.details[0].hasOwnProperty('groupName')) ?
                                         list.details.length : 
                                         (list.details.length > 0) ? list.details.map(x => x.bills.length).reduce((a,b)=> a+b) : 0
           }}

      </div>
       <!-- search text box -->
      <div class='tc pa2' v-if='ActiveView === "group" || ActiveView === "details"'>
          <div class='br-clr w100'> 
            <i class="fa fa-search dib" aria-hidden="true"></i>
            <input class='pa2 b5 dib br-white tc' type='text' v-model='searchString' @input='saySmthn' :placeholder="'search in '+activeMeta.groupName">
          </div>
      </div>
    </div>

    <!-- result label -->
    <div class='p2-4' v-if='searchString.length > 0'>
      <span class='gray'> Results for </span> "<b>{{ searchString }}</b>" <button class='fr f14 close' @click="searchString=''">clear</button>
    </div>
    <!-- Group listing -->
    <span v-if='ActiveView === "group"'>
      <ul class='pa h-fix y-flow'>
          <li class='p5-10 cursor' v-for='i in filterList' :key='i.id' @click='getData(i,"getBillList")' :class='{"active-item":(activeListItem.id !== undefined && activeListItem.id === i.id)}'>
            <div class='black tc b6'>{{i.groupName}}</div>
            <!-- <i class="fa fa-chevron-right fr f14" aria-hidden="true"></i> -->
            <i v-if='(activeListItem.hasOwnProperty("id") && activeListItem.id === i.id)' class="fa fa-chevron-right fr f14" aria-hidden="true"></i>
            <div>
              <div class='flex justify-around pa1 gray tc'>
                <div class='flex flex-column'>
                  <span class='f6'>Total</span>
                  <span class='navy b6' v-money>{{i.total}}</span>
                </div>
                <div class='flex flex-column'>
                  <span class='f6'>Paid</span>
                  <span class='green b6' v-money>{{i.paid}}</span>
                </div>
                <div class='flex flex-column'>
                  <span class='f6'>Pending</span>
                  <span class='light-red b6' v-money>{{i.pending}}</span>
                </div>
              </div>
            
            </div>
          </li>
          <li class=' p5-10 tc gray f11 br-none' v-if='list.group.length !== 0 && filterList.length === 0'>Wups! No matches</li>
          <li class=" p5-10 tc gray f11 br-none" v-if='list.group.length === 0'></li>
      </ul>
    </span>
    
    

    <!-- details listing -->
    <span v-if='ActiveView === "details"'>
      <ul class='pa fl w100 h-fix y-flow'>
        <!-- details list without filter -->
        <li class='fl w100  cursor' v-if='!filterDetailsList[0].hasOwnProperty("groupName")' v-for='i in filterDetailsList' :key='i.bookingId' @click='getData(i,"getBill")' :class='{"active-item":(activeListItem.bookingId !== undefined && activeListItem.bookingId === i.bookingId)}'>
          
          <div class="fl w100 p5-10">
            <div class='fl w50 p2-4'><span class="label label-primary f11">{{i.bookingVoucherId}}</span></div>
            <div class='fl w50 al-right p2-4'><span class='gray'>{{i.date}}</span> </div>
          </div>
          
          <div class="fl w100 p5-10">
            <div class='fl w50 p2-4'>{{i.customerName}}</div>
            <div class='fl w50 al-right p2-4 b6 black f14'><span class='badge badge-primary' v-money>{{i.total}}</span></div>
          </div>
        </li>
        <li class='fl w100  cursor' v-else><!-- details list view with filter -->
          <div class='fl w100' v-for='i in filterDetailsList' :key='i'>
            <div class='fl w100 p5-10 black b6 bg-gray center'><span class='fl w100'>{{i.groupName}}</span> 
              <span class='blue fl w33' style="background-color: rgb(245, 245, 245);" v-money>{{ getTotal(i.bills,'paid') }}</span>  
              <span class='green fl w33' v-money>{{ getTotal(i.bills,'pending') }}</span>
              <span class='reds fl w33' v-money>{{ getTotal(i.bills,'total') }}</span>
            </div>
            <div class='fl w100 cursor groupList p2-4' v-for='y in i.bills' :key='y.bookingId' :class='{"active-item":(activeListItem.bookingId !== undefined && activeListItem.bookingId === y.bookingId)}' @click='getData(y,"getBill")'>
                <div class="fl w100 p2-4">
                  <div class='fl w50 p2-4'><span class="label label-primary f11">{{y.bookingVoucherId}}</span></div>
                  <div class='fl w50 al-right p2-4'><span class='gray'>{{y.date}}</span> </div>
                </div>
                
                <div class="fl w100 p2-4">
                  <div class='fl w50 p2-4'>{{y.customerName}}  <span >{{y.payStatus}}</span></div>
                  <div class='fl w50 al-right p2-4 b6 black f14'>
                    <span class='badge badge-primary' v-money>{{y.total}}</span>
                  </div>
                </div>
            </div>
            <div class='fl w100 p5-10 center gray f11' v-if='i.bills.length === 0'>Wups! No Bills are here</div>
            <!-- bill strip end -->
            
          </div>
        </li>
        <li class='fl w100 p5-10 center gray f11 br-none' v-if='list.details.length !== 0 && filterDetailsList.length === 0'>Wups! No Bill are there</li>
        <li class='fl w100 p5-10 center gray f11 br-none' v-if='list.details.length === 0'>Wups! No Bill are there</li>
      </ul>
    </span>

    <!-- meta listing -->
     <span v-if=" ActiveView ==='meta' ">
      <ul class='pa  h-fix y-flow' v-if='list.meta.length > 0 && list.group.length === 0' >
        <li class='p20-40 cursor tc b6' v-for='i in list.meta' :key='i.id' @click='getData(i,"getBillGroup")'><span>{{i.groupName}}</span>
          <i class="fa fa-chevron-right fr f14" aria-hidden="true"></i>
        </li>
      </ul>
    </span>
    <!-- report sumary -->
    <div class='flex flex-column bg-ddd' style="overflow-x:auto;"  v-if='ActiveView === "group" || ActiveView === "details"'>
      
        <div class='tc pa1'>summary</div>
        
        <div class='flex flex-stretch f5 tc'>
          <div class='blue _flx_full' v-money>{{overAllTotal}}</div>
          <div class='green _flx_full' v-money>{{overAllPaid}}</div>
          <div class='reds _flx_full' v-money>{{overAllPending}}</div>
        </div>
       
    </div>
    <!-- filter -->
    <div class='tc' v-if='ActiveView === "group" || ActiveView === "details"'>
       <group :filterData="dataForFilter" @setFilter='emitFilter'/>
    </div>
  </div>
</template>

<script>
import api from '../assets/event.js'
import Group from './Group.vue'
import Datepicker from 'vuejs-datepicker'

export default {
  name: "panel",
  components: { Group  ,Datepicker },

  watch: {
    'detailsActive' : function(){ //when the details filtered applied
      const self = this;
      if(self.detailsActive.hasOwnProperty('groupName') && !self.list.details[0].hasOwnProperty('groupName')){
        self.detailsActiveList = self.list.details.filter(x => x[self.detailsActive.groupName.toLowerCase()] > 0 );
      }else{
        if(!self.detailsActive.hasOwnProperty('groupName')){
            self.detailsActiveList = self.list.details.map(x => {
              x.bills.filter( y => y[self.detailsActive.groupName.toLowerCase()] > 0);
              return x
            })
        }else{
          self.detailsActiveList = self.list.details;
        }
      }
    }
  },

  computed: {
    dataForFilter(){
      const self = this;
      if(this.list.meta.length > 0 && this.list.group.length > 0){
        return this.list.meta.filter(function(x){
          return self.activeMeta.filterMap.findIndex(y => { return y === x.id }) !== -1
        })
      }else{
        return this.detailsFilter
      }
    },
    overAllPaid(){
      if(this.list.group.length > 0) {
       return this.list.group.map(x => x.paid).reduce((acc,x) => Number(acc) + Number(x)) 
      }else if(this.list.details.length > 0){
        if(this.list.details.length > 0 && !this.list.details[0].hasOwnProperty('groupName')){

          return Math.round(Number(this.list.details.map(x => x.paid).reduce((acc,x) => Number(acc) + Number(x))))
        }else{
          return 0 ;//do the calc when they are in group
        }
      }
    },
    overAllPending(){
     if(this.list.group.length > 0) {
       return this.list.group.map(x => x.pending).reduce((acc,x) => Number(acc) + Number(x) )
      }else if(this.list.details.length > 0){
        if(this.list.details.length > 0 && !this.list.details[0].hasOwnProperty('groupName')){
          
          return Math.round(Number(this.list.details.map(x => x.pending).reduce((acc,x) => Number(acc) + Number(x))))
        }else{
          return 0 ;//do the calc when they are in group
        }
      }
    },
    overAllTotal(){
      if(this.list.group.length > 0) {
       return this.list.group.map(x => x.total).reduce((acc,x) => Number(acc) +Number(x)) 
      }else if(this.list.details.length > 0){
        if(this.list.details.length > 0 && !this.list.details[0].hasOwnProperty('groupName')){
          
          return Math.round(Number(this.list.details.map(x => x.total).reduce((acc,x) => Number(acc) + Number(x))))
        }else{
          return 0 ;//do the calc when they are in group
        }
      }
    },
    filterList(){
      const self = this;
      if(this.list.group.length > 0 && this.searchString.length > 0){
        var str = self.searchString.toString();
        var patt = new RegExp(str,'g');
       return this.list.group.filter(x =>{ 
            // console.log(patt.test(x.groupName.toLowerCase()));
            return patt.test(x.groupName.toLowerCase()) 
            });
      }else{
        return self.list.group
      }
    },

    filterDetailsList(){
      const self = this;
      if(this.list.details.length > 0 && this.searchString.length > 0 && !self.detailsActive.hasOwnProperty('groupName')){
        var str = self.searchString.toString();
        var patt = new RegExp(str,'g');
        if(this.list.details[0].hasOwnProperty('groupName')){
            return this.list.details.filter(x =>{ 
                  // console.log(patt.test(x.groupName.toLowerCase()));
                     x.bills.filter(y => patt.test(y.customerName.toLowerCase())) ;
                   //filter the biils list based on customerName
                    return true                  
               });
               //apply the filter when it is in group structure
          }else{
              return this.list.details.filter(x =>{ 
                  // console.log(patt.test(x.groupName.toLowerCase()));
                  if(self.detailsActive.hasOwnProperty('groupName')){
                    return patt.test(x.customerName.toLowerCase()) && x[self.detailsActive.groupName.toLowercase()] != 0
                  }else{
                    return patt.test(x.customerName.toLowerCase())
                  }
               });
               
          }
      }else{ //this will pass when filter applied 
        if(self.detailsActive.hasOwnProperty('groupName')){
          var str = self.searchString.toString();
          var patt = new RegExp(str,'g');
          if(self.searchString.length > 0 ){
            return self.detailsActiveList.filter(x => patt.test(x.customerName.toLowerCase()))
          }else{
            return self.detailsActiveList
          }
        }else{
          return self.list.details
        }
      }
    }
  },
  
  props: {
    list: {
      type: Object,
      default: function(){
        return {
          meta: [],
          group: [],
          details: []
        }
      }
    },
    filterData: {
      type: Array,
      default: function(){
        return []
      }
    },
    activeMeta: {
      type: Object,
      default: function(){
        return {
          groupName: "Billing Report",
          id: 5,
          filterMap: [1,4,5]
        }
      }
    },
    ActiveView: {
      type: String,
      default : "meta"
    }
  },
  data() {
    return {
      detailsFilter: [
        {groupName: "Monthly",id:1},
        {groupName: "Paid",id:2},
        {groupName: "Pending",id:3},
      ],
      activeListItem: {},
      filterDate: {
        from: (function(){ 
          var dat = new Date();
          var newDate = dat.setMonth(dat.getMonth() - 4);//number will be the months difference from current month
          return new Date(newDate)
        })(),
        to: new Date()
      },
      searchString: "",
      holderListData:[],
      detailsActive: '',
      detailsActiveList:[]
    };
  },

  directives: {
    money:{
      inserted:function(el){
        var str = el.innerHTML;
        var output,
            decm = "";
        if(str.includes('.')){
          decm ='.' + str.split('.')[1];
          str = str.split('.')[0];
        }
          if( !isNaN(str) && str.toString().length >= 4 ){
            output = str.split('').reverse().map((x,i)=>{
              if(i >1 && i%2 !== 0){
                return  x  + ','
              }else{
                return x
              }
            }).reverse().join('');
          }else{
            output = el.innerHTML
          }
          el.innerHTML = '₹' + output + decm;
        }
    }
  },

  methods: {
    pushFilter: function(){
      this.$emit('back');
      this.activeListItem = {}
      this.searchString = '';
    },
    getReport: function(){
      const self = this;
      (self.list.group.length > 0 && self.list.details.length === 0) ?
      this.$emit('getReport',{data: self.list.group,date:self.filterDate,from:'group'}) :
      this.$emit('getReport',{data: self.list.details,date:self.filterDate,from:'details'})
      
    },
    getTotal: function(arr,obj){
      if(arr.length > 0){
      return arr.map(x => x[obj]).reduce((acc,item) => Number(acc) + Number(item))
      }else{
        return 0 
      }
    },
    getData: function(payLoad,type){
      
      if(type !== 'getBillGroup'){
        this.activeListItem = payLoad;//active item
      }
      
      //change time unixstamp
      let to = parseInt(new Date(this.filterDate.to).getTime()/1000);
      let from = parseInt(new Date(this.filterDate.from).getTime()/1000);
      
      this.$emit(type,Object.assign(payLoad,{to,from}));//combine the date 
    },
    emitFilter: function(data){
      const self = this;
      if((this.list.group.length > 0 || this.list.meta.length > 0) && this.list.details.length === 0){
         this.$emit('hadFilter',{filterData:data,active: self.activeListItem,filterDate: self.filterDate});
      }else{
        //do the things to filter the list 
          self.detailsActive = data;
      }
    
   },
   setDate: function(){
     const self = this;
     //fire the date changes only when it is in group view
      if(self.ActiveView === "group"){
      //change time unixstamp
        let to = parseInt(new Date(this.filterDate.to).getTime()/1000);
        let from = parseInt(new Date(this.filterDate.from).getTime()/1000);
        self.$emit('hadDate',{active: self.activeListItem,filterDate: {to,from}});
     }
   }
  },
  
};
</script>

<style>
#panel ul { 
  
  border-left:1px solid #e7e7e7;
  border-right: 1px solid #e7e7e7; }
#panel ul li {border-bottom:1px solid #e7e7e7;}
/* #panel ul li:hover{ background-color: #e7e7e7;} */
#panel .active-item{background-color: rgb(175, 255, 255);}
#panel .vdp-datepicker div{display: inline;}
#panel .w200{ width:200px !important; }
.vdp-datepicker__calendar .cell{
  height:30px !important;
  line-height: 30px !important ;
}
.groupList {border-bottom:1px solid #e7e7e7;}

</style>