<template>
  <el-dialog title="分页使用说明" :close-on-click-modal="false" :visible.sync="visible"
    :append-to-body="true" class="JNPF-dialog JNPF-dialog_center page-explain-box" lock-scroll
    width="600px">
    <div class="content">
      <p>1. 适用控件 </p>
      <p class="pl-6">a. 下拉表格</p>
      <p class="pl-6">b. 弹窗选择</p>
      <p class="pl-6">c. 设计子表-动作配置</p>
      <p>2. 分页设置支持SQL、API模式</p>
      <p>3. SQL模式配置：</p>
      <p class="pl-6">a. 数据配置页面：正常查询列表语句。(select * from base_user where f_account like concat('%',
        @keyword, '%')
        limit @offsetSize, @pageSize)</p>
      <p class="pl-12">ⅰ. @offsetSize: 跳过的数据量</p>
      <p class="pl-12">ⅱ. @pageSize: 需要返回的数据量</p>
      <p class="pl-12">ⅲ. @keyword: 前端功能支持搜索时, 传递过来的搜索词</p>
      <p class="pl-6">b. 数量统计页面：同样的条件统计数量。(select count(*) from base_user where f_account like
        concat('%',@keyword,'%'))</p>
      <p class="pl-6">c. 数据回显页面：通过ID等唯一字段返回需要转换的文本数据(select f_realname from base_user where @showKey
        = @showValue)</p>
      <p class="pl-12">ⅰ. @showKey: 本次回显过滤的ID字段名称</p>
      <p class="pl-12">ⅱ. @showValue: 本次回显过滤的ID值</p>
      <p>4. API模式</p>
      <p class="pl-6">a. 数据配置页面：Get将分页参数中填写的参数名称添加到URL上请求对应的接口. Post将分页参数中填写的参数名称添加Body中一起提交到接口</p>
      <p class="pl-12">ⅰ. GET：http://domain/list?currentPage=1&pageSize=20&keywork=搜索词</p>
      <p class="pl-12">ⅱ. POST：{currentPage:1, pageSize:20, keyword:'搜索词'}</p>
      <p class="pl-12">ⅲ. 配置的接口需要返回的格式</p>
      <p class="pl-18">1. {list:[{数据列表}, {数据列表}], pagination:{total:总条数}}</p>
      <p class="pl-18">2. {list:[{f_id:'1', f_realname:'老陈'}, {f_id:'2', f_realname:'老王'}],
        pagination:{total:201}}</p>
      <p class="pl-6">b. 数据回显页面</p>
      <p class="pl-12">ⅰ. 接口路径中可使用{showValue}替换为当前ID(http://domain/{showValue}/info)</p>
      <p class="pl-12">ⅱ. @showKey: 本次回显过滤的ID字段名称</p>
      <p class="pl-12">ⅲ. @showValue: 本次回显过滤的ID值</p>
      <p class="pl-12">ⅳ. GET：http://domain/info?showKey=f_id&showValue=1010101</p>
      <p class="pl-12">ⅴ. POST：{showKey:'f_id', showValue:'1010101'}</p>
      <p class="pl-12">ⅵ. 配置的接口需要返回的格式</p>
      <p class="pl-18">1. {数据详情}</p>
      <p class="pl-18">2. {f_id:'1', f_realname:'老陈'}</p>
    </div>
  </el-dialog>
</template>
<script>

export default {
  data() {
    return {
      visible: false,
    }
  },
  methods: {
    init(id) {
      this.visible = true
    }
  }
}
</script>
<style lang="scss" scoped>
.content {
  overflow: auto;
  height: 600px;
  line-height: 1.8;
  margin-bottom: 20px;
  .pl-6 {
    padding-left: 6px;
  }
  .pl-12 {
    padding-left: 12px;
  }
  .pl-18 {
    padding-left: 18px;
  }
}
</style>