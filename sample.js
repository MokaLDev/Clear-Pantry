// 请安装 OpenAI SDK : npm install openai
// apiKey 获取地址： https://console.bce.baidu.com/qianfan/ais/console/apiKey
// 支持的模型列表： https://cloud.baidu.com/doc/qianfan-docs/s/7m95lyy43
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.API_KEY;

import OpenAI from "openai";
const openai = new OpenAI({
    baseURL: 'https://qianfan.baidubce.com/v2',
    apiKey: apiKey,
    defaultHeaders: {"appid":"undefined"}
});

async function main() {
  const response = await openai.chat.completions.create({
                "model": "kimi-k2.6",
                "messages": [
                        {
                                "role": "user",
                                "content": [
                                        {
                                                "type": "image_url",
                                                "image_url": {
                                                        "url": "data:image/jpeg;base64,/9j/"// complete link here
                                                }
                                        },
                                        {
                                                "type": "text",
                                                "text": "帮我识别下这张照片里有什么东西"
                                        }
                                ]
                        },
                        {
                                "role": "assistant",
                                "content": ""
                        }
                ],
                "stop": [],
                "enable_thinking": true
        });

  console.log(response);
}

main();