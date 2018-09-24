<template>
  <div>
   <div class='flex flex-wrap pa1' v-if='filterData.length > 0 && false'>
     <div class='_flx_full tc' v-for='i in filterData' :key='i.id'>
       <!-- <input class='p2-4' v-model='activeFilter' :value='i' type='radio' :name='filterName' @click='sendFilter'>{{i.groupName}} -->
        <button class='btn btn-xs' :class='{"act":activeFilter.id !== undefined && (i.id === activeFilter.id ),"btn-ghost":!(activeFilter.id !== undefined && (i.id === activeFilter.id ))}' @click='sendFilter(i)'>
          <i class="fa fa-list-alt" aria-hidden="true"></i>
          {{i.groupName}}
        </button>
     </div>
   </div>
   <!-- <div class='tc gray' v-else>No filters available </div> -->
   <div class='flex flex-wrap pa1'>
     <div class='_flx_full tc'>
       <div class="dropdown">
          <button class="btn btn-default  btn-xs btn-ghost dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
            <i class="fa fa-list-alt" aria-hidden="true"></i>
              Group By {{ (activeFilter.hasOwnProperty('id')) ? activeFilter.groupName : ""  }}
            <span class="caret"></span>
          </button>
          <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">
            <li class='cursor p5-10' v-for='i in filterData' :key='i.id' @click="sendFilter(i)"
                :class='{"act-li": (activeFilter.hasOwnProperty("id") && (i.id == activeFilter.id)) }'
            >{{i.groupName}}</li>
            <li class='cursor p5-10 clear-filter' @click='sendFilter(activeFilter)'>Clear Grouping</li>
          </ul>
       </div>
     </div>
     <div class='_flx_full tc'>
       <div class="dropdown">
          <button class="btn btn-default btn-xs btn-ghost dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
            <i class="fa fa-filter" aria-hidden="true"></i>
              Filter By {{ (activeFinanceFilter.hasOwnProperty('id')) ? activeFinanceFilter.groupName : ""  }}
            <span class="caret"></span>
          </button>
          <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">
            <li class='cursor p5-10' v-for='i in FinaceFilter' :key='i.id' @click="sendFinanceFilter(i)"
                :class='{"act-li": (activeFinanceFilter.hasOwnProperty("id") && (i.id == activeFinanceFilter.id)) }'
            >{{i.groupName}}</li>
            <li class='cursor p5-10 clear-filter' @click='sendFinanceFilter(activeFinanceFilter)'>Clear Filter</li>
          </ul>
       </div>
     </div>
   </div>
  </div>
</template>

<script>
import  api  from '../assets/event.js'
export default {
  name: "group",
  computed: {
    filterName(){
      return this.filterData.map(x => x.groupName).join('_')
    }
  },
  props: {
    filterData: {
      type: Array,
      default: function(){
        return []
      }
    },
    FinaceFilter :{
      type: Array,
      default: function(){

      },
    },
    View: {
      type: String,
      default : ''
    }
  },
  data() {
    return {
      activeFilter : {},
      activeFinanceFilter : {}
    };
  },
  methods: {
    sendFilter: function(obj){
      if(this.activeFilter.hasOwnProperty('id') && this.activeFilter.id === obj.id ){
        this.activeFilter = {};
        this.$emit('setFilter',{});
      }else{
        this.activeFilter = JSON.parse(JSON.stringify(obj));
        this.$emit('setFilter',this.activeFilter);
      }
     
    },
    sendFinanceFilter: function(obj){
      if(this.activeFinanceFilter.hasOwnProperty('id') && this.activeFinanceFilter.id === obj.id ){
        this.activeFinanceFilter = {};
        this.$emit('setFinanceFilter',{});
      }else{
        this.activeFinanceFilter = JSON.parse(JSON.stringify(obj));
        this.$emit('setFinanceFilter',this.activeFinanceFilter);
      }
     
    }
  }
};
</script>

<style>
.act-li{
  background-color: aliceblue;
}
ul.dropdown-menu > li{
  padding:5px;
}
.clear-filter{
    background-color: #e7e7e7 !important;
    text-align: center;
    color: #463f3f !important;
    font-weight: 600;
}
</style>