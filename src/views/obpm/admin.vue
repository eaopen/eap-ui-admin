<template>
  <div>
    <i-frame v-if="!loading" :src="url" />
  </div>
</template>
<script>
import iFrame from "@/components/iFrame/index";
import { getConfigKey } from "@/api/infra/config";
export default {
  name: "ObpmAdmin",
  components: { iFrame },
  data() {
    return {
      // obpmAdminBaseUrl = /obpm-admin/  规避跨域问题
      // obpmBaseUrl = http://localhost:3002/  dev only
      // url = obpmBaseUrl + path + ssoAuth
      url: "/obpm-admin/" + this.$route.meta.urlAddr,
      //loading: true
    };
  },
  created() {
    // save accessToken to obpm iframe
    // getConfigKey("url.obpm").then(response => {
    //   if (!response.data || response.data.length === 0) {
    //     return
    //   }
    //   this.obpmBaseUrl = response.data;
    //   this.url = this.obpmBaseUrl +"/"+ this.$route.meta.urlAddr;
    // }).finally(() => {
    //   this.loading = false;
    // })
    this.loading = false;
  }
};
</script>
