import { mapGetters } from "vuex";
import QRCode from "qrcodejs2";
import JsBarcode from "jsbarcode";
import request from "@/utils/request";
import { getAmountChinese } from "@/components/extnGenerator/utils/index"

const printOptionApi = {
  computed: {
    ...mapGetters(['userInfo'])
  },
  data() {
    return {
      data: {},
      printTemplate: "",
      recordList: [],
      loading: false,
      showContainer: false,
      qrTemp: [],
      barTemp: [],
      handleNameMap: { "0": "退回", "1": "通过", "2": "发起", "3": "撤回", "4": "终止", "5": "指派", "6": "加签", "7": "转审", "8": "变更", "9": "复活" }
    }
  },
  methods: {
    initData() {
      this.barTemp = []
      this.qrTemp = []
      this.batchData = [];
      this.printTemplate = "";
    },
    async handleData(data, domCurrent) {
      this.data = data.printData
      this.recordList = data.operatorRecordList || []
      this.printTemplate = domCurrent.innerHTML
      this.replaceMyValue(domCurrent, 'p')
      this.createTable(domCurrent)
      this.replaceSysValue()
      this.qrbarReplace()
      const pageBreak = '<p style="page-break-after:always;"></p>'
      this.printTemplate = this.printTemplate.replace('<p><!-- pagebreak --></p>', pageBreak)
      this.printTemplate = this.printTemplate.replaceAll('大写金额(', '')
      this.printTemplate = this.printTemplate.replaceAll('千位分隔符(', '')
      this.printTemplate = this.printTemplate.replaceAll(')', '')

    },
    getTdTrueValue(text) {
      if (!text.match(/tablekey="([^"]*)"/)) return
      let info = text.match(/tablekey="([^"]*)"/)[1]
      let dataTag = info.split('.')[0]
      let line = info.split('.')[1]
      let field = text.match(/{([^}]*)}/)[1]
      let value = ''
      if (dataTag == 'headTable') {
        value = this.data[field]
      } else {
        value = this.data[dataTag][line][field]
      }
      return value
    },
    getTrueValue(text) {
      let info = text.match(/data-tag="([^"]*)"/)[1]
      let dataTag = info.split('.')[0]
      let field = text.match(/{([^}]*)}/)[1]
      let value = ''
      if (dataTag == 'headTable') {
        value = this.data[field]
      } else {
        // 子表设计在外面而且有多条则合并显示
        let data = this.data[dataTag]
        if (data) {
          let re = ''
          for (const item of data) {
            re += item[field] + '-'
          }
          value = re.substring(0, re.length - 1)
        }
      }
      return value
    },
    replaceMyValue(domCurrent, tag) {
      let getTrueValue = tag == 'td' ? this.getTdTrueValue : this.getTrueValue
      let domList = domCurrent.querySelectorAll(tag)
      for (const dom of domList) {
        let pcontent = dom.outerHTML
        if (pcontent.includes('{')) {
          // 替换千分符
          if (pcontent.includes('千位分隔符')) {
            let text = pcontent.match(/千位分隔符\(\<span[^>]+"[^<]+\>[^)]+/)[0];
            let place = 0
            if (text.includes(`</span>,`)) {
              place = text.split('</span>,')[1]
            }
            let value = getTrueValue(tag == 'td' ? pcontent : text)
            let transValue = this.getThousands(value, place)
            this.replaceMe(text, transValue)
            continue
          }
          // 替换数字金额
          if (pcontent.includes('大写金额')) {
            let text = pcontent.match(/大写金额\(\<span[^>]+"[^<]+\>[^)]+/)[0];
            let value = getTrueValue(tag == 'td' ? pcontent : text)
            let transValue = getAmountChinese(value)
            this.replaceMe(text, transValue)
            continue
          }
          // 替换图片
          if (pcontent.includes('&lt;img')) {
            let value = getTrueValue(pcontent)
            if (!value) value = '[]'
            this.replaceMyImg(dom, value)
            continue
          }
          // 替换二维码
          if (pcontent.includes('qrCode')) {
            let value = getTrueValue(pcontent)
            if (value.trim() == '') {
              let cloneNode = dom.cloneNode(true)
              cloneNode.innerText = ''
              this.replaceMe(pcontent, cloneNode.outerHTML)
              continue
            }
            this.replaceMyQrCode(dom, value)
            continue
          }
          // 替换条码
          if (pcontent.includes('barCode')) {
            let value = getTrueValue(pcontent)
            if (value.trim() == '') {
              this.replaceMe(pcontent, '')
              continue
            }
            this.replaceMyBarCode(dom, value)
            continue
          }
          // 替换普通值
          let value = getTrueValue(pcontent)
          let spanText = pcontent.match(/<span class="wk-print-tag-wukong.*?[^}]}.*?<\/span>/);
          this.replaceMe(spanText, value)
        } else {
          // 不是字段,只解析千分和数字金额
          if (pcontent.includes('千位分隔符')) {
            let data = pcontent.match(/千位分隔符\((.*?)\)/);
            let arr = data && data[1].split(',')
            let value = arr[0] ? arr[0] : ''
            let place = arr[1] ? arr[1] : 0
            let transValue = this.getThousands(value, place)
            this.replaceMe(dom.innerHTML, transValue)
            continue
          }
          if (pcontent.includes('大写金额')) {
            let value = pcontent.match(/大写金额\((.*?)\)/)[1];
            let transValue = getAmountChinese(value)
            this.replaceMe(dom.innerHTML, transValue)
            continue
          }
        }
      }
    },
    /**
     * 创建表格行
     * @param {*} table 表格dom
     * @param {*} tableKey 表格的key
     * @param {*} index 记录下标
     * @param {*} removeTitleTr 是否移除标题行
     */
    createTr(table, tableKey, index, removeTitleTr, tableBody) {
      let cloneTable = table.cloneNode(true);
      let trs = cloneTable.querySelectorAll('tr')
      for (const tr of trs) {
        if (tr.innerText.trim() == '') {
          tableBody.appendChild(tr)
          continue
        }
        if (removeTitleTr && !tr.innerHTML.includes('{')) {
          continue
        }
        let tds = tr.querySelectorAll('td')
        for (const td of tds) {
          if (td.innerHTML.includes('{')) {
            td.setAttribute('tableKey', tableKey + "." + index)
          }
        }
        tableBody.appendChild(tr)
      }
      return cloneTable
    },
    /**
     * 创建表格
     * @param {*} domCurrent 
     */
    createTable(domCurrent) {
      let tableList = domCurrent.querySelectorAll('table')
      for (let j = 0; j < tableList.length; j++) {
        let tableWrap = document.createElement('table');
        let tableBody = tableWrap.appendChild(document.createElement('tbody'))
        let table = tableList[j];
        let tableKey = this.getTableKey(table)
        let data = this.data[tableKey]
        if (data && Array.isArray(data)) {
          // 子表
          let tableSize = (data && Array.isArray(data)) ? data.length : 0
          for (let index = 0; index < tableSize; index++) {
            if (index == 0) {
              this.createTr(table, tableKey, index, false, tableBody)
            } else {
              this.createTr(table, tableKey, index, true, tableBody)
            }
          }
        } else {
          this.createTr(table, 'headTable', '', false, tableBody)
        }
        this.replaceMe(table.innerHTML, tableWrap.innerHTML)
        this.replaceMyValue(tableWrap, 'td')
      }
    },
    /**
     * 替换图片
     * @param {*} dom 
     * @param {*} data 替换的值 
     */
    replaceMyImg(dom, data) {
      if (!data) return
      let list = JSON.parse(data)
      if (JSON.stringify(list) == '[]') {
        let replaceDom = dom.cloneNode(true);
        replaceDom.innerHTML = ''
        this.replaceMe(dom.innerHTML, replaceDom.innerHTML)
      }
      let template = ''
      const width = this.getWidthHeight(dom.innerHTML)
      const height = this.getWidthHeight(dom.innerHTML, 'height')
      for (let index = 0; index < list.length; index++) {
        const element = list[index];
        if (element.url) {
          let value = this.define.comUrl + element.url
          template += `<img width='${width}' height='${height}' src='${value}'/>`
        }
      }
      let replaceDom = dom.cloneNode(true);
      replaceDom.innerHTML = template
      this.replaceMe(dom.innerHTML, replaceDom.innerHTML)
    },
    replaceMyQrCode(dom, value) {
      let imgRegular = /&lt;qrCode(\S|\s)*?&lt;\/qrCode&gt;/g
      let imgList = dom.innerHTML.match(imgRegular)
      if (imgList && imgList.length) {
        for (var i = 0; i < imgList.length; i++) {
          const item = imgList[i]
          const width = this.getWidthHeight(item)
          const height = this.getWidthHeight(item, 'height')
          const id = this.jnpf.idGenerator()
          let info = {
            replaceStr: item,
            width, height,
            barcodeId: `qrCode${id}`,
            value
          }
          this.qrTemp.push(info)
        }
      }
    },
    replaceMyBarCode(dom, value) {
      let imgRegular = /&lt;barCode(\S|\s)*?&lt;\/barCode&gt;/g
      let imgList = dom.innerHTML.match(imgRegular)
      if (imgList && imgList.length) {
        for (var i = 0; i < imgList.length; i++) {
          const item = imgList[i]
          const width = this.getWidthHeight(item)
          const height = this.getWidthHeight(item, 'height')
          const id = this.jnpf.idGenerator()
          let info = {
            replaceStr: item,
            width, height,
            barcodeId: `barcode${id}`,
            value
          }
          this.barTemp.push(info)
        }
      }
    },
    qrbarReplace() {
      if (this.barTemp.length > 0) {
        let array = this.barTemp
        for (let index = 0; index < array.length; index++) {
          const element = array[index];
          // 在页面中设置这个dom,获取码的html字符串
          const id = this.jnpf.idGenerator()
          let dom = this.$refs.barcodewrap
          let imgdom = document.createElement('img');
          imgdom.width = '100';
          imgdom.height = '100';
          imgdom.id = `barcode${id}`
          dom.appendChild(imgdom)
          this.$nextTick(() => {
            this.getJsBarcode(element.value, `#barcode${id}`, element.width, element.height)
            let dom = document.querySelector(`#barcode${id}`)
            if (!dom) return
            this.printTemplate = this.printTemplate.replace(element.replaceStr, dom.outerHTML)
          })
        }
      }
      if (this.qrTemp.length > 0) {
        let array = this.qrTemp
        for (let index = 0; index < array.length; index++) {
          const element = array[index];
          // 在页面中设置这个dom,获取码的html字符串
          const id = this.jnpf.idGenerator()
          let dom = this.$refs.qrcodewrap
          let imgdom = document.createElement('img');
          imgdom.width = '100';
          imgdom.height = '100';
          imgdom.id = `qrCode${id}`
          dom.appendChild(imgdom)
          this.$nextTick(() => {
            let base64Url = this.getJsQrcode(element.value, `qrCode${id}`, element.width, element.height)
            this.printTemplate = this.printTemplate.replace(element.replaceStr, `<img id='qrCode${id}'  width='${element.width}' height='${element.height}' src='${base64Url}'/>`)
          })
        }
      }
    },
    replaceMe(key, value) {
      this.printTemplate = this.printTemplate.replace(key, value)
    },
    getTableKey(dom) {
      let tdDoms = dom.querySelectorAll('span')
      for (let tdDom of tdDoms) {
        let dataTag = tdDom.getAttribute('data-tag')
        if (['thousands', 'isAmountChinese'].includes(dataTag)) {
          tdDom = tdDom.querySelector('span')
          dataTag = tdDom.getAttribute('data-tag')
        }
        if (dataTag) {
          return dataTag.split(".")[0]
        }
      }
      return ''
    },
    replaceSysValue() {
      const recordList = this.recordList
      const systemPrinter = this.userInfo.userName + '/' + this.userInfo.userAccount
      const systemPrintTime = this.jnpf.toDate(new Date())
      let systemApprovalContent = ''
      if (recordList.length) {
        systemApprovalContent += '<table style="border-collapse: collapse; width: 100%;" border="1" data-mce-style="border-collapse: collapse; width: 100%;"><tbody><tr><td style="width:20%;" data-mce-style="width: 20%;">节点名称</td><td style="width:20%;" data-mce-style="width: 20%;">操作人员</td><td style="width:20%;" data-mce-style="width: 20%;">操作时间</td><td style="width:20%;" data-mce-style="width: 20%;">执行动作</td><td style="width: 20%;" data-mce-style="width: 20%;">备注</td></tr>'
        let content = ''
        for (let i = 0; i < recordList.length; i++) {
          const record = recordList[i];
          content += `<tr><td style="width: 20%;" data-mce-style="width: 20%;"><span class="wk-print-tag-wukong wk-tiny-color--common" contenteditable="false">${record.nodeName}</span></td><td style="width: 20%;" data-mce-style="width: 20%;"><span class="wk-print-tag-wukong wk-tiny-color--common" contenteditable="false">${record.userName}</span></td><td style="width: 20%;" data-mce-style="width: 20%;"><span class="wk-print-tag-wukong wk-tiny-color--common" contenteditable="false">${this.jnpf.toDate(record.handleTime)}</span></td><td style="width: 20%;" data-mce-style="width: 20%;"><span class="wk-print-tag-wukong wk-tiny-color--common" contenteditable="false">${this.getHandleName(record.handleStatus)}</span></td><td style="width: 20%;" data-mce-style="width: 20%;"><span class="wk-print-tag-wukong wk-tiny-color--common" contenteditable="false">${record.handleOpinion || ""}</span></td></tr>`
        }
        systemApprovalContent += content
        systemApprovalContent += '</tbody></table>'
      }
      this.printTemplate = this.printTemplate.replace('{systemPrinter}', systemPrinter)
      this.printTemplate = this.printTemplate.replace('{systemPrintTime}', systemPrintTime)
      this.printTemplate = this.printTemplate.replace('{systemApprovalContent}', systemApprovalContent)
    },
    getThousands(value, place) {
      if (!value && value !== 0) return ''
      place = place ? place : this.getPlace(value)
      value = Number(value).toFixed(place)
      const numArr = value.toString().split('.');
      numArr[0] = numArr[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      numArr[1] = numArr[1] ? numArr[1].toString().substring(0, place) : ''
      return numArr[1] ? numArr.join('.') : numArr[0];
    },
    getPlace(value) {
      if (!value || value.toString().indexOf(".") == -1) return 0
      var index = value.toString().indexOf(".") + 1;
      var count = value.toString().length - index;
      return count
    },
    getWidthHeight(item, type = 'width') {
      let regular = ""
      if (type == 'width') regular = /width=[\"|'](.*?)[\"|']/gi;
      if (type == 'height') regular = /height=[\"|'](.*?)[\"|']/gi;
      let quotes = /["|'](.*)["|']/;
      let data = item.match(regular)
      let value = ""
      if (data && data.length) {
        let res = data[0].match(quotes)
        value = res && res.length ? res[1] : 100
      }
      return value
    },
    getJsBarcode(value, id, width, height) {
      if (!value) return
      JsBarcode(id, value, {
        width: width ? width : 4,
        height: height ? height : 80,
        displayValue: false
      });
    },
    getJsQrcode(value, id, width, height) {
      if (!value) return
      let dom = document.getElementById(id)
      if (!dom) return
      let qrcode = new QRCode(dom, {
        width: width ? width : 265,
        height: height ? height : 265, // 高度
        text: value, // 二维码内容
        correctLevel: QRCode.CorrectLevel.H //容错级别 容错级别有：（1）QRCode.CorrectLevel.L （2）QRCode.CorrectLevel.M （3）QRCode.CorrectLevel.Q （4）QRCode.CorrectLevel.H
      })
      let canvas = qrcode._el.querySelector("canvas");//获取生成二维码中的canvas，并将canvas转换成base64
      let base64Text = canvas.toDataURL("image/png");
      return base64Text
    },
    getHandleName(handleStatus) {
      if (handleStatus == 0) return "退回"
      if (handleStatus == 1) return "通过"
      if (handleStatus == 2) return "发起"
      if (handleStatus == 3) return "撤回"
      if (handleStatus == 4) return "终止"
      if (handleStatus == 5) return "指派"
      if (handleStatus == 6) return "加签"
      if (handleStatus == 7) return "转审"
      if (handleStatus == 8) return "变更"
      if (handleStatus == 9) return "复活"
      return ''
    },
    word() {
      let print = this.$refs.tsPrint.innerHTML
      const blob = new Blob([print], {
        type: ''
      })
      const name = this.fullName ? `${this.fullName}.doc` : '下载文档.doc'
      this.downloadFile(blob, name)
    },
    downloadFile(data, name, type) {
      let blob = new Blob([data], {
        type: type || ''
      })
      let downloadElement = document.createElement('a')
      let href = window.URL.createObjectURL(blob)
      downloadElement.href = href
      downloadElement.download = name
      document.body.appendChild(downloadElement)
      downloadElement.click()
      document.body.removeChild(downloadElement)
      window.URL.revokeObjectURL(href)
    },
    print() {
      let print = this.$refs.tsPrint.innerHTML
      print = print + `<style>html * {word-break:break-all}</style>`
      let iframe = document.createElement('IFRAME');
      document.body.appendChild(iframe);
      iframe.setAttribute("style", "position:absolute;width:0px;height:0px;left:-500px;top:-500px;");
      iframe.contentWindow.focus();
      let doc = iframe.contentWindow.document
      let _this = this
      iframe.onload = function () {
        let oldTitle = document.title;
        iframe.contentWindow.onafterprint = function (e) {
          let title = oldTitle.split('-')[0]
          let data = {
            printTitle: _this.fullName ? _this.fullName : title,
            printNum: 1,
            printId: _this.id
          }
          request({
            url: `/api/system/printLog/save`,
            method: "post",
            data
          }).then((res) => {
          });
        };
        document.title = "JNPF快速开发平台";
        iframe.contentWindow.print();
        document.title = oldTitle;
        document.body.removeChild(iframe);
      }
      doc.write(print);
      doc.close();
    },
    closeDialog() {
      this.$emit('update:visible', false)
    },
  },
  mounted() {
  }
}
export default printOptionApi;
