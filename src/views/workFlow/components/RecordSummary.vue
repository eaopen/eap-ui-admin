<template>
  <el-tabs tab-position="left" style="height: 100%;" v-model="activeTab" class="recordSummary">
    <el-tab-pane label="按部门汇总" name="1"></el-tab-pane>
    <el-tab-pane label="按岗位汇总" name="3"></el-tab-pane>
    <div class="recordSummary-list" v-loading="loading">
      <template v-if="list.length">
        <el-card class="recordSummary-item" v-for="(item,i) in list" :key="i"
          v-show="item.list&&item.list.length">
          <div class="recordSummary-item-main">
            <div class="cap">{{item.fullName}}意见</div>
            <div class="content">
              <div class="child-item" v-for="(child,j) in item.list" :key="j">
                <div class="child-item-block">
                  <div class="avatar">
                    <el-avatar :src="define.comUrl+child.headIcon"></el-avatar>
                  </div>
                  <div class="child-item-title">
                    <div class="child-item-line">
                      <div class="name">
                        {{child.userName}}<span> 于 {{child.handleTime | toDate()}}</span>
                      </div>
                      <el-tag :type="child.tagType" class="tag">{{child.txt}}</el-tag>
                    </div>
                    <div class="child-item-option"
                      v-if="child.handleOpinion && child.handleStatus!=2">
                      {{child.handleOpinion}}
                    </div>
                    <div class="file-List" v-if="(child.fileList.length && child.handleStatus!=2)">
                      <JNPF-UploadFz v-model="child.fileList" detailed disabled :showIcon='false'>
                      </JNPF-UploadFz>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </template>
      <el-empty description="暂无数据" :image-size="120" v-else></el-empty>
    </div>
  </el-tabs>
</template>

<script>
import { getRecordList } from '@/api/workFlow/FlowBefore'
export default {
  name: 'comments',
  props: {
    id: { type: String, default: '' },
    summaryType: { default: '0' },
  },
  data() {
    return {
      list: [],
      activeTab: '1',
      loading: false
    }
  },
  watch: {
    activeTab(val) {
      this.init()
    }
  },
  methods: {
    init() {
      this.loading = true
      const query = {
        category: this.activeTab,
        type: this.summaryType
      }
      getRecordList(this.id, query).then(res => {
        this.list = res.data
        if (this.list.length) {
          this.list.forEach((o, i) => {
            o.list.forEach(j => {
              j.fileList = j.fileList ? JSON.parse(j.fileList) : []
            })
            o.list = o.list.map(i => ({
              txt: i.handleStatus == 0 ? '退回' : i.handleStatus == 1 ? '同意' : i.handleStatus == 2 ? '发起' : i.handleStatus == 3 ? '撤回' : i.handleStatus == 4 ? '终止' : i.handleStatus == 5 ? '指派' : i.handleStatus == 6 ? '后加签' : i.handleStatus == 10 ? '前加签' : i.handleStatus == 8 ? '变更' : i.handleStatus == 11 ? '挂起' : i.handleStatus == 12 ? '恢复' : '转审',
              tagType: i.handleStatus == 0 || i.handleStatus == 11 ? 'danger' : i.handleStatus == 1 || i.handleStatus == 12 ? 'success' : i.handleStatus == 3 || i.handleStatus == 4 || i.handleStatus == 8 ? 'warning' : "",
              ...i
            }))
          })
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.recordSummary {
  .el-tab-pane {
    height: 0;
  }
  >>> .el-tabs__content {
    height: 100%;
    .recordSummary-list {
      height: 100%;
      overflow: hidden auto;
      padding: 50px 100px 0;
      .recordSummary-item {
        margin-bottom: 20px;
        .el-card__body {
          padding: 0;
          .recordSummary-item-main {
            display: flex;
            align-items: center;
            .cap {
              width: 150px;
              flex-shrink: 0;
              text-align: center;
              font-size: 14px;
            }
            .content {
              flex: 1;
              padding: 0px 36px;
              border-left: 1px solid #e4e7ed;
            }
            .child-item {
              padding: 20px 0;
              font-size: 14px;
              line-height: 22px;
              &:last-child {
                margin-bottom: 0;
              }
              &:nth-child(2n) {
                border-top: 1px solid #e1e5eb;
              }
              .child-item-block {
                display: flex;
                align-items: flex-start;
                flex-direction: row;
                .avatar {
                  width: 40px;
                  height: 40px;
                }
                // padding: 10px;

                .child-item-title {
                  flex: 1;
                  margin-bottom: 2px;
                  display: flex;
                  justify-content: space-between;
                  flex-direction: column;
                  margin-left: 5px;
                  .child-item-line {
                    display: flex;
                    align-items: center;
                    flex-direction: row;
                    justify-content: space-between;
                    padding-left: 4px;
                    .name {
                      font-weight: 600;
                      span {
                        font-weight: 400;
                        font-size: 12px;
                      }
                    }
                    .tag {
                      float: right;
                    }
                  }
                  .child-item-option {
                    color: #747579;
                    padding-left: 4px;
                  }
                  .status {
                    flex-shrink: 0;
                    .el-link {
                      cursor: auto !important;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>