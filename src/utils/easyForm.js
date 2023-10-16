export const filterHtml = function (str) {
	let html = str.replace(/\u200B/g, "");
	let custScriptStr = "",
		customScript;
	if (html.indexOf("<script>") != -1) {
		const reg = /<script[^>]*?>[\s\S]*?<\/script>/i;
		let patten = reg.exec(html);
		let script = patten[0];

		var len1 = script.indexOf(">");
		var len2 = script.lastIndexOf("<");
		custScriptStr = script.substring(len1 + 1, len2);
		// 指令替换
		if (custScriptStr) {
			customScript = eval(
				custScriptStr.substring(
					custScriptStr.indexOf("window.custFormComponentMixin")
				)
			);
		}
		html = html.replace(reg, "");
		customScript.created = () => { };
	}
	return {
		html,
		customScript,
	};
};

export const generateUUID = function () {
	let d = new Date().getTime();
	if (window.performance && typeof window.performance.now === "function") {
		d += performance.now(); //use high-precision timer if available
	}
	let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
		/[xy]/g,
		function (c) {
			let r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
		}
	);
	return uuid.replaceAll("-", "");
};


export const handleSpecialPermision = function (el, binding, vnode) {

	//无展示权限则移除掉标签
	if (binding.arg === "show" && binding.value == "n") {
		vnode.elm.style.display = "none";
		return;
	}

	//无编辑权限则移除掉控件
	if (binding.arg === "edit" && binding.value !== "w" && binding.value !== "b") {
		vnode.elm.style.display = "none";
		return;
	}
	vnode.elm.style.display = "";
}

export const handleElementPermission = function (el, binding, vnode) {

	let componentTag = vnode.componentOptions ? vnode.componentOptions.tag : '';
	if (componentTag === 'ab-dict') {
		//数据字典把权限给组件(组件获取不到v-ab-permission)
		vnode.componentInstance.bpmPermission = binding.value;
	}

	if (!binding.value) return;
	// 只成功处理一次

	//重新计算时，[还原权限]
	if (binding.oldValue && !binding.oldValue.startsWith("w")) {
		if (binding.oldValue.startsWith("b")) {
			vnode.elm.required = false;
			vnode.elm.$_oldValue = undefined;
		} else if (binding.oldValue.startsWith("r")) {
			vnode.elm.readOnly = false;
			vnode.elm.disabled = false;
			if (vnode.elm.css) {
				vnode.elm.css.pointerEvents = "none";
			}
		} else if (binding.oldValue.startsWith("n")) {
			vnode.elm.style.display = "";
		}
	}

	if (binding.arg) {
		handleSpecialPermision(el, binding, vnode);
		return;
	}

	// 处理必填权限
	if (binding.value.startsWith("b")) {
		vnode.elm.$_oldValue = undefined;
		vnode.elm.required = true;

		if (!document.location.pathname.endsWith("vueFormDetail.html")) {
			$(vnode.elm).parents(".form-item-content").prev().addClass("i-required");

			if (!$(el).attr("placeholder") || $(el).attr("placeholder") == "") {
				let label =
					$(vnode.elm).parents(".form-item-content").prev().text() ||
					$(vnode.elm).attr("desc");
				let tag = vnode.tag,
					componentTag = vnode.componentOptions
						? vnode.componentOptions.tag
						: "";
				if (tag == "input" || tag == "textarea") {
					$(el).attr("placeholder", "请输入" + label);
				} else if (
					tag == "select" ||
					componentTag == "ab-dict" ||
					componentTag == "ab-dict-mult" ||
					componentTag == "ab-date"
				) {
					$(el).attr("placeholder", "请选择" + label);
				} else if (
					componentTag == "ab-select-async" ||
					componentTag == "ab-async-mult"
				) {
					$(el).attr("placeholder", "请输入" + label + "搜索");
				}
			}
		}

		// formValidator.doValidate(el, binding, vnode);

		//  原生 input 没有 update 动作，这里做input事件补偿
		var validateHandler = function (e) {
			if (e.target && e.target !== el) return;

			var value = e.target ? e.target.value : e;
			// formValidator.doValidate(el, binding, vnode, value, true);
		};

		if (vnode.componentInstance) {
			vnode.componentInstance.$on("input", function (value) {
				validateHandler(value);
			});
		} else {
			addEvent(el, "input", validateHandler);
		}
	} else if (binding.value.startsWith("w")) {
		if (binding.value.indexOf("0") > 0) {
			// formValidator.doValidate(el, binding, vnode);
		}
	}
	//
	else if (binding.value.startsWith("r")) {
		vnode.elm.readOnly = true;
		vnode.elm.disabled = true;
	} else if (binding.value.startsWith("n")) {
		vnode.elm.style.display = "none";
		if (
			vnode.context.$validity &&
			vnode.context.$validity[vnode.data.attrs.desc]
		) {
			delete vnode.context.$validity[vnode.data.attrs.desc];
		}
	}
};
