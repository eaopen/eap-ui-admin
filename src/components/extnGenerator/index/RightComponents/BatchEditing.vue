<template>
  <el-dialog :visible.sync="visible" append-to-body title="批量编辑" :closeOnClickModal="false"
    class="JNPF-dialog JNPF-dialog_center update-dialog" lock-scroll width="700px">
    <el-alert title="注意：每行对应一个选项；选项名和选项值之间用英文 | 隔开。参考格式如下：" type="warning" :closable="false"
      show-icon />
    <div class="demo-box">
      <div class="demo-box-cell">
        <p class="w-220px">格式一：选项名和选项值一致时</p>
        <span class="w-100px">选项名</span>
        <p>输入示例：<span>选项一</span></p>
      </div>
      <div class="demo-box-cell">
        <p class="w-220px">格式二：选项名和选项值不一致时</p>
        <span class="w-100px">选项名|选项值</span>
        <p>输入示例：<span>选项一|选项一的值</span></p>
      </div>
    </div>
    <el-input type="textarea" :rows="100" v-model="resultInfo" autosize class="textarea"></el-input>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">{{$t('common.cancelButton')}}</el-button>
      <el-button type="primary" @click="handleSure()">
        {{$t('common.confirmButton')}}
      </el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  components: {},
  props: {
  },
  data() {
    return {
      visible: false,
      resultInfo: '',
      separator: '|',
      options: []
    }
  },
  computed: {
  },
  methods: {
    init(options) {
      this.options = options || []
      this.analysis()
      this.visible = true
    },
    analysis() {
      this.resultInfo = ''
      if (this.options.length > 0) {
        this.options.forEach((opt) => {
          if (opt.id === opt.fullName) {
            this.resultInfo += opt.fullName + this.separator + opt.id + '\n'
          } else {
            this.resultInfo += opt.fullName + this.separator + opt.id + '\n'
          }
        })
      }
    },
    handleSure() {
      let lineArray = this.resultInfo.split('\n')
      if (lineArray.length > 0) {
        this.options = []
        lineArray.forEach((optLine) => {
          if (!!optLine && !!optLine.trim()) {
            if (optLine.indexOf(this.separator) !== -1) {
              this.options.push({
                id: optLine.split(this.separator)[1],
                fullName: optLine.split(this.separator)[0]
              })
            } else {
              this.options.push({
                id: optLine,
                fullName: optLine
              })
            }
          }
        })
      } else {
        this.options = []
      }
      this.$emit('change', this.options)
      this.visible = false
    },
  }
}
</script>
<style lang="scss" scoped>
.format-one {
  border: 1px solid #dcdfe6;
}
.format-two {
  border-right: 1px solid #dcdfe6;
  border-left: 1px solid #dcdfe6;
  border-bottom: 1px solid #dcdfe6;
  margin-bottom: 20px;
}
.textarea {
  >>> .el-textarea__inner {
    height: 300px !important;
    line-height: 30px;
  }
}
.demo-box {
  margin: 10px 0;
  border: 1px solid #d9d9d9;
  .w-220px {
    width: 220px;
  }
  .w-100px {
    width: 100px;
  }
  .demo-box-cell {
    line-height: 36px;
    border-bottom: 1px solid #d9d9d9;
    padding: 0 15px;
    &:last-child {
      border-bottom: 0;
    }
    p,
    span {
      display: inline-block;
    }
    span {
      color: #1890ff;
    }
  }
}
</style>
