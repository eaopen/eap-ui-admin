<template>
  <el-card shadow="never" class="portal-eChart-box">
    <CardHeader v-if="activeData.title" slot="header" :title="activeData.title"
      :card="activeData.card" />
    <div class="rankList-box-body">
      <JNPF-table v-loading="listLoading" :data="list" highlight-current-row :hasNO="false"
        :cell-style="handleRowStyle" v-if="option.styleType==1||option.styleType==2">
        <el-table-column width="70" label="排名" align="center">
          <template slot-scope="scope">
            <div v-if="option.styleType==1" class="rank-box">
              <img v-if="scope.$index==0" src="@/assets/images/rankList/rank1.png">
              <img v-else-if="scope.$index==1" src="@/assets/images/rankList/rank2.png">
              <img v-else-if="scope.$index==2" src="@/assets/images/rankList/rank3.png">
              <span v-else class="rank-box-span">{{scope.$index+1}}</span>
            </div>
            <div v-if="option.styleType==2" class="rank-box">
              <img v-if="scope.$index==0" src="@/assets/images/rankList/badge1.png">
              <img v-else-if="scope.$index==1" src="@/assets/images/rankList/badge2.png">
              <img v-else-if="scope.$index==2" src="@/assets/images/rankList/badge3.png">
              <span v-else>{{scope.$index+1}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :prop="item.value" :label="item.label"
          v-for="(item,i) in option.columnOptions" :key="i" align="center" />
      </JNPF-table>
      <div class="cup-medal-box" v-else>
        <div v-if="option.styleType==3">
          <div class="cup-top-box">
            <div class="cup2-box cup-box">
              <img src="@/assets/images/rankList/cup2.png">
              <div class="top-bg"></div>
              <div class="cup-box-content">
                <p v-if="option.columnOptions.length">{{secondData[option.columnOptions[0].value]}}
                </p>
                <p v-if="option.columnOptions.length>1">
                  {{secondData[option.columnOptions[1].value]}}
                </p>
              </div>
            </div>
            <div class="cup1-box cup-box">
              <img src="@/assets/images/rankList/cup1.png">
              <div class="top-bg"></div>
              <div class="cup-box-content">
                <p v-if="option.columnOptions.length">{{fistData[option.columnOptions[0].value]}}
                </p>
                <p v-if="option.columnOptions.length>1">
                  {{fistData[option.columnOptions[1].value]}}
                </p>
              </div>
            </div>
            <div class="cup3-box cup-box">
              <img src="@/assets/images/rankList/cup3.png">
              <div class="top-bg"></div>
              <div class="cup-box-content">
                <p v-if="option.columnOptions.length">{{thirdData[option.columnOptions[0].value]}}
                </p>
                <p v-if="option.columnOptions.length>1">{{thirdData[option.columnOptions[1].value]}}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="medal-box" v-else>
          <div class="medal-top-box">
            <div class="medal-box medal2-box">
              <img src="@/assets/images/rankList/medal2.png">
              <div class="medal-box-content">
                <p v-if="option.columnOptions.length">{{secondData[option.columnOptions[0].value]}}
                </p>
                <p v-if="option.columnOptions.length>1">
                  {{secondData[option.columnOptions[1].value]}}
                </p>
              </div>
            </div>
            <div class="medal-box medal1-box">
              <img src="@/assets/images/rankList/medal1.png">
              <div class="medal-box-content">
                <p v-if="option.columnOptions.length">{{fistData[option.columnOptions[0].value]}}
                </p>
                <p v-if="option.columnOptions.length>1">
                  {{fistData[option.columnOptions[1].value]}}
                </p>
              </div>
            </div>
            <div class="medal-box medal3-box">
              <img src="@/assets/images/rankList/medal3.png">
              <div class="medal-box-content">
                <p v-if="option.columnOptions.length">{{thirdData[option.columnOptions[0].value]}}
                </p>
                <p v-if="option.columnOptions.length>1">{{thirdData[option.columnOptions[1].value]}}
                </p>
              </div>
            </div>
          </div>
        </div>
        <JNPF-table class="cupMedalTable" v-loading="listLoading" :data="otherDataList"
          highlight-current-row :hasNO="false" v-if="otherDataList.length">
          <el-table-column label="排名" align="center">
            <template slot-scope="scope">
              <span>{{scope.$index+4}}</span>
            </template>
          </el-table-column>
          <el-table-column :prop="item.value" :label="item.label"
            v-for="(item,i) in option.columnOptions" :key="i" align="center" />
        </JNPF-table>
      </div>
    </div>
  </el-card>
</template>
<script>
import commonMixins from '@/components/VisualPortal/mixins/common'
export default {
  mixins: [commonMixins],
}
</script>
<style lang="scss" scoped>
.rankList-box-body {
  margin: 0 10px;
  height: 100%;
  >>> .el-table tr:last-child td {
    border-bottom: unset;
  }
  .rank-box {
    .rank-box-span {
      display: inline-block;
      width: 24px;
      height: 24px;
      line-height: 24px;
      text-align: center;
      background-color: rgba(24, 144, 255, 0.39);
      border-radius: 50%;
      color: #fff;
      opacity: 0.3;
    }
    img {
      width: 35px;
      height: 35px;
    }
  }
  .cup-medal-box {
    height: 100%;
    display: flex;
    flex-direction: column;
    .cup-top-box {
      display: flex;
      justify-content: center;
      align-items: flex-end;
      overflow: hidden;
      padding: 10px 0 15px;
      .cup-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        img {
          width: 46px;
          margin-bottom: -6px;
          z-index: 20;
        }
        .top-bg {
          width: 230px;
          height: 0;
          border-bottom: 9px solid rgba(239, 233, 225, 0.39);
          border-left: 20px solid transparent;
          border-right: 10px solid transparent;
        }
        .cup-box-content {
          width: 230px;
          height: 81px;
          background: rgba(245, 241, 234, 0.59);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: #6f89ac;
          p {
            width: 100%;
            margin-bottom: 4px;
            padding: 0 10px;
            text-align: center;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
      .cup1-box {
        img {
          width: 63px;
        }
        .top-bg {
          width: 260px;
          border-right: 20px solid transparent;
          border-bottom: 9px solid rgba(250, 247, 242, 0.59);
        }
        .cup-box-content {
          width: 260px;
          height: 103px;
          background: rgba(250, 247, 242, 0.59);
          color: #ce7c1f;
        }
      }
      .cup3-box {
        .top-bg {
          border-bottom: 9px solid rgba(245, 241, 234, 0.59);
          border-left: 10px solid transparent;
          border-right: 20px solid transparent;
        }
        .cup-box-content {
          height: 65px;
          background: rgba(245, 241, 234, 0.59);
          color: #8d4112;
        }
      }
    }
  }
  .medal-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    .medal-top-box {
      margin: 60px 0 15px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      min-width: 70%;
      .medal-box {
        width: 160px;
        height: 91px;
        border-radius: 4px;
        border: 1px solid rgba(111, 137, 172, 0.59);
        flex-shrink: 0;
        position: relative;
        .medal-box-content {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: #6f89ac;
          p {
            width: 100%;
            margin-bottom: 4px;
            padding: 0 10px;
            text-align: center;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
        img {
          width: 60px;
          margin-top: -30px;
        }
      }
      .medal1-box {
        width: 200px;
        height: 100px;
        margin: 0 10px;
        border: 1px solid rgba(206, 124, 31, 0.59);
        .medal-box-content {
          color: #ce7c1f;
        }
        img {
          width: 100px;
          margin-top: -65px;
        }
      }
      .medal3-box {
        border: 1px solid rgba(141, 65, 18, 0.59);
        .medal-box-content {
          color: #8d4112;
        }
      }
    }
  }
}
>>> .el-table thead tr th {
  background-color: #fff;
}
</style>
