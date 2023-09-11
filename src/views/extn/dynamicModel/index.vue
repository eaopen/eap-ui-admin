
<template>
  <component :is="currentView" :config="config" :modelId="modelId" :isPreview="isPreview"
    v-show="showPage" />
</template>

<script>
import { getConfigData } from '@/api/onlineDev/visualDev'
import Form from './form'
import List from './list'
import ViewForm from './view'
import { message } from '@/utils/message'

export default {
  name: 'dynamicModel',
  components: { Form, List, ViewForm },
  data() {
    return {
      currentView: '',
      showPage: false,
      isPreview: false,
      modelId: '',
      config: {}
    }
  },
  created() {
    let isPreview = this.$route.query.isPreview || false
    if (isPreview) {
      this.modelId = this.$route.query.id
      this.isPreview = true
    } else {
      this.modelId = this.$route.meta.relationId
    }
    const type = this.$route.query.previewType ? this.$route.query.previewType : ''
    if (!this.modelId) return
    this.getConfigData({ type })
  },
  methods: {
    getConfigData(previewType) {
      getConfigData(this.modelId, previewType).then(res => {
        if (res.code !== 200 || !res.data) {
          this.$store.dispatch('tagsView/delView', this.$route)
          this.$router.replace('/404')
          message({
            message: res.msg || '请求出错，请重试',
            type: 'error',
            duration: 1500,
          })
          return
        }
        this.config = res.data
        if (res.data.webType == '1') {
          this.currentView = 'Form'
        } else if (res.data.webType == '4') {
          this.currentView = 'ViewForm'
        } else {
          this.currentView = 'List'
        }
        this.showPage = true
      }).catch(() => { })
    }
  }
}
</script>
