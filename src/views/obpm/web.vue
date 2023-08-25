<template>
  <div>
    <i-frame v-if="!loading" :src="url" />
  </div>
</template>
<script>
import iFrame from "@/components/iFrame/index";
import { getConfigKey } from "@/api/infra/config";
export default {
  name: "ObpmWeb",
  components: { iFrame },
  data() {
    return {
      // sso
      // obpmWebBaseUrl = /obpm-web/  规避跨域问题
      // url = obpmBaseUrl + path + ssoAuth
      url: "/obpm-web1/"+this.$route.meta.urlAddr,
      //loading: true
    };
  },
  created() {
    getConfigKey("url.obpm").then(response => {
      if (!response.data || response.data.length === 0) {
        return
      }
      this.obpmBaseUrl = response.data;
      this.url = this.obpmBaseUrl +"/"+ this.$route.meta.urlAddr;
    }).finally(() => {
      this.loading = false;
    })

    this.loading = false;
  }
};
</script>
