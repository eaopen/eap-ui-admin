<template>
  <div class="fieldFrom">
    <div class="JNPF-common-title">
      <h2>字段设置</h2>
    </div>
    <el-table :data="drawingList" size='mini'>
      <el-table-column type="index" width="50" label="序号" align="center" />
      <el-table-column prop="filedName" label="名称">
        <template slot-scope="scope">
          <el-input v-model="scope.row.filedName" placeholder="输入名称"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="filedId" label="字段">
        <template slot-scope="scope">
          <el-input v-model="scope.row.filedId" placeholder="输入字段"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="jnpfKey" label="控件类型">
        <template slot-scope="scope">
          <el-select v-model="scope.row.jnpfKey" placeholder="选择控件类型" clearable filterable>
            <el-option-group v-for="group in componentList" :key="group.id"
              :label="group.fullName+'【'+group.children.length+'】'">
              <el-option v-for="item in group.children" :key="item.__config__.jnpfKey"
                :label="item.__config__.label" :value="item.__config__.jnpfKey">
              </el-option>
            </el-option-group>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="required" label="必填" width="50" align="center">
        <template slot-scope="scope">
          <el-checkbox :checked="scope.row.required"
            @change='scope.row.required?scope.row.required=false:scope.row.required=true' />
        </template>
      </el-table-column>
      <el-table-column prop="multiple" label="多选" width="50" align="center">
        <template slot-scope="scope">
          <el-checkbox :checked="scope.row.multiple"
            @change='scope.row.multiple?scope.row.multiple=false:scope.row.multiple=true' />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="50">
        <template slot-scope="scope">
          <el-button size="mini" type="text" class="JNPF-table-delBtn"
            @click="handleDel(scope.$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="table-actions" @click="addHandle()">
      <el-button type="text" icon="el-icon-plus">新增字段</el-button>
    </div>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { inputComponents, selectComponents, systemComponents } from '@/components/Generator/generator/config'
const ignoreList = ['divider', 'JNPFText', 'link', 'alert', 'button', 'table']
export default {
  props: ['conf', 'enCode'],
  data() {
    return {
      componentList: [],
      drawingList: [],
    }
  },
  created() {
    this.getComponentList()
    if (typeof this.conf === 'object' && this.conf !== null) {
      this.drawingList = deepClone(this.conf)
    }
  },
  methods: {
    /**
      * 供父组件使用 获取表单JSON
    */
    getData() {
      return new Promise((resolve, reject) => {
        if (!this.exist()) return
        if (!this.drawingList.length) {
          reject({ msg: '表单列表不允许为空', target: 1 })
          return
        }
        resolve({ formData: this.drawingList, target: 1 })
      })
    },
    getComponentList() {
      const realInputComponents = inputComponents.filter(o => !ignoreList.includes(o.__config__.jnpfKey))
      const realSelectComponents = selectComponents.filter(o => !ignoreList.includes(o.__config__.jnpfKey))
      this.componentList = [
        {
          id: '1',
          fullName: '基础控件',
          children: realInputComponents
        },
        {
          id: '2',
          fullName: '高级控件',
          children: realSelectComponents
        },
        {
          id: '3',
          fullName: '系统控件',
          children: systemComponents
        }
      ]
    },
    // 验证
    exist() {
      let isOk = true;
      //  遍历数组，判断非空
      for (let i = 0; i < this.drawingList.length; i++) {
        const e = this.drawingList[i];
        if (!e.filedName) {
          this.$message({
            showClose: true,
            message: '名称不能为空',
            type: 'error',
            duration: 1000
          });
          isOk = false
          break
        }
        let num = this.drawingList.filter(o => o.filedName == e.filedName)
        if (num.length > 1) {
          this.$message({
            showClose: true,
            message: `名称'${e.filedName}'已重复`,
            type: 'error',
            duration: 1000
          });
          isOk = false
          break
        }
        if (!e.filedId) {
          this.$message({
            showClose: true,
            message: '字段不能为空',
            type: 'error',
            duration: 1000
          });
          isOk = false
          break
        }
        let idNum = this.drawingList.filter(o => o.filedId == e.filedId)
        if (idNum.length > 1) {
          this.$message({
            showClose: true,
            message: `字段'${e.filedId}'已重复`,
            type: 'error',
            duration: 1000
          });
          isOk = false
          break
        }
      }
      return isOk;
    },
    handleDel(index) {
      this.drawingList.splice(index, 1);
    },
    addHandle() {
      let item = { filedName: "", filedId: "", jnpfKey: "", required: false, multiple: false }
      this.drawingList.push(item)
    }
  }
}
</script>