<template>
  <el-dialog v-bind="$attrs" :close-on-click-modal="false" :modal-append-to-body="false"
    v-on="$listeners" @open="onOpen" fullscreen lock-scroll class="OBPM-full-dialog"
    :show-close="false" :modal="false" append-to-body>
    <div class="OBPM-full-dialog-header">
      <div class="header-title">
        <img src="@/assets/images/extn/logo.png" class="header-logo" />
        <p class="header-txt">· 打印预览</p>
      </div>
      <div class="header-page">
        <el-button @click="pageIndex = pageIndex - 1">上一页</el-button>
        <el-input-number style="width: 60px" class="text-center" v-model="pageIndex"
          @change="scrollpage" @blur="scrollpage" :controls="false" controls-position="right"
          :min="1" :max="batchData.length"></el-input-number>
        <span class="page-size">/ {{ batchData.length }}</span>
        <el-button @click="pageIndex = pageIndex + 1">下一页</el-button>
      </div>
      <div class="options">
        <el-button type="primary" size="small" @click="word">下 载</el-button>
        <el-button type="primary" size="small" @click="print">打 印</el-button>
        <el-button @click="closeDialog()">{{ $t("common.cancelButton") }}</el-button>
      </div>
    </div>
    <div v-if="showContainer">
      <div ref="barcodewrap"></div>
      <div ref="qrcodewrap"></div>
    </div>
    <div class="main" ref="tsPrint" v-loading="loading">
      <div class="print-content" v-html="item" v-for="(item, index) in batchData" :key="index" ></div>
    </div>
  </el-dialog>
</template>
<script>
import printOptionApi from "./printMinxin.js";
import { getBatchData } from "@/api/extn/printDev";
import request from "@/utils/request";

export default {
  props: ["id", "formId", "fullName", "batchIds", "printTitle"],
  mixins: [printOptionApi],
  data() {
    return {
      pageIndex: 1,
      batchData: [],
    };
  },
  watch: {
    pageIndex: {
      handler(val) {
        this.scrollpage(val);
      },
      deep: true,
      immediate: true
    },
  },
  methods: {
    scrollpage() {
      let index = this.pageIndex - 1 < 0 ? 0 : this.pageIndex - 1;
      this.$nextTick(() => {
        let dom = this.$refs.tsPrint
        if (dom) {
          dom.scrollTo({
            top: (window.document.body.clientHeight - 10) * index,
            behavior: "smooth",
          });
        }
      });
    },
    onOpen() {
      // 打开时候初始化位置为第一页
      this.pageIndex = 0;
      if (!this.id) return;
      this.initData();
      this.batchData = [];
      this.printTemplate = "";
      this.data = {};
      this.loading = true;
      let query = {
        id: this.id,
        formId: this.batchIds,
      };
      getBatchData(query).then((res) => {
        if (!res.data) return;
        let array = res.data;
        for (let index = 0; index < array.length; index++) {
          const element = array[index];
          this.batchData.push(element.printTemplate);
        }
        this.showContainer = true
        this.$nextTick(async () => {
          let dom = this.$refs["tsPrint"];
          for (let index = 0; index < array.length; index++) {
            const element = array[index];
            // 获取每一页dom
            let domCurrent = dom.querySelectorAll(".print-content")[index];
            if (!element.printData) {
              this.batchData[index] = domCurrent.innerHTML.replace(/\{(.*?)\}/g, "");
            }
            await this.handleData(element, domCurrent);
            this.$set(this.batchData,index,this.printTemplate.replace(/\{(.*?)\}/g, ""))
            if (index == array.length - 1) {
              this.showContainer = false
            }
          }
        });
        this.loading = false;
      });
    },
    print() {
      let print = this.$refs.tsPrint.innerHTML;
      print = print + `<style>html * {word-break:break-all}</style>`;
      let iframe = document.createElement("IFRAME");
      document.body.appendChild(iframe);
      iframe.setAttribute(
        "style",
        "position:absolute;width:0px;height:0px;left:-500px;top:-500px;"
      );
      iframe.contentWindow.focus();
      let doc = iframe.contentWindow.document;
      let _this = this;
      iframe.onload = function () {
        let oldTitle = document.title;
        iframe.contentWindow.onafterprint = function (e) {
          // 插入日志
          let title = oldTitle.split("-")[0];
          let data = {
            printTitle: _this.fullName ? _this.fullName : title,
            printNum: _this.batchIds.split(",").length,
            printId: _this.id,
          };
          request({
            url: `/api/system/printLog/save`,
            method: "post",
            data,
          }).then((res) => { });
        };
        document.title = "JNPF快速开发平台";
        iframe.contentWindow.print();
        document.title = oldTitle;
        document.body.removeChild(iframe);
      };
      doc.write(print);
      doc.close();
    },
  },
};
</script>
<style lang="scss" scoped>
.main {
  overflow: auto !important;
  .print-content {
    background: white;
    padding: 40px 30px;
    margin: 20px auto 0;
    border: 1px solid #ccc;
    height: calc(100% - 10px);
    border-radius: 4px;
    width: 776px;
    height: 100%;
    overflow: auto;
  }
}
.header-page {
  vertical-align: middle;
  min-width: 300px;
  .el-button {
    margin: 0 10px;
  }
  .page-size {
    vertical-align: middle;
    margin-left: 10px;
    font-size: 18px;
    font-weight: 400;
    color: #333;
  }
}
</style>
