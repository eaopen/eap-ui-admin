/**
 * @description 替换字符串中的${xx}
 * @param string
 * @returns {*}
 */
export function formatString(string, data) {
  if (!string) return "";
  if (!data || !data.length) return string;
  string = string.replace(/\${length}/g, data.length);
  string = string.replace(/\${/g, "${data[0].");
  string = "`" + string + "`";
  return eval(string);
}

// 获取URL中的参数
export function getParams(str) {
  str = str.split("?")[1];
  let aryParams = str.split("&");
  let json = {};
  for (var i = 0; i < aryParams.length; i++) {
    var pair = aryParams[i];
    var aryEnt = pair.split("=");
    var key = aryEnt[0];
    var val = aryEnt[1];
    if (json[key]) {
      json[key] = json[key] + "," + val;
    } else {
      json[key] = val;
    }
  }
  return json;
}

// listGrid path修改，删除code
export function formatListGridPath(path) {
  if (!path) return "";
  if(path.indexOf('?')== -1) return path
  let paramsObj = getParams(path);
  const keys = Object.keys(paramsObj);
  if (!keys.length) {
    return path;
  } else if (keys.length == 1) {
    if (keys[0] == "code") {
      return path.split('?')[0]
    } else {
      return path;
    }
  } else {
    let newPath = Object.keys(paramsObj) + "?";
    keys.forEach((k) => {
      if (k !== "code") {
        newPath += k + "=" + paramsObj[k];
      }
    });
  }
}
