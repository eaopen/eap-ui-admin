<template>
  <div class="child-table-column">
    <template v-if="!expand">
      <tr v-for="(item, index) in fewData" class="child-table__row" :key="index">
        <td v-for="(headItem, i) in head" :key="i"
          :style="{width:`${headItem.width-1}px`,'text-align':headItem.align}"
          :class="{'td-flex-1':!headItem.width}">
          <div class="cell" v-if="headItem.jnpfKey==='relationForm'">
            <el-link :underline="false" type="primary"
              @click.native="toDetail(headItem.modelId,item[`${headItem.vModel}_id`])">
              {{ item[headItem.vModel] }}
            </el-link>
          </div>
          <div class="cell"
            v-else-if="headItem.jnpfKey==='numInput' ||headItem.jnpfKey==='calculate'">
            <JnpfNumber v-model="item[headItem.vModel]" :thousands="headItem.thousands"
              :precision="headItem.precision">
            </JnpfNumber>
          </div>
          <div class="cell" v-else>
            {{ item[headItem.vModel] }}
          </div>
        </td>
      </tr>
    </template>
    <template v-if="expand">
      <tr v-for="(item, index) in data" class="child-table__row" :key="index">
        <td v-for="(headItem, i) in head" :key="i"
          :style="{width:`${headItem.width-1}px`,'text-align':headItem.align}"
          :class="{'td-flex-1':!headItem.width}">
          <div class="cell" v-if="headItem.jnpfKey==='relationForm'">
            <el-link :underline="false" type="primary"
              @click.native="toDetail(headItem.modelId,item[`${headItem.vModel}_id`])">
              {{ item[headItem.vModel] }}
            </el-link>
          </div>
          <div class="cell"
            v-else-if="headItem.jnpfKey==='numInput' ||headItem.jnpfKey==='calculate'">
            <JnpfNumber v-model="item[headItem.vModel]" :thousands="headItem.thousands"
              :precision="headItem.precision">
            </JnpfNumber>
          </div>
          <div class="cell" v-else>
            {{ item[headItem.vModel] }}
          </div>
        </td>
      </tr>
    </template>
    <div class="expand-more-btn" v-if="data.length > defaultNumber">
      <el-button v-if="expand" type="text" @click="toggleExpand">隐藏部分</el-button>
      <el-button v-if="!expand" type="text" @click="toggleExpand">加载更多</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'childTableColumn',
  data() {
    return {
    }
  },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    head: {
      type: Array,
      default: () => []
    },
    defaultNumber: {
      type: Number,
      default: 3
    },
    rowEdit: {
      type: Boolean,
      default: false
    },
    expand: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    fewData() {
      if (!this.data) return []
      return this.data.slice(0, this.defaultNumber)
    }
  },
  methods: {
    toggleExpand() {
      this.$emit('toggleExpand')
    },
    toDetail(modelId, id) {
      this.$emit('toDetail', modelId, id)
    }
  }
}
</script>
