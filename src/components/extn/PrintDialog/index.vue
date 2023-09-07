<template>
  <div>
    <el-dialog title="请选择打印模板" :close-on-click-modal="false" append-to-body
      class="JNPF-dialog template-dialog JNPF-dialog_center" lock-scroll width="400px"
      :visible.sync="printVisible">
      <el-scrollbar class="template-list">
        <div class="template-item" v-for="item in printListOptions" :key="item.id"
          @click="selectPrint(item)">
          {{ item.fullName }}
        </div>
      </el-scrollbar>
    </el-dialog>
  </div>
</template>

<script>
import { printOptionsApi } from "@/api/extn/printDev";
export default {
  components: {},
  props: {
    ids: {
      type: String
    }
  },
  data() {
    return {
      printVisible: false,
      printListOptions: []
    };
  },
  watch: {
    ids: {
      handler(val) {
        if(val) {
        }
      }
    }
  },
  computed: {},
  created() { },
  mounted() { },
  methods: {
    init(ids) {
      if(ids.length==1) {
        this.$emit("change",ids[0]);
        return
      }
      if(ids.length>0) {
        printOptionsApi({ ids }).then(res => {
          this.printListOptions=res.data;
          this.printVisible=true;
        });
      }
    },
    initOptions(options) {
      this.printListOptions = options;
      this.printVisible = true;
    },
    selectPrint(item) {
      this.$emit("change",item.id);
      this.printVisible=false;
    }
  }
};
</script>

<style lang="scss" scoped></style>
