<template>
  <div>
    <i-frame v-if="!loading" :src="url" />
  </div>
</template>
<script>
import iFrame from "@/components/iFrame/index";
// import { getConfigKey } from "@/api/infra/config";
export default {
  name: "ObpmWeb",
  components: { iFrame },
  data() {
    return {
      // obpmWebBaseUrl = /obpm-web1/  规避跨域问题
      // url = obpmBaseUrl + path + ssoAuth
      url: process.env.VUE_APP_BASE_API + "/admin-api/obpm-web1/" + this.$route.meta.urlAddr,
      //loading: true
    };
  },
  created() {
    this.loading = false;
  }
};
</script>
