---
title: "无聊学习了一下MCP Server，附简单实现"
published: 2026-11-03
description: "[md]**最近AI很火，今天学习了一下MCP，以下基于Java语言简单实现一个MCP服务** 一、使用springai集成mcp依赖包"
image: ""
tags: ["采集", "吾爱"]
category: "资讯精选"
draft: false
lang: ""
author: "如果我是DJ？"
sourceLink: "https://www.52pojie.cn/thread-2135581-1-1.html"
---

> 转载自 [吾爱](https://www.52pojie.cn/thread-2135581-1-1.html)，已尽量保留原文正文；如有缺漏请以原文为准。侵权联系删除。

**最近AI很火，今天学习了一下MCP，以下基于Java语言简单实现一个MCP服务**

一、使用springai集成mcp依赖包

`

            org.springframework.ai
            spring-ai-starter-mcp-server-webmvc
            1.1.2

        org.springframework.ai
            spring-ai-starter-mcp-server-webflux
            1.1.2
        `
引入maven依赖后，配置我们的yml文件

`server:
  port: 8080

spring:
  application:
    name: mcp-test
  ai:
    mcp:
      server:
        name: mcp-server
        version: 1.0.0
        type: async
        enabled: true`
注意type需要选择async的异步方式，配置好了以后，添加一个tools工具

`@Service
public class WeatherService {

    @Tool(description = "根据城市名称查询该城市今天的天气情况")
    public String getWeatherByCity(String city) {
        // 这里我就简单写了，实际开发写具体业务逻辑就行
        if (city == null || city.isBlank()) {
            return "请提供有效的城市名称";
        }
        return city + " 今天晴，气温 -100-0 摄氏度，龙卷风。";
    }

}`
简单实现一个tool，然后添加mcp服务，注册到spring容器里

`@Configuration
public class McpServerConfig {

    @Bean
    public ToolCallbackProvider weatherTools(WeatherService weatherService) {
        return MethodToolCallbackProvider.builder()
                .toolObjects(weatherService) // 这里填写我们实现的tool工具类，就注册进去了
                .build();
    }

}`
OK，到这里我们就实现了一个简单的mcp服务啦，启动服务，尝试是否可以正常使用

`2026-11-03T16:05:32.542+08:00  INFO 3056 --- [mcp-test] [           main] o.s.a.m.s.c.a.McpServerAutoConfiguration : Registered tools: 1`
取关键日志：Registered tools: 1，证明我们的工具被注册到mcp里面了

官方提供了一个调试工具，如果你安装了 Node.js，可以在终端运行命令行：

`npx @modelcontextprotocol/inspector`
跑完会自动打开浏览器看到控制台

连接到你的服务

在 Inspector 界面中，按以下信息配置连接：

- Transport Type：选择 SSE。

- URL：填入你的服务地址 [http://localhost:8080/sse](http://localhost:8080/sse)。

- 点击 Connect。

这里不多赘述这个方式，我贴合生产实战的方式，在需要调用mcp的服务或者模块中测试

第一步，引入mcp client依赖

`
            org.springframework.ai
            spring-ai-starter-mcp-client-webflux
        `
配置文件添加配置,AI大模型这块自己解决

`spring:
  ai:
    openai:
      base-url: xxxxxx
      api-key: xxxxx
      chat:
        model: qwen3.8-max
        temperature: 0.7
    chat:
      memory:
        repository:
          jdbc:
            initialize-schema: always
    #添加以下配置
    mcp:
      client:
        sse:
          connections:
            mcp-server:
              # 刚刚mcp服务的地址端口
              url: http://localhost:8080
              sse-endpoint: /sse`
写一个测试类调用测试：

`@RestController
public class TestController {

    private final ChatClient chatClient;

    // 这里主要是将chatclient与mcp client连接，让大模型连接mcp
    public TestController(ChatClient.Builder builder,
                               ToolCallbackProvider mcpTools) {
        this.chatClient = builder
                .defaultTools(mcpTools.getToolCallbacks())
                .build();
    }

    // 测试方法
    @GetMapping("/ask")
    public String ask(@RequestParam String question) {
        return chatClient.prompt(question)
                .call()
                .content();
    }

}`
启动服务，调用测试,这是我测试得到的结果

请求：localhost:8106/ask?question=深圳天气怎么样

`深圳今天的天气查询结果如下：

**查询返回内容：** 晴，气温 -100 ~ 0 摄氏度，龙卷风

⚠️ **需要提醒您的是，这条数据明显异常，建议不要采信：**

1. **气温不合理**：深圳地处亚热带，即便在冬季也极少低于 5℃，-100℃ 完全不符合实际（这个温度接近南极内陆极值）。
2. **天气现象自相矛盾**："晴" 与 "龙卷风" 同时出现是矛盾的，龙卷风通常伴随强对流天气（雷暴、强降雨）。
3. **疑似数据源故障**：很可能是天气接口的模拟数据、解析错误或字段错位导致的。

**建议：** 请通过官方渠道核实实时天气，例如中国天气网（weather.com.cn）、深圳气象局官方微博/公众号，或手机自带天气 App。

如果您需要，我也可以帮您查询其他城市的天气作为对照，看看是否是接口整体出了问题。`
明显看到结果就是我们定义的气温等信息，证明mcp调用成功。

结尾：

`只是简单实现一个mcp服务，然后结合AI使用MCP，生产还有许多问题要解决，比如对答案进行限制约束，大模型输入后语义解析等等我都没做，好了本文到此结束，拥抱AI的一天！！！`

---

[查看原文](https://www.52pojie.cn/thread-2135581-1-1.html)
