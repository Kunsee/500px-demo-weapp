/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
var host = 'https://ny1z4sac.qcloud.la';

var BasicUrl = 'https://api.500px.com/v1/';

var CKEY = 'pd67OURWTmXMy6X1E3DL5jmr9aBAZ9VLjZp4jLvz';

var config = {

    // 下面的地址配合云端 Demo 工作
    service: {
        host,
        BasicUrl,
        CKEY,
        // 登录地址，用于建立会话
        loginUrl: `${host}/weapp/login`,

        // 测试的请求地址，用于测试会话
        requestUrl: `${host}/weapp/user`,

        // 测试的信道服务地址
        tunnelUrl: `${host}/weapp/tunnel`,

        // 上传图片接口
        uploadUrl: `${host}/weapp/upload`,

        // index图片
        photos: `photos`,

        // 评论
        comments: `/comments`,

        // 搜索
        search: `${BasicUrl}photos/search`,

        // 用户列表
        showUser: `${BasicUrl}/users/search`,

        // 用户详细
        getUser: `${BasicUrl}/users/show?id=`
    }
};

module.exports = config;
