// components/playlist/playlist.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    playlist: {
      type: Object
    }
  },

  observers: {
    ["playlist.playCount"](count) {
      this.setData({ _count: this._transNum(count, 2) });
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    _count: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toMusicList() {
      wx.navigateTo({
        url: `../../pages/musiclist/musiclist?playlistID=${
          this.properties.playlist.id
        }`
      });
    },
    _transNum(num, point) {
      let numStr = num.toString().split(".")[0];
      if (numStr.length < 6) {
        return numStr;
      } else if (numStr.length >= 6 && numStr.length < 8) {
        let decimal = numStr.substring(
          numStr.length - 4,
          numStr.length - 4 + point
        );
        return `${parseInt(numStr / 10000)}.${decimal}万`;
      } else if (numStr.length >= 8) {
        let decimal = numStr.substring(
          numStr.length - 8,
          numStr.length - 8 + point
        );
        return `${parseInt(numStr / 100000000)}.${decimal}亿`;
      }
    }
  }
});
