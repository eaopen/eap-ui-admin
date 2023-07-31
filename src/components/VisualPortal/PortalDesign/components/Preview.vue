<template>
  <el-dialog v-bind="$attrs" :close-on-click-modal="false" :modal-append-to-body="false"
    v-on="$listeners" @open="onOpen" @close="showPortalLayout = false" fullscreen lock-scroll
    class="JNPF-full-dialog" :show-close="false" :modal="false">
    <div class="JNPF-full-dialog-header">
      <div class="header-title">
        <img src="@/assets/images/jnpf.png" class="header-logo" />
        <p class="header-txt"> · 门户预览</p>
      </div>
      <div class="options">
        <el-button @click="closeDialog()">{{$t('common.cancelButton')}}</el-button>
      </div>
    </div>
    <div class="main" style="padding:0">
      <PortalLayout v-if="showPortalLayout" :layout="layoutData" mask detailed />
    </div>
  </el-dialog>
</template>

<script>
import PortalLayout from '@/components/VisualPortal/Layout'
export default {
  props: ['layout'],
  components: { PortalLayout },
  data() {
    return {
      showPortalLayout: false,
      layoutData: []
    }
  },
  methods: {
    onOpen() {
      this.showPortalLayout = true
      this.layoutData = this.filterList(JSON.parse(JSON.stringify(this.layout)))
    },
    filterList(layout) {
      const loop = list => {
        for (let i = 0; i < list.length; i++) {
          const item = list[i];
          if (!(Array.isArray(item.visibility) && item.visibility.includes('pc')) && item.jnpfKey) {
            list.splice(i, 1)
            i--
          }
          if (item.children && item.children.length) loop(item.children)
        }
      }

      loop(layout)
      return layout
    },
    closeDialog() {
      this.$emit('update:visible', false)
    }
  }
}
</script>