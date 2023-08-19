<template>
  <p :style="_style">
    <el-link :underline="false" @click="onClickLink" type="primary">{{ content }}</el-link>
  </p>
</template>
<script>
const Base64 = require('js-base64').Base64
export default {
  props: {
    textStyle: {
      type: Object,
      default: () => ({
        'text-align': 'left',
      })
    },
    content: {
      type: String,
      default: ""
    },
    href: {
      type: String,
      default: ""
    },
    target: {
      type: String,
      default: "_self"
    }
  },
  computed: {
    _style() {
      return { ...this.textStyle }
    }
  },
  methods: {
    onClickLink(event) {
      this.$emit('click', event)
      if (!this.href) return
      if (this.target === '_self') {
        this.$router.push({ path: `/externalLink?href=${encodeURIComponent(Base64.encode(this.href))}` })
      } else if (this.target === '_blank') {
        window.open(this.href, this.target)
      }
    }
  }
}
</script>