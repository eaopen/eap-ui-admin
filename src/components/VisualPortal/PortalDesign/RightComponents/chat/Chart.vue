<template>
  <el-collapse-item :title="getTitle()" name="1">
    <jnpf-form-tip-item label="风格类型" :tip-label="getTipLabel()"
      v-if="!noStyleTypeList.includes(activeData.jnpfKey)">
      <el-select v-model="activeData.option.styleType" placeholder="请选择风格类型" filterable
        @change="styleTypeChange">
        <el-option v-for="(item, index) in styleTypeOptions" :key="index" :label="item.label"
          :value="item.value" />
      </el-select>
    </jnpf-form-tip-item>
    <template v-if="activeData.jnpfKey == 'lineChart'">
      <el-form-item label="面积堆积">
        <el-switch v-model="activeData.option.areaStyle" />
      </el-form-item>
      <el-form-item label="线条宽度">
        <el-slider v-model="activeData.option.seriesLineStyleWidth" :min="1" :max="20" />
      </el-form-item>
      <el-form-item label="点的大小" v-show="showType == 'pc'">
        <el-slider v-model="activeData.option.seriesSymbolRotate" :max="20" />
      </el-form-item>
    </template>
    <template v-if="activeData.jnpfKey == 'pieChart'">
      <el-form-item label="南丁格尔图" v-show="showType == 'pc'||activeData.option.styleType==1">
        <el-switch v-model="activeData.option.roseType" />
      </el-form-item>
      <el-form-item label="自动排序" v-show="showType == 'pc'">
        <el-switch v-model="activeData.option.sortable" />
      </el-form-item>
      <el-form-item label="不展示零">
        <el-switch v-model="activeData.option.showZero" />
      </el-form-item>
    </template>
    <template v-if="activeData.jnpfKey == 'radarChart'">
      <el-form-item label="指示器大小" v-show="showType == 'pc'">
        <el-input-number v-model="activeData.option.radarAxisNameFontSize" controls-position="right"
          :min="12" :max="25" />
      </el-form-item>
      <el-form-item label="指示器加粗" v-show="showType == 'pc'">
        <el-switch v-model="activeData.option.radarAxisNameFontWeight" />
      </el-form-item>
      <el-form-item label="指示器颜色" style="height:32px">
        <el-color-picker v-model="activeData.option.radarAxisNameColor" />
      </el-form-item>
      <el-form-item label="区域透明度" v-show="showType == 'pc'">
        <el-slider v-model="activeData.option.seriesAreaStyleOpacity" :max="1" :step="0.1" />
      </el-form-item>
    </template>
    <template v-if="activeData.jnpfKey == 'mapChart'">
      <MapSet :activeData="activeData" :cascaderOptions="cascaderOptions" :showType="showType" />
    </template>
    <template v-if="activeData.jnpfKey == 'rankList'">
      <el-divider>列表字段</el-divider>
      <draggable :list="activeData.option.columnOptions" :animation="340" group="selectItem"
        handle=".option-drag">
        <div v-for="(item, index) in activeData.option.columnOptions" :key="index"
          class="select-item">
          <div class="select-line-icon option-drag">
            <i class="icon-ym icon-ym-darg" />
          </div>
          <el-input v-model="item.label" placeholder="列名" size="small" />
          <el-input v-model="item.value" placeholder="字段" size="small" />
          <div class="close-btn select-line-icon" @click="delSelectItem(index)"
            :class="{'opacity5':activeData.option.columnOptions.length==1}">
            <i class="el-icon-remove-outline" />
          </div>
        </div>
      </draggable>
      <div style="margin: 0 0 15px 29px">
        <el-button style="padding-bottom: 0" icon="el-icon-circle-plus-outline" type="text"
          @click="addSelectItem">
          添加字段
        </el-button>
      </div>
    </template>
    <template v-if="activeData.jnpfKey == 'timeAxis'">
      <jnpf-form-tip-item label="标签布局" tip-label="APP不支持所有交错类型，默认显示轴右侧">
        <el-select v-model="activeData.option.layout" placeholder="请选择风格类型" filterable>
          <el-option v-for="(item, index) in layoutStyleList" :key="index" :label="item.label"
            :value="item.value" />
        </el-select>
      </jnpf-form-tip-item>
      <el-form-item label="排序">
        <el-radio-group v-model="activeData.option.sortable" size="small">
          <el-radio-button :label="item.value" v-for="(item,index) in sortList" :key="index">
            {{item.label}}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <jnpf-form-tip-item label="显示条数" tipLabel='置空时，则显示全部数据'>
        <el-input-number v-if="showType=='pc'" v-model="activeData.option.showNumber"
          controls-position="right" :min="0" :max="500" />
        <el-input-number v-else v-model="activeData.option.appShowNumber" controls-position="right"
          :min="0" :max="500" />
      </jnpf-form-tip-item>
    </template>
    <template v-if="activeData.jnpfKey == 'text'">
      <el-form-item label="文本类型">
        <el-radio-group v-model="activeData.option.styleType" size="small" @change="textChange">
          <el-radio-button :label="item.value" v-for="(item,index) in textStyleList" :key="index">
            {{item.label}}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="数据类型">
        <el-radio-group v-model="activeData.dataType" size="small" @change="dataTypeChange">
          <el-radio-button label="static">静态数据</el-radio-button>
          <el-radio-button label="dynamic">远端数据</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="文本内容" v-if="activeData.dataType=='static'">
        <el-input v-if="activeData.option.styleType==1" v-model="activeData.option.defaultValue"
          placeholder="请输入文本内容" />
        <el-button v-if="activeData.option.styleType==2" @click="showEditor()">设置</el-button>
      </el-form-item>
      <el-form-item label="数据接口" v-else>
        <interface-dialog :value="activeData.propsApi" :title="activeData.propsName"
          popupTitle="数据接口" @change="propsApiChange" />
      </el-form-item>
      <refresh v-if="activeData.dataType==='dynamic'&&activeData.propsApi"
        :refresh="activeData.refresh" />
      <template v-if="activeData.option.styleType!=2">
        <el-form-item label="文本大小">
          <el-input-number v-model="activeData.option.textFontSize" controls-position="right"
            :min="12" :max="25" />
        </el-form-item>
        <el-form-item label="文本加粗">
          <el-switch v-model="activeData.option.textFontWeight" />
        </el-form-item>
        <el-form-item label="文本斜体">
          <el-switch v-model="activeData.option.textFontStyle" />
        </el-form-item>
        <el-form-item label="文本颜色" style="height:32px">
          <el-color-picker v-model="activeData.option.textFontColor" />
        </el-form-item>
        <el-form-item label="文本位置">
          <el-radio-group v-model="activeData.option.textLeft" size="small">
            <el-radio-button :label="item.value" v-for="(item,index) in alignList" :key="index">
              {{item.label}}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="文本下划线">
          <el-radio-group v-model="activeData.option.textUnderLine" size="small">
            <el-radio-button :label="item.value" v-for="(item,index) in underLineList" :key="index">
              {{item.label}}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </template>
      <el-form-item label="文本滚动" v-if="activeData.option.styleType!='2'">
        <el-switch v-model="activeData.option.textAutoplay" />
      </el-form-item>
      <template v-if="activeData.option.textAutoplay&&activeData.option.styleType!='2'">
        <el-form-item label="滚动方向" v-if="showType=='pc'">
          <el-radio-group v-model="activeData.option.textAutoplayMode" size="small"
            @change="renderKeyChange">
            <el-radio-button label="left">横向</el-radio-button>
            <el-radio-button label="up">纵向</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="滚动速度">
          <el-input-number v-model="activeData.option.textAutoplaySpeed" controls-position="right"
            :min="10" :max="100" @change="renderKeyChange" />
        </el-form-item>
      </template>
      <el-form-item label="背景色" style="height:32px">
        <el-color-picker v-model="activeData.option.textBgColor" />
      </el-form-item>
      <Link :activeData="activeData" :menuList="menuList" :appMenuList="appMenuList"
        :showType="showType" />
    </template>
    <template v-if="activeData.jnpfKey == 'image'">
      <el-form-item label="图片来源">
        <el-radio-group v-model="activeData.option.styleType" size="small"
          @change="styleTypeChange">
          <el-radio-button :label="item.value" v-for="(item,index) in styleTypeOptions"
            :key="index">
            {{item.label}}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <jnpf-form-tip-item label="上传图片" v-if="activeData.option.styleType==1">
        <single-img v-model="activeData.option.defaultValue" />
      </jnpf-form-tip-item>
      <jnpf-form-tip-item label="图片地址" v-else-if="activeData.option.styleType==2"
        tipLabel='地址以http://或https://为开头'>
        <el-input v-model="activeData.option.defaultValue" placeholder="请输入图片地址" />
      </jnpf-form-tip-item>
      <el-form-item label="数据接口" v-else>
        <interface-dialog :value="activeData.propsApi" :title="activeData.propsName"
          popupTitle="数据接口" @change="propsApiChange" />
      </el-form-item>
      <refresh v-if="activeData.dataType==='dynamic'&&activeData.propsApi"
        :refresh="activeData.refresh" />
      <el-form-item label="填充方式">
        <el-select v-model="activeData.option.imageFillStyle" placeholder="请选择风格类型" filterable>
          <el-option v-for="(item, index) in fillStyleList" :key="index" :label="item.label"
            :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="文本内容">
        <el-input v-model="activeData.option.textDefaultValue" placeholder="请输入文本内容" />
      </el-form-item>
      <textSet :activeData="activeData" />
      <Link :activeData="activeData" :menuList="menuList" :appMenuList="appMenuList"
        :showType="showType" />
    </template>
    <template v-if="activeData.jnpfKey == 'carousel'">
      <el-form-item label="轮播图方向" v-show="showType=='pc'">
        <el-radio-group v-model="activeData.option.carouselDirection" size="small">
          <el-radio-button :label="item.value" v-for="(item,index) in directionList" :key="index">
            {{item.label}}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="自动轮播">
        <el-switch v-model="activeData.option.carouselAutoplay" />
      </el-form-item>
      <el-form-item label="轮播间隔">
        <el-input v-model="activeData.option.carouselInterval" placeholder="请输入轮播间隔" type="number"
          :min="500" :max="500000">
          <template slot="append">ms</template>
        </el-input>
      </el-form-item>
      <el-form-item label="指示点显示">
        <el-radio-group v-model="activeData.option.carouselIndicatorPosition" size="small">
          <el-radio-button :label="item.value" v-for="(item,index) in indicatorPositionList"
            :key="index">
            <span v-if="activeData.option.carouselDirection=='horizontal'">{{item.label}}</span>
            <span v-else>{{item.title}}</span>
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="箭头显示"
        v-if="activeData.option.carouselDirection=='horizontal'&&showType=='pc'">
        <el-radio-group v-model="activeData.option.carouselArrow" size="small">
          <el-radio-button :label="item.value" v-for="(item,index) in arrowList" :key="index">
            {{item.label}}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="循环显示" v-show="showType=='pc'">
        <el-switch v-model="activeData.option.carouselLoop" />
      </el-form-item>
      <el-form-item label="3D效果" v-show="showType!='pc'">
        <el-switch v-model="activeData.option.carouselType" />
      </el-form-item>
      <el-form-item label="选项">
        <el-button @click="showData('carouselData','carouselDataVisible')">设置</el-button>
      </el-form-item>
      <refresh :refresh="activeData.refresh"
        v-show="activeData.option[showType=='pc'?'defaultValue':'appDefaultValue'].find(ele => ele.dataType === 3)" />
      <CarouselData ref="carouselData" :menuList="menuList" :appMenuList="appMenuList"
        :showType="showType" v-if="carouselDataVisible" @refresh="refresh" />
      <el-form-item label="填充方式">
        <el-select v-model="activeData.option.imageFillStyle" placeholder="请选择风格类型" filterable>
          <el-option v-for="(item, index) in fillStyleList" :key="index" :label="item.label"
            :value="item.value" />
        </el-select>
      </el-form-item>
      <textSet :activeData="activeData" />
    </template>
    <template v-if="activeData.jnpfKey == 'video'">
      <el-form-item label="视频来源">
        <el-radio-group v-model="activeData.option.styleType" size="small"
          @change="styleTypeChange">
          <el-radio-button :label="item.value" v-for="(item,index) in styleTypeOptions"
            :key="index">
            {{item.label}}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="上传视频" v-if="activeData.option.styleType=='1'">
        <JNPF-UploadFz v-model="fileList" :limit="1" buttonText="上传视频" accept="video/*"
          fileSize="100" @change="UploadFzChange" />
      </el-form-item>
      <jnpf-form-tip-item label="视频地址" v-else-if="activeData.option.styleType==2"
        tipLabel='地址以http://或https://开头'>
        <el-input v-model="activeData.option.defaultValue" placeholder="请输入视频地址" />
      </jnpf-form-tip-item>
      <template v-else>
        <el-form-item label="数据接口">
          <interface-dialog :value="activeData.propsApi" :title="activeData.propsName"
            popupTitle="数据接口" @change="propsApiChange" />
        </el-form-item>
        <refresh v-if="activeData.dataType==='dynamic'&&activeData.propsApi"
          :refresh="activeData.refresh" />
      </template>
      <el-form-item label="自动播放">
        <el-switch v-model="activeData.option.videoAutoplay" />
      </el-form-item>
      <el-form-item label="播放频率">
        <el-radio-group v-model="activeData.option.playNumber" size="small">
          <el-radio-button :label="item.value" v-for="(item,index) in playNumberList" :key="index">
            {{item.label}}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="静音播放">
        <el-switch v-model="activeData.option.mutePlay" />
      </el-form-item>
    </template>
    <template v-if="activeData.jnpfKey == 'iframe'">
      <jnpf-form-tip-item label="链接地址" tip-label="地址以http://或https://为开头">
        <el-input v-model="activeData.option.defaultValue" placeholder="请输入链接地址" />
      </jnpf-form-tip-item>
    </template>
    <template v-if="activeData.jnpfKey == 'todo'">
      <template v-if="showType=='app'">
        <el-form-item label="风格类型">
          <el-select v-model="activeData.option.styleType" placeholder="请选择风格类型" filterable>
            <el-option v-for="(item, index) in appTodoStyleList" :key="index" :label="item.label"
              :value="item.value" />
          </el-select>
        </el-form-item>
        <template v-if="activeData.option.styleType==2">
          <el-form-item label="每行选项数">
            <el-input-number v-model="activeData.option.appRowNumber" controls-position="right"
              :min="1" :max="10" />
          </el-form-item>
          <el-form-item label="显示边框">
            <el-switch v-model="activeData.option.appShowBorder" />
          </el-form-item>
        </template>
      </template>
      <template v-else>
        <el-form-item label="每行选项数">
          <el-input-number v-model="activeData.option.rowNumber" controls-position="right" :min="1"
            :max="10" />
        </el-form-item>
        <el-form-item label="显示边框">
          <el-switch v-model="activeData.option.showBorder" />
        </el-form-item>
      </template>
      <el-form-item label="选项">
        <el-button @click="showDataTodoData">设置</el-button>
      </el-form-item>
      <refresh :refresh="activeData.refresh" />
      <todo-data ref="todoData" v-if="todoDataVisible" @refresh="commonRefresh" />
      <el-form-item label="名称大小">
        <el-input-number v-model="activeData.option.labelFontSize" controls-position="right"
          :min="12" :max="25" />
      </el-form-item>
      <el-form-item label="名称加粗">
        <el-switch v-model="activeData.option.labelFontWeight" />
      </el-form-item>
      <el-form-item label="名称颜色" style="height:32px">
        <el-color-picker v-model="activeData.option.labelFontColor" />
      </el-form-item>
      <el-form-item label="数值大小">
        <el-input-number v-model="activeData.option.valueFontSize" controls-position="right"
          :min="12" :max="25" />
      </el-form-item>
      <el-form-item label="数值加粗">
        <el-switch v-model="activeData.option.valueFontWeight" />
      </el-form-item>
      <el-form-item label="数值颜色" style="height:32px">
        <el-color-picker v-model="activeData.option.valueFontColor" />
      </el-form-item>
      <el-form-item label="数值背景色" v-if="showType=='app'" style="height:32px">
        <el-color-picker v-model="activeData.option.valueFontBgColor" />
      </el-form-item>
    </template>
    <template v-if="activeData.jnpfKey == 'commonFunc'">
      <template v-if="showType=='app'">
        <el-form-item label="风格类型">
          <el-select v-model="activeData.option.appStyleType" placeholder="请选择风格类型" filterable>
            <el-option v-for="(item, index) in appTodoStyleList" :key="index" :label="item.label"
              :value="item.value" />
          </el-select>
        </el-form-item>
        <template v-if="activeData.option.appStyleType==2">
          <el-form-item label="每行选项数">
            <el-input-number v-model="activeData.option.appRowNumber" controls-position="right"
              :min="1" :max="10" />
          </el-form-item>
          <el-form-item label="显示边框">
            <el-switch v-model="activeData.option.appShowBorder" />
          </el-form-item>
        </template>
      </template>
      <template v-else>
        <el-form-item label="每行选项数">
          <el-input-number v-model="activeData.option.rowNumber" controls-position="right" :min="1"
            :max="10" />
        </el-form-item>
        <el-form-item label="显示边框">
          <el-switch v-model="activeData.option.showBorder" />
        </el-form-item>
      </template>
      <el-form-item label="选项">
        <el-button @click="showData('commonFunData','commonFunDataVisible')">设置</el-button>
      </el-form-item>
      <CommonFunData ref="commonFunData" :menuList="menuList" :appMenuList="appMenuList"
        :showType="showType" v-if="commonFunDataVisible" @refresh="refresh" />
      <el-form-item label="图标位置" v-if="showType=='pc'">
        <el-radio-group v-model="activeData.option.styleType" size="small">
          <el-radio-button :label="item.value" v-for="(item,index) in commonFuncStyleList"
            :key="index">
            {{item.label}}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="名称大小">
        <el-input-number v-model="activeData.option.labelFontSize" controls-position="right"
          :min="12" :max="25" />
      </el-form-item>
      <el-form-item label="名称加粗">
        <el-switch v-model="activeData.option.labelFontWeight" />
      </el-form-item>
      <el-form-item label="名称颜色" style="height:32px">
        <el-color-picker v-model="activeData.option.labelFontColor" />
      </el-form-item>
    </template>
    <template v-if="activeData.jnpfKey == 'dataBoard'">
      <template v-if="showType=='app'">
        <el-form-item label="风格类型">
          <el-select v-model="activeData.option.appStyleType" placeholder="请选择风格类型" filterable>
            <el-option v-for="(item, index) in appTodoStyleList" :key="index" :label="item.label"
              :value="item.value" />
          </el-select>
        </el-form-item>
        <template v-if="activeData.option.appStyleType==2">
          <el-form-item label="每行选项数">
            <el-input-number v-model="activeData.option.appRowNumber" controls-position="right"
              :min="1" :max="8" />
          </el-form-item>
          <el-form-item label="显示边框">
            <el-switch v-model="activeData.option.appShowBorder" />
          </el-form-item>
        </template>
      </template>
      <template v-else>
        <el-form-item label="每行选项数">
          <el-input-number v-model="activeData.option.rowNumber" controls-position="right" :min="1"
            :max="8" />
        </el-form-item>
        <el-form-item label="显示边框">
          <el-switch v-model="activeData.option.showBorder" />
        </el-form-item>
      </template>
      <el-form-item label="选项">
        <el-button @click="showData('dataBoardData','dataBoardDataVisible')">设置</el-button>
      </el-form-item>
      <Refresh :refresh="activeData.refresh"
        v-show="activeData.option[showType=='pc'?'defaultValue':'appDefaultValue'].find(ele => ele.dataType === 'dynamic')" />
      <DataBoardData ref="dataBoardData" :menuList="menuList" :appMenuList="appMenuList"
        :showType="showType" v-if="dataBoardDataVisible" @refresh="refresh" />
      <el-form-item label="名称大小">
        <el-input-number v-model="activeData.option.labelFontSize" controls-position="right"
          :min="12" :max="25" />
      </el-form-item>
      <el-form-item label="名称加粗">
        <el-switch v-model="activeData.option.labelFontWeight" />
      </el-form-item>
      <el-form-item label="名称颜色" style="height:32px">
        <el-color-picker v-model="activeData.option.labelFontColor" />
      </el-form-item>
      <el-form-item label="数值大小">
        <el-input-number v-model="activeData.option.valueFontSize" controls-position="right"
          :min="12" :max="25" />
      </el-form-item>
      <el-form-item label="数值加粗">
        <el-switch v-model="activeData.option.valueFontWeight" />
      </el-form-item>
      <el-form-item label="数值颜色" style="height:32px">
        <el-color-picker v-model="activeData.option.valueFontColor" />
      </el-form-item>
      <el-form-item label="单位大小">
        <el-input-number v-model="activeData.option.unitFontSize" controls-position="right"
          :min="12" :max="25" />
      </el-form-item>
      <el-form-item label="单位加粗">
        <el-switch v-model="activeData.option.unitFontWeight" />
      </el-form-item>
      <el-form-item label="单位颜色" style="height:32px">
        <el-color-picker v-model="activeData.option.unitFontColor" />
      </el-form-item>
    </template>
    <TableList v-if="activeData.jnpfKey=='tableList'" :activeData="activeData"
      :showType='showType' />
    <popupEditor v-if="editorVisible" ref="popupEditor" @refresh="commonRefresh" />
  </el-collapse-item>
</template>
<script>

import {
  alignList,
  underLineList,
  linkTypeList,
  barStyleList,
  lineStyleList,
  pieStyleList,
  radarStyleList,
  rankStyleList,
  timeStyleList,
  layoutStyleList,
  appLayoutStyleList,
  textStyleList,
  mapStyleList,
  directionList,
  indicatorPositionList,
  arrowList,
  fillStyleList,
  imageStyleList,
  videoStyleList,
  playNumberList,
  sortList,
  noStyleTypeList,
  appTodoStyleList,
  commonFuncStyleList,
  tableTypeList
} from '../../components/config'
import draggable from 'vuedraggable'
//import InterfaceDialog from '@/components/extnProcess/PropPanel/InterfaceDialog'
import popupEditor from '../../components/popupEditor'
import todoData from '../common/TodoData'
import CommonFunData from '../common/CommonFunData'
import DataBoardData from '../common/DataBoardData'
import CarouselData from '../common/CarouselData'
import TableList from '../common/Table'
import textSet from '../common/Text'
import MapSet from '../common/MapSet'
import Link from '../common/Link'
import { getFeatureSelector } from '@/api/onlineDev/visualDev'
import { getAtlas } from '@/api/onlineDev/portal'
import Refresh from '../common/Refresh'
import singleImg from '@/components/extn/Upload/SingleImg'
export default {
  props: ['activeData', 'menuList', 'appMenuList', 'showType'],
  components: {
    draggable,
    popupEditor,
    todoData,
    CommonFunData,
    DataBoardData,
    CarouselData,
    //InterfaceDialog,
    textSet,
    MapSet,
    Link,
    TableList,
    Refresh,
    singleImg
  },
  data() {
    return {
      cascaderOptions: [],
      styleTypeOptions: [],
      tempData: [],
      fileList: [],
      editorVisible: false,
      todoDataVisible: false,
      commonFunDataVisible: false,
      dataBoardDataVisible: false,
      carouselDataVisible: false,
      alignList,
      underLineList,
      linkTypeList,
      directionList,
      indicatorPositionList,
      arrowList,
      fillStyleList,
      playNumberList,
      layoutStyleList,
      appLayoutStyleList,
      sortList,
      textStyleList,
      noStyleTypeList,
      appTodoStyleList,
      commonFuncStyleList,
    }
  },
  watch: {
    'activeData.jnpfKey': {
      handler(val) {
        this.getStyleTypeOptions()
      },
      immediate: true,
    }
  },
  computed: {
    linkType() {
      return this.activeData.option.linkType || ''
    },
  },
  created() {
    getAtlas().then((res) => {
      this.cascaderOptions = res.data
    })
    this.fileList = []
    if (this.activeData.jnpfKey == 'video' && this.activeData.option.defaultValue && this.activeData.option.styleType == 1) {
      this.fileList = [this.activeData.option.defaultValue]
    }
  },
  methods: {
    initBarType() {
      if (this.activeData.option.styleType != 7 || this.activeData.jnpfKey != 'barChart') return
      const optionData = this.activeData.option.defaultValue || []
      if (!Array.isArray(optionData)) return
      this.activeData.option.barType = []
      let typeArr = Array.from(new Set(optionData.map((item) => item.type)))
      typeArr.map((item, index) => {
        this.activeData.option.barType.push({
          title: item,
          type: index == 1 ? 'line' : 'bar'
        })
      })
    },
    getStyleTypeOptions() {
      this.styleTypeOptions = []
      const jnpfKey = this.activeData.jnpfKey
      if (jnpfKey == 'barChart') this.styleTypeOptions = JSON.parse(JSON.stringify(barStyleList))
      if (jnpfKey == 'lineChart') this.styleTypeOptions = lineStyleList
      if (jnpfKey == 'pieChart') this.styleTypeOptions = pieStyleList
      if (jnpfKey == 'radarChart') this.styleTypeOptions = radarStyleList
      if (jnpfKey == 'rankList') this.styleTypeOptions = rankStyleList
      if (jnpfKey == 'timeAxis') this.styleTypeOptions = timeStyleList
      if (jnpfKey == 'image') this.styleTypeOptions = imageStyleList
      if (jnpfKey == 'video') this.styleTypeOptions = videoStyleList
      if (jnpfKey == 'mapChart') this.styleTypeOptions = mapStyleList
      if (jnpfKey == 'tableList') this.styleTypeOptions = tableTypeList
    },
    getTitle() {
      const jnpfKey = this.activeData.jnpfKey
      if (jnpfKey == 'barChart') return '柱状图设置'
      if (jnpfKey == 'lineChart') return '折线图设置'
      if (jnpfKey == 'pieChart') return '饼图设置'
      if (jnpfKey == 'radarChart') return '雷达图设置'
      if (jnpfKey == 'rankList') return '排行榜设置'
      if (jnpfKey == 'timeAxis') return '时间轴设置'
      if (jnpfKey == 'text') return '文本设置'
      if (jnpfKey == 'image') return '图片设置'
      if (jnpfKey == 'carousel') return '轮播图设置'
      if (jnpfKey == 'video') return '视频设置'
      if (jnpfKey == 'iframe') return 'iframe设置'
      if (jnpfKey == 'mapChart') return '地图设置'
      if (jnpfKey == 'todo') return '待办设置'
      if (jnpfKey == 'commonFunc') return '常用功能设置'
      if (jnpfKey == 'dataBoard') return '数据面板设置'
      if (jnpfKey == 'tableList') return '表格列表设置'
    },
    getTipLabel() {
      const jnpfKey = this.activeData.jnpfKey
      if (jnpfKey == 'barChart') return 'APP不支持背景类型，默认显示基础类型'
      if (jnpfKey == 'lineChart') return 'APP不支持堆叠类型，默认显示基础类型'
      if (jnpfKey == 'mapChart') return 'APP不支持柱形和柱形排名类型，默认显示散点类型'
      return ''
    },
    addSelectItem() {
      this.activeData.option.columnOptions.push({
        value: '',
        label: ''
      })
    },
    delSelectItem(index) {
      if (this.activeData.option.columnOptions.length > 1) this.activeData.option.columnOptions.splice(index, 1)
    },
    showEditor() {
      this.editorVisible = true
      this.$nextTick(() => {
        this.$refs.popupEditor.init(this.activeData.option.defaultValue)
      })
    },
    getTempData() {
      if (!this.tempData.length) {
        getFeatureSelector({ type: 1 }).then(res => {
          this.tempData = res.data.list
        })
      }
    },
    showData(refName, visible) {
      this[visible] = true
      this.$nextTick(() => {
        if (this.showType == 'pc') {
          this.$refs[refName].init(this.activeData.option.defaultValue)
        } else {
          this.$refs[refName].init(this.activeData.option.appDefaultValue)
        }
      })
    },
    showDataTodoData() {
      this.todoDataVisible = true
      this.$nextTick(() => {
        this.$refs.todoData.init(this.activeData.option.defaultValue)
      })
    },
    refresh(val) {
      const type = this.showType == 'pc' ? 'defaultValue' : 'appDefaultValue'
      this.activeData.option[type] = val
      this.renderKeyChange()
    },
    commonRefresh(val) {
      this.activeData.option.defaultValue = val
      this.renderKeyChange()
    },
    UploadFzChange(e) {
      this.activeData.option.defaultValue = e.length ? e[0] : ''
    },
    textChange() {
      this.activeData.option.defaultValue = ''
      if (this.activeData.dataType == 'static') this.activeData.option.defaultValue = 'JNPF快速开发平台'
    },
    dataTypeChange() {
      this.activeData.option.defaultValue = ''
      if (this.activeData.dataType == 'static') this.activeData.option.defaultValue = 'JNPF快速开发平台'
      this.activeData.propsApi = ''
      this.activeData.propsName = ''
    },
    propsApiChange(val, item) {
      if (val) {
        this.activeData.propsApi = val
        this.activeData.propsName = item.fullName
        this.activeData.refresh.autoRefresh = false
      } else {
        this.activeData.propsApi = ''
        this.activeData.propsName = ''
      }
      this.renderKeyChange()
    },
    renderKeyChange() {
      this.activeData.renderKey = +new Date()
    },
    styleTypeChange(val) {
      const jnpfKey = this.activeData.jnpfKey
      if (jnpfKey == 'image' || jnpfKey == 'video') {
        this.activeData.propsApi = ""
        this.activeData.propsName = ""
        this.activeData.dataType = 'static'
        this.activeData.option.defaultValue = ''
        if (val == '3') this.activeData.dataType = 'dynamic'
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.opacity5 {
  opacity: 0.5;
}
>>> .select-item,
.select-item {
  display: flex;
  border: 1px dashed #fff;
  box-sizing: border-box;
  & .el-input + .el-input {
    margin-left: 4px;
  }
  & + .select-item {
    margin-top: 4px;
  }
  &.sortable-chosen {
    border: 1px dashed #409eff;
  }
  .select-line-icon {
    line-height: 32px;
    font-size: 22px;
    padding: 0 4px;
    color: #606266;
    .icon-ym-darg {
      font-size: 20px;
      line-height: 31px;
      display: inline-block;
    }
  }
  .close-btn {
    cursor: pointer;
    color: #f56c6c;
  }
  .option-drag {
    cursor: move;
  }
}
</style>