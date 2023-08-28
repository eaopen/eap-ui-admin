<template>
  <div v-loading="loading" :style="'height:' + height">
    <iframe
      :src="src"
      frameborder="no"
      style="width: 100%; height: 100%"
      scrolling="auto"
      ref="iframeRef"
      @load="load"
    />
  </div>
</template>
<script>
export default {
  props: {
    src: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      height: document.documentElement.clientHeight - 94.5 + "px;",
      loading: true,
      url: this.src,
      iframeWin: ''
    };
  },
  computed:{
    token(){
      return this.$store.getters.token
    }
  },
  watch:{
    token: "load"
  },
  mounted: function () {
    setTimeout(() => {
      this.loading = false;
    }, 300);
    const that = this;
    window.onresize = function temp() {
      that.height = document.documentElement.clientHeight - 94.5 + "px;";
    };
    this.iframeWin = this.$refs.iframeRef.contentWindow
  },
  methods:{
    load(){
      let data = {
        token: this.token
      }
      console.log('post token:', data)
      this.iframeWin.postMessage(data)
    }
  }
};
</script>
