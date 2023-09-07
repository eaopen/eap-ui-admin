<template>
  <el-dialog v-bind="$attrs" :close-on-click-modal="false" :modal-append-to-body="false"
    v-on="$listeners" @open="onOpen" fullscreen lock-scroll class="OBPM-full-dialog"
    :show-close="false" :modal="false" append-to-body>
    <div class="OBPM-full-dialog-header">
      <div class="header-title">
        <img src="@/assets/images/extn/logo.png" class="header-logo" />
        <p class="header-txt">· 打印预览</p>
      </div>
      <div class="options">
        <el-button type="primary" size="small" @click="word">下 载</el-button>
        <el-button type="primary" size="small" @click="print">打 印</el-button>
        <el-button @click="closeDialog()">{{ $t("common.cancelBtn") }}</el-button>
      </div>
    </div>
    <div v-if="showContainer">
      <div ref="barcodewrap"></div>
      <div ref="qrcodewrap"></div>
    </div>
    <div v-loading="loading">
      <div class="main" ref="tsPrint">
        <div class="print-content" v-html="item" v-for="(item, index) in batchData" :key="index" />
      </div>
    </div>
  </el-dialog>
</template>
<script>
import printOptionApi from "./printMinxin.js";
import { getData } from "@/api/extn/printDev";
export default {
  mixins: [printOptionApi],
  props: ["id", "formId", "fullName"],
  data() {
    return {
      batchData: [],
    };
  },
  methods: {
    getNowDocument(index) {
      let dom = this.$refs["tsPrint"];
      let domCurrent = dom.querySelectorAll(".print-content")[index];
      return domCurrent;
    },
    tagTable(domCurrent) {
      const tableList = domCurrent.getElementsByTagName("table");
      if (tableList.length) {
        for (let j = 0; j < tableList.length; j++) {
          const tableObj = tableList[j];
          tableObj.setAttribute("tagid", +new Date());
        }
      }
    },
    onOpen() {
      if (!this.id) return;
      this.initData();
      //刚开始清空数据
      this.data = {};
      let query = {
        id: this.id,
        formId: this.formId,
      };
      this.loading = true;
      this.showContainer = true;
      getData(query).then(async (res) => {
        if (!res.data) return (this.loading = false);
        this.batchData.push(res.data.printTemplate);
        this.$nextTick(async () => {
          let dom = this.$refs["tsPrint"];
          for (let index = 0; index < this.batchData.length; index++) {
            let domCurrent = dom.querySelectorAll(".print-content")[index];
            // 给table加标识
            this.tagTable(domCurrent);
            if (!res.data.printData) {
              this.printTemplate = domCurrent.innerHTML
              this.batchData[index] = this.printTemplate.replace(/\{(.*?)\}/g, "")
              this.loading = false;
              break
            }
            await this.handleData(res.data, domCurrent, index);
            this.batchData[index] = this.printTemplate.replace(/\{(.*?)\}/g, "");
            this.showContainer = false;
            this.loading = false;
          }
        });
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.print-content {
  background: white;
  padding: 40px 30px;
  margin: 0 auto;
  border-radius: 4px;
  width: 776px;
  height: 100%;
  overflow: auto;
  color: #000;
}
</style>
