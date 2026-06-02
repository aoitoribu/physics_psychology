export const MUSIC_PLAYER_CONFIG = {
  enabled: true,

  // 在这里选择音乐来源：netease / qq / kugou
  provider: "netease",

  // 在这里选择播放类型：song / playlist
  // 说明：网易云支持 song 和 playlist；QQ 官方外链更适合 song；
  // 酷狗建议填写官方分享页、开放组件或可嵌入播放器地址到 customEmbedUrl。
  itemType: "song",

  // 在这里填写歌曲 ID 或歌单 ID。
  // 网易云：歌曲/歌单页面 URL 里的 id。
  // QQ 音乐：单曲使用 songid；歌单和酷狗建议优先使用 customEmbedUrl。
  id: "1833805540",

  // 单曲默认自动播放；歌单由平台播放器按顺序播放。
  autoplay: true,

  // 填写后优先使用，适合 QQ 歌单、酷狗或其他官方可嵌入播放器地址。
  customEmbedUrl: ""
};
