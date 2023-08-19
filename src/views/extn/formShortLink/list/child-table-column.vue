<template>
  <div class="child-table-column">
    <template v-if="!expand">
      <tr v-for="(item, index) in fewData" class="child-table__row" :key="index">
        <td v-for="(headItem, i) in head" :key="i" :style="{width:`${headItem.width-1}px`}"
          :class="{'td-flex-1':!headItem.width}">
          <div class="cell">
            {{ item[headItem.vModel] }}
          </div>
        </td>
      </tr>
    </template>
    <template v-if="expand">
      <tr v-for="(item, index) in data" class="child-table__row" :key="index">
        <td v-for="(headItem, i) in head" :key="i" :style="{width:`${headItem.width-1}px`}"
          :class="{'td-flex-1':!headItem.width}">
          <div class="cell">
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
    }
  }
}
</script>
