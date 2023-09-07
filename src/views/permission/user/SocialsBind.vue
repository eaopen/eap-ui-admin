<template>
  <transition name="el-zoom-in-center">
    <div class="JNPF-preview-main">
      <div class="JNPF-common-page-header">
        <el-page-header @back="goBack" content="第三方服务绑定管理" />
        <div class="options">
          <el-button @click="goBack()">{{$t('common.cancelButton')}}</el-button>
        </div>
      </div>
      <div class="main">
        <el-col :span="22" :offset="1" class="mt-20">
          <template v-for="(item,i) in socialsList">
            <el-row :key="i">
              <el-col :span="1" class="col-img">
                <img v-if="item.enname" :src="item.logo" alt="" class="row-img" />
                <img v-if="!item.enname" src="" alt="" class="row-img" />
              </el-col>
              <el-col :span="21">
                <div class="tag-group-div">
                  <span class="tag-group-span">{{item.name}}</span>
                </div>
                <div class="tag-group-con"> <span>{{item.describetion}}</span>
                </div>
              </el-col>
              <el-col :span="1" class="col-line-height">
                <el-button size="small" type="" v-if="item.entity"
                  @click="deleteSocials(item.entity.id)">解绑</el-button>
              </el-col>
            </el-row>
            <el-divider class="divider-margin" :key="i"></el-divider>
          </template>
        </el-col>
      </div>
    </div>
  </transition>

</template>

<script>
import { getSocialsUserListByUser, deleteSocials } from '@/api/permission/socialsUser'
export default {
  data() {
    return {
      userId: "",
      socialsList: [],
    }
  },
  methods: {
    init(rowdata) {
      this.userId = rowdata.id;
      this.initList()
    },
    initList() {
      getSocialsUserListByUser(this.userId).then(res => {
        this.socialsList = res.data;
      })
    },
    goBack() {
      this.$emit('close')
    },
    deleteSocials(id) {
      this.$confirm('确定要解除该账号绑定?', '提示', {
        type: 'warning'
      }).then(() => {
        deleteSocials(this.userId, id).then(res => {
          this.$message({
            message: res.msg,
            type: 'success',
            duration: 1000,
            onClose: () => {
              this.initList()
            }
          })
        })
      }).catch(() => {
        this.initList()
      });
    },
  }
}
</script>
<style scoped>
.col-img {
  margin: 0px 10px;
}
.tag-group-div {
  height: 24px;
  line-height: 24px;
}
.row-img {
  height: 50px;
  width: 50px;
}
.tag-group-span {
  height: 24px;
  line-height: 24px;
  margin-right: 20px;
  font-weight: bolder;
  font-size: 16px;
}
.tag-group-con {
  font-size: 14px;
  margin: 5px 0;
}
.divider-margin {
  margin: 15px 0px;
}
.tag-group-button {
  height: 24px;
  line-height: 24px;
}

.col-line-height {
  line-height: 50px;
}
</style>