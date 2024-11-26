/**
 * @Sub-Store-Page
 * CNAME 接口查询去重/重命名 2023-11-16 20:34:08
 * - 入口查询[国内spapi 识别到国外为ip-api] 落地查询[ip-api]
 * - 根据接口返回的真实结果，重新对节点命名。
 * - 添加入口城市、落地国家或地区、国内运营商信息，并对这些数据做持久化缓存（48小时有效期），减少API请求次数，提高运行效率。
 * - 仅兼容 Surge, Loon 客户端。
 * - Surge 需要固定带 ability 参数版本。
 * 特别说明：
 * - 符号：🅳电信 🅻联通 🆈移动 🅶广电 🅲公司 🆉直连 🎮游戏
 * - 首次运行或者在没有缓存的情况下会通知进度
 * - 无参数时的节点命名格式: "美国 01"
 * - 1. 官方默认版(目前不带 ability 参数, 不保证以后不会改动): 》https://raw.githubusercontent.com/sub-store-org/Sub-Store/master/config/Surge.sgmodule
 *
 * - 2. 固定带 ability 参数版本,可能会爆内存, 如果需要使用指定节点功能 例如 [加国旗脚本或者cname脚本] 请使用此带 ability 参数版本: https://raw.githubusercontent.com/sub-store-org/Sub-Store/master/config/Surge-ability.sgmodule
 *
 * - 3. 固定不带 ability 参数版本：https://raw.githubusercontent.com/sub-store-org/Sub-Store/master/config/Surge-Noability.sgmodule
 *
 * - 参数必须以"#"开头，多个参数使用"&"连接，例如 https://github.com/Keywos/rule/raw/main/cname.js#city&iisp&name=Name
 * - 以下是此脚本支持的参数，必须以"#"开头，多个参数使用"&"连接，需要传入参数的话用 "=" 例如 "name=一元" 参考上述地址为例使用参数。
 * - 无参数时的节点命名格式: "美国 01"，如果 [入口IP或国家]或 [落地IP或国家]一样则为 "直连 德国 01"
 * - 首次运行或者在没有缓存的情况下会通知进度
 *
 *
 * 入口参数
 * - [iisp]      增加入口运营商或者直连标识；
 * - [city]      增加入口城市文字标识；
 * - [sheng]     增加入口省份文字标识；
 * - [yuan]      为境外入口添加真实的入口属地标识，当未配置此此参数时，则将境外入口统一标记为 [境外]，默认未配置此参数；
 * - [inflag]    增加入口国旗
 *
 * 落地参数
 * - [yisp]      显示落地详细运营商名称；
 * - [yw]        落地归属地使用英文缩写标识，不建议与其他入口参数配合使用，因为其他参数API没有返回英文；
 * - [xy]        此参数关闭落地查询，仅查询入口；开启 yisp || yw || flag 参数后 xy 参数无效
 *
 * 图标参数
 * - [game]      增加游戏节点标识；
 * - [flag]      增加国家或地区的旗帜标识，默认无此参数；
 * - [bl]        保留倍率标识；
 * - [snone]     清理某地区内只有一个节点的序号；
 *
 * 分隔符参数
 * - [fgf=]      设置入口和落地之间的分隔符，默认为空格；
 * - [sn=]       设置国家与序号之间的分隔符，默认为空格；
 * - [name=]     为节点添加机场名称前缀；
 *
 * 通知参数
 * - [offtz]     关闭脚本通知；
 *
 * 解析参数
 * - [dnsjx]     将节点域名解析为IP，普通用户不建议使用；
 *
 * 逻辑参数
 * - [bs=]       批处理节点数建议10个左右，如果经常读不到节点建议减小批处理个数；
 *
 * 缓存参数
 * - [h=]        节点缓存有效期，单位小时，时间参数只能二选一，Loon用户不需填写要此参数，请进入Sub-Store插件的配置界面自定义缓存有效期；
 * - [min=]      节点缓存有效期，单位分钟，时间参数只能二选一，Loon用户不需填写要此参数，请进入Sub-Store插件的配置界面自定义缓存有效期；
 *
 * 超时参数
 * - [timeout=]  当无任何节点缓存时测试节点HTTP延时允许的最大超时参数，超出允许范围则判定为无效节点，默认2000ms；
 * - [cd=]       当有缓存时，会先读取缓存，直接输出结果；默认 [cd=]的值等于0，微直接读取缓存；
当设为更高的值: 比如'460'则每次读缓存都会再次处理之前判定为超时的节点,超时为460ms
*
* 其他参数
* - [debug]     调试日志，普通用户不建议使用。
* - 异常：如遇问题，Loon可以进入[配置]→[持久化缓存]→[删除指定数据]→输入Key [sub-store-cached-script-resource]并删除缓存。累计输出节点为0个3次以上将清理所有缓存
* - Surge需要进入[脚本编辑器]→左下角[设置]→[$persistentStore]  [sub-store-cached-script-resource]删除缓存数据。
*/
const SUB_STORE_SCHEMA = {
  title: "CNAME",
  description: "根据接口返回的真实结果，重新对节点命名/去重。 如：入口/落地详细地区信息",
  scope: ["Surge", "Loon"],
  author: "@Key @奶茶姐 @小一 @可莉",
  updateTime: "2023-11-11 18:26:00",
  version: "1.2.2",
  params: {
    flag: {
      datatype: "boolean",
      description: "增加落地国家或地区的旗帜标识，默认无此参数",
      defaultValue: false,
    },
    inflag: {
      datatype: "boolean",
      description: "增加入口国家或地区的旗帜标识，默认无此参数",
      defaultValue: false,
    },
    xy: {
      datatype: "boolean",
      description: "关闭落地查询，仅查询入口；开启 yisp || yw || flag 参数后 xy 参数无效",
      defaultValue: false,
    },
    iisp: {
      datatype: "boolean",
      description: "增加入口运营商或者直连标识",
      defaultValue: false,
    },
    city: {
      datatype: "boolean",
      description: "增加入口城市文字标识",
      defaultValue: false,
    },
    sheng: {
      datatype: "boolean",
      description: "增加入口省份文字标识",
      defaultValue: false,
    },
    yuan: {
      datatype: "boolean",
      description: "为境外入口添加真实的入口属地标识，当未配置此此参数时，则将境外入口统一标记为[境外]，默认未配置此参数",
      defaultValue: false,
    },
    yisp: {
      datatype: "boolean",
      description: "显示落地详细运营商名称",
      defaultValue: false,
    },
    yw: {
      datatype: "boolean",
      description: "落地归属地使用英文缩写标识，不建议与其他入口参数配合使用，因为其他参数API没有返回英文",
      defaultValue: false,
    },
    game: {
      datatype: "boolean",
      description: "增加游戏节点标识",
      defaultValue: false,
    },
    bl: {
      datatype: "boolean",
      description: "保留倍率标识",
      defaultValue: false,
    },
    snone: {
      datatype: "boolean",
      description: "清理某地区内只有一个节点的序号",
      defaultValue: false,
    },
    offtz: {
      datatype: "boolean",
      description: "关闭脚本通知",
      defaultValue: false,
    },
    dnsjx: {
      datatype: "boolean",
      description: "将节点域名解析为IP, 普通用户不建议使用",
      defaultValue: false,
    },
    debug: {
      datatype: "boolean",
      description: "调试日志，普通用户不建议使用",
      defaultValue: false,
    },
    fgf: {
      datatype: "string",
      description: "设置入口和落地之间的分隔符，默认为空格",
      defaultValue: " ",
    },
    sn: {
      datatype: "string",
      description: "设置国家与序号之间的分隔符，默认为空格",
      defaultValue: " ",
    },
    name: {
      datatype: "string",
      description: "为节点添加机场名称前缀",
      defaultValue: "",
    },
    timeout: {
      datatype: "number",
      description: "当无任何节点缓存时测试节点HTTP延时允许的最大超时参数，超出允许范围则判定为无效节点，默认2000ms",
      defaultValue: 2000,
    },
    cd: {
      datatype: "number",
      description: "当有缓存时，会先读取缓存，直接输出结果；默认[cd=]的值等于0，微直接读取缓存； 当设为更高的值: 比如'460'则每次读缓存都会再次处理之前判定为超时的节点,超时为460ms",
      defaultValue: 0,
    },
    bs: {
      datatype: "number",
      description: "批处理节点数建议10个左右，如果经常读不到节点建议减小批处理个数",
      defaultValue: 10,
    },
    h: {
      datatype: "number",
      description: "节点缓存有效期，单位小时，时间参数只能二选一，Loon用户不需填写要此参数，请进入Sub-Store插件的配置界面自定义缓存有效期",
      defaultValue: "",
    },
    min: {
      datatype: "number",
      description: "节点缓存有效期，单位分钟，时间参数只能二选一，Loon用户不需填写要此参数，请进入Sub-Store插件的配置界面自定义缓存有效期",
      defaultValue: "",
    },
  },
};
