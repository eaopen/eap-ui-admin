<template>
  <div class="ExternalLink-container app-container">
    <iframe id="ExternalLink" name="ExternalLink" width="100%" height="100%" frameborder="0"
      scrolling="yes" :src="url"></iframe>
  </div>
</template>

<script>
const Base64 = require('js-base64').Base64
export default {
  name: 'externalLink',
  data() {
    return {
      url: ''
    }
  },
  created() {
    const urlAddress = this.$route.meta.urlAddress || ''
    if (urlAddress) return this.url = urlAddress
    const href = Base64.decode(this.$route.query.href)
    this.url = href || ''
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
.ExternalLink-container {
  padding: 0;
}
</style>