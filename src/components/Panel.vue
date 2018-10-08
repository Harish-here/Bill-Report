<template>
  <div id="panel" class='pa flex flex-column trans' :class='{"panel-shadow":list.details.length > 0}'>
    <div class='pa2 tc br-clr h-head' :class='{"br-none":list.details.length > 0}' >
      <div class='flex flex-column items-stretch'>
        <!-- <button class='btn btn-default btn-xs' v-if='ActiveView === "group"' @click='pushFilter'>
          <i class="fa fa-chevron-left f4" aria-hidden="true"></i>
        </button> -->
        <span class='_flx_full f4 p5' v-if='ActiveView !== "meta"'>
            {{ (ActiveView === 'details') ? ActiveMetaData.groupName : "" }} <i v-if='ActiveView === "details"' class="fa fa-chevron-right f5" aria-hidden="true"></i> {{ (ActiveView !== "meta") ?  activeMeta.groupName : "Billing Report" }}
            <i  v-if='(ActiveView === "group" || ActiveView === "details") && (list.group.length > 0 || DetailsList.length > 0)' title='export this as report' @click='getReport' class="fa fa-download pa1 f4 cursor" aria-hidden="true"></i>
        </span>
        <span style='padding:1px;' v-if='ActiveView === "meta"'>Date Type</span>
        <span  class='_flx_full f4' v-if='ActiveView === "meta"'>
          <span class="flex w-100 pa1">            
            <button class='btn btn-default btn-xs btn-ghost w-33' :class='{"btn-ghost-act" : DateFilter === "all"}' @click='DateFilter = "all"'>All</button>
            <button class='btn btn-default btn-xs btn-ghost w-33' :class='{"btn-ghost-act" : DateFilter === "booking"}' @click='DateFilter = "booking"'>Booking</button>
            <button class='btn btn-default btn-xs btn-ghost w-33' :class='{"btn-ghost-act" : DateFilter === "checkin"}' @click='DateFilter = "checkin"'>Checkin</button>
            <button class='btn btn-default btn-xs btn-ghost w-33' :class='{"btn-ghost-act" : DateFilter === "checkout"}' @click='DateFilter = "checkout"'>Checkout</button>
          </span>
        </span>
        <span style='padding:1px;' v-if='ActiveView === "meta"'>Range</span>
      </div>
      <!--datepicker -->
      <div class='pa1 tc' v-if='ActiveView === "meta"'>
        <datepicker @input='setDate' calendar-class='w200' wrapper-class='di' input-class=' w40 btn btn-default btn-xs'	 v-model='filterDate.from'></datepicker> 
        <div class='di w20  p5-10'>to</div>
        <datepicker  @input='setDate' calendar-class='w200' wrapper-class='di' input-class='w40 btn btn-default btn-xs'	 v-model='filterDate.to' :disabled-dates='{to: filterDate.from}'></datepicker> 

      </div>
       <!-- Number of transction label -->
      <div class='p1 tc' v-if='ActiveView === "details"'>
        
          Number of transactions - 
          {{ (list.details.length > 0 && 
               !list.details[0].hasOwnProperty('groupName')) ?
                                         list.details.length : 
                                         (list.details.length > 0) ? list.details.map(x => x.bills.length).reduce((a,b)=> a+b) : 0
           }}

      </div>
       <!-- search text box -->
      <div class='tl p1' v-if='ActiveView === "group"'>
          <div class='br-clr w100 flex'> 
            <!-- <i class="fa fa-search dib" aria-hidden="true"></i> -->
            <input class='pa2 b5 w-100 br-white' type='text' v-model='searchString' @input='saySmthn' :placeholder="'Search in '+activeMeta.groupName">
          </div>
      </div>
      <!--- group filter -->
      <div class='tc' v-if='ActiveView === "details"'>
       <group :filterData="dataForFilter" :finace-filter="detailsFilter" @setFinanceFilter='FilterEmit' @setFilter='GroupEmit' View='group'/>
      </div>
            <!-- filter -->
      <div class='tc' v-if='ActiveView === "details" && false'>
        <group :filterData="detailsFilter" @setFilter='FilterEmit' View='details'/>
      </div>
    </div>

    <!-- result label -->
    <div class='p2-4' v-if='searchString.length > 0'>
      <span class='gray'> Results for </span> "<b>{{ searchString }}</b>" <button class='fr f12 close' @click="searchString=''">clear</button>
    </div>
    <!-- Group listing -->
    <span v-if='ActiveView === "group"'>
      <ul class='pa h-fix-g y-flow'>
          <li class='p5-10 cursor' v-for='i in filterList' :key='i.id' @click='getData(i,"getBillList")' :class='{"active-item":(activeListItem.id !== undefined && activeListItem.id === i.id)}'>
            <div class='black tc b6 p10'>{{i.groupName}}</div>
            <!-- <i class="fa fa-chevron-right fr f14" aria-hidden="true"></i> -->
            <i v-if='(activeListItem.hasOwnProperty("id") && activeListItem.id === i.id)' class="fa fa-chevron-right fr f14" aria-hidden="true"></i>
            <div>
              <div class='flex justify-around pa1  tc'>
                <div class='flex flex-column'>
                  <span class=''>Total</span>
                  <span class='navy b6 p5' v-money>{{i.total}}</span>
                </div>
                <div class='flex flex-column'>
                  <span class=''>Paid</span>
                  <span class='green b6 p5' v-money>{{i.paid}}</span>
                </div>
                <div class='flex flex-column'>
                  <span class=''>Pending</span>
                  <span class='light-red b6 p5' v-money>{{i.pending}}</span>
                </div>
              </div>
            
            </div>
          </li>
          <li class=' p10 tc  br-none no-bill' v-if='list.group.length !== 0 && filterList.length === 0'>No Reports found</li>
          <li class=" p10 tc  br-none no-bill" v-if='list.group.length === 0'>No Reports found</li>
      </ul>
    </span>
    
    <!-- details listing -->
    <span v-if='ActiveView === "details"'>
      <ul class='pa fl w100 h-fix y-flow'>
        <!-- details list without filter -->
        <span v-if='DetailsList.length > 0 && !DetailsList[0].hasOwnProperty("groupName")'>
          <li class='fl w100  '
              v-for='i in DetailsList' :key='i.bookingId' 
              :class='{"active-item":(activeListItem.bookingId !== undefined && activeListItem.bookingId === i.bookingId)}'>
            
            <div class="fl w100 p10">
              <div class='fl w30 p2-4 cursor'><span class="label label-primary f12 pa1 " @click='getData(i,"getBill")'>{{i.bookingVoucherId}}</span></div>
              <div class="fl w25 p2-4 cursor" @click='getAttach(i.bookingId)'><i class="fa fa-file-image-o" aria-hidden="true"></i> Uploaded Bills</div>
              <div class='fl w40 al-right p2-4'><span class=''>{{i.date}}</span> </div>
            </div>      
            <div class="fl w100 p10">
              <div class='fl w30 p2-4'>{{i.customerName}}</div>
              <div class='fl w25 p2-4 cursor' @click='getData(i,"getBill")'><i class="fa fa-file-text-o" aria-hidden="true"></i> Travel Voucher</div>
              <div class='fl w40 al-right p2-4 b6 black f12'><span class='badge badge-primary' v-money>{{i.total}}</span></div>
            </div>
          </li>
        </span>
        <li class='fl w100' v-else><!-- details list view with filter -->
          <div class='fl w100' v-for='i in DetailsList' :key='i'>
            <div class='fl w100 p5-10 black  bg-gray center'><span class='b6 fl w100 p5'>{{i.groupName}}</span>
              <div class='flex w100' v-if="getTotal(i.bills,'total') > 0">
                <span class='flex flex-column _flx_full'>Total<span class='reds fl' v-money>{{ getTotal(i.bills,'total') }}</span></span>
                <span class='flex flex-column _flx_full'>Paid<span class='blue fl' style="background-color: rgb(245, 245, 245);" v-money>{{ getTotal(i.bills,'paid') }}</span></span>
                <span class='flex flex-column _flx_full'>Pending<span class='green fl' v-money>{{ getTotal(i.bills,'pending') }}</span></span>
              </div>
            </div>
            <div class='fl w100  groupList p2-4' v-for='y in i.bills' :key='y.bookingId' :class='{"active-item":(activeListItem.bookingId !== undefined && activeListItem.bookingId === y.bookingId)}' @click='getData(y,"getBill")'>
                <div class="fl w100 p10">
                  <div class='fl w30 p2-4 cursor'><span class="label label-primary f12 pa1 cursor" @click='getData(i,"getBill")'>{{y.bookingVoucherId}}</span></div>
                  <div class="fl w25 p2-4 cursor" @click='getAttach(i.bookingId)'><i class="fa fa-file-text-o" aria-hidden="true"></i> Uploaded Bills</div>
                  <div class='fL w40 al-right p2-4'><span class=''>{{y.date}}</span> </div>
                </div>
                
                <div class="fl w100 p10">
                  <div class='fl w30 p2-4'>{{y.customerName}} </div>
                  <div class='fl w25 p2-4 cursor' @click='getData(i,"getBill")'><i class="fa fa-file-text-o" aria-hidden="true"></i> Travel Voucher</div>
                  <div class='fl w40 al-right p2-4 b6 black f12'>
                    <span class='badge badge-primary' v-money>{{y.total}}</span>
                  </div>
                </div>
            </div>
            <div class='fl w100 p10 center no-bill' v-if='i.bills.length === 0'>No Bills found</div>
            <!-- bill strip end -->
            
          </div>
        </li>
        <li class='fl w100 p10 center br-none no-bill' v-if='list.details.length !== 0 && DetailsList.length === 0'>No Bills found</li>
        <!-- <li class='fl w100 p10 center  br-none' v-if='DetailsList.length.length === 0'> No Bills found</li> -->
      </ul>
    </span>

    <!-- meta listing -->
     <span v-if=" ActiveView ==='meta' ">
      <ul class='pa  h-fix y-flow' v-if='list.meta.length > 0 && list.group.length === 0' >
        <li class='p20-40 cursor tc b6' v-for='i in list.meta' :key='i.id' @click='getData(i,"getBillGroup")'><span>{{i.groupName}}</span>
          <i class="fa fa-chevron-right fr f14" aria-hidden="true" v-if='i === activeListItem'></i>
        </li>
      </ul>
    </span>
    <!-- report sumary -->
    <div class='flex flex-column bg-ddd' style="overflow-x:auto;"  v-if='ActiveView === "group" || ActiveView === "details"'>
      
        <div class='tc pa1 b6'>Summary</div>
        
        <div class='flex flex-stretch f5 tc' v-if='ActiveView === "group"'>
         <div class='flex flex-column  _flx_full'>Total <div class='blue' v-money>{{overAllTotal}}</div></div>
         <div class='flex flex-column  _flx_full'>Paid<div class='green' v-money>{{overAllPaid}}</div></div>
         <div class='flex flex-column  _flx_full'>Pending <div class='reds' v-money>{{overAllPending}}</div></div>
        </div>
        <div class='flex flex-stretch f5 tc' v-if='ActiveView === "details"'>
         <div class='flex flex-column  _flx_full'>Total <div class='blue' >{{Total}}</div></div>
         <div class='flex flex-column  _flx_full'>Paid<div class='green' >{{PaidTotal}}</div></div>
         <div class='flex flex-column  _flx_full'>Pending <div class='reds' >{{PendingTotal}}</div></div>
        </div>
       
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
    'detailsActive': function(){ //when the details filtered applied
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
    },
    DetailsList: {
      immediate: true,
      handler: function(val){
          const self = this;
            let o = val,
            pay = 0 ,
            pending = 0 ,
            Tot = 0 ;
          for(let c=0;c < val.length;c++){
            if(o[c].hasOwnProperty('groupName')){
              if(o[c].bills.length > 0){
                pay += Number(o[c].bills.map(x => x.paid).reduce((acc,a) => Number(acc) + Number(a)));
                pending += Number(o[c].bills.map(x => x.pending).reduce((acc,a) => Number(acc) + Number(a)));
                Tot += Number(o[c].bills.map(x => x.total).reduce((acc,a) => Number(acc) + Number(a)));
              }
            }else{
              pay += Number(val[c].paid);
              pending += Number(val[c].pending);
              Tot += Number(val[c].total);
            }
          }
          self.PaidTotal = self.makeMoney(pay.toFixed(2));
          self.PendingTotal = self.makeMoney(pending.toFixed(2));
          self.Total = self.makeMoney(Tot.toFixed(2));
        }
    },
    DateFilter: function(){
      if(this.activeListItem.hasOwnProperty('groupName')){
        this.getData(this.activeListItem,'getBillGroup');
      }
    }
  },

  computed: {
    dataForFilter(){
      const self = this;
      if(this.ActiveMetaDataList.length > 0){
        return this.ActiveMetaDataList.filter(function(x){
          return self.ActiveMetaData.filterMap.findIndex(y => { return y === x.id }) !== -1
        })
      }else{
        return this.detailsFilter
      }
    },
    overAllPaid(){
      if(this.list.group.length > 0) {
       return Number(this.list.group.map(x => x.paid).reduce((acc,x) => Number(acc) + Number(x))).toFixed(2) 
      }else if(this.list.details.length > 0){
        if(this.list.details.length > 0 && !this.list.details[0].hasOwnProperty('groupName')){

          return Number(this.list.details.map(x => x.paid).reduce((acc,x) => Number(acc) + Number(x))).toFixed(2)
        }else{
          return Number(this.list.details.map(x => {
            if(x.bills.length > 0){
              return x.bills.map(y => y.paid).reduce((acc1,u) => Number(acc1) + Number(u));
            }else{
              return 0;
            }
            
          }).reduce((acc,x) => Number(acc) + Number(x))).toFixed(2);//do the calc when they are in group
        }
      }
    },
    overAllPending(){
     if(this.list.group.length > 0) {
       return Number(this.list.group.map(x => x.pending).reduce((acc,x) => Number(acc) + Number(x) )).toFixed(2)
      }else if(this.list.details.length > 0){
        if(this.list.details.length > 0 && !this.list.details[0].hasOwnProperty('groupName')){
          
          return Number(this.list.details.map(x => x.pending).reduce((acc,x) => Number(acc) + Number(x))).toFixed(2);
        }else{
          return Number(this.list.details.map(x => {
            if(x.bills.length > 0) return x.bills.map(y => y.pending).reduce((acc1,u) => Number(acc1) + Number(u));
            return 0;
            
          }).reduce((acc,x) => Number(acc) + Number(x))).toFixed(2);//do the calc when they are in group
        }
      }
    },
    overAllTotal(){
      if(this.list.group.length > 0) {
       return Number(this.list.group.map(x => x.total).reduce((acc,x) => Number(acc) +Number(x))).toFixed(2) 
      }else if(this.list.details.length > 0){
        if(this.list.details.length > 0 && !this.list.details[0].hasOwnProperty('groupName')){
          
          return Number(this.list.details.map(x => x.total).reduce((acc,x) => Number(acc) + Number(x))).toFixed(2)
        }else{
          return Number(this.list.details.map(x => {
            if(x.bills.length > 0) return x.bills.map(y => y.pending).reduce((acc1,u) => Number(acc1) + Number(u));
            return 0;
          }).reduce((acc,x) => Number(acc) + Number(x))).toFixed(2);
        }
      }
    },
    filterList(){
      const self = this;
      if(this.list.group.length > 0 && this.searchString.length > 0){
        var str = self.searchString.toLowerCase();
        // var patt = new RegExp(str,'g');
       return this.list.group.filter(x =>{ 
            // console.log(patt.test(x.groupName.toLowerCase()));
            return x.groupName.toLowerCase().includes(str) 
            });
      }else{
        return self.list.group
      }
    },

    filterDetailsList(){
      const self = this;
      if(this.list.details.length > 0 && this.searchString.length > 0 && !self.detailsActive.hasOwnProperty('groupName')){
        var str = self.searchString.toLowerCase();
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
          var str = self.searchString.toLowerCase();
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
    },
    DetailsList(){
      const self = this;
      const fo = this.ActiveDetailsFilter;

      if(this.list.details.length > 0){
        if(this.list.details[0].hasOwnProperty('groupName')){
          //do the filter when they are in group
          if(fo.hasOwnProperty('groupName')){
            return this.list.details.map(x => {
              let temp = []
              if(x.bills.length > 0){
                temp = x.bills.filter(y => {
                  if(fo.groupName == 'Pending'){
                    return  Number(y.pending) > 0 
                  }else{
                    return Number(y.pending) == 0
                  }
                });
              }
              return {
                groupName: x.groupName,
                bills: temp,
              }
            });
          }else{
            return this.list.details
          }
        }else{
          //do the filter when they are not in group
          if(fo.hasOwnProperty('groupName')){
            return this.list.details.filter(y =>{
              return (fo.groupName == 'Pending') ? y.pending > 0 : y.paid == y.total;
            });
          }else{
            return this.list.details
          }
        }
      }else{
        return []
      } 
    },
    DetailsPaid(){
      const self = this;
     if(self.DetailsList.length > 0){
        if(self.DetailsList[0].hasOwnProperty('groupName')){
          return Number(self.DetailsList.map(x => {
            if(x.bills.length > 0){
             return Number(x.bills.map(y => y.paid).reduce((acc,val) => Number(acc) + Number(val)))
            }else{
              return 0
            }
          }).reduce((a,b) => Number(a) + Number(b))).toFixed(2);
        }else{
          return Number(self.DetailsList.map(x => x.paid).reduce((acc,val) => Number(acc) + Number(val))).toFixed(2)
        }
      }else{
        return 0;
      }
    },
    DetailsPending(){
       const self = this;
        if(self.DetailsList.length > 0){
            if(self.DetailsList[0].hasOwnProperty('groupName')){
              return Number(self.DetailsList.map(x => {
                if(x.bills.length > 0){
                return Number(x.bills.map(y => y.pending).reduce((acc,val) => Number(acc) + Number(val)))
                }else{
                  return 0
                }
              }).reduce((a,b) => Number(a) + Number(b))).toFixed(2);
            }else{
              return Number(self.DetailsList.map(x => x.pending).reduce((acc,val) => Number(acc) + Number(val))).toFixed(2)
            }
          }else{
            return 0;
          }
    },
    DetailsTotal(){
          const self = this;
        if(self.DetailsList.length > 0){
            if(self.DetailsList[0].hasOwnProperty('groupName')){
              return Number(self.DetailsList.map(x => {
                if(x.bills.length > 0){
                return Number(x.bills.map(y => y.total).reduce((acc,val) => Number(acc) + Number(val)))
                }else{
                  return 0
                }
              }).reduce((a,b) => Number(a) + Number(b))).toFixed(2);
            }else{
              return Number(self.DetailsList.map(x => x.total).reduce((acc,val) => Number(acc) + Number(val))).toFixed(2)
            }
          }else{
            return 0;
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
    },
    ActiveMetaData: {
      type : Object,
      default: function(){
        return {id: "2", groupName: "Hotel", filterMap: ["4", "5"]}
      }
    },
    ActiveMetaDataList: {
      type: Array,
      default: function(){
        return []
      }
    }

  },
  data() {
    return {
      detailsFilter: [
        // {groupName: "Monthly",id:1},
        {groupName: "Paid",id:2},
        {groupName: "Pending",id:3},
      ],
      DateFilter: 'all', 
      ActiveDetailsFilter: {},
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
      detailsActiveList:[],
      PaidTotal : 0,
      PendingTotal: 0,
      Total: 0
    };
  },
  mounted: function() {
    this.$emit('EmitDate',{to: this.filterDate.to,from: this.filterDate.from})
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
            output = str
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
      this.ActiveDetailsFilter = {};

    },

    getAttach: function(id){
      this.$emit('GetAttachments',id);
    },

    makeMoney : function(el){
        var str = el.toString();
        var output,
            decm = "";
        if(str.includes('.')){
          decm ='.' + str.split('.')[1];
          str = str.split('.')[0];
        }
          if( !isNaN(str) && str.length >= 4 ){
            output = str.split('').reverse().map((x,i)=>{
              if(i >1 && i%2 !== 0){
                return  x  + ','
              }else{
                return x
              }
            }).reverse().join('');
          }else{
            output = str
          }
          let money = '₹' + output + decm;
          return money
        },

    calculate: function(type){
     if(this.list.details.length > 0){
        if(this.list.details[0].hasOwnProperty('groupName')){
          return this.list.details.map(x => {
            if(x.bills.length > 0){
             return x.bills.map(y => y['paid']).reduce((acc,val) => Number(acc) + Number(val))
            }else{
              return 0
            }
          }).reduce((a,b) => Number(a) + Number(b));
        }else{
          return this.list.details.map(x => x['paid']).reduce((acc,val) => Number(acc) + Number(val))
        }
      }else{
        return 0;
      }
    },
    getReport: function(){
      const self = this;
      if(self.list.group.length > 0) {
      this.$emit('getReport',{data: self.list.group,date:self.filterDate,from:'group'})}else{
      this.$emit('getReport',{data: self.list.details,date:self.filterDate,from:'details'})}
      
    },
    getTotal: function(arr,obj){
      if(arr.length > 0){
      return Number(arr.map(x => x[obj]).reduce((acc,item) => Number(acc) + Number(item))).toFixed(2)
      }else{
        return 0 
      }
    },
    getData: function(payLoad,type){
      const self = this;
      // if(type !== 'getBillGroup'){
        this.activeListItem = payLoad;//active item
      
      //change time unixstamp
      let to = parseInt(new Date(this.filterDate.to).getTime()/1000);
      let from = parseInt(new Date(this.filterDate.from).getTime()/1000);
      let DateType = self.DateFilter;
      this.$emit(type,Object.assign(payLoad,{to,from,DateType}));//combine the date 
    },
    emitFilter: function(data){
      const self = this;
      if((this.list.group.length > 0 || this.list.meta.length > 0) && this.list.details.length === 0){
         this.$emit('hadFilter',{filterData: data,active: self.activeListItem,filterDate: self.filterDate});
      }else{
        //do the things to filter the list 
          self.detailsActive = data;
      }
    
   },

   GroupEmit: function(data){
     const self = this;
     this.$emit('GroupEmitted',{filterData:data,active: self.activeMeta,DateType : self.DateFilter});
   },
   
   FilterEmit: function(data){
     //filter the incoming list of details
      this.ActiveDetailsFilter = data;

   },
   setDate: function(){
     const self = this;
    //fire the date changes only when it is in group view
    //change time unixstamp
    let to = parseInt(new Date(this.filterDate.to).getTime()/1000);
    let from = parseInt(new Date(this.filterDate.from).getTime()/1000);
    let DateType = self.DateFilter;
    self.$emit('hadDate',{active: self.activeListItem,filterDate: {to,from,DateType}});
     
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