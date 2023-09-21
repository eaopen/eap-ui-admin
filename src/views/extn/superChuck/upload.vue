<template>
    <div class="myDiv">
      <el-upload
        class="upload-demo"
        action="#"
        :on-change="changeUpload"
        :show-file-list="false"
        :auto-upload="false"
        ref="uploadFile"
        :limit="1"
      >
        <el-button size="small" type="primary" :loading="loadingFile">
          上传文件
        </el-button>
      </el-upload>
   
      <el-progress
        v-show="uploadFlag"
        :text-inside="true"
        text-color="#fff"
        :stroke-width="18"
        :percentage="percent"
      ></el-progress>
    </div>
  </template>
   
  <script>
//   import { uploadInit, uploadPart } from '../../api/api'  //接口
  import Sha256 from 'crypto-js/sha256'
  import Base64 from 'crypto-js/enc-base64'
  export default {
    data() {
      return {
        loadingFile: false,//上传按钮的loading
        partCount: 1, //文件切片数量
        groupCount: 5, //一次性发送切片请求的个数 默认 5
        uploadFlag: false,//正在上传，用于展示进度条
        uploadPartCount: 0 //上传成功的切片数量
      }
    },
    computed: {
      percent() {
        let { uploadPartCount, partCount } = this
        return Math.floor((uploadPartCount*100) / partCount) 
      }
    },
    watch:{
      percent:function(newValue,oldValue){
        console.log("----------watch-----",newValue,oldValue);
        if(newValue==100){
          setTimeout(()=>{
             this.uploadPartCount=0
          this.uploadFlag=false
          this.$refs.uploadFile.clearFiles()
          },1000) //有的文件小，进度条太快了，看不到效果，因此加了个定时
        }
      }
    },
    methods: {
      /**
       * @description el-upload onchange 数字员工列表文件上传-初始化
       * @param {*} File 文件
       * @return {*}
       */
      async changeUpload(File) {
        this.uploadPartCount = 0 //上传成功的切片数量
        this.uploadFlag = true //正在上传，用于展示进度条
        this.loadingFile = true //上传按钮的loading
        let params = {
          fileHash: Base64.stringify(Sha256(File.raw)),
          fileName: File.name,
          totalSize: File.size
        }
        console.log(params)
        // const { data = {} } = await uploadInit(params) //初始化从后台获取分片数量
        const data = {
          partCount: 100,
          objectName: '分片上传',
          partSize: '10000000'
        }
        this.partCount = data.partCount
        this.loadingFile = false //这里方便测试，把这个状态置为false写在这
        let chunkList = this.sliceFile(File, data) //文件分片处理
        let groupList = this.groupChunkList(chunkList) //对分片文件数组进行分组
        await this.uploadPartFile(groupList) //文件上传
      },
      /**
       * @description 异步分片上传文件
       * @param {*} list 分片的formData对象数组
       * @return {*}
       */
      async uploadPartFile(list) {
        for (let i = 0; i < list.length; i++) {
          let itemList = Array.isArray(list[i]) ? list[i] : []
          let itemHttpUpload = itemList.map((item, index) => {
            return new Promise(async (resolve, reject) => {
              console.log('异步分组上传')
              // uploadPart(item)
              //   .then((res) => {
              //     if (res.code !== 200) {
              //       console.log(`第${item.get('index')}片上传失败，请重传`, res)
              //       reject(item)
              //     } else {
              //         this.uploadPartCount++
              //       console.log(this.uploadPartCount,`第${item.get('index')}片上传成功啦！`, res)
              //       resolve(item)
              //     }
              //   })
              //   .catch((err) => {
              //     console.log('【文件异步上传报错】', err)
              //   })
            })
          })
          // Promise.allSettled  等待上一组 upload http请求所有都完成后 返回结果
          const lastGroupUpload = await Promise.allSettled(itemHttpUpload)
            .then((res) => {
              res.forEach((item) => {
                console.log(item.status)
              })
              return Promise.resolve(res)
            })
            .catch((err) => {
              return Promise.resolve(err)
            })
          // 将上传失败的分片文件存储在errorChunkList
          let errorChunkList = lastGroupUpload
            .filter((item) => item.status === 'rejected')
            .map((item) => item.reason)
          // 上传失败的分片再次上传
          if (errorChunkList.length > 0) {
            errorChunkList.forEach((item) => {
              this.errorChunkUpload(item)
            })
          }
        }
        return true
      },
   
      /**
       * @description 针对上传失败的切片再次上传
       * @param {*}  chunk 文件上传formData参数
       * @return {*}
       */
      async errorChunkUpload(chunk) {
        let res = await uploadPart(chunk)
        if (res.code && res.code !== 200) {
          console.log(`上传失败，请重传`, res)
          this.errorChunkUpload(chunk)//失败则递归不断上传该片
        } else {
          console.log(`上传成功啦！`, res)
        }
      },
   
      /**
       * @description 文件分片处理
       * @param {*} File 文件对象
       * @param {*} data  初始化j接口-从后台获取分片数量等参数
       * @return {*} 分片的formData对象数组
       */
   
      sliceFile(File, data) {
        let chunkList = []
        const { objectName, partCount, partSize } = { ...data }
        for (let i = 0; i < partCount; i++) {
          let start = i * partSize //分片开始位置
          let end = Math.min(File.size, start + partSize) //分片结束位置
          console.log("------分片",`${start}-${end}`);
          let _chunkFile = File.raw.slice(start, end)
          console.log(`第${i}片文件`, _chunkFile)
          let formData = new FormData()
          formData.append('index', i + 1) //后台分片索引从1开始
          formData.append('multipartFile', _chunkFile)
          formData.append('objectName', objectName)
          chunkList.push(formData)
        }
        return chunkList
      },
   
      /**
       * @description 对分片文件数组进行分组，一组一组上传，避免一次同时发起太多次请求导致服务压力
       * @param {*}
       * @return {*}
       */
      groupChunkList(chunkList) {
        let group = Math.ceil(chunkList.length / this.groupCount) //分组
        let resultList = new Array(group) // 根据组数创建一个空的 list
        chunkList.map((item, index) => {
          let i = Math.floor(index / this.groupCount) // index / count 向下取整 为组数编号
          if (Array.isArray(resultList[i])) resultList[i].push(item)
          else resultList[i] = [item]
        })
        return resultList
      }
    },
    created() {},
    mounted() {}
  }
  </script>
  <style lang="scss" scoped>
  .progress-wrapper {
    margin-left: 0.3rem;
    margin-top: 0.9rem;
    height: 0.3.5rem;
    width: 6.15rem;
    border-radius: 0.25rem;
    background-color: #f4f4f4;
    border: 3px solid #f4f4f4;
    .progress {
      background-color: aqua;
      height: 100%;
    }
  }
  </style>