<template>
    <el-dialog
      :title="title"
      :visible="visible"
      :width="width"
      :height="height || '400px'"
      :before-close="closeDialog">
      <div>
        <component v-if="showComponent" :is="innerComponent" :params="params"></component>
      </div>
    </el-dialog>
</template>
<script>
export default {
    name: 'customComponentDialog',
    props: ['title', 'visible', 'width', 'height', 'componentName', 'innerComponent', 'params'],
    data(){
        return {
            showComponent: false,
        }
    },
    watch:{
      visible(v){
        if(v){
          this.showComponent = true
        }else{
          this.showComponent = false
        }
      }
    },
    methods:{
      closeDialog(){
        this.$store.dispatch('customDialog/hideDialog')
      }  
    }
}
</script>

