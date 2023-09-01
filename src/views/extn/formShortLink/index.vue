
<template>
  <component :is="currentView" :config="config" :modelId="modelId" :isPreview="isPreview"
    :encryption='encryption' v-show="showPage" />
</template>

<script>
import { getConfigData } from '@/api/onlineDev/webDesign'
import Form from './form/index.vue'
import List from './list/index.vue'
import { message } from '@/utils/message'
import CryptoJS from 'crypto-js'
import jnpf from '@/utils/extn'
import { Base64 } from 'js-base64'
export default {
  name: 'formShortLink',
  components: { Form, List },
  data() {
    return {
      currentView: '',
      showPage: false,
      isPreview: false,
      modelId: '',
      config: {},
      encryption: '',
      type: 'from'
    }
  },
  created() {
    let json = this.Decrypt(this.$route.query.encryption)
    let dataAll = JSON.parse(json)
    this.modelId = dataAll.modelId ? dataAll.modelId : ''
    this.encryption = this.$route.query.encryption
    this.type = dataAll.type
    if (!this.modelId) return
    this.getConfigData()
  },
  methods: {
    getConfigData() {
      getConfigData(this.modelId, this.encryption).then(res => {
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
        if (this.type == 'form') {
          this.currentView = 'Form'
        } else {
          this.currentView = 'List'
        }
        this.showPage = true
      }).catch(() => { })
    },
    Decrypt(data) {
      //AES key要求16位mode: CryptoJS.mode.ECB/DES key要求8位mode: CryptoJS.mode.ECB,
      var key = "jnpflinkjnpflink";
      let b = CryptoJS.enc.Hex.parse(data);
      const srcs = CryptoJS.enc.Base64.stringify(b)
      let decryptedData = CryptoJS.AES.decrypt(srcs, CryptoJS.enc.Utf8.parse(key), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }).toString(CryptoJS.enc.Utf8);
      return decryptedData
    },
  }
}
</script>
<style lang="scss" scoped>
.table {
  width: 80%;
}
</style>

