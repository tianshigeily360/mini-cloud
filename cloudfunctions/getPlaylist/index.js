// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

const db = cloud.database();

const rp = require("request-promise");

const playlistCollection = db.collection("playlist");
// 云函数获取条数限制 100条
const MAX_LIMIT = 100;

// 云函数入口函数
exports.main = async (event, context) => {
  const playlist = await rp("http://musicapi.xiecheng.live/personalized").then(
    res => {
      return JSON.parse(res).result;
    }
  );
  // 突破云函数获取条数限制
  const { total } = await playlistCollection.count();
  const length = Math.ceil(total / MAX_LIMIT);
  // 把所有次数的请求数据任务放在一个数组中，之后通过 Promise.all 做异步请求
  const task = [];
  for (let i = 0; i < length; i++) {
    let promise = playlistCollection
      .skip(i * MAX_LIMIT)
      .limit(MAX_LIMIT)
      .get();
    task.push(promise);
  }

  let list = {
    data: []
  };
  // 如果有数据需要请求，通过 Promise.all 请求数据然后对结果迭代进行处理
  if (task.length > 0) {
    list = (await Promise.all(task)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data)
      };
    });
  }

  // 对接口请求的歌单数据信息做去重处理
  let newData = [];
  for (let i = 0, len1 = playlist.length; i < len1; i++) {
    let flag = true;
    for (let j = 0, len2 = list.data.length; j < len2; j++) {
      if (list.data[j].id === playlist[i].id) {
        flag = false;
        break;
      }
    }
    if (flag) {
      newData.push(playlist[i]);
    }
  }

  for (let i = 0, len = newData.length; i < len; i++) {
    await playlistCollection
      .add({
        data: {
          ...newData[i],
          creatime: db.serverDate()
        }
      })
      .then(res => {
        console.log("数据存储成功");
      })
      .catch(err => {
        console.error("数据存储失败");
      });
  }
  return newData.length;
};
