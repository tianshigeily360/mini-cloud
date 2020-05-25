// 云函数入口文件
const cloud = require("wx-server-sdk");
const TcbRouter = require("tcb-router");
const rp = require("request-promise");

cloud.init();

const BASE_URL = "http://musicapi.xiecheng.live";

// 云函数入口函数
exports.main = async (event, context) => {
  // 通过 tcb-router 可以像洋葱模型把多个路由调用进行封装
  const app = new TcbRouter({ event });

  app.router("playlist", async (ctx, next) => {
    ctx.body = await cloud
      .database()
      .collection("playlist")
      .skip(event.offset)
      .limit(event.limit)
      .orderBy("creatime", "desc")
      .get()
      .then(res => {
        return res;
      });
  });

  app.router("musiclist", async (ctx, next) => {
    ctx.body = await rp(
      `${BASE_URL}/playlist/detail?id=${parseInt(event.playlistID)}`
    ).then(res => {
      return JSON.parse(res);
    });
  });

  return app.serve();
};
