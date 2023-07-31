<template>
  <component :is="routerType" v-bind="linkProps(to)">
    <slot />
  </component>
</template>

<script>
import { isExternal } from '@/utils/validate'
import { getToken } from '@/utils/auth'
export default {
  props: {
    linkType: {
      type: String,
      default: ''
    },
    urlAddress: {
      type: String,
      default: ''
    },
    linkTarget: {
      type: String,
      default: 'self'
    },
    type: {
      type: [Number, String],
      default: 0
    },
    propertyJson: {
      type: String
    }
  },
  data() {
    return {
      to: ''
    }
  },
  computed: {
    isExternal() {
      return isExternal(this.to)
    },
    routerType() {
      if (!this.linkType || !this.urlAddress) return 'div'
      if (this.isExternal) return 'a'
      return 'router-link'
    }
  },
  created() {
    if (this.linkType) this.init()
  },
  methods: {
    init() {
      let path = '/' + this.urlAddress
      if (this.type == 6) {
        let propertyJson = this.propertyJson ? JSON.parse(this.propertyJson) : null, moduleId = '';
        if (propertyJson) moduleId = propertyJson.moduleId || ''
        path = `${this.define.dataV}/view/${moduleId}?token=${getToken()}`
      }
      if (this.type == 7 || this.linkType == 2) {
        if (this.linkTarget === "_self") {
          path = `/externalLink?href=${encodeURIComponent(Base64.encode(this.urlAddress))}`
        } else {
          path = this.urlAddress.replace(/\${dataV}/g, this.define.dataV).replace(/\${jnpfToken}/g, getToken())
        }
      }
      this.to = path
    },
    linkProps(to) {
      if (this.isExternal) {
        return {
          href: to,
          target: '_blank',
          rel: 'noopener'
        }
      }
      return {
        to: to
      }
    }
  }
}
</script>