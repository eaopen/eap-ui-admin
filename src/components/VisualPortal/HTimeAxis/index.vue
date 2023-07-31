<template>
  <el-card shadow="never" class="portal-eChart-box portal-time-box">
    <CardHeader v-if="activeData.title" slot="header" :title="activeData.title"
      :card="activeData.card" />
    <div class="portal-box-body "
      :class="{'timeline-box':option.layout>4,'card-timeline-box':option.styleType==2}">
      <template v-if="timeList.length">
        <el-timeline class="timeline-left-right timeline-left" v-if="option.layout=='1'">
          <el-timeline-item v-for="(item, index) in timeList" :key="index"
            :timestamp="item.timestamp" :color="getColor(index)" placement="top">
            <span v-if="option.styleType==1">{{item.content}}</span>
            <el-card class="card-box" v-else>
              {{item.content}}
            </el-card>
          </el-timeline-item>
        </el-timeline>
        <el-timeline class="timeline-left-right timeline-right" v-else-if="option.layout=='2'">
          <el-timeline-item v-for="(item, index) in timeList" :key="index"
            :timestamp="item.timestamp" :color="getColor(index)" placement="top">
            <span v-if="option.styleType==1">{{item.content}}</span>
            <el-card class="card-box" v-else>
              {{item.content}}
            </el-card>
          </el-timeline-item>
        </el-timeline>
        <el-timeline class="timeline-right-box" v-else-if="option.layout=='3'">
          <el-timeline-item v-for="(item, index) in timeList" :key="index"
            :timestamp="item.timestamp" :color="getColor(index)" placement="top">
            <span v-if="option.styleType==1">{{item.content}}</span>
            <el-card class="card-box" v-else>
              {{item.content}}
            </el-card>
          </el-timeline-item>
        </el-timeline>
        <el-timeline class="timeline" v-else-if="option.layout=='4'">
          <el-timeline-item v-for="(item, index) in timeList" :key="index"
            :timestamp="item.timestamp" :color="getColor(index)" placement="top">
            <span v-if="option.styleType==1">{{item.content}}</span>
            <el-card class="card-box" v-else>
              {{item.content}}
            </el-card>
          </el-timeline-item>
        </el-timeline>
        <el-timeline class="timeline-top-bottom timeline-top" v-else-if="option.layout=='5'">
          <el-timeline-item v-for="(item, index) in timeList" :key="index"
            :timestamp="item.timestamp" :color="getColor(index)" placement="top">
            <span v-if="option.styleType==1">{{item.content}}</span>
            <el-card class="card-box" v-else>
              {{item.content}}
            </el-card>
          </el-timeline-item>
        </el-timeline>
        <el-timeline class="timeline-top-bottom timeline-bottom" v-else-if="option.layout=='6'">
          <el-timeline-item v-for="(item, index) in timeList" :key="index"
            :timestamp="item.timestamp" :color="getColor(index)" placement="top">
            <span v-if="option.styleType==1">{{item.content}}</span>
            <el-card class="card-box" v-else>
              {{item.content}}
            </el-card>
          </el-timeline-item>
        </el-timeline>
        <el-timeline class="timeline-bottom-box" v-else-if="option.layout=='7'">
          <el-timeline-item v-for="(item, index) in timeList" :key="index"
            :timestamp="item.timestamp" :color="getColor(index)" placement="top">
            <span v-if="option.styleType==1">{{item.content}}</span>
            <el-card class="card-box" v-else>
              {{item.content}}
            </el-card>
          </el-timeline-item>
        </el-timeline>
        <el-timeline class="timeline-top-box" v-else-if="option.layout=='8'">
          <el-timeline-item v-for="(item, index) in timeList" :key="index"
            :timestamp="item.timestamp" :color="getColor(index)" placement="top">
            <span v-if="option.styleType==1">{{item.content}}</span>
            <el-card class="card-box" v-else>
              {{item.content}}
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </template>
      <div class="portal-common-noData" v-else>
        <img src="@/assets/images/portal-nodata.png" alt="" class="noData-img">
        <p class="noData-txt">暂无数据</p>
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
.ortal-time-box {
  display: flex;
  flex-direction: column;
}
.portal-box-body {
  height: 100%;
  overflow: auto;
  padding: 15px 20px;

  .timeline-left-right {
    >>> .el-timeline-item__tail {
      left: 50%;
    }
    >>> .el-timeline-item__node--normal {
      left: calc(50% - 5px);
      top: -1px;
    }
  }
  .timeline-right {
    >>> .el-timeline-item:nth-of-type(odd) {
      .el-timeline-item__wrapper {
        padding-left: calc(50% + 28px);
      }
    }
    >>> .el-timeline-item:nth-of-type(even) {
      .el-timeline-item__wrapper {
        padding-left: unset;
        padding-right: calc(50% + 28px);
        text-align: right;
      }
    }
  }
  .timeline-left {
    >>> .el-timeline-item:nth-of-type(even) {
      .el-timeline-item__wrapper {
        padding-left: calc(50% + 28px);
      }
    }
    >>> .el-timeline-item:nth-of-type(odd) {
      .el-timeline-item__wrapper {
        padding-left: unset;
        padding-right: calc(50% + 28px);
        text-align: right;
      }
    }
  }
  .timeline-right-box {
    >>> .el-timeline-item__tail {
      left: unset;
      right: 4px;
    }
    >>> .el-timeline-item__node--normal {
      left: unset;
      top: -1px;
      right: -1px;
    }
    >>> .el-timeline-item__wrapper {
      padding-left: unset;
      padding-right: 28px;
      text-align: right;
    }
  }
  .timeline {
    >>> .el-timeline-item__tail {
      left: 4px;
      right: unset;
    }
    >>> .el-timeline-item__node--normal {
      top: -1px;
    }
  }
  .timeline-top-box {
    display: flex;
    white-space: nowrap;
    >>> .el-timeline-item__tail {
      width: 100%;
      left: unset;
      top: 4px;
      border-left: unset;
      border-top: 2px solid #e4e7ed;
    }
    >>> .el-timeline-item__node {
      top: -1px;
      bottom: unset;
    }
    >>> .el-timeline-item__wrapper {
      padding: 28px 28px 0 0;
    }
  }
  .timeline-bottom-box {
    display: flex;
    white-space: nowrap;
    margin-bottom: 43px;
    >>> .el-timeline-item__tail {
      width: 100%;
      top: unset;
      bottom: 4px;
      border-left: unset;
      border-top: unset;
      border-bottom: 2px solid #e4e7ed;
    }
    >>> .el-timeline-item__node {
      top: unset;
      bottom: -1px;
    }
    >>> .el-timeline-item__wrapper {
      padding: 28px 28px 0 0;
    }
  }
  .timeline-top-bottom {
    display: flex;
    white-space: nowrap;
    >>> .el-timeline-item__tail {
      width: 100%;
      border-left: unset;
      border-top: 2px solid #e4e7ed;
      top: calc(50% - 2px);
    }
    >>> .el-timeline-item__node {
      top: calc(50% - 7px);
    }
  }

  .timeline-top {
    >>> .el-timeline-item:nth-of-type(even) {
      .el-timeline-item__wrapper {
        top: 40px;
        padding-left: unset;
      }
    }
    >>> .el-timeline-item:nth-of-type(odd) {
      .el-timeline-item__wrapper {
        top: -24px;
        padding-left: unset;
      }
    }
  }

  .timeline-bottom {
    >>> .el-timeline-item:nth-of-type(even) {
      .el-timeline-item__wrapper {
        top: -24px;
        padding-left: unset;
      }
    }
    >>> .el-timeline-item:nth-of-type(odd) {
      .el-timeline-item__wrapper {
        top: 40px;
        padding-left: unset;
      }
    }
  }
  .card-box {
    padding: 15px 10px;
    line-height: 1.5;
  }
}
.timeline-box {
  display: flex;
  align-items: center;
}
.card-timeline-box {
  .timeline-top {
    >>> .el-timeline-item:nth-of-type(even) {
      .el-timeline-item__wrapper {
        top: 58px;
      }
    }
    >>> .el-timeline-item:nth-of-type(odd) {
      .el-timeline-item__wrapper {
        top: -48px;
      }
    }
  }

  .timeline-bottom {
    >>> .el-timeline-item:nth-of-type(even) {
      .el-timeline-item__wrapper {
        top: -48px;
      }
    }
    >>> .el-timeline-item:nth-of-type(odd) {
      .el-timeline-item__wrapper {
        top: 58px;
      }
    }
  }
  .card-box {
    padding: 15px 10px;
    line-height: 1.5;
  }
}
</style>