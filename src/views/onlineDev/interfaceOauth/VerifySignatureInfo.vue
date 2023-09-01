<template>
  <el-dialog class="JNPF-dialog JNPF-dialog_center" title="验证签名使用说明" append-to-body
    :visible.sync="verifySignatureVisible" width="800px" @close="goback">
    <div class="doc-container">
      <div class="docu-container">
        <h4><a href="#验证开启" id="验证开启" name="验证开启" class="anchor"><span
              class="octicon octicon-link"></span>验证开启</a></h4>
        <p>验证签名关闭，不使用验证机制</p>
        <li>直接将appId和appSecret，按照 Authorization: appId::appSecret 格式加入到 Header 中。</li>
        <p>验证签名开启，使用下列签名验证机制</p>
        <p></p>
        <h4><a href="#签名验证机制" id="签名验证机制" name="签名验证机制" class="anchor"><span
              class="octicon octicon-link"></span>签名验证机制</a></h4>
        <p>和第三方服务对接时，需要建立通讯双方的信任关系，以及确保通讯内容不被篡改，不被重放等。通常，我们采用 HTTPS 和 KeyId/SecretKey 的方式：</p>
        <ol>
          <li>HTTPS 用来确定接收方的身份，利用公钥证书机制来保证。</li>
          <li>根据双方共享的一对 keyId/secret，使用 HMAC 签名机制，发送方对请求内容进行签名，并加入到 Header
            中，接收方使用同样的方式对请求进行签名计算，比对签名结果用来判别发送方的身份。</li>
        </ol>
        <p>当前HTTP授权证书支持globalsign, symantec, geotrust, comodo这四类，其余证书类型需要经过处理，暂时不推荐。</p>
        <p>本系统内采用appId/appSecret来进行签名。</p>
        <h4><a href="#签名过程" id="签名过程" name="签名过程" class="anchor"><span
              class="octicon octicon-link"></span>签名过程</a></h4>
        <p>签名分为以下4个步骤:</p>
        <ol>
          <li>选择合适的签名方法</li>
          <li>根据对应的签名，构建待签名的字符串</li>
          <li>根据对应的签名算法和对应的appSecret，计算待签名字符串的 Hmac 签名</li>
          <li>将签名按规定格式加入到 Header: Authorization中。
            <p>通常使用: Authorization: SignVersion:KeyId:Scope:Signature;
            </p>
          </li>
          <p>本系统内最终以KeyId:Signature规则展示</p>
        </ol>
        <h4><a href="#签名方法" id="签名方法" name="签名方法" class="anchor"><span
              class="octicon octicon-link"></span>签名方法</a></h4>
        <p>为了使双方采用一致的算法计算签名，需要规定签名字符串的构建和签名算法，为了满足后续的签名算法升级，当前支持的签名方式为： HmacSHA256</p>
        <p>待签名字符串，请按照以下顺序构建</p>
        <ol>
          <li>
            <p>Http Method, 大写。例如 GET, POST。加上换行符 \n</p>
          </li>
          <li>
            <p>URI Path。query params string 之前的部分。 加上换行符 \n</p>
          </li>
          <li>
            <p>Header 中的 YmDate， 以时间戳的形式，例如（2022-06-28 16:26:11=>1656404771000）。加上换行符 \n</p>
            <p>该时间将会用来判断请求有效性，限定一分钟之内有效。若无效返回验证超时。</p>
          </li>
          <li>
            <p>Header 中的 Host，为开发者自身的域名，加上换行符 \n</p>
          </li>
        </ol>
        <p>Header规范化方法如下:</p>
        <ol>
          <li>将所有的 header name 都变成小写，按照字典序排序。</li>
          <li>对每一个小写的 name, 取出所有的对应的 value。如果有多个 value, 对所有的 value 进行字典序排序，用逗号 (,) 连接。</li>
          <li>对每一对 name, value。按照如下方式拼接：name:value\n (\n 为换行)</li>
        </ol>
        <h4><a href="#计算待签名字符串的签名" id="计算待签名字符串的签名" name="计算待签名字符串的签名" class="anchor"><span
              class="octicon octicon-link"></span>计算待签名字符串的签名</a></h4>
        <p><b>签名使用的 Key</b></p>
        <ol>
          <li>HmacSHA256 方式直接使用 appId 对应的 appSecret。通常这是一个32位 Base64 字符串，将其 Base64 decode 为字节数组。
          </li>
          <li>其他方法，为了更加安全的保护 appSecret, 可能会使用特定的算法根据 appSecret 派生出新的签名用的 key。目前保留。</li>
        </ol>
        <p><b>计算签名</b></p>
        <ol>
          <li>使用 HmacSha256 计算 Hmac 签名。</li>
          <li>将待签名字符串，获取对应的 UTF-8 字节数组。</li>
          <li>使用签名算法对待签名字节数组计算 Hmac 签名。</li>
          <li>将签名结果变成 Hex 字符串。</li>
          <li>将签名结果，按照 Authorization: &lt;KeyId&gt;:&lt;Signature&gt; 格式加入到 Header 中。</li>
        </ol>
        <h4><a href="#签名示例" id="签名示例" name="签名示例" class="anchor"><span
              class="octicon octicon-link"></span>签名示例</a></h4>
        <p>针对 appId, appSecret (abcde, xxxxxxxxxxxxxxxxyyyyyyyyyyyyyyyy)</p>
        <p>appId和appSecret为必传参数。可以添加为请求头参数（Header）如：abcde:xxxxxxxxxxxxxxxxyyyyyyyyyyyyyyyy</p>
        <p>其他参数：如果是GET请求，统一路径传参；如果是POST请求，统一Body-application/json传参。
        <h5><a href="#get-请求" id="get-请求" name="get-请求" class="anchor"><span
              class="octicon octicon-link"></span>GET 请求：</a></h5>
        <p><em>GET</em>
          /api/system/DataInterface/{id}/Actions/Response?tenantId=xxxxx&amp;name=abc<br>
          Host : localhost:30000<br>
          YmDate : 1656404771000<br>
        <p>按照规则生成的待签名字符串如下：</p>
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>签名结果</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>待签名字段名</td>
              <td>待签名字段值</td>
            </tr>
            <tr>
              <td>Http Method</td>
              <td>GET</td>
            </tr>
            <tr>
              <td>URL Path</td>
              <td> /api/system/DataInterface/{id}/Actions/Response</td>
            </tr>
            <tr>
              <td>YmDate</td>
              <td>1656404771000</td>
            </tr>
            <tr>
              <td>Host</td>
              <td>localhost:30000</td>
            </tr>
            <tr>
              <td>最终待签名字符串</td>
              <td>以下 \n
                表明换行<br>GET\n<br>/api/system/DataInterface/{id}/Actions/Response\n<br>1656404771000\n
                <br>localhost:30000\n<br>
              </td>
            </tr>
            <tr>
              <td>最终计算的 Authorization header</td>
              <td>Authorization:
                abcde::5a13e56353da7954a96605c7f21f0f14a26a49baf387f95e600cdbdd7f0dc604</td>
            </tr>
          </tbody>
        </table>
        <h5><a href="#post-请求" id="post-请求" name="post-请求" class="anchor"><span
              class="octicon octicon-link"></span>POST 请求：</a></h5>
        <p><em>POST /api/system/DataInterface/{id}/Actions/Response<br>
            Host : localhost:30000<br>
            YmDate : 1656404771000<br>
            body参数json格式如：{"tenantId":"123","name":"abc"}</em></p>
        <p>按照规则生成的待签名字符串如下：</p>
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>签名结果</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>待签名字段名</td>
              <td>待签名字段值</td>
            </tr>
            <tr>
              <td>Http Method</td>
              <td>POST</td>
            </tr>
            <tr>
              <td>URL Path</td>
              <td>/api/system/DataInterface/{id}/Actions/Response</td>
            </tr>
            <tr>
              <td>YmDate</td>
              <td>1656404771000</td>
            </tr>
            <tr>
              <td>Host</td>
              <td>localhost:30000</td>
            </tr>

            <tr>
              <td>最终待签名字符串</td>
              <td>以下 \n 表明换行<br>POST\n<br>/hmac/testPost\n<br>1656404771000\n
                <br>localhost:30000\n<br>
              </td>
            </tr>
            <tr>
              <td>最终计算的 Authorization header</td>
              <td>Authorization :
                abcde::7af664ac15b675633bc13a3ab03adc2d0c6e3834999785698e5830ae215a8545</td>
            </tr>
          </tbody>
        </table>
        <h4><a href="#javaversion" id="javaversion" name="javaversion" class="anchor"><span
              class="octicon octicon-link"></span>(java版)生成待签名字符串及Authorization代码示例:</a></h4>
        <pre class=" language-java"><code class=" language-java"><span class="token keyword">import</span> org<span class="token punctuation">.</span>apache<span class="token punctuation">.</span>commons<span class="token punctuation">.</span>codec<span class="token punctuation">.</span>binary<span class="token punctuation">.</span>Base64<span class="token punctuation">;</span>
<span class="token keyword">import</span> org<span class="token punctuation">.</span>apache<span class="token punctuation">.</span>commons<span class="token punctuation">.</span>codec<span class="token punctuation">.</span>binary<span class="token punctuation">.</span>Hex<span class="token punctuation">;</span>
<span class="token keyword">import</span> javax<span class="token punctuation">.</span>crypto<span class="token punctuation">.</span>Mac<span class="token punctuation">;</span>
<span class="token keyword">import</span> javax<span class="token punctuation">.</span>crypto<span class="token punctuation">.</span>spec<span class="token punctuation">.</span>SecretKeySpec<span class="token punctuation">;</span>
<span class="token keyword">import</span> java<span class="token punctuation">.</span>io<span class="token punctuation">.</span>UnsupportedEncodingException<span class="token punctuation">;</span>
<span class="token keyword">import</span> java<span class="token punctuation">.</span>security<span class="token punctuation">.</span>InvalidKeyException<span class="token punctuation">;</span>
<span class="token keyword">import</span> java<span class="token punctuation">.</span>security<span class="token punctuation">.</span>NoSuchAlgorithmException<span class="token punctuation">;</span>

<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">EncryDemo</span> <span class="token punctuation">{</span>
    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span>String<span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token keyword">throws</span> NoSuchAlgorithmException<span class="token punctuation">,</span> InvalidKeyException<span class="token punctuation">,</span> UnsupportedEncodingException <span class="token punctuation">{</span>
        String secret <span class="token operator">=</span> <span class="token string">"xxxxxxxxxxxxxxxxyyyyyyyyyyyyyyyy"</span><span class="token punctuation">;</span>
        String algorithmForMac <span class="token operator">=</span> <span class="token string">"HmacSHA256"</span><span class="token punctuation">;</span>
        String method <span class="token operator">=</span> <span class="token string">"POST"</span><span class="token punctuation">;</span>
        String urlPath <span class="token operator">=</span> <span class="token string">"/api/system/DataInterface/{id}/Actions/Response"</span><span class="token punctuation">;</span>
        String YmDate <span class="token operator">=</span> <span class="token string">"1656404771000"</span><span class="token punctuation">;</span>
        String host <span class="token operator">=</span> <span class="token string">"localhost:30000"</span><span class="token punctuation">;</span>
        String source <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">StringBuilder()</span>
                      <span class="token punctuation">.</span><span class="token function">append</span>(method)<span class="token punctuation">.</span><span class="token function">append</span><span class="token punctuation">(</span><span class="token string">'\n'</span><span class="token punctuation">)</span>
                      <span class="token punctuation">.</span><span class="token function">append</span>(url)<span class="token punctuation">.</span><span class="token function">append</span><span class="token punctuation">(</span><span class="token string">'\n'</span><span class="token punctuation">)</span>
                      <span class="token punctuation">.</span><span class="token function">append</span>(ymdate)<span class="token punctuation">.</span><span class="token function">append</span><span class="token punctuation">(</span><span class="token string">'\n'</span><span class="token punctuation">)</span>
                      <span class="token punctuation">.</span><span class="token function">append</span>(host)<span class="token punctuation">.</span><span class="token function">append</span><span class="token punctuation">(</span><span class="token string">'\n'</span><span class="token punctuation">)</span><span class="token punctuation">.toString();</span>
        Mac mac <span class="token operator">=</span> Mac<span class="token punctuation">.</span><span class="token function">getInstance</span><span class="token punctuation">(</span>algorithmForMac<span class="token punctuation">)</span><span class="token punctuation">;</span>
        SecretKeySpec secretKeySpec <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">SecretKeySpec</span><span class="token punctuation">(</span>Base64<span class="token punctuation">.</span><span class="token function">decodeBase64</span><span class="token punctuation">(</span>secret<span class="token punctuation">)</span><span class="token punctuation">,</span> algorithmForMac<span class="token punctuation">)</span><span class="token punctuation">;</span>
        mac<span class="token punctuation">.</span><span class="token function">init</span><span class="token punctuation">(</span>secretKeySpec<span class="token punctuation">)</span><span class="token punctuation">;</span>
        String signature <span class="token operator">=</span> Hex<span class="token punctuation">.</span><span class="token function">encodeHexString</span><span class="token punctuation">(</span>mac<span class="token punctuation">.</span><span class="token function">doFinal</span><span class="token punctuation">(</span>source<span class="token punctuation">.</span><span class="token function">getBytes</span><span class="token punctuation">(</span><span class="token string">"utf-8"</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        System<span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span>signature<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre>
        <h4><a href="#.netversion" id=".netversion" name=".netversion" class="anchor"><span
              class="octicon octicon-link"></span>(.net版)生成待签名字符串及Authorization代码示例:</a></h4>
        <pre class=" language-java"><code class=" language-java"><span class="token keyword">using</span><span > System.Security.Cryptography;</span>
<span class="token keyword">using</span><span> System.Text;</span>
<span class="token keyword">using</span><span > JNPF.Common.Extension;</span>
<span class="token keyword">namespace JNPF.Systems.System</span>
<span class="token punctuation">{</span>
    <span class="token keyword"> internal class Class1</span>
    <span class="token punctuation">{</span>
      <span class="token keyword"> static void Main(string[] args)</span>
      <span class="token punctuation">{</span>
        String secret <span class="token operator">=</span> <span class="token string">"xxxxxxxxxxxxxxxxyyyyyyyyyyyyyyyy"</span><span class="token punctuation">;</span>
        String method <span class="token operator">=</span> <span class="token string">"POST"</span><span class="token punctuation">;</span>
        String urlPath <span class="token operator">=</span> <span class="token string">"/api/system/DataInterface/{id}/Actions/Response"</span><span class="token punctuation">;</span>
        String YmDate <span class="token operator">=</span> <span class="token string">"1656404771000"</span><span class="token punctuation">;</span>
        String host <span class="token operator">=</span> <span class="token string">"localhost:30000"</span><span class="token punctuation">;</span>
        String source <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">StringBuilder()</span>
                      <span class="token punctuation">.</span><span class="token function">Append</span>(method)<span class="token punctuation">.</span><span class="token function">Append</span><span class="token punctuation">(</span><span class="token string">'\n'</span><span class="token punctuation">)</span>
                      <span class="token punctuation">.</span><span class="token function">Append</span>(url)<span class="token punctuation">.</span><span class="token function">Append</span><span class="token punctuation">(</span><span class="token string">'\n'</span><span class="token punctuation">)</span>
                      <span class="token punctuation">.</span><span class="token function">Append</span>(ymdate)<span class="token punctuation">.</span><span class="token function">Append</span><span class="token punctuation">(</span><span class="token string">'\n'</span><span class="token punctuation">)</span>
                      <span class="token punctuation">.</span><span class="token function">Append</span>(host)<span class="token punctuation">.</span><span class="token function">Append</span><span class="token punctuation">(</span><span class="token string">'\n'</span><span class="token punctuation">)</span><span class="token punctuation">.ToString();</span>
        <span>using (var hmac = </span><span class="token keyword">new</span><span> HMACSHA256(secret.</span><span class="token function">ToBytes</span><span>(Encoding.UTF8)))</span>
        <span class="token punctuation">{</span>
          <span>byte[] hashmessage = hmac.</span><span class="token function">ComputeHash</span><span>(source.</span><span class="token function">ToBytes</span><span>(Encoding.UTF8));</span>
          <span>var signature = hashmessage.</span><span class="token function">ToHexString</span><span>();</span>
          <span>Console.</span><span class="token function">WriteLine</span><span>(signature);</span>
          <span>Console.</span><span class="token function">ReadKey</span><span>();</span>
        <span class="token punctuation">}</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      verifySignatureVisible: false
    }
  },
  created() {
  },
  methods: {
    init() {
      this.verifySignatureVisible = true
    },
    goback() {
      this.verifySignatureVisible = false
      this.$emit('close')
    }
  }
}
</script>
<style scoped>
.flex {
  display: -webkit-box;
  display: -moz-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
}
.center-box {
  max-width: 1400px;
  min-width: 1180px;
  margin: 0 auto;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.containers {
  background-color: #f8f9fa;
}
.docs-type-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 0 100px;
  display: flex;
  background: #fff;
}
.docs-type-container .nav-container .nav-title {
  height: 62px;
  font-size: 20px;
  font-weight: 700;
  padding: 18px 24px;
  border-bottom: 1px solid #e8e8e8;
  border-right: 1px solid #e8e8e8;
}
.docs-type-container .nav-container .ant-menu-item,
.docs-type-container .nav-container .ant-menu-submenu-title {
  font-size: 16px !important;
  margin: 0;
  padding: 0;
  height: 50px;
  line-height: 50px;
}
.docs-type-container .right-container {
  width: 180px;
  color: #fff;
  font-size: 14px;
}
@media (max-width: 1400px) and (min-width: 768px) {
  .docs-type-container .right-container {
    right: 0;
  }
}
.docs-type-container .right-container .ant-anchor-link {
  line-height: 16px;
  padding: 6px 0 6px 15px;
}
.docs-type-container .right-container .ant-anchor-link-title {
  color: #000;
}
.docs-type-container .right-container .ant-anchor-ink-ball {
  border: 0 solid #00c1df !important;
  height: 16px;
  width: 3px;
  background-color: #00c1df;
  margin-top: -4px;
}
.docs-type-container .right-container .ant-anchor-ink:before {
  width: 3px;
}
.docs-type-container .right-container .ant-anchor-link-active > .ant-anchor-link-title,
.docs-type-container .right-container .ant-anchor-link-title:hover {
  color: #00c1df !important;
}
.right-container {
  width: 180px;
  float: right;
  color: #fff;
  font-size: 14px;
}
.right-container .ant-anchor-link {
  line-height: 20px;
  padding: 6px 0 6px 15px;
}
.right-container .ant-anchor-ink-ball {
  border: 0 solid #00c1df !important;
  height: 30px;
  width: 3px;
  background-color: #00c1df;
  margin-top: -10px;
}
.right-container .ant-anchor-ink:before {
  width: 3px;
}
.right-container .ant-anchor-link-active > .ant-anchor-link-title,
.right-container .ant-anchor-link-title:hover {
  color: #00c1df !important;
}
.right-container .ant-anchor-wrapper::-webkit-scrollbar {
  height: 2px;
  width: 4px;
}
.right-container .ant-anchor-wrapper::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.26);
}
.docus-container {
  max-width: 900px;
  min-height: 600px;
  font-size: 14px;
  padding: 0 60px;
  box-sizing: border-box;
}
.docus-container .backUp {
  width: 50px;
  height: 50px;
  text-align: center;
  line-height: 50px;
  color: #666;
  font-size: 20px;
  background: #e9e9e9;
  border-radius: 10px;
}
table {
  width: 100%;
  margin: 10px 0 !important;
}
table thead {
  background: #eceef0;
}
table thead tr th {
  font-weight: 600;
}
table tbody tr:nth-child(odd) {
  background: #fcfcfc;
}
table tbody tr:nth-child(2n) {
  background: #f9f9f9;
}
table tr td,
table tr th {
  font-size: 14px;
  line-height: 20px;
  padding: 17px 20px;
  text-align: left;
  font-weight: 400;
}
table.noise-table tbody tr td {
  background-color: #f9f9f9;
}
.doc-container .docu-container ol,
.doc-container .docu-container ul {
  padding: 10px 0;
  margin-left: 20px;
  font-weight: 400;
  font-size: 16px;
}
.doc-container .docu-container ol li,
.doc-container .docu-container ul li {
  margin-top: 6px !important;
  color: #454a47 !important;
}
.doc-container .docu-container ol image,
.doc-container .docu-container ul image {
  padding-left: 10px;
  line-height: 20px;
}
.doc-container .docu-container ol ol,
.doc-container .docu-container ol ul,
.doc-container .docu-container ul ol,
.doc-container .docu-container ul ul {
  padding: 10px 0 10px 25px !important;
  margin-left: 0;
}
.doc-container .docu-container img {
  padding: 15px 0;
}
.doc-container .docu-container p {
  font-size: 16px !important;
  color: #454a47 !important;
  padding: 6px 0 !important;
}
.doc-container .docu-container h2 {
  margin: 40px auto 20px;
  font-size: 32px;
  line-height: 36px;
}
.doc-container .docu-container h2 a {
  margin-left: 0;
}
.doc-container .docu-container table {
  margin: 20px 0;
}
.doc-container .docu-container p {
  padding: 10px 0;
  font-weight: 400;
  font-size: 14px;
  line-height: 24px;
}
.doc-container .docu-container p a {
  color: #086cf1;
}
.doc-container .docu-container blockquote {
  border-left: 3px solid #00c1df;
  margin: 20px 0 10px 20px;
  padding-left: 20px;
}
.doc-container .docu-container blockquote p {
  padding: 0;
  font-size: 14px;
  line-height: 28px !important;
}
.doc-container .docu-container h3 {
  color: #000;
  font-size: 24px;
  line-height: 28px;
  padding-top: 25px;
  padding-bottom: 15px;
}
.doc-container .docu-container h3 a {
  font-size: 32px !important;
  font-family: 微软雅黑 !important;
  font-weight: 550;
  color: #454a47 !important;
}
.doc-container .docu-container h4 a {
  font-size: 24px !important;
  color: #454a47 !important;
  font-weight: 550;
}
.doc-container .docu-container h5 {
  margin: 10px 0 0;
  font-size: 18px;
  line-height: 28px;
  font-weight: 550 !important;
  padding-top: 20px !important;
  padding-bottom: 10px !important;
}
.doc-container .docu-container h5 a {
  font-size: 20px !important;
  color: #454a47 !important;
}
.doc-container .docu-container h6 {
  padding: 5px 0;
  font-size: 14px;
  line-height: 24px;
  font-weight: 600 !important;
}
.doc-container .docu-container .catalog-div {
  background-color: #f7f7f7;
  margin-top: 60px;
  padding-bottom: 30px;
}
.doc-container .docu-container .catalog-div .catalog-title {
  padding: 20px 0 0 20px;
}
.doc-container .docu-container .catalog-div .catalog-ul {
  display: flex;
  flex-flow: row nowrap;
}
.doc-container .docu-container .catalog-div .catalog-ul ul {
  list-style: none;
  display: flex;
  flex-flow: column wrap;
  width: 400px;
}
.doc-container .docu-container .catalog-div .catalog-ul ul li {
  width: 400px;
}
.doc-container .docu-container .twoCol .rightCol {
  width: 400px;
  margin-left: 10px;
  float: right;
}
.doc-container .docu-container .blueBlock {
  background-color: #00c1df;
  opacity: 0.9;
  color: #00aad0;
  padding: 10px 40px;
}
.listTitle .ant-anchor-link-title {
  color: #8b8b8b !important;
}
.intro-container {
  margin: 50px auto 110px;
  max-width: 1200px;
  font-size: 14px;
}
.intro-container .intro-header {
  margin-bottom: 60px;
  text-align: center;
}
.intro-container .intro-header .title {
  text-align: center;
  font-size: 32px;
}
.intro-container .intro-header .sub-title {
  margin-top: 14px;
  color: #9d9d9d;
}
.intro-container .intro-body .nav-link {
  color: #333;
}
.intro-container .intro-body .nav-block {
  background: #fff;
  background-size: cover;
  padding: 40px 50px;
  height: 280px;
  cursor: pointer;
}
.intro-container .intro-body .nav-block .title {
  font-size: 24px;
}
.intro-container .intro-body .nav-block .desc {
  padding: 10px 0;
  color: #9d9d9d;
  height: 150px;
  line-height: 23px;
}
.intro-container .intro-body .nav-block .bottom {
  color: #4b9bff;
}
.intro-container .intro-body .advantage-container {
  margin-top: 50px;
}
.intro-container .intro-body .advantage-container .title {
  text-align: center;
  font-size: 32px;
}
.intro-container .intro-body .advantage-container .advantages {
  margin-top: 40px;
  display: flex;
  justify-content: space-between;
}
.intro-container .intro-body .advantage-container .advantages .advantage {
  width: 271px;
  height: 380px;
  border: 1px solid #e8e8e8;
  padding: 35px 30px;
}
.intro-container .intro-body .advantage-container .advantages .advantage .advantage-img {
  text-align: center;
}
.intro-container .intro-body .advantage-container .advantages .advantage .advantage-img img {
  width: 96px;
  height: 96px;
}
.intro-container .intro-body .advantage-container .advantages .advantage .title {
  margin-top: 18px;
  font-size: 20px;
}
.intro-container .intro-body .advantage-container .advantages .advantage .desc {
  margin-top: 15px;
  font-size: 14px;
  color: #9d9d9d;
  line-height: 23px;
}
</style>
<style>
/* http://prismjs.com/download.html?themes=prism&languages=markup+css+clike+javascript+c+cpp+http+java+json+nginx+python+scala+yaml */
/**
 * prism.js default theme for JavaScript, CSS and HTML
 * Based on dabblet (http://dabblet.com)
 * @author Lea Verou
 */

code[class*='language-'],
pre[class*='language-'] {
  color: black;
  background: none;
  text-shadow: 0 1px white;
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
  line-height: 1.5;

  -moz-tab-size: 4;
  -o-tab-size: 4;
  tab-size: 4;

  -webkit-hyphens: none;
  -moz-hyphens: none;
  -ms-hyphens: none;
  hyphens: none;
}

pre[class*='language-']::-moz-selection,
pre[class*='language-'] ::-moz-selection,
code[class*='language-']::-moz-selection,
code[class*='language-'] ::-moz-selection {
  text-shadow: none;
  background: #b3d4fc;
}

pre[class*='language-']::selection,
pre[class*='language-'] ::selection,
code[class*='language-']::selection,
code[class*='language-'] ::selection {
  text-shadow: none;
  background: #b3d4fc;
}

@media print {
  code[class*='language-'],
  pre[class*='language-'] {
    text-shadow: none;
  }
}

/* Code blocks */
pre[class*='language-'] {
  padding: 1em;
  margin: 0.5em 0;
  overflow: auto;
}

:not(pre) > code[class*='language-'],
pre[class*='language-'] {
  background: #f5f2f0;
}

/* Inline code */
:not(pre) > code[class*='language-'] {
  padding: 0.1em;
  border-radius: 0.3em;
  white-space: normal;
}

.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: slategray;
}

.token.punctuation {
  color: #999;
}

.namespace {
  opacity: 0.7;
}

.token.property,
.token.tag,
.token.boolean,
.token.number,
.token.constant,
.token.symbol,
.token.deleted {
  color: #905;
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
  color: #690;
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string {
  color: #a67f59;
  background: hsla(0, 0%, 100%, 0.5);
}

.token.atrule,
.token.attr-value,
.token.keyword {
  color: #07a;
}

.token.function {
  color: #dd4a68;
}

.token.regex,
.token.important,
.token.variable {
  color: #e90;
}

.token.important,
.token.bold {
  font-weight: bold;
}
.token.italic {
  font-style: italic;
}

.token.entity {
  cursor: help;
}
</style>
