export default {
  data() {
    return {
      recordList: [],
      currentRecordIndex: -1,
      recordLimit: 500,
      copyLayout: ""
    }
  },
  computed: {
    getCanUndo() {
      return this.currentRecordIndex > 0
    },
    getCanRedo() {
      return this.recordList.length > this.currentRecordIndex + 1
    },
  },
  methods: {
    initRedo(limit = 500) {
      this.recordList = [];
      this.currentRecordIndex = -1;
      this.recordLimit = limit;
    },
    addRecord(item) {
      if (this.currentRecordIndex + 1 < this.recordList.length) {
        this.recordList.splice(this.currentRecordIndex + 1);
      }
      this.recordList.push(JSON.parse(JSON.stringify(item)));
      this.currentRecordIndex++;
      if (this.recordList.length > this.recordLimit) {
        this.recordList.shift();
        this.currentRecordIndex--;
      }
    },
    handleUndo(callback) {
      if (!this.getCanUndo) return;
      this.currentRecordIndex--;
      const currRecord = this.recordList[this.currentRecordIndex];
      callback(currRecord);
    },
    handleRedo(callback) {
      if (!this.getCanRedo) return;
      this.currentRecordIndex++;
      const currRecord = this.recordList[this.currentRecordIndex];
      callback(currRecord);
    },
  }
}
