
<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-left" v-if="columnData.type === 2">
      <div class="JNPF-common-title" v-if="columnData.treeTitle">
        <h2>{{columnData.treeTitle}}</h2>
        <el-dropdown v-if="columnData.treeSynType==0">
          <el-link icon="icon-ym icon-ym-mpMenu" :underline="false" />
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="toggleTreeExpand(true)">展开全部</el-dropdown-item>
            <el-dropdown-item @click.native="toggleTreeExpand(false)">折叠全部</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="JNPF-common-tree-search-box"
        v-if="columnData.hasTreeQuery&&columnData.treeSynType==0">
        <el-input placeholder="输入关键字" v-model="keyword" suffix-icon="el-icon-search" clearable />
      </div>
      <el-tree :data="treeData" :props="treeProps"
        :default-expand-all="columnData.treeSynType==0?expandsTree:false" highlight-current
        ref="treeBox" :expand-on-click-node="false" @node-click="handleNodeClick"
        class="JNPF-common-el-tree" :node-key="treeProps.value" :filter-node-method="filterNode"
        :lazy="columnData.treeSynType==1&columnData.treeDataSource==='api'?true:false"
        :load="loadNode" v-if="refreshTree">
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <i :class="data.icon"></i>
          <span class="text">{{node.label}}</span>
        </span>
      </el-tree>
    </div>
    <div class="JNPF-common-layout-center">
      <Search ref="Search" :list="columnData.searchList" @reset="reset" @search="searchData"
        :initDataJson="listQuery.queryJson" />
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <div v-if="isPreview || !columnData.useBtnPermission">
            <span v-for="(item, i) in columnData.btnsList" :key="i" style="margin:0 4px;">
              <el-button :type="i==0?'primary':'text'" :icon="item.icon"
                @click="headBtnsHandel(item.value)">
                {{item.label}}</el-button>
            </span>
          </div>
          <div v-else>
            <span v-for="(item, i) in columnData.btnsList" :key="i" style="margin:0 4px;">
              <el-button :type="i==0?'primary':'text'" :icon="item.icon" v-has="'btn_'+item.value"
                @click="headBtnsHandel(item.value)">
                {{item.label}}</el-button>
            </span>
          </div>
          <div class="JNPF-common-head-right">
            <el-tooltip content="高级查询" placement="top" v-if="columnData.hasSuperQuery">
              <el-link icon="icon-ym icon-ym-filter JNPF-common-head-icon" :underline="false"
                @click="openSuperQuery()" />
            </el-tooltip>
            <template v-if="columnData.type==5&&columnData.treeLazyType == 0">
              <el-tooltip effect="dark" content="展开" placement="top">
                <el-link v-show="!expandsTable" type="text"
                  icon="icon-ym icon-ym-btn-expand JNPF-common-head-icon" :underline="false"
                  @click="toggleExpandList()" />
              </el-tooltip>
              <el-tooltip effect="dark" content="折叠" placement="top">
                <el-link v-show="expandsTable" type="text"
                  icon="icon-ym icon-ym-btn-collapse JNPF-common-head-icon" :underline="false"
                  @click="toggleExpandList()" />
              </el-tooltip>
            </template>
            <el-tooltip effect="dark" :content="$t('common.refresh')" placement="top">
              <el-link icon="icon-ym icon-ym-Refresh JNPF-common-head-icon" :underline="false"
                @click="initData()" />
            </el-tooltip>
          </div>
        </div>
        <JNPF-table v-loading="listLoading" :data="list" row-key="id"
          :default-expand-all="columnData.childTableStyle!==2&&columnData.treeLazyType!=1?expandsTable:false"
          :lazy="columnData.type==5&&columnData.treeLazyType==1"
          :tree-props="{children: 'children', hasChildren: columnData.treeLazyType==1?'hasChildren':''}"
          :load="treeLoad" @sort-change="sortChange" :row-style="rowStyle" :cell-style="cellStyle"
          :has-c="hasBatchBtn" @selection-change="handleSelectionChange" v-if="refreshTable"
          custom-column :span-method="arraySpanMethod" ref="tableRef"
          :hasNO="!(columnData.childTableStyle==2&&childColumnList.length&&columnData.type != 3)&&columnData.type != 4"
          :hasNOFixed="columnList.some(o=>o.fixed == 'left')"
          :show-summary='columnData.showSummary && !(columnData.type==3 ||columnData.type==5)'
          :summary-method="getTableSummaries">
          <template v-if="columnData.type === 4">
            <el-table-column width="50" align="center" label="序号"
              :fixed="columnList.some(o=>o.fixed == 'left')">
              <template slot-scope="scope">
                <div class="row-action" v-if="config.enableFlow==0">
                  <span class="index">{{ scope.$index + 1 }}</span>
                  <i class="ym-custom ym-custom-arrow-expand"
                    @click="handleRowForm(scope.$index)"></i>
                </div>
                <div v-else>{{ scope.$index + 1 }}</div>
              </template>
            </el-table-column>
            <template v-for="(item, i) in columnList">
              <el-table-column :prop="item.prop" :label="item.label" :align="item.align"
                :fixed="item.fixed!='none'?item.fixed:false" :width="item.width" :key="i"
                :sortable="item.sortable?'custom':item.sortable" v-if="item.jnpfKey !=='table'">
                <template slot-scope="scope">
                  <template v-if="scope.row.rowEdit">
                    <template v-if="item.jnpfKey==='numInput'">
                      <JnpfInputNumber v-model="scope.row[item.prop]"
                        :placeholder="item.placeholder" :min="item.min" :max="item.max"
                        :step="item.step" :precision="item.precision"
                        :controls-position="item['controls-position']" :disabled="item.disabled"
                        style="width:100%" :thousands="item.thousands" />
                    </template>
                    <template v-else-if="['rate','slider'].includes(item.jnpfKey)">
                      <el-input-number v-model="scope.row[item.prop]" placeholder="请输入"
                        controls-position="right" style="width:100%" :disabled="item.disabled" />
                    </template>
                    <div v-else-if="item.jnpfKey==='switch'" style="padding-top: 5px;">
                      <el-switch v-model="scope.row[item.prop]" :active-value="item['active-value']"
                        :inactive-value="item['inactive-value']" :disabled="item.disabled" />
                    </div>
                    <template v-else-if="item.jnpfKey==='time'">
                      <JnpfTimePicker v-model="scope.row[item.prop]" style="width:100%"
                        :placeholder="item.placeholder" :clearable="item.clearable"
                        :valueFormat="item['value-format']" :format="item.format"
                        :readonly="item.readonly" :disabled="item.disabled"
                        :startTime='item.startTime' :endTime="item.endTime">
                      </JnpfTimePicker>
                    </template>
                    <template v-else-if="item.jnpfKey==='date'">
                      <JnpfDatePicker v-model="scope.row[item.prop]" :type="item.type"
                        :clearable="item.clearable" :placeholder="item.placeholder"
                        :valueFormat="item['value-format']" :format="item.format" style="width:100%"
                        :readonly="item.readonly" :disabled="item.disabled"
                        :startTime='item.startTime' :endTime="item.endTime">
                      </JnpfDatePicker>
                    </template>
                    <template v-else-if="['comSelect'].includes(item.jnpfKey)">
                      <comSelect v-model="scope.row[item.prop]" :placeholder="item.placeholder"
                        :multiple="item.multiple" :clearable="item.clearable"
                        :disabled="item.disabled" />
                    </template>
                    <template v-else-if="['depSelect'].includes(item.jnpfKey)">
                      <depSelect v-model="scope.row[item.prop]" :placeholder="item.placeholder"
                        :selectType="item.selectType" :ableDepIds="item.ableDepIds"
                        :multiple="item.multiple" :clearable="item.clearable"
                        :disabled="item.disabled" />
                    </template>
                    <template v-else-if="['userSelect'].includes(item.jnpfKey)">
                      <userSelect v-model="scope.row[item.prop]" :placeholder="item.placeholder"
                        :selectType="item.selectType" :ableDepIds="item.ableDepIds"
                        :ablePosIds="item.ablePosIds" :ableUserIds="item.ableUserIds"
                        :ableRoleIds="item.ableRoleIds" :ableGroupIds="item.ableGroupIds"
                        :multiple="item.multiple" :clearable="item.clearable"
                        :disabled="item.disabled" />
                    </template>
                    <template v-else-if="['usersSelect'].includes(item.jnpfKey)">
                      <usersSelect v-model="scope.row[item.prop]" :placeholder="item.placeholder"
                        :selectType="item.selectType" :ableIds="item.ableIds"
                        :multiple="item.multiple" :clearable="item.clearable"
                        :disabled="item.disabled" />
                    </template>
                    <template v-else-if="['posSelect'].includes(item.jnpfKey)">
                      <posSelect v-model="scope.row[item.prop]" :placeholder="item.placeholder"
                        :selectType="item.selectType" :ableDepIds="item.ableDepIds"
                        :ablePosIds="item.ablePosIds" :multiple="item.multiple"
                        :clearable="item.clearable" :disabled="item.disabled" />
                    </template>
                    <template v-else-if="item.jnpfKey==='groupSelect'">
                      <groupSelect v-model="scope.row[item.prop]" :placeholder="item.placeholder"
                        :multiple="item.multiple" :clearable="item.clearable"
                        :disabled="item.disabled" />
                    </template>
                    <template v-else-if="item.jnpfKey==='roleSelect'">
                      <roleSelect v-model="scope.row[item.prop]" :placeholder="item.placeholder"
                        :multiple="item.multiple" :clearable="item.clearable"
                        :disabled="item.disabled" />
                    </template>
                    <template v-else-if="item.jnpfKey==='address'">
                      <JNPFAddress v-model="scope.row[item.prop]" :level="item.level"
                        :placeholder="item.placeholder" :multiple="item.multiple"
                        :clearable="item.clearable" :disabled="item.disabled" />
                    </template>
                    <template v-else-if="['select','radio','checkbox'].includes(item.jnpfKey)">
                      <el-select v-model="scope.row[item.prop]" :placeholder="item.placeholder"
                        :filterable="item.filterable"
                        :multiple="item.multiple||item.jnpfKey==='checkbox'"
                        :clearable="item.clearable" :disabled="item.disabled">
                        <el-option :label="oItem[item.props.props.label]"
                          v-for="(oItem, i) in item.options" :value="oItem[item.props.props.value]"
                          :key="i"></el-option>
                      </el-select>
                    </template>
                    <template v-else-if="item.jnpfKey==='cascader'">
                      <el-cascader v-model="scope.row[item.prop]" :options="item.options"
                        :clearable="item.clearable" :show-all-levels="item['show-all-levels']"
                        :props="item.props.props" :filterable="item.filterable"
                        :separator="item.separator" :placeholder="item.placeholder"
                        :disabled="item.disabled" style="width:100%">
                      </el-cascader>
                    </template>
                    <template v-else-if="item.jnpfKey==='treeSelect'">
                      <JNPF-TreeSelect v-model="scope.row[item.prop]" :options="item.options"
                        :props="item.props.props" :placeholder="item.placeholder"
                        :multiple="item.multiple" :clearable="item.clearable"
                        :disabled="item.disabled" />
                    </template>
                    <template v-else-if="item.jnpfKey==='relationForm'">
                      <relationForm v-model="scope.row[item.prop]" :placeholder="item.placeholder"
                        :modelId="item.modelId" :columnOptions="item.columnOptions"
                        :relationField="item.relationField" :hasPage="item.hasPage"
                        :pageSize="item.pageSize" :clearable="item.clearable"
                        :disabled="item.disabled" />
                    </template>
                    <template v-else-if="item.jnpfKey==='popupSelect'">
                      <popupSelect v-model="scope.row[item.prop]" :placeholder="item.placeholder"
                        :interfaceId="item.interfaceId" :columnOptions="item.columnOptions"
                        :propsValue="item.propsValue" :relationField="item.relationField"
                        :hasPage="item.hasPage" :pageSize="item.pageSize"
                        :popupType="item.popupType" :popupTitle="item.popupTitle"
                        :popupWidth="item.popupWidth" :clearable="item.clearable"
                        :disabled="item.disabled" />
                    </template>
                    <template v-else-if="item.jnpfKey==='autoComplete'">
                      <JnpfAutoComplete v-model="scope.row[item.prop]"
                        :placeholder="item.placeholder" :interfaceId="item.interfaceId"
                        :relationField="item.relationField" :total="item.total"
                        :clearable="item.clearable" :templateJson="item.templateJson"
                        :disabled="item.disabled" />
                    </template>
                    <template v-else-if="item.jnpfKey==='popupTableSelect'">
                      <popupTableSelect v-model="scope.row[item.prop]"
                        :placeholder="item.placeholder" :interfaceId="item.interfaceId"
                        :columnOptions="item.columnOptions" :propsValue="item.propsValue"
                        :relationField="item.relationField" :hasPage="item.hasPage"
                        :pageSize="item.pageSize" :popupType="item.popupType"
                        :popupTitle="item.popupTitle" :popupWidth="item.popupWidth"
                        :filterable="item.filterable" :multiple="item.multiple"
                        :clearable="item.clearable" :disabled="item.disabled" />
                    </template>
                    <template v-else-if="['comInput','textarea'].includes(item.jnpfKey)">
                      <el-input v-model="scope.row[item.prop]" :placeholder="item.placeholder"
                        :readonly="item.readonly" :prefix-icon="item['prefix-icon']"
                        :suffix-icon="item['suffix-icon']" :clearable="item.clearable"
                        :show-word-limit="item['show-word-limit']" :maxlength="item.maxlength"
                        :show-password="item['show-password']" :disabled="item.disabled">
                        <template slot="prepend"
                          v-if="item.__slot__ && item.__slot__.prepend">{{item.__slot__.prepend}}</template>
                        <template slot="append"
                          v-if="item.__slot__ && item.__slot__.append">{{item.__slot__.append}}</template>
                      </el-input>
                    </template>
                    <template v-else-if="systemComponentsList.includes(item.jnpfKey)">
                      {{scope.row[item.prop+'_name']||scope.row[item.prop]}}
                    </template>
                    <template v-else>
                      {{scope.row[item.prop]}}
                    </template>
                  </template>
                  <template v-else>
                    <template v-if="['relationForm'].includes(item.jnpfKey)">
                      <el-link :underline="false"
                        @click.native="toDetail(item.modelId,scope.row[`${item.prop}`])"
                        type="primary">
                        {{scope.row[item.prop+'_name']||scope.row[item.prop]}}</el-link>
                    </template>
                    <template v-if="['numInput','calculate'].includes(item.jnpfKey)">
                      <template v-if="scope.row[item.prop+'_name']">
                        <JnpfNumber v-model="scope.row[item.prop+'_name']"
                          :thousands="item.thousands" :precision="item.precision">
                        </JnpfNumber>
                      </template>
                      <template v-else>
                        <JnpfNumber v-model="scope.row[item.prop]" :thousands="item.thousands"
                          :precision="item.precision">
                        </JnpfNumber>
                      </template>
                    </template>
                    <template v-else>
                      {{scope.row[item.prop+'_name']||scope.row[item.prop]}}
                    </template>
                  </template>
                </template>
              </el-table-column>
            </template>
          </template>
          <template v-else>
            <template
              v-if="columnData.childTableStyle==2&&childColumnList.length&&(columnData.type ==1||columnData.type == 2)">
              <el-table-column width="0" />
              <el-table-column type="expand" width="40">
                <template slot-scope="scope">
                  <el-tabs>
                    <el-tab-pane :label="child.label" v-for="(child,cIndex) in childColumnList"
                      :key="cIndex">
                      <el-table :data="scope.row[child.prop]" size='mini'>
                        <el-table-column :prop="childTable.vModel" :label="childTable.childLabel"
                          :align="childTable.align" :width="childTable.width"
                          v-for="(childTable,iii) in child.children" :key="iii">
                          <template slot-scope="scope">
                            <template v-if="childTable.jnpfKey==='relationForm'">
                              <el-link :underline="false"
                                @click.native="toDetail(childTable.modelId,scope.row[`${childTable.vModel}_id`])"
                                type="primary">
                                {{ scope.row[childTable.vModel]}}
                              </el-link>
                            </template>
                            <template
                              v-else-if="childTable.jnpfKey==='numInput' ||childTable.jnpfKey==='calculate'">
                              <JnpfNumber v-model="scope.row[childTable.vModel]"
                                :thousands="childTable.thousands" :precision="childTable.precision">
                              </JnpfNumber>
                            </template>
                            <template v-else>
                              {{ scope.row[childTable.vModel]}}
                            </template>
                          </template>
                        </el-table-column>
                      </el-table>
                    </el-tab-pane>
                  </el-tabs>
                </template>
              </el-table-column>
              <el-table-column type="index" width="50" label="序号" align="center" />
            </template>
            <template v-for="(item, i) in columnList">
              <template v-if="item.jnpfKey==='table'">
                <el-table-column :prop="item.prop" :label="item.label" :align="item.align" :key="i"
                  v-if="columnData.childTableStyle!=2||columnData.type == 3">
                  <el-table-column :prop="child.prop" :label="child.childLabel" :align="child.align"
                    :width="child.width" :key="ii"
                    :sortable="child.sortable?'custom':child.sortable"
                    v-for="(child, ii) in item.children" class-name="child-table-box">
                    <template slot-scope="scope">
                      <child-table-column :data="scope.row[item.prop]" :head="item.children"
                        @toggleExpand="toggleExpand(scope.row,`${item.prop}Expand`)"
                        @toDetail="toDetail" :expand="scope.row[`${item.prop}Expand`]" v-if="!ii" />
                    </template>
                  </el-table-column>
                </el-table-column>
              </template>
              <template v-else-if="item.jnpfKey==='relationForm'">
                <el-table-column :prop="item.prop" :label="item.label" :align="item.align"
                  :fixed="getFixed(item, i)" :width="item.width" :key="i"
                  :sortable="item.sortable?'custom':item.sortable">
                  <template slot-scope="scope">
                    <el-link :underline="false"
                      @click.native="toDetail(item.modelId,scope.row[`${item.prop}_id`])"
                      type="primary">
                      {{ scope.row[item.prop] }}</el-link>
                  </template>
                </el-table-column>
              </template>
              <template v-else-if="item.jnpfKey==='numInput' ||item.jnpfKey==='calculate'">
                <el-table-column :prop="item.prop" :label="item.label" :align="item.align"
                  :fixed="getFixed(item, i)" :width="item.width" :key="i"
                  :sortable="item.sortable?'custom':item.sortable">
                  <template slot-scope="scope">
                    <template v-if="scope.row[item.__vModel__]">
                      <JnpfNumber v-model="scope.row[item.__vModel__]" :thousands="item.thousands"
                        :precision="item.precision">
                      </JnpfNumber>
                    </template>
                  </template>
                </el-table-column>
              </template>
              <el-table-column :prop="item.prop" :label="item.label" :align="item.align"
                :fixed="getFixed(item, i)" :width="item.width" :key="i"
                :sortable="item.sortable?'custom':item.sortable" v-else />
            </template>
          </template>
          <el-table-column
            :fixed="columnList.some(o=>o.fixed == 'right')&&columnData.childTableStyle!=2?'right':false"
            prop="flowState" label="状态" width="100" v-if="config.enableFlow==1">
            <template slot-scope="scope" v-if="!scope.row.top||columnData.type==5">
              <el-tag v-if="scope.row.flowState==1">等待审核</el-tag>
              <el-tag type="success" v-else-if="scope.row.flowState==2">审核通过</el-tag>
              <el-tag type="danger" v-else-if="scope.row.flowState==3">审核退回</el-tag>
              <el-tag type="info" v-else-if="scope.row.flowState==4">流程撤回</el-tag>
              <el-tag type="info" v-else-if="scope.row.flowState==5">审核终止</el-tag>
              <el-tag type="warning" v-else>等待提交</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作"
            :fixed="columnData.childTableStyle==2&&childColumnList.length?false:'right'"
            :width="operationWidth" v-if="columnBtnsList.length || customBtnsList.length">
            <template slot-scope="scope" v-if="!scope.row.top||columnData.type==5">
              <template v-if="scope.row.rowEdit">
                <el-button size="mini" type="text" @click="saveForRowEdit(scope.row,1)">
                  保存</el-button>
                <el-button size="mini" type="text" class="JNPF-table-delBtn"
                  @click="cancelRowEdit(scope.row,scope.$index)">取消</el-button>
                <el-button size="mini" type="text" @click="submitForRowEdit(scope.row)"
                  v-if="config.enableFlow==1">提交</el-button>
              </template>
              <template v-else>
                <template v-if="isPreview || !columnData.useBtnPermission">
                  <template v-for="(item, i) in columnBtnsList">
                    <template v-if="item.value=='edit'">
                      <template v-if="columnData.type === 4">
                        <el-button size="mini" type="text" :key="i"
                          :disabled="config.enableFlow==1 && [1,2,4,5].indexOf(scope.row.flowState)>-1"
                          @click="editForRowEdit(scope.row)">
                          {{item.label}}</el-button>
                      </template>
                      <template v-else>
                        <el-button size="mini" type="text" :key="i"
                          :disabled="config.enableFlow==1 && [1,2,4,5].indexOf(scope.row.flowState)>-1"
                          @click="columnBtnsHandel(item.value,scope.row)">
                          {{item.label}}</el-button>
                      </template>
                    </template>
                    <template v-else-if="item.value=='remove'">
                      <el-button size="mini" type="text" :key="i" class="JNPF-table-delBtn"
                        :disabled="config.enableFlow==1 && [1,2,3,5].indexOf(scope.row.flowState)>-1"
                        @click="columnBtnsHandel(item.value,scope.row,scope.$index)">
                        {{item.label}}</el-button>
                    </template>
                    <template v-else-if="item.value=='detail'">
                      <el-button size="mini" type="text" :key="i"
                        :disabled="config.enableFlow==1 && !scope.row.flowState"
                        @click="columnBtnsHandel(item.value,scope.row)" v-if="scope.row.id">
                        {{item.label}}</el-button>
                    </template>
                  </template>
                  <template v-if="customBtnsList.length">
                    <el-dropdown hide-on-click>
                      <span class="el-dropdown-link">
                        <el-button type="text" size="mini">
                          {{$t('common.moreBtn')}}<i class="el-icon-arrow-down el-icon--right"></i>
                        </el-button>
                      </span>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item v-for="(item, i) in customBtnsList" :key="i"
                          @click.native="customBtnsHandel(item,scope.row,scope.$index)">
                          {{item.label}}</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </template>
                </template>
                <template v-else>
                  <template v-for="(item, i) in columnBtnsList">
                    <template v-if="item.value=='edit'">
                      <template v-if="columnData.type === 4">
                        <el-button size="mini" type="text" :key="i"
                          :disabled="config.enableFlow==1 && [1,2,4,5].indexOf(scope.row.flowState)>-1"
                          @click="scope.row.rowEdit=true" v-has="'btn_'+item.value">
                          {{item.label}}</el-button>
                      </template>
                      <template v-else>
                        <el-button size="mini" type="text" :key="i"
                          :disabled="config.enableFlow==1 && [1,2,4,5].indexOf(scope.row.flowState)>-1"
                          @click="columnBtnsHandel(item.value,scope.row)" v-has="'btn_'+item.value">
                          {{item.label}}</el-button>
                      </template>
                    </template>
                    <template v-else-if="item.value=='remove'">
                      <el-button size="mini" type="text" :key="i" class="JNPF-table-delBtn"
                        :disabled="config.enableFlow==1 && [1,2,3,5].indexOf(scope.row.flowState)>-1"
                        @click="columnBtnsHandel(item.value,scope.row,scope.$index)"
                        v-has="'btn_'+item.value">{{item.label}}</el-button>
                    </template>
                    <template v-else-if="item.value=='detail'">
                      <el-button size="mini" type="text" :key="i"
                        :disabled="config.enableFlow==1 && !scope.row.flowState"
                        @click="columnBtnsHandel(item.value,scope.row)" v-has="'btn_'+item.value">
                        {{item.label}}</el-button>
                    </template>
                  </template>
                  <template v-if="customBtnsList.length">
                    <el-dropdown hide-on-click>
                      <span class="el-dropdown-link">
                        <el-button type="text" size="mini">
                          {{$t('common.moreBtn')}}
                          <i class="el-icon-arrow-down el-icon--right"></i>
                        </el-button>
                      </span>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item v-for="(item, i) in customBtnsList" :key="i"
                          @click.native="customBtnsHandel(item,scope.row,scope.$index)"
                          v-has="item.value">{{item.label}}</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </template>
                </template>
              </template>
            </template>
          </el-table-column>
        </JNPF-table>
        <template
          v-if="columnData.type !== 3 &&columnData.type !== 5&& columnData.hasPage&&refreshTable">
          <pagination :total="total" :page.sync="listQuery.currentPage"
            :limit.sync="listQuery.pageSize" @pagination="initData" />
        </template>
      </div>
    </div>
    <print-browse :visible.sync="printBrowseVisible" :id="printId"
      :batchIds="multipleSelection.join()" />
    <FlowBox v-if="flowVisible" ref="FlowBox" @close="closeFlow" />
    <Form v-show="formVisible" ref="Form" @refreshDataList="refresh" />
    <extraForm v-show="extraFormVisible" ref="extraForm" @refreshDataList="refresh" />
    <Detail v-if="detailVisible" ref="Detail" @close="detailVisible = false" />
    <RelevanceDetail v-if="detailsVisible" ref="RelevanceDetail" @close="detailsVisible = false" />
    <ExportBox v-if="exportBoxVisible" ref="ExportBox" @download="download" />
    <ImportBox v-if="uploadBoxVisible" ref="UploadBox" @refresh="initData" />
    <CustomBox v-if="customBoxVisible" ref="CustomBox" @close="customBoxVisible= false" />
    <SuperQuery v-if="superQueryVisible" ref="SuperQuery" :columnOptions="columnOptions"
      @superQuery="superQuery" />
    <candidate-form :visible.sync="candidateVisible" :candidateList="candidateList"
      :branchList="branchList" taskId="0" :formData="workFlowFormData"
      @submitCandidate="submitCandidate" :isCustomCopy="isCustomCopy" />
    <PrintDialog v-if="printDialogVisible" ref="printDialog" @change="printBrowseHandle">
    </PrintDialog>
    <el-dialog title="请选择流程" :close-on-click-modal="false" append-to-body
      :visible.sync="flowListVisible" class="JNPF-dialog template-dialog JNPF-dialog_center"
      lock-scroll width="400px">
      <el-scrollbar class="template-list">
        <div class="template-item" v-for="item in flowList" :key="item.id"
          @click="selectFlow(item)">{{item.fullName}}
        </div>
      </el-scrollbar>
    </el-dialog>
  </div>
</template>

<script>
import PrintDialog from '@/components/extn/PrintDialog'
import PrintBrowse from "@/components/extn/PrintBrowse/batch";
import { getModelList, getModelSubList, deleteModel, batchDelete, exportModel, createModel, updateModel, getConfigData } from '@/api/onlineDev/visualDev'
import { Create, Update } from '@/api/extn/workFlow'
import { printOptionsApi } from '@/api/extn/printDev'
import { getDictionaryDataSelector } from '@/api/extn/dictionary'
import { getDataInterfaceRes } from '@/api/extn/dataInterface'
import { getColumnsByModuleId } from '@/api/extn/common'
import { dyOptionsList, systemComponentsList } from '@/components/extnGenerator/generator/comConfig'
import { Candidates } from '@/api/workFlow/FlowBefore'
import { getFlowList } from '@/api/workFlow/FlowEngine'
import request from '@/utils/request'
import Form from './Form'
import extraForm from './extraForm'
import FlowBox from '@/views/workFlow/components/FlowBox'
import Detail from './detail'
import RelevanceDetail from './RelevanceDetail'
import ExportBox from '@/components/extn/ExportBox'
import Search from './Search'
import ChildTableColumn from './child-table-column'
import SuperQuery from '@/components/extn/SuperQuery'
import CandidateForm from '@/views/workFlow/components/CandidateForm'
import CustomBox from '@/components/extn/JNPFCustom'
import { mapGetters } from "vuex";
import { getDateDay, getLaterData, getBeforeData, getBeforeTime, getLaterTime, thousandsFormat } from '@/components/extnGenerator/utils/index.js'
export default {
  name: 'dynamicModel',
  components: { PrintDialog, PrintBrowse, Form, extraForm, ExportBox, Search, Detail, FlowBox, ChildTableColumn, SuperQuery, CandidateForm, CustomBox, RelevanceDetail },
  props: ['config', 'modelId', 'isPreview'],
  data() {
    return {
      printDialogVisible: false,
      printBrowseVisible: false,
      printId: "",
      printListOptions: [],
      systemComponentsList,
      keyword: '',
      treeProps: {
        children: 'children',
        label: 'fullName',
        value: 'id',
        isLeaf: 'isLeaf'
      },
      list: [],
      cacheList: [],
      total: 0,
      listLoading: false,
      listQuery: {
        currentPage: 1,
        pageSize: 20,
        sort: 'desc',
        sidx: '',
        menuId: '',
        queryJson: '',
        superQueryJson: ''
      },
      defaultListQuery: {
        pageSize: 20,
        sort: 'desc',
        sidx: '',
      },
      flowVisible: false,
      formVisible: false,
      extraFormVisible: false,
      detailVisible: false,
      detailsVisible: false,
      importBoxVisible: false,
      exportBoxVisible: false,
      uploadBoxVisible: false,
      customBoxVisible: false,
      superQueryVisible: false,
      treeData: [],
      expandsTree: true,
      treeActiveId: '',
      columnData: {
        columnBtnsList: []
      },
      formData: {},
      columnList: [],
      childColumnList: [],
      columnOptions: [],
      exportList: [],
      columnBtnsList: [],
      customBtnsList: [],
      hasBatchBtn: false,
      refreshTable: false,
      expandsTable: true,
      multipleSelection: [],
      settingsColumnList: [],
      mergeList: [],
      expandObj: {},
      flowTemplateJson: {},
      isCustomCopy: false,
      candidateVisible: false,
      candidateType: 1,
      branchList: [],
      candidateList: [],
      currRow: {},
      workFlowFormData: {},
      rowStyle: null,
      cellStyle: null,
      refreshTree: true,
      flowList: [],
      flowListVisible: false,
      currFlow: {},
      key2: +new Date()
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    operationWidth() {
      let customWidth = this.customBtnsList.length ? 50 : 0
      if (this.columnData.type == 4 && this.config.enableFlow) customWidth += 50
      return this.columnBtnsList.length * 50 + customWidth
    }
  },
  watch: {
    keyword(val) {
      if (this.columnData.treeSynType == 0) this.$refs.treeBox.filter(val)
    }
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
      this.listLoading = true
      this.listQuery.menuId = this.$route.meta.modelId
      this.refreshTable = false
      if (!this.config.columnData || !this.config.formData) return
      this.columnData = JSON.parse(this.config.columnData)
      if (this.columnData.printIds && this.columnData.printIds.length > 0) {
        this.getPrintListOptions(this.columnData.printIds)
      }

      if (this.columnData.type === 3) {

        this.columnData.columnList = this.columnData.columnList.filter(o => o.prop != this.columnData.groupField)
      }
      if (this.config.enableFlow == 1) {
        if (this.config.flowId) this.getFlowList()
      }
      this.hasBatchBtn = this.columnData.btnsList.some(o => ['batchRemove', 'batchPrint'].includes(o.value))
      this.formData = JSON.parse(this.config.formData)
      this.customBtnsList = this.columnData.customBtnsList || []
      this.columnBtnsList = this.columnData.columnBtnsList || []
      this.columnOptions = this.columnData.columnOptions || []
      this.listLoading = true
      if (this.isPreview) this.listQuery.menuId = "270579315303777093"
      let res = await getColumnsByModuleId(this.listQuery.menuId)
      this.settingsColumnList = res.data || []
      this.rowStyle = this.jnpf.getScriptFunc.call(this, this.columnData.funcs && this.columnData.funcs.rowStyle && this.columnData.funcs.rowStyle.func)
      this.cellStyle = this.jnpf.getScriptFunc.call(this, this.columnData.funcs && this.columnData.funcs.cellStyle && this.columnData.funcs.cellStyle.func)
      this.getColumnList()
      this.$nextTick(() => {
        this.refreshTable = true
      })
      if (this.columnData.type === 4) this.buildOptions()
      if (this.isPreview) return this.listLoading = false
      this.initDefaultSearchData()
      this.listQuery.pageSize = this.columnData.pageSize
      this.listQuery.sort = this.columnData.sort
      this.listQuery.sidx = this.columnData.defaultSidx
      this.defaultListQuery.pageSize = this.columnData.pageSize
      this.defaultListQuery.sort = this.columnData.sort
      this.defaultListQuery.sidx = this.columnData.defaultSidx
      if (this.columnData.type === 3 || !this.columnData.hasPage) this.listQuery.pageSize = 10000
      if (this.columnData.type === 2) {
        this.treeProps.value = this.columnData.treePropsValue || 'id'
        this.treeProps.label = this.columnData.treePropsLabel || 'fullName'
        this.treeProps.children = this.columnData.treePropsChildren || 'children'
        this.getTreeView()
      } else {
        this.initData()
      }
    },
    async getPrintListOptions(ids) {
      printOptionsApi({ ids }).then(res => {
        this.printListOptions = res.data
      })
    },
    printBrowseHandle(id) {
      this.printDialogVisible = false
      this.handleBatchPrint(id)
    },
    printDialog() {
      this.printDialogVisible = true
      this.$nextTick(() => {
        if (this.printListOptions.length == 1) {
          this.printBrowseHandle(this.printListOptions[0].id)
          return
        }
        this.$refs.printDialog.initOptions(this.printListOptions)
      })
    },
    handleBatchPrint(id) {
      if (!id) {
        this.$message({
          type: "warning",
          message: "请配置打印模板",
          duration: 1500
        });
        return;
      }
      this.printId = id;
      this.printBrowseVisible = true;
    },
    initData() {
      if (this.isPreview) return
      this.listLoading = true
      getModelList(this.modelId, this.listQuery).then(res => {
        if (this.columnData.type === 4) {
          this.list = res.data.list.map(o => ({
            ...o,
            ...this.expandObj,
            rowEdit: false
          }))
          this.cacheList = JSON.parse(JSON.stringify(this.list))
        } else {
          this.list = res.data.list.map(o => ({
            ...o,
            ...this.expandObj,
            hasChildren: true
          }))
          if (this.columnData.type === 3) {
            this.list.map(o => {
              if (o.children && o.children.length) {
                o.children = o.children.map(e => ({
                  ...e,
                  ...this.expandObj
                }))
              }
            })
          }
        }
        if (this.columnData.type !== 3 && this.columnData.hasPage) this.total = res.data.pagination.total
        this.listLoading = false
        this.$nextTick(() => {
          if (this.columnData.funcs && this.columnData.funcs.afterOnload && this.columnData.funcs.afterOnload.func) this.setTableLoadFunc()
        })
      })
    },
    /**
    * 对表格进行合计 目前只支持数字，金额，滑块
    */
    getTableSummaries(param) {
      const thousandsField = []
      this.columnList.forEach(res => {
        if (res.thousands) thousandsField.push(res.__vModel__)
      })
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计';
          return;
        } else if (this.columnData.summaryField.includes(column.property)) {
          const values = data.map(item => Number(item[column.property]));
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr);
              if (!isNaN(value)) {
                return prev + curr;
              } else {
                return prev;
              }
            }, 0).toFixed(2);
            if (thousandsField.includes(column.property)) sums[index] = thousandsFormat(sums[index])
          } else {
            sums[index] = '';
          }
        }
      })
      return sums;
    },
    toDetail(modelId, id) {
      if (!id) return
      this.mainLoading = true
      getConfigData(modelId).then(res => {
        this.mainLoading = false
        if (!res.data || !res.data.formData) return
        let formData = JSON.parse(res.data.formData)
        formData.popupType = 'general'
        this.detailsVisible = true
        this.$nextTick(() => {
          this.$refs.RelevanceDetail.init(formData, modelId, id)
        })
      }).catch(() => { this.mainLoading = false })
    },
    getTreeView() {
      if (this.columnData.treeDataSource === "dictionary") {
        if (!this.columnData.treeDictionary) return
        getDictionaryDataSelector(this.columnData.treeDictionary).then(res => {
          this.treeData = res.data.list
          this.initData()
        })
      }
      if (this.columnData.treeDataSource === "organize") {
        this.$store.dispatch('generator/getDepTree').then(res => {
          this.treeData = res
          this.initData()
        })
      }
      if (this.columnData.treeDataSource === "department") {
        this.$store.dispatch('generator/getDepTree').then(res => {
          this.treeData = res
          this.initData()
        })
      }
      if (this.columnData.treeDataSource === "api") {
        if (!this.columnData.treePropsUrl) return
        getDataInterfaceRes(this.columnData.treePropsUrl).then(res => {
          let data = res.data
          if (Array.isArray(data)) {
            this.treeData = data
          } else {
            this.treeData = []
          }
          this.initData()
        })
      }
    },
    getColumnList() {
      if (this.isPreview) {
        const columnList = this.columnData.columnList
        this.columnList = this.transformColumnList(columnList)
        return
      }
      let columnPermissionList = []
      if (!this.columnData.useColumnPermission) {
        columnPermissionList = this.columnData.columnList
      } else {
        const permissionList = this.$store.getters.permissionList
        const modelId = this.$route.meta.modelId
        const list = permissionList.filter(o => o.modelId === modelId)
        const columnList = list[0] && list[0].column ? list[0].column : []
        for (let i = 0; i < this.columnData.columnList.length; i++) {
          inner: for (let j = 0; j < columnList.length; j++) {
            if (this.columnData.columnList[i].prop === columnList[j].enCode) {
              columnPermissionList.push(this.columnData.columnList[i])
              break inner
            }
          }
        }
      }
      this.columnList = this.transformColumnList(columnPermissionList)
    },
    transformColumnList(columnList) {
      let list = []
      for (let i = 0; i < columnList.length; i++) {
        const e = columnList[i];
        if (!e.prop.includes('-')) {
          list.push(e)
        } else {
          let prop = e.prop.split('-')[0]
          let vModel = e.prop.split('-')[1]
          let label = e.label.split('-')[0]
          let childLabel = e.label.replace(label + '-', '');
          let newItem = {
            align: "center",
            jnpfKey: "table",
            prop,
            label,
            children: []
          }
          e.vModel = vModel
          e.childLabel = childLabel
          if (!this.expandObj.hasOwnProperty(`${prop}Expand`)) this.$set(this.expandObj, `${prop}Expand`, false)
          if (!list.some(o => o.prop === prop)) list.push(newItem)
          for (let i = 0; i < list.length; i++) {
            if (list[i].prop === prop) {
              list[i].children.push(e)
              break
            }
          }
        }
      }
      this.getMergeList(list)
      this.getExportList(list)
      this.childColumnList = list.filter(o => o.jnpfKey === 'table')
      return list
    },
    getExportList(list) {
      let exportList = []
      for (let i = 0; i < list.length; i++) {
        if (list[i].jnpfKey === 'table') {
          if (this.columnData.type != 4) {
            for (let j = 0; j < list[i].children.length; j++) {
              exportList.push(list[i].children[j])
            }
          }
        } else {
          exportList.push(list[i])
        }
      }
      this.exportList = exportList
    },
    initDefaultSearchData() {
      let searchList = this.columnData.searchList
      //处理搜索条件中的默认值
      if (searchList != null && searchList.length > 0) {
        let initQueryJson = {}
        for (let i = 0, len = searchList.length; i < len; i++) {
          if (searchList[i].jnpfKey === 'comSelect' && searchList[i].__config__.defaultCurrent == true) {
            //组织机构
            if (this.userInfo.organizeIdList instanceof Array && this.userInfo.organizeIdList.length > 0) {
              initQueryJson[searchList[i].__vModel__] = searchList[i].searchMultiple == true ? [this.userInfo.organizeIdList] : this.userInfo.organizeIdList;
            } else {
              initQueryJson[searchList[i].__vModel__] = undefined
            }
          } else if (searchList[i].jnpfKey === 'depSelect' && searchList[i].__config__.defaultCurrent == true && this.userInfo.departmentId != null && this.userInfo.departmentId != '') {
            if (searchList[i].__config__.defaultValue != null) {
              initQueryJson[searchList[i].__vModel__] = searchList[i].__config__.defaultValue
            }
          } else if (searchList[i].__config__.jnpfKey === 'userSelect' && searchList[i].__config__.defaultCurrent == true) {
            if (searchList[i].__config__.defaultValue != null) {
              initQueryJson[searchList[i].__vModel__] = searchList[i].__config__.defaultValue
            }
          }
        }
        if (Object.keys(initQueryJson).length > 0) {
          this.listQuery.queryJson = JSON.stringify(initQueryJson)
        }
      }
    },
    getMergeList(list) {
      list.forEach(item => {
        if (item.children && item.children.length > 0) {
          item.children.forEach((child, index) => {
            if (index == 0) {
              this.mergeList.push({
                prop: child.prop,
                rowspan: 1,
                colspan: item.children.length
              })
            } else {
              this.mergeList.push({
                prop: child.prop,
                rowspan: 0,
                colspan: 0
              })
            }
          })
        } else {
          this.mergeList.push({
            prop: item.prop,
            rowspan: 1,
            colspan: 1
          })
        }
      })
    },
    arraySpanMethod({ column }) {
      for (let i = 0; i < this.mergeList.length; i++) {
        if (column.property == this.mergeList[i].prop) {
          return [this.mergeList[i].rowspan, this.mergeList[i].colspan]
        }
      }
    },
    toggleExpand(row, field) {
      row[field] = !row[field]
    },
    getNodePath(node) {
      let fullPath = []
      const loop = (node) => {
        if (node.level) fullPath.unshift(node.data)
        if (node.parent) loop(node.parent)
      }
      loop(node)
      return fullPath
    },
    handleNodeClick(data, node) {
      if (this.treeActiveId == data[this.treeProps.value]) return
      this.treeActiveId = data[this.treeProps.value]
      this.$refs.Search.treeReset()
      let queryJson = {}
      if (this.columnData.treeDataSource === "organize") {
        const nodePath = this.getNodePath(node)
        const currValue = nodePath.map(o => o[this.treeProps.value])
        queryJson = { [this.columnData.treeRelation]: currValue }
        this.treeActiveId = currValue
      } else {
        queryJson = { [this.columnData.treeRelation]: data[this.treeProps.value] }
      }
      this.search(JSON.stringify(queryJson))
    },
    handleDel(id, index) {
      this.$confirm(this.$t('common.delTip'), this.$t('common.tipTitle'), {
        type: 'warning'
      }).then(() => {
        if (id) {
          deleteModel(this.modelId, id).then(res => {
            this.$message({
              type: 'success',
              message: res.msg,
              duration: 1000,
              onClose: () => { this.initData() }
            });
          })
        } else {
          this.list.splice(index, 1)
        }
      }).catch(() => { });
    },
    editForRowEdit(row) {
      row.rowEdit = true
      this.addHandleForRowEdit(true)
      const flowId = row.flowId || this.flowList[0].id;
      if (!flowId) return
      const list = this.flowList.filter(o => o.id === flowId)
      if (!list.length) return
      this.currFlow = list[0]
      let flowTemplateJson = this.currFlow.flowTemplateJson ? JSON.parse(this.currFlow.flowTemplateJson) : {}
      this.isCustomCopy = flowTemplateJson.properties && flowTemplateJson.properties.isCustomCopy
    },
    saveForRowEdit(row, status, candidateData) {
      if (this.isPreview) return this.$message({ message: '功能预览不支持数据保存', type: 'warning' })
      if (this.config.enableFlow == 1) {
        let query = {
          id: row.id,
          status: status || "1",
          candidateType: this.candidateType,
          formData: row,
          flowId: this.currFlow.id,
          flowUrgent: 1
        }
        if (candidateData) query = { ...query, ...candidateData }
        const formMethod = query.id ? Update : Create
        formMethod(query).then(res => {
          this.$message({
            message: res.msg,
            type: 'success',
            duration: 1500,
            onClose: () => {
              this.candidateVisible = false
              this.initData()
            }
          })
        })
      } else {
        let query = {
          id: row.id,
          data: JSON.stringify(row)
        }
        const formMethod = query.id ? updateModel : createModel
        formMethod(this.modelId, query).then(res => {
          this.$message({
            message: res.msg,
            type: 'success',
            duration: 1500,
            onClose: () => {
              this.candidateVisible = false
              this.initData()
            }
          })
        })
      }
    },
    submitForRowEdit(row) {
      this.currRow = row
      if (this.isPreview) return this.$message({ message: '功能预览不支持数据保存', type: 'warning' })
      this.workFlowFormData = {
        id: row.id,
        formData: row,
        flowId: this.currFlow.id
      }
      Candidates(0, this.workFlowFormData).then(res => {
        let data = res.data
        this.candidateType = data.type
        if (data.type == 1) {
          this.branchList = res.data.list.filter(o => o.isBranchFlow)
          this.candidateList = res.data.list.filter(o => !o.isBranchFlow && o.isCandidates)
          this.candidateVisible = true
        } else if (data.type == 2) {
          this.branchList = []
          this.candidateList = res.data.list.filter(o => o.isCandidates)
          this.candidateVisible = true
        } else {
          if (this.isCustomCopy) {
            this.branchList = []
            this.candidateList = []
            this.candidateVisible = true
            return
          }
          this.$confirm('您确定要提交当前流程吗, 是否继续?', '提示', {
            type: 'warning'
          }).then(() => {
            this.saveForRowEdit(row, '0')
          }).catch(() => { })
        }
      }).catch(() => { })
    },
    submitCandidate(data) {
      this.saveForRowEdit(this.currRow, '0', data)
    },
    cancelRowEdit(row, index) {
      if (!row.id) return this.list.splice(index, 1)
      row.rowEdit = false
      let item = JSON.parse(JSON.stringify(this.cacheList[index]))
      this.$set(this.list, index, item)
    },
    addHandleForRowEdit(flag) {
      let item = {
        rowEdit: true
      }
      for (let i = 0; i < this.columnData.columnList.length; i++) {
        let e = this.columnData.columnList[i]
        item[e.__vModel__] = e.__config__.defaultValue
        const config = e.__config__
        if (e.__config__.jnpfKey === 'date') {
          if (e.__config__.defaultCurrent == true) item[e.__vModel__] = new Date().getTime()
          if (config.startTimeRule) {
            if (config.startTimeType == 1) {
              e.startTime = config.startTimeValue
            } else if (config.startTimeType == 3) {
              e.startTime = new Date().getTime()
            } else if (config.startTimeType == 4) {
              let previousDate = '';
              if (config.startTimeTarget == 1 || config.startTimeTarget == 2) {
                previousDate = getDateDay(config.startTimeTarget, config.startTimeType, config.startTimeValue)
                e.startTime = new Date(previousDate).getTime()
              } else if (config.startTimeTarget == 3) {
                previousDate = getBeforeData(config.startTimeValue)
                e.startTime = new Date(previousDate).getTime()
              } else {
                e.startTime = getBeforeTime(config.startTimeTarget, config.startTimeValue).getTime()
              }
            } else if (config.startTimeType == 5) {
              let previousDate = '';
              if (config.startTimeTarget == 1 || config.startTimeTarget == 2) {
                previousDate = getDateDay(config.startTimeTarget, config.startTimeType, config.startTimeValue)
                e.startTime = new Date(previousDate).getTime()
              } else if (config.startTimeTarget == 3) {
                previousDate = getLaterData(config.startTimeValue)
                e.startTime = new Date(previousDate).getTime()
              } else {
                e.startTime = getLaterTime(config.startTimeTarget, config.startTimeValue).getTime()
              }
            }
          }
          if (config.endTimeRule) {
            if (config.endTimeType == 1) {
              e.endTime = config.endTimeValue
            } else if (config.endTimeType == 3) {
              e.endTime = new Date().getTime()
            } else if (config.endTimeType == 4) {
              let previousDate = '';
              if (config.endTimeTarget == 1 || config.endTimeTarget == 2) {
                previousDate = getDateDay(config.endTimeTarget, config.endTimeType, config.endTimeValue)
                e.endTime = new Date(previousDate).getTime()
              } else if (config.endTimeTarget == 3) {
                previousDate = getBeforeData(config.endTimeValue)
                e.endTime = new Date(previousDate).getTime()
              } else {
                e.endTime = getBeforeTime(config.endTimeTarget, config.endTimeValue).getTime()
              }
            } else if (config.endTimeType == 5) {
              let previousDate = '';
              if (config.endTimeTarget == 1 || config.endTimeTarget == 2) {
                previousDate = getDateDay(config.endTimeTarget, config.endTimeType, config.endTimeValue)
                e.endTime = new Date(previousDate).getTime()
              } else if (config.endTimeTarget == 3) {
                previousDate = getLaterData(config.endTimeValue)
                e.endTime = new Date(previousDate).getTime()
              } else {
                e.endTime = getLaterTime(config.endTimeTarget, config.endTimeValue).getTime()
              }
            }
          }

        } else if (e.__config__.jnpfKey === 'comSelect' && e.__config__.defaultCurrent == true) {
          if (this.userInfo.organizeIdList instanceof Array && this.userInfo.organizeIdList.length > 0) {
            item[e.__vModel__] = e.multiple == true ? [this.userInfo.organizeIdList] : this.userInfo.organizeIdList
          } else {
            item[e.__vModel__] = []
          }
        } else if (e.__config__.jnpfKey === 'time') {
          if (e.__config__.defaultCurrent == true) item[e.__vModel__] = this.jnpf.toDate(new Date(), e.format)
          let format = e.format === 'HH:mm' ? 'HH:mm:00' : e.format
          if (config.startTimeRule) {
            if (config.startTimeType == 1) {
              e.startTime = config.startTimeValue || '00:00:00'
              if (e.startTime.split(':').length == 3) {
                e.startTime = e.startTime
              } else {
                e.startTime = e.startTime + ':00'
              }
            } else if (config.startTimeType == 3) {
              e.startTime = this.jnpf.toDate(new Date(), format)
            } else if (config.startTimeType == 4) {
              let previousDate = '';
              previousDate = getBeforeTime(config.startTimeTarget, config.startTimeValue)
              e.startTime = this.jnpf.toDate(previousDate, format)
            } else if (config.startTimeType == 5) {
              let previousDate = '';
              previousDate = getLaterTime(config.startTimeTarget, config.startTimeValue)
              e.startTime = this.jnpf.toDate(previousDate, format)
            }
          }
          if (config.endTimeRule) {
            if (config.endTimeType == 1) {
              e.endTime = config.endTimeValue || '23:59:59'
              if (e.endTime.split(':').length == 3) {
                e.endTime = e.endTime
              } else {
                e.endTime = e.endTime + ':00'
              }
            } else if (config.endTimeType == 3) {
              e.endTime = this.jnpf.toDate(new Date(), format)
            } else if (config.endTimeType == 4) {
              let previousDate = '';
              previousDate = getBeforeTime(config.endTimeTarget, config.endTimeValue)
              e.endTime = this.jnpf.toDate(previousDate, format)
            } else if (config.endTimeType == 5) {
              let previousDate = '';
              previousDate = getLaterTime(config.endTimeTarget, config.endTimeValue)
              e.endTime = this.jnpf.toDate(previousDate, format)
            }
          }

        }
      }
      if (!flag) this.list.unshift(item)
    },
    addHandle() {
      if (this.config.enableFlow == 1) {
        if (!this.flowList.length) {
          this.$message({
            type: 'error',
            message: '流程不存在'
          });
        } else if (this.flowList.length === 1) {
          this.selectFlow(this.flowList[0])
        } else {
          this.flowListVisible = true
        }
      } else {
        if (this.columnData.type === 4) {
          this.addHandleForRowEdit()
        } else {
          this.formVisible = true
          this.$nextTick(() => {
            this.$refs.Form.init(this.formData, this.modelId, '', this.isPreview, this.columnData.useFormPermission, this.list, this.columnData.type)
          })
        }
      }
    },
    selectFlow(item) {
      this.currFlow = item
      if (this.columnData.type === 4) {
        let flowTemplateJson = item.flowTemplateJson ? JSON.parse(item.flowTemplateJson) : {}
        this.isCustomCopy = flowTemplateJson.properties && flowTemplateJson.properties.isCustomCopy
        this.flowListVisible = false
        this.addHandleForRowEdit()
      } else {
        let data = {
          id: '',
          flowId: item.id,
          opType: '-1',
          type: 1,
          modelId: this.modelId,
          isPreview: this.isPreview,
        }
        this.flowListVisible = false
        this.flowVisible = true
        this.$nextTick(() => {
          this.$refs.FlowBox.init(data)
        })
      }
    },
    updateHandle(row) {
      if (this.config.enableFlow == 1) {
        let data = {
          id: row.id,
          flowId: row.flowId || this.flowList[0].id,
          type: 1,
          opType: '-1',
          modelId: this.modelId,
          isPreview: this.isPreview,
        }
        this.flowVisible = true
        this.$nextTick(() => {
          this.$refs.FlowBox.init(data)
        })
      } else {
        this.formVisible = true
        this.$nextTick(() => {
          this.$refs.Form.init(this.formData, this.modelId, row.id, this.isPreview, this.columnData.useFormPermission, this.list, this.columnData.type)
        })
      }
    },
    headBtnsHandel(key) {
      if (key === 'add') {
        this.addHandle()
      }
      if (key == 'download') {
        this.exportBoxVisible = true
        this.$nextTick(() => {
          this.$refs.ExportBox.init(this.exportList)
        })
      }
      if (key == 'upload') {
        this.uploadBoxVisible = true
        this.$nextTick(() => {
          this.$refs.UploadBox.init(this.modelId)
        })
      }
      if (this.isPreview) return
      if (key === 'batchRemove') {
        this.batchRemove()
      }

      if (key === 'batchPrint') {
        if (!this.multipleSelection.length) {
          this.$message({
            type: 'error',
            message: '请选择一条数据',
            duration: 1500,
          })
          return
        }
        this.printDialog()
      }
    },
    handleSelectionChange(val) {
      const res = val.map(item => item.id)
      this.multipleSelection = res
    },
    batchRemove() {
      if (!this.multipleSelection.length) {
        this.$message({
          type: 'error',
          message: '请选择一条数据',
          duration: 1500,
        })
        return
      }
      this.$confirm('您确定要删除这些数据吗, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        batchDelete(this.modelId, this.multipleSelection).then(res => {
          this.$message({
            type: 'success',
            message: res.msg,
            duration: 1500,
            onClose: () => {
              this.initData()
            }
          })
        })
      }).catch(() => { })
    },
    download(data) {
      if (this.isPreview) return this.$message({ message: '功能预览不支持数据导出', type: 'warning' })
      let query = { ...this.listQuery, ...data }
      exportModel(this.modelId, query).then(res => {
        if (!res.data.url) return
        this.jnpf.downloadFile(res.data.url)
        this.$refs.ExportBox.visible = false
        this.exportBoxVisible = false
      })
    },
    columnBtnsHandel(key, row, index) {
      if (key === 'edit') {
        this.updateHandle(row)
      }
      if (key === 'detail') {
        this.goDetail(row)
      }
      if (key == 'remove') {
        this.handleDel(row.id, index)
      }
    },
    goDetail(row) {
      if (this.config.enableFlow == 1) {
        let data = {
          id: row.id,
          flowId: row.flowId,
          type: 1,
          opType: 0,
          modelId: this.modelId,
          isPreview: this.isPreview,
          status: row.flowState
        }
        this.flowVisible = true
        this.$nextTick(() => {
          this.$refs.FlowBox.init(data)
        })
      } else {
        this.detailVisible = true
        this.$nextTick(() => {
          this.$refs.Detail.init(this.formData, this.modelId, row.id, this.columnData.useFormPermission)
        })
      }
    },
    sortChange({ column, prop, order }) {
      this.listQuery.sort = order == 'ascending' ? 'asc' : 'desc'
      this.listQuery.sidx = !order ? '' : prop
      this.initData()
    },
    refresh(isRefresh) {
      this.formVisible = false
      this.extraFormVisible = false
      if (isRefresh) this.initData()
    },
    closeFlow(isRefresh) {
      this.flowVisible = false
      if (isRefresh) this.initData()
    },
    reset() {
      this.listQuery.sort = this.defaultListQuery.sort
      this.listQuery.sidx = this.defaultListQuery.sidx
      if (this.columnData.type === 2) {
        let obj = { [this.columnData.treeRelation]: this.treeActiveId }
        let queryJson = this.treeActiveId ? JSON.stringify(obj) : ''
        this.search(queryJson)
      } else {
        this.search('')
      }
    },
    searchData(queryJson) {
      if (this.columnData.type === 2 && this.treeActiveId) {
        queryJson = queryJson ? JSON.parse(queryJson) : ''
        queryJson = { [this.columnData.treeRelation]: this.treeActiveId, ...queryJson }
        queryJson = JSON.stringify(queryJson)
      }
      this.search(queryJson)
    },
    search(queryJson) {
      if (this.isPreview) return
      if (!queryJson) this.$refs.treeBox && this.$refs.treeBox.setCurrentKey(null);
      this.listQuery.queryJson = queryJson
      this.listQuery.currentPage = 1
      this.initData()
    },
    openSuperQuery() {
      this.superQueryVisible = true
      this.$nextTick(() => {
        this.$refs.SuperQuery.init()
      })
    },
    superQuery(queryJson) {
      if (this.isPreview) return
      this.listQuery.superQueryJson = queryJson
      this.listQuery.currentPage = 1
      this.initData()
    },
    customBtnsHandel(item, row, index) {
      if (item.event.btnType == 1) this.handlePopup(item.event, row, index)
      if (item.event.btnType == 2) this.handleScriptFunc(item.event, row, index)
      if (item.event.btnType == 3) this.handleInterface(item.event, row, index)
    },
    handlePopup(item, row, index) {
      this.customBoxVisible = true
      this.$nextTick(() => {
        this.$refs.CustomBox.init(item, this.modelId, row.id, this.isPreview)
      })
    },
    handleScriptFunc(item, row, index) {
      const parameter = {
        data: row,
        index,
        request: this.request,
        toast: this.$message,
        refresh: this.initData
      }
      const func = this.jnpf.getScriptFunc.call(this, item.func)
      if (!func) return
      func.call(this, parameter)
    },
    handleInterface(item, row, index) {
      const handlerInterface = () => {
        if (item.templateJson && item.templateJson.length) {
          item.templateJson.forEach((ele) => {
            ele.defaultValue = row[ele.relationField] || ""
          })
        }
        let query = {
          paramList: item.templateJson || [],
        }
        getDataInterfaceRes(item.interfaceId, query).then(res => {
          this.$message({ message: res.msg, type: 'success' });
        })
      }
      if (!item.useConfirm) return handlerInterface()
      this.$confirm(item.confirmTitle || '确认执行此操作', '提示', { type: 'warning' }).then(() => {
        handlerInterface()
      }).catch(() => { })
    },
    request(url, method, data) {
      if (!url) return
      return request({
        url: url,
        method: method || 'GET',
        data: data || {}
      })
    },
    setTableLoadFunc() {
      const JNPFTable = this.$refs.tableRef.$refs.JNPFTable
      const parameter = {
        data: this.list,
        attributes: JNPFTable._props,
        events: JNPFTable._events,
        methods: JNPFTable,
        tableRef: JNPFTable,
        request: this.request,
      }
      const func = this.jnpf.getScriptFunc.call(this, this.columnData.funcs.afterOnload.func)
      if (!func) return
      func.call(this, parameter)
    },
    buildOptions() {
      this.columnData.columnList.forEach(cur => {
        const config = cur.__config__
        if (dyOptionsList.indexOf(config.jnpfKey) > -1) {
          let isTreeSelect = config.jnpfKey === 'treeSelect' || config.jnpfKey === 'cascader'
          if (config.dataType === 'dictionary') {
            if (!config.dictionaryType) return
            getDictionaryDataSelector(config.dictionaryType).then(res => {
              cur.options = res.data.list
            })
          }
          if (config.dataType === 'dynamic') {
            if (!config.propsUrl) return
            let query = {
              paramList: config.templateJson || [],
            }
            getDataInterfaceRes(config.propsUrl, query).then(res => {
              let data = res.data
              if (Array.isArray(data)) {
                cur.options = data
              } else {
                cur.options = []
              }
            })
          }
        }
      })
    },
    filterNode(value, data) {
      if (!value) return true;
      return data[this.treeProps.label].indexOf(value) !== -1;
    },
    toggleTreeExpand(expands) {
      this.keyword = ''
      this.refreshTree = false
      this.expandsTree = expands
      this.$nextTick(() => {
        this.refreshTree = true
        this.$nextTick(() => {
          this.$refs.treeBox.setCurrentKey(null)
        })
      })
    },
    toggleExpandList() {
      this.refreshTable = false;
      this.expandsTable = !this.expandsTable;
      this.$nextTick(() => {
        this.refreshTable = true;
      });
    },
    loadNode(node, resolve) {
      const nodeData = node.data
      const config = this.columnData
      if (config.treeInterfaceId) {
        if (config.treeTemplateJson && config.treeTemplateJson.length) {
          for (let i = 0; i < config.treeTemplateJson.length; i++) {
            const element = config.treeTemplateJson[i];
            element.defaultValue = nodeData[element.relationField] || ''
          }
        }
        let query = {
          paramList: config.treeTemplateJson || [],
        }
        getDataInterfaceRes(config.treeInterfaceId, query).then(res => {
          let data = res.data
          if (Array.isArray(data)) {
            resolve(data);
          } else {
            resolve([]);
          }
        })
      }
    },
    treeLoad(tree, treeNode, resolve) {
      getModelSubList(this.modelId, tree.id, this.listQuery).then(res => {
        if (res.data.list && Array.isArray(res.data.list)) {
          const list = res.data.list.map(o => ({
            ...o,
            ...this.expandObj,
            hasChildren: true
          }))
          resolve(list);
        } else {
          resolve([]);
        }
      })
    },
    getFlowList() {
      getFlowList(this.config.flowId, '1').then(res => {
        this.flowList = res.data
      })
    },
    handleRowForm(index) {
      this.extraFormVisible = true
      this.$nextTick(() => {
        const fields = this.columnList.filter(o => o.jnpfKey != 'table')
        fields.map(ele => { ele.__config__.span = 24 })
        const formData = { ...this.formData, fields }
        this.$refs.extraForm.init(formData, this.modelId, this.isPreview, this.columnData.useFormPermission, this.list[index])
      })
    },
    getFixed(item, i) {
      if (i == 0 && this.columnData.groupField && this.columnData.type == 3) {
        if (this.columnList.some(o => o.fixed == 'left')) return 'left'
        return false
      } else if (this.columnData.childTableStyle != 2) {
        return item.fixed == 'none' ? false : item.fixed
      } else {
        return false
      }
    }
  }
}
</script>
<style scoped lang="scss">
.JNPF-common-head {
  >>> .el-button span {
    margin-left: 0px !important;
  }
}
</style>
