 /**
 * 角色权限处理
 * Copyright (c) 2019 ruoyi
 */

import store from '@/store'
import {handleElementPermission} from '@/utils/easyForm'
export default {
  inserted: function (el, binding, vnode) {
		handleElementPermission(el, binding, vnode);
	},
	update: function (el, binding, vnode) {
		// if (binding.oldValue && binding.oldValue === binding.value) {
		// 	return;
		// }
		handleElementPermission(el, binding, vnode);
	}
}
