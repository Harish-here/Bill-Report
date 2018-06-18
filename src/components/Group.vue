<template>
  <div class='pa1 bg-ddd'>
   <div class='flex flex-wrap' v-if='filterData.length > 0'>
     <div class='_flx_full tc pa1' v-for='i in filterData' :key='i.id'>
       <!-- <input class='p2-4' v-model='activeFilter' :value='i' type='radio' :name='filterName' @click='sendFilter'>{{i.groupName}} -->
        <button class='btn btn-xs' :class='{"act":activeFilter.id !== undefined && (i.id === activeFilter.id ),"btn-ghost":!(activeFilter.id !== undefined && (i.id === activeFilter.id ))}' @click='sendFilter(i)'>{{i.groupName}}</button>
     </div>
   </div>
   <div class='tc gray' v-else>No filters available </div>
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
        return [
         
        ]
      }
    }
  },
  data() {
    return {
      activeFilter : {}
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
     
    }
  }
};
</script>

<style>

</style>