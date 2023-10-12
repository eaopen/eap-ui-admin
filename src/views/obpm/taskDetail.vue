<template>
  <div>
    <task-detail-component :taskid="taskid"/>
  </div>
</template>
<script>
const TaskDetailComponent = ()=> import("@/components/obpm/bpm/taskDetail/index.vue")

export default {
  name: 'TaskDetail',
  components: {
    TaskDetailComponent
  },
  data(){
    return {
      taskid: ''
    }
  },
  created(){
    this.taskid = this.$route.path.split('/taskDetail/')[1] ||'444861860525637633'
  },

}
</script>
