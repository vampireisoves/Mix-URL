
// 部署完成后在网址后面加上这个，获取自建节点和机场聚合节点，/?token=auto或/auto或

let mytoken = '7Q23V6O4OaUwv7aY10';
let guestToken = 'be2a1d8b-89a2-4ce7-a34d-b64037d3a5a1'; //可以随便取，或者uuid生成，https://1024tools.com/uuid
let BotToken = ''; //可以为空，或者@BotFather中输入/start，/newbot，并关注机器人
let ChatID = ''; //可以为空，或者@userinfobot中获取，/start
let TG = 0; //小白勿动， 开发者专用，1 为推送所有的访问信息，0 为不推送订阅转换后端的访问信息与异常访问
let FileName = 'SUB-MIX';
let SUBUpdateTime = 6; //自定义订阅更新时间，单位小时
let total = 99;//TB
let timestamp = 4102329600000;//2099-12-31

//节点链接 + 订阅链接
let MainData = `
https://cfxr.eu.org/getSub
`;

let urls = [];
let subConverter = "SUBAPI.cmliussss.net"; //在线订阅转换后端，目前使用CM的订阅转换功能。支持自建psub 可自行搭建https://github.com/bulianglin/psub
let subConfig = "https://raw.githubusercontent.com/cmliu/ACL4SSR/refs/heads/main/Clash/config/ACL4SSR_Online_Mini_MultiMode_CF.ini"; //订阅配置文件
let subProtocol = 'https';

export default {
	async fetch(request, env) {
		const userAgentHeader = request.headers.get('User-Agent');
		const userAgent = userAgentHeader ? userAgentHeader.toLowerCase() : "null";
		const url = new URL(request.url);
		const token = url.searchParams.get('token');
		mytoken = env.TOKEN || mytoken;
		BotToken = env.TGTOKEN || BotToken;
		ChatID = env.TGID || ChatID;
		TG = env.TG || TG;
		subConverter = env.SUBAPI || subConverter;
		if (subConverter.includes("http://")) {
			subConverter = subConverter.split("//")[1];
			subProtocol = 'http';
		} else {
			subConverter = subConverter.split("//")[1] || subConverter;
		}
		subConfig = env.SUBCONFIG || subConfig;
		FileName = env.SUBNAME || FileName;

		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0);
		const timeTemp = Math.ceil(currentDate.getTime() / 1000);
		const fakeToken = await MD5MD5(`${mytoken}${timeTemp}`);
		guestToken = env.GUESTTOKEN || env.GUEST || guestToken;
		if (!guestToken) guestToken = await MD5MD5(mytoken);
		const 访客订阅 = guestToken;
		//console.log(`${fakeUserID}\n${fakeHostName}`); // 打印fakeID

		let UD = Math.floor(((timestamp - Date.now()) / timestamp * total * 1099511627776) / 2);
		total = total * 1099511627776;
		let expire = Math.floor(timestamp / 1000);
		SUBUpdateTime = env.SUBUPTIME || SUBUpdateTime;

		if (!([mytoken, fakeToken, 访客订阅].includes(token) || url.pathname == ("/" + mytoken) || url.pathname.includes("/" + mytoken + "?"))) {
			if (TG == 1 && url.pathname !== "/" && url.pathname !== "/favicon.ico") await sendMessage(`#异常访问 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgent}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
			if (env.URL302) return Response.redirect(env.URL302, 302);
			else if (env.URL) return await proxyURL(env.URL, url);
			else return new Response(await nginx(), {
				status: 200,
				headers: {
					'Content-Type': 'text/html; charset=UTF-8',
				},
			});
		} else {
			if (env.KV) {
				await 迁移地址列表(env, 'LINK.txt');
				if (userAgent.includes('mozilla') && !url.search) {
					await sendMessage(`#编辑订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
					return await KV(request, env, 'LINK.txt', 访客订阅);
				} else {
					MainData = await env.KV.get('LINK.txt') || MainData;
				}
			} else {
				MainData = env.LINK || MainData;
				if (env.LINKSUB) urls = await ADD(env.LINKSUB);
			}
			let 重新汇总所有链接 = await ADD(MainData + '\n' + urls.join('\n'));
			let 自建节点 = "";
			let 订阅链接 = "";
			for (let x of 重新汇总所有链接) {
				if (x.toLowerCase().startsWith('http')) {
					订阅链接 += x + '\n';
				} else {
					自建节点 += x + '\n';
				}
			}
			MainData = 自建节点;
			urls = await ADD(订阅链接);
			await sendMessage(`#获取订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
			const isSubConverterRequest = request.headers.get('subconverter-request') || request.headers.get('subconverter-version') || userAgent.includes('subconverter');
			let 订阅格式 = 'base64';
			if (!(userAgent.includes('null') || isSubConverterRequest || userAgent.includes('nekobox') || userAgent.includes(('CF-Workers-SUB').toLowerCase()))) {
				if (userAgent.includes('sing-box') || userAgent.includes('singbox') || url.searchParams.has('sb') || url.searchParams.has('singbox')) {
					订阅格式 = 'singbox';
				} else if (userAgent.includes('surge') || url.searchParams.has('surge')) {
					订阅格式 = 'surge';
				} else if (userAgent.includes('quantumult') || url.searchParams.has('quanx')) {
					订阅格式 = 'quanx';
				} else if (userAgent.includes('loon') || url.searchParams.has('loon')) {
					订阅格式 = 'loon';
				} else if (userAgent.includes('clash') || userAgent.includes('meta') || userAgent.includes('mihomo') || url.searchParams.has('clash')) {
					订阅格式 = 'clash';
				}
			}

			let subConverterUrl;
			let 订阅转换URL = `${url.origin}/${await MD5MD5(fakeToken)}?token=${fakeToken}`;
			//console.log(订阅转换URL);
			let req_data = MainData;

			let 追加UA = 'v2rayn';
			if (url.searchParams.has('b64') || url.searchParams.has('base64')) 订阅格式 = 'base64';
			else if (url.searchParams.has('clash')) 追加UA = 'clash';
			else if (url.searchParams.has('singbox')) 追加UA = 'singbox';
			else if (url.searchParams.has('surge')) 追加UA = 'surge';
			else if (url.searchParams.has('quanx')) 追加UA = 'Quantumult%20X';
			else if (url.searchParams.has('loon')) 追加UA = 'Loon';

			const 订阅链接数组 = [...new Set(urls)].filter(item => item?.trim?.()); // 去重
			if (订阅链接数组.length > 0) {
				const 请求订阅响应内容 = await getSUB(订阅链接数组, request, 追加UA, userAgentHeader);
				console.log(请求订阅响应内容);
				req_data += 请求订阅响应内容[0].join('\n');
				订阅转换URL += "|" + 请求订阅响应内容[1];
				if (订阅格式 == 'base64' && !isSubConverterRequest && 请求订阅响应内容[1].includes('://')) {
					subConverterUrl = `${subProtocol}://${subConverter}/sub?target=mixed&url=${encodeURIComponent(请求订阅响应内容[1])}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
					try {
						const subConverterResponse = await fetch(subConverterUrl, { headers: { 'User-Agent': 'v2rayN/CF-Workers-SUB  (https://github.com/cmliu/CF-Workers-SUB)' } });
						if (subConverterResponse.ok) {
							const subConverterContent = await subConverterResponse.text();
							// 验证是否为有效的 base64
							if (isValidBase64(subConverterContent)) {
								try {
									req_data += '\n' + atob(subConverterContent);
								} catch (e) {
									console.log('atob 解码失败:', e.message);
								}
							} else {
								console.log('订阅转换返回的不是有效的 base64 数据');
							}
						}
					} catch (error) {
						console.log('订阅转换请回base64失败，检查订阅转换后端是否正常运行');
					}
				}
			}

			if (env.WARP) 订阅转换URL += "|" + (await ADD(env.WARP)).join("|");
			//修复中文错误
			const utf8Encoder = new TextEncoder();
			const encodedData = utf8Encoder.encode(req_data);
			//const text = String.fromCharCode.apply(null, encodedData);
			const utf8Decoder = new TextDecoder();
			const text = utf8Decoder.decode(encodedData);

			//去重
			const uniqueLines = new Set(text.split('\n'));
			const result = [...uniqueLines].join('\n');
			//console.log(result);

			let base64Data;
			try {
				base64Data = btoa(result);
			} catch (e) {
				function encodeBase64(data) {
					const binary = new TextEncoder().encode(data);
					let base64 = '';
					const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

					for (let i = 0; i < binary.length; i += 3) {
						const byte1 = binary[i];
						const byte2 = binary[i + 1] || 0;
						const byte3 = binary[i + 2] || 0;

						base64 += chars[byte1 >> 2];
						base64 += chars[((byte1 & 3) << 4) | (byte2 >> 4)];
						base64 += chars[((byte2 & 15) << 2) | (byte3 >> 6)];
						base64 += chars[byte3 & 63];
					}

					const padding = 3 - (binary.length % 3 || 3);
					return base64.slice(0, base64.length - padding) + '=='.slice(0, padding);
				}

				base64Data = encodeBase64(result)
			}

			// 构建响应头对象
			const responseHeaders = {
				"content-type": "text/plain; charset=utf-8",
				"Profile-Update-Interval": `${SUBUpdateTime}`,
				"Profile-web-page-url": request.url.includes('?') ? request.url.split('?')[0] : request.url,
				//"Subscription-Userinfo": `upload=${UD}; download=${UD}; total=${total}; expire=${expire}`,
			};

			if (订阅格式 == 'base64' || token == fakeToken) {
				return new Response(base64Data, { headers: responseHeaders });
			} else if (订阅格式 == 'clash') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=clash&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'singbox') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=singbox&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'surge') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=surge&ver=4&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'quanx') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=quanx&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&udp=true`;
			} else if (订阅格式 == 'loon') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=loon&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false`;
			}
			//console.log(订阅转换URL);
			try {
				const subConverterResponse = await fetch(subConverterUrl, { headers: { 'User-Agent': userAgentHeader } });//订阅转换
				if (!subConverterResponse.ok) return new Response(base64Data, { headers: responseHeaders });
				let subConverterContent = await subConverterResponse.text();
				if (订阅格式 == 'clash') subConverterContent = await clashFix(subConverterContent);
				// 只有非浏览器订阅才会返回SUBNAME
				if (!userAgent.includes('mozilla')) responseHeaders["Content-Disposition"] = `attachment; filename*=utf-8''${encodeURIComponent(FileName)}`;
				return new Response(subConverterContent, { headers: responseHeaders });
			} catch (error) {
				return new Response(base64Data, { headers: responseHeaders });
			}
		}
	}
};

async function ADD(envadd) {
	var addtext = envadd.replace(/[	"'|\r\n]+/g, '\n').replace(/\n+/g, '\n');	// 替换为换行
	//console.log(addtext);
	if (addtext.charAt(0) == '\n') addtext = addtext.slice(1);
	if (addtext.charAt(addtext.length - 1) == '\n') addtext = addtext.slice(0, addtext.length - 1);
	const add = addtext.split('\n');
	//console.log(add);
	return add;
}

async function nginx() {
	const text = `
	<!DOCTYPE html>
	<html>
	<head>
	<title>Welcome to nginx!</title>
	<style>
		body {
			width: 35em;
			margin: 0 auto;
			font-family: Tahoma, Verdana, Arial, sans-serif;
		}
	</style>
	</head>
	<body>
	<h1>Welcome to nginx!</h1>
	<p>If you see this page, the nginx web server is successfully installed and
	working. Further configuration is required.</p>
	
	<p>For online documentation and support please refer to
	<a href="http://nginx.org/">nginx.org</a>.<br/>
	Commercial support is available at
	<a href="http://nginx.com/">nginx.com</a>.</p>
	
	<p><em>Thank you for using nginx.</em></p>
	</body>
	</html>
	`
	return text;
}

async function sendMessage(type, ip, add_data = "") {
	if (BotToken !== '' && ChatID !== '') {
		let msg = "";
		const response = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`);
		if (response.status == 200) {
			const ipInfo = await response.json();
			msg = `${type}\nIP: ${ip}\n国家: ${ipInfo.country}\n<tg-spoiler>城市: ${ipInfo.city}\n组织: ${ipInfo.org}\nASN: ${ipInfo.as}\n${add_data}`;
		} else {
			msg = `${type}\nIP: ${ip}\n<tg-spoiler>${add_data}`;
		}

		let url = "https://api.telegram.org/bot" + BotToken + "/sendMessage?chat_id=" + ChatID + "&parse_mode=HTML&text=" + encodeURIComponent(msg);
		return fetch(url, {
			method: 'get',
			headers: {
				'Accept': 'text/html,application/xhtml+xml,application/xml;',
				'Accept-Encoding': 'gzip, deflate, br',
				'User-Agent': 'Mozilla/5.0 Chrome/90.0.4430.72'
			}
		});
	}
}

function base64Decode(str) {
	try {
		if (!str || !isValidBase64(str)) {
			console.log('无效的 base64 数据');
			return '';
		}
		const bytes = new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)));
		const decoder = new TextDecoder('utf-8');
		return decoder.decode(bytes);
	} catch (error) {
		console.log('base64 解码失败:', error.message);
		return '';
	}
}

async function MD5MD5(text) {
	const encoder = new TextEncoder();

	const firstPass = await crypto.subtle.digest('MD5', encoder.encode(text));
	const firstPassArray = Array.from(new Uint8Array(firstPass));
	const firstHex = firstPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

	const secondPass = await crypto.subtle.digest('MD5', encoder.encode(firstHex.slice(7, 27)));
	const secondPassArray = Array.from(new Uint8Array(secondPass));
	const secondHex = secondPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

	return secondHex.toLowerCase();
}

function clashFix(content) {
	if (content.includes('wireguard') && !content.includes('remote-dns-resolve')) {
		let lines;
		if (content.includes('\r\n')) {
			lines = content.split('\r\n');
		} else {
			lines = content.split('\n');
		}

		let result = "";
		for (let line of lines) {
			if (line.includes('type: wireguard')) {
				const 备改内容 = `, mtu: 1280, udp: true`;
				const 正确内容 = `, mtu: 1280, remote-dns-resolve: true, udp: true`;
				result += line.replace(new RegExp(备改内容, 'g'), 正确内容) + '\n';
			} else {
				result += line + '\n';
			}
		}

		content = result;
	}
	return content;
}

async function proxyURL(proxyURL, url) {
	const URLs = await ADD(proxyURL);
	const fullURL = URLs[Math.floor(Math.random() * URLs.length)];

	// 解析目标 URL
	let parsedURL = new URL(fullURL);
	console.log(parsedURL);
	// 提取并可能修改 URL 组件
	let URLProtocol = parsedURL.protocol.slice(0, -1) || 'https';
	let URLHostname = parsedURL.hostname;
	let URLPathname = parsedURL.pathname;
	let URLSearch = parsedURL.search;

	// 处理 pathname
	if (URLPathname.charAt(URLPathname.length - 1) == '/') {
		URLPathname = URLPathname.slice(0, -1);
	}
	URLPathname += url.pathname;

	// 构建新的 URL
	let newURL = `${URLProtocol}://${URLHostname}${URLPathname}${URLSearch}`;

	// 反向代理请求
	let response = await fetch(newURL);

	// 创建新的响应
	let newResponse = new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers
	});

	// 添加自定义头部，包含 URL 信息
	//newResponse.headers.set('X-Proxied-By', 'Cloudflare Worker');
	//newResponse.headers.set('X-Original-URL', fullURL);
	newResponse.headers.set('X-New-URL', newURL);

	return newResponse;
}

async function getSUB(api, request, 追加UA, userAgentHeader) {
	if (!api || api.length === 0) {
		return [];
	} else api = [...new Set(api)]; // 去重
	let newapi = "";
	let 订阅转换URLs = "";
	let 异常订阅 = "";
	const controller = new AbortController(); // 创建一个AbortController实例，用于取消请求
	const timeout = setTimeout(() => {
		controller.abort(); // 2秒后取消所有请求
	}, 2000);

	try {
		// 使用Promise.allSettled等待所有API请求完成，无论成功或失败
		const responses = await Promise.allSettled(api.map(apiUrl => getUrl(request, apiUrl, 追加UA, userAgentHeader).then(response => response.ok ? response.text() : Promise.reject(response))));

		// 遍历所有响应
		const modifiedResponses = responses.map((response, index) => {
			// 检查是否请求成功
			if (response.status === 'rejected') {
				const reason = response.reason;
				if (reason && reason.name === 'AbortError') {
					return {
						status: '超时',
						value: null,
						apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
					};
				}
				console.error(`请求失败: ${api[index]}, 错误信息: ${reason.status} ${reason.statusText}`);
				return {
					status: '请求失败',
					value: null,
					apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
				};
			}
			return {
				status: response.status,
				value: response.value,
				apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
			};
		});

		console.log(modifiedResponses); // 输出修改后的响应数组

		for (const response of modifiedResponses) {
			// 检查响应状态是否为'fulfilled'
			if (response.status === 'fulfilled') {
				const content = await response.value || 'null'; // 获取响应的内容
				if (content.includes('proxies:')) {
					//console.log('Clash订阅: ' + response.apiUrl);
					订阅转换URLs += "|" + response.apiUrl; // Clash 配置
				} else if (content.includes('outbounds"') && content.includes('inbounds"')) {
					//console.log('Singbox订阅: ' + response.apiUrl);
					订阅转换URLs += "|" + response.apiUrl; // Singbox 配置
				} else if (content.includes('://')) {
					//console.log('明文订阅: ' + response.apiUrl);
					newapi += content + '\n'; // 追加内容
				} else if (isValidBase64(content)) {
					//console.log('Base64订阅: ' + response.apiUrl);
					newapi += base64Decode(content) + '\n'; // 解码并追加内容
				} else {
					const 异常订阅LINK = `trojan://CMLiussss@127.0.0.1:8888?security=tls&allowInsecure=1&type=tcp&headerType=none#%E5%BC%82%E5%B8%B8%E8%AE%A2%E9%98%85%20${response.apiUrl.split('://')[1].split('/')[0]}`;
					console.log('异常订阅: ' + 异常订阅LINK);
					异常订阅 += `${异常订阅LINK}\n`;
				}
			}
		}
	} catch (error) {
		console.error(error); // 捕获并输出错误信息
	} finally {
		clearTimeout(timeout); // 清除定时器
	}

	const 订阅内容 = await ADD(newapi + 异常订阅); // 将处理后的内容转换为数组
	// 返回处理后的结果
	return [订阅内容, 订阅转换URLs];
}

async function getUrl(request, targetUrl, 追加UA, userAgentHeader) {
	// 设置自定义 User-Agent
	const newHeaders = new Headers(request.headers);
	newHeaders.set("User-Agent", `v2rayN/6.45 cmliu/CF-Workers-SUB ${追加UA}(${userAgentHeader})`);

	// 构建新的请求对象
	const modifiedRequest = new Request(targetUrl, {
		method: request.method,
		headers: newHeaders,
		body: request.method === "GET" ? null : request.body,
		redirect: "follow",
		cf: {
			// 忽略SSL证书验证
			insecureSkipVerify: true,
			// 允许自签名证书
			allowUntrusted: true,
			// 禁用证书验证
			validateCertificate: false
		}
	});

	// 输出请求的详细信息
	console.log(`请求URL: ${targetUrl}`);
	console.log(`请求头: ${JSON.stringify([...newHeaders])}`);
	console.log(`请求方法: ${request.method}`);
	console.log(`请求体: ${request.method === "GET" ? null : request.body}`);

	// 发送请求并返回响应
	return fetch(modifiedRequest);
}

function isValidBase64(str) {
	// 先移除所有空白字符(空格、换行、回车等)
	const cleanStr = str.replace(/\s/g, '');
	const base64Regex = /^[A-Za-z0-9+/=]+$/;
	return base64Regex.test(cleanStr);
}

async function 迁移地址列表(env, txt = 'ADD.txt') {
	const 旧数据 = await env.KV.get(`/${txt}`);
	const 新数据 = await env.KV.get(txt);

	if (旧数据 && !新数据) {
		// 写入新位置
		await env.KV.put(txt, 旧数据);
		// 删除旧数据
		await env.KV.delete(`/${txt}`);
		return true;
	}
	return false;
}

async function KV(request, env, txt = 'ADD.txt', guest) {
	const url = new URL(request.url);
	try {
		// POST请求处理
		if (request.method === "POST") {
			if (!env.KV) return new Response("未绑定KV空间", { status: 400 });
			try {
				const content = await request.text();
				await env.KV.put(txt, content);
				return new Response("保存成功");
			} catch (error) {
				console.error('保存KV时发生错误:', error);
				return new Response("保存失败: " + error.message, { status: 500 });
			}
		}

		// GET请求部分
		let content = '';
		let hasKV = !!env.KV;

		if (hasKV) {
			try {
				content = await env.KV.get(txt) || '';
			} catch (error) {
				console.error('读取KV时发生错误:', error);
				content = '读取数据时发生错误: ' + error.message;
			}
		}

		const html = `
			<!DOCTYPE html>
			<html>
				<head>
					<title>${FileName} 订阅编辑</title>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1">
					<style>
						@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
						
						:root {
							/* 暗色主题（默认） */
							--bg-primary: #0a0a0f;
							--bg-secondary: rgba(15, 15, 25, 0.6);
							--bg-tertiary: rgba(255, 255, 255, 0.03);
							--bg-hover: rgba(99, 102, 241, 0.08);
							--text-primary: #e0e0e0;
							--text-secondary: #9ca3af;
							--text-muted: #6b7280;
							--border-color: rgba(255, 255, 255, 0.08);
							--border-hover: rgba(99, 102, 241, 0.3);
							--accent-primary: #6366f1;
							--accent-secondary: #a855f7;
							--accent-tertiary: #ec4899;
							--accent-success: #10b981;
							--accent-warning: #f59e0b;
							--shadow-color: rgba(0, 0, 0, 0.4);
							--shadow-hover: rgba(0, 0, 0, 0.5);
							--gradient-1: rgba(120, 119, 198, 0.3);
							--gradient-2: rgba(79, 70, 229, 0.2);
							--gradient-3: rgba(139, 92, 246, 0.2);
							--header-bg: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
							--editor-bg: rgba(0, 0, 0, 0.4);
							--input-bg: rgba(0, 0, 0, 0.3);
							--warning-bg: rgba(251, 191, 36, 0.1);
							--warning-border: rgba(251, 191, 36, 0.3);
							--warning-text: #fbbf24;
							--link-color: #a5b4fc;
							--link-hover: #c7d2fe;
							--sub-link-bg: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
							--sub-link-hover: linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%);
							--qrcode-bg: rgba(255, 255, 255, 0.05);
							--qrcode-hover: rgba(255, 255, 255, 0.08);
							--qrcode-dark: #8b5cf6;
							--qrcode-light: rgba(255, 255, 255, 0.05);
							--btn-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
							--footer-color: #6b7280;
							--footer-link: #a5b4fc;
						}
						
						/* 亮色主题 */
						:root[data-theme="light"] {
							--bg-primary: #f8fafc;
							--bg-secondary: rgba(255, 255, 255, 0.8);
							--bg-tertiary: rgba(0, 0, 0, 0.02);
							--bg-hover: rgba(99, 102, 241, 0.05);
							--text-primary: #1e293b;
							--text-secondary: #64748b;
							--text-muted: #94a3b8;
							--border-color: rgba(0, 0, 0, 0.08);
							--border-hover: rgba(99, 102, 241, 0.3);
							--shadow-color: rgba(0, 0, 0, 0.1);
							--shadow-hover: rgba(0, 0, 0, 0.15);
							--gradient-1: rgba(120, 119, 198, 0.15);
							--gradient-2: rgba(79, 70, 229, 0.1);
							--gradient-3: rgba(139, 92, 246, 0.1);
							--header-bg: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
							--editor-bg: rgba(255, 255, 255, 0.9);
							--input-bg: rgba(0, 0, 0, 0.03);
							--warning-bg: rgba(251, 191, 36, 0.1);
							--warning-border: rgba(251, 191, 36, 0.3);
							--warning-text: #d97706;
							--link-color: #6366f1;
							--link-hover: #8b5cf6;
							--sub-link-bg: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%);
							--sub-link-hover: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
							--qrcode-bg: rgba(0, 0, 0, 0.03);
							--qrcode-hover: rgba(0, 0, 0, 0.05);
							--qrcode-dark: #6366f1;
							--qrcode-light: rgba(255, 255, 255, 0.9);
							--footer-color: #64748b;
							--footer-link: #6366f1;
						}
						
						* {
							margin: 0;
							padding: 0;
							box-sizing: border-box;
						}
						
						body {
							font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
							font-size: 14px;
							line-height: 1.6;
							background: var(--bg-primary);
							min-height: 100vh;
							padding: 20px;
							color: var(--text-primary);
							position: relative;
							overflow-x: hidden;
							transition: background 0.3s ease, color 0.3s ease;
						}
						
						body::before {
							content: '';
							position: fixed;
							top: 0;
							left: 0;
							right: 0;
							bottom: 0;
							background: 
								radial-gradient(ellipse 80% 50% at 50% -20%, var(--gradient-1), transparent),
								radial-gradient(ellipse 60% 40% at 80% 60%, var(--gradient-2), transparent),
								radial-gradient(ellipse 50% 40% at 20% 80%, var(--gradient-3), transparent);
							pointer-events: none;
							z-index: 0;
							transition: background 0.3s ease;
						}
						
						.container {
							max-width: 960px;
							margin: 0 auto;
							position: relative;
							z-index: 1;
						}
						
						.header {
							text-align: center;
							margin-bottom: 32px;
							padding: 32px 0;
							background: var(--header-bg);
							border-radius: 24px;
							border: 1px solid var(--border-color);
							backdrop-filter: blur(20px);
							transition: all 0.3s ease;
						}
						
						.header h1 {
							font-size: 28px;
							font-weight: 700;
							background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 50%, var(--accent-tertiary) 100%);
							-webkit-background-clip: text;
							-webkit-text-fill-color: transparent;
							background-clip: text;
							margin-bottom: 8px;
							letter-spacing: -0.5px;
						}
						
						.header p {
							color: var(--text-secondary);
							font-size: 14px;
						}
						
						.theme-toggle {
							position: fixed;
							top: 20px;
							right: 20px;
							z-index: 1000;
							padding: 12px;
							background: var(--bg-secondary);
							border: 1px solid var(--border-color);
							border-radius: 12px;
							cursor: pointer;
							color: var(--text-primary);
							font-size: 20px;
							transition: all 0.3s ease;
							box-shadow: 0 4px 12px var(--shadow-color);
							backdrop-filter: blur(10px);
						}
						
						.theme-toggle:hover {
							background: var(--bg-hover);
							border-color: var(--border-hover);
							transform: scale(1.05);
						}
						
						.card {
							background: var(--bg-secondary);
							backdrop-filter: blur(20px);
							border-radius: 20px;
							padding: 28px;
							margin-bottom: 24px;
							border: 1px solid var(--border-color);
							box-shadow: 
								0 4px 24px var(--shadow-color),
								inset 0 1px 0 rgba(255, 255, 255, 0.05);
							transition: all 0.3s ease;
						}
						
						.card:hover {
							border-color: var(--border-hover);
							box-shadow: 
								0 8px 32px var(--shadow-hover),
								0 0 0 1px rgba(99, 102, 241, 0.1),
								inset 0 1px 0 rgba(255, 255, 255, 0.08);
						}
						
						.card-title {
							font-size: 20px;
							font-weight: 700;
							color: var(--text-primary);
							margin-bottom: 20px;
							padding-bottom: 16px;
							border-bottom: 1px solid var(--border-color);
							display: flex;
							align-items: center;
							gap: 12px;
							letter-spacing: -0.3px;
						}
						
						.card-title::before {
							content: '';
							width: 4px;
							height: 24px;
							background: linear-gradient(180deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
							border-radius: 3px;
							box-shadow: 0 0 12px rgba(99, 102, 241, 0.5);
						}
						
						.sub-item {
							display: flex;
							align-items: flex-start;
							gap: 16px;
							padding: 20px;
							background: var(--bg-tertiary);
							border-radius: 16px;
							margin-bottom: 16px;
							border: 1px solid var(--border-color);
							transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
						}
						
						.sub-item:hover {
							background: var(--bg-hover);
							border-color: var(--border-hover);
							transform: translateY(-2px);
							box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
						}
						
						.qrcode-wrapper {
							flex-shrink: 0;
							padding: 12px;
							background: var(--qrcode-bg);
							border-radius: 12px;
							border: 1px solid var(--border-color);
							transition: all 0.3s ease;
						}
						
						.qrcode-wrapper:hover {
							background: var(--qrcode-hover);
							border-color: var(--border-hover);
							transform: scale(1.05);
						}
						
						.sub-info {
							flex: 1;
							min-width: 0;
						}
						
						.sub-label {
							font-size: 12px;
							color: var(--text-secondary);
							margin-bottom: 8px;
							font-weight: 600;
							text-transform: uppercase;
							letter-spacing: 1px;
						}
						
						.sub-link {
							display: block;
							color: var(--link-color);
							text-decoration: none;
							font-weight: 500;
							word-break: break-all;
							padding: 12px 16px;
							background: var(--sub-link-bg);
							border-radius: 10px;
							transition: all 0.3s ease;
							font-size: 13px;
							border: 1px solid rgba(99, 102, 241, 0.2);
							font-family: 'JetBrains Mono', monospace;
						}
						
						.sub-link:hover {
							background: var(--sub-link-hover);
							border-color: rgba(99, 102, 241, 0.4);
							transform: translateX(4px);
							box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
						}
						
						.guest-toggle {
							display: inline-block;
							padding: 12px 28px;
							background: var(--btn-gradient);
							color: white;
							border: none;
							border-radius: 12px;
							cursor: pointer;
							font-weight: 600;
							font-size: 14px;
							transition: all 0.3s ease;
							margin-top: 12px;
							box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
							letter-spacing: 0.3px;
						}
						
						.guest-toggle:hover {
							transform: translateY(-3px);
							box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
						}
						
						.guest-token {
							display: inline-block;
							padding: 8px 16px;
							background: var(--warning-bg);
							color: var(--warning-text);
							border-radius: 8px;
							font-size: 13px;
							font-weight: 600;
							margin: 12px 0;
							border: 1px solid var(--warning-border);
							font-family: 'JetBrains Mono', monospace;
						}
						
						.config-info {
							display: grid;
							gap: 16px;
						}
						
						.config-item {
							display: flex;
							flex-direction: column;
							padding: 16px;
							background: var(--bg-tertiary);
							border-radius: 12px;
							border: 1px solid var(--border-color);
							transition: all 0.3s ease;
						}
						
						.config-item:hover {
							background: var(--bg-hover);
							border-color: var(--border-hover);
						}
						
						.config-label {
							font-size: 12px;
							color: var(--text-secondary);
							margin-bottom: 8px;
							font-weight: 600;
							text-transform: uppercase;
							letter-spacing: 0.5px;
						}
						
						.config-value {
							color: var(--text-primary);
							word-break: break-all;
							font-size: 13px;
							font-family: 'JetBrains Mono', monospace;
							padding: 8px 12px;
							background: var(--input-bg);
							border-radius: 8px;
							border: 1px solid var(--border-color);
						}
						
						.editor-container {
							width: 100%;
						}
						
						.editor {
							width: 100%;
							height: 400px;
							padding: 20px;
							border: 2px solid var(--border-color);
							border-radius: 16px;
							font-size: 14px;
							line-height: 1.8;
							overflow-y: auto;
							resize: vertical;
							min-height: 250px;
							font-family: 'JetBrains Mono', monospace;
							background: var(--editor-bg);
							color: var(--text-primary);
							transition: all 0.3s ease;
						}
						
						.editor:focus {
							outline: none;
							border-color: var(--accent-primary);
							background: var(--editor-bg);
							box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15), 0 0 24px rgba(99, 102, 241, 0.1);
						}
						
						.editor::placeholder {
							color: var(--text-muted);
						}
						
						.save-container {
							margin-top: 20px;
							display: flex;
							align-items: center;
							gap: 16px;
						}
						
						.save-btn {
							padding: 14px 32px;
							color: white;
							background: var(--btn-gradient);
							border: none;
							border-radius: 12px;
							cursor: pointer;
							font-weight: 700;
							font-size: 14px;
							transition: all 0.3s ease;
							box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
							letter-spacing: 0.3px;
						}
						
						.save-btn:hover {
							transform: translateY(-3px);
							box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
						}
						
						.save-btn:disabled {
							opacity: 0.5;
							cursor: not-allowed;
							transform: none;
							box-shadow: none;
						}
						
						.save-status {
							color: var(--text-secondary);
							font-size: 13px;
							font-weight: 500;
						}
						
						footer {
							text-align: center;
							padding: 24px;
							color: var(--footer-color);
							font-size: 13px;
							margin-top: 24px;
						}
						
						footer a {
							color: var(--footer-link);
							text-decoration: none;
							transition: all 0.3s ease;
							font-weight: 500;
						}
						
						footer a:hover {
							color: var(--link-hover);
							text-decoration: underline;
						}
						
						.ua-info {
							color: var(--footer-color);
							font-size: 12px;
							word-break: break-all;
							margin-top: 12px;
							padding: 12px;
							background: var(--input-bg);
							border-radius: 8px;
							font-family: 'JetBrains Mono', monospace;
							border: 1px solid var(--border-color);
						}
						
						@media (max-width: 768px) {
							body {
								padding: 12px;
							}
							
							.header {
								padding: 24px 16px;
								margin-bottom: 24px;
							}
							
							.header h1 {
								font-size: 24px;
							}
							
							.card {
								padding: 20px;
								border-radius: 16px;
							}
							
							.card-title {
								font-size: 18px;
							}
							
							.sub-item {
								flex-direction: column;
								align-items: center;
								text-align: center;
								padding: 16px;
							}
							
							.qrcode-wrapper {
								margin-bottom: 12px;
							}
							
							.editor {
								height: 300px;
								padding: 16px;
							}
							
							.save-btn {
								padding: 12px 24px;
							}
						}
						
						/* 动画效果 */
						@keyframes fadeIn {
							from {
								opacity: 0;
								transform: translateY(20px);
							}
							to {
								opacity: 1;
								transform: translateY(0);
							}
						}
						
						.card {
							animation: fadeIn 0.5s ease-out;
						}
						
						.card:nth-child(2) {
							animation-delay: 0.1s;
						}
						
						.card:nth-child(3) {
							animation-delay: 0.2s;
						}
						
						.card:nth-child(4) {
							animation-delay: 0.3s;
						}
						
						/* 系统主题偏好设置 */
						@media (prefers-color-scheme: dark) {
							:root:not([data-theme="light"]) {
								--bg-primary: #0a0a0f;
								--bg-secondary: rgba(15, 15, 25, 0.6);
								--bg-tertiary: rgba(255, 255, 255, 0.03);
								--bg-hover: rgba(99, 102, 241, 0.08);
								--text-primary: #e0e0e0;
								--text-secondary: #9ca3af;
								--text-muted: #6b7280;
								--border-color: rgba(255, 255, 255, 0.08);
								--border-hover: rgba(99, 102, 241, 0.3);
								--shadow-color: rgba(0, 0, 0, 0.4);
								--shadow-hover: rgba(0, 0, 0, 0.5);
								--gradient-1: rgba(120, 119, 198, 0.3);
								--gradient-2: rgba(79, 70, 229, 0.2);
								--gradient-3: rgba(139, 92, 246, 0.2);
								--header-bg: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
								--editor-bg: rgba(0, 0, 0, 0.4);
								--input-bg: rgba(0, 0, 0, 0.3);
								--warning-bg: rgba(251, 191, 36, 0.1);
								--warning-border: rgba(251, 191, 36, 0.3);
								--warning-text: #fbbf24;
								--link-color: #a5b4fc;
								--link-hover: #c7d2fe;
								--sub-link-bg: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
								--sub-link-hover: linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%);
								--qrcode-bg: rgba(255, 255, 255, 0.05);
								--qrcode-hover: rgba(255, 255, 255, 0.08);
								--qrcode-dark: #8b5cf6;
								--qrcode-light: rgba(255, 255, 255, 0.05);
								--footer-color: #6b7280;
								--footer-link: #a5b4fc;
							}
						}
						
						@media (prefers-color-scheme: light) {
							:root:not([data-theme="dark"]) {
								--bg-primary: #f8fafc;
								--bg-secondary: rgba(255, 255, 255, 0.8);
								--bg-tertiary: rgba(0, 0, 0, 0.02);
								--bg-hover: rgba(99, 102, 241, 0.05);
								--text-primary: #1e293b;
								--text-secondary: #64748b;
								--text-muted: #94a3b8;
								--border-color: rgba(0, 0, 0, 0.08);
								--border-hover: rgba(99, 102, 241, 0.3);
								--shadow-color: rgba(0, 0, 0, 0.1);
								--shadow-hover: rgba(0, 0, 0, 0.15);
								--gradient-1: rgba(120, 119, 198, 0.15);
								--gradient-2: rgba(79, 70, 229, 0.1);
								--gradient-3: rgba(139, 92, 246, 0.1);
								--header-bg: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
								--editor-bg: rgba(255, 255, 255, 0.9);
								--input-bg: rgba(0, 0, 0, 0.03);
								--warning-bg: rgba(251, 191, 36, 0.1);
								--warning-border: rgba(251, 191, 36, 0.3);
								--warning-text: #d97706;
								--link-color: #6366f1;
								--link-hover: #8b5cf6;
								--sub-link-bg: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%);
								--sub-link-hover: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
								--qrcode-bg: rgba(0, 0, 0, 0.03);
								--qrcode-hover: rgba(0, 0, 0, 0.05);
								--qrcode-dark: #6366f1;
								--qrcode-light: rgba(255, 255, 255, 0.9);
								--footer-color: #64748b;
								--footer-link: #6366f1;
							}
						}
					</style>
					<script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
				</head>
				<body>
					<button class="theme-toggle" onclick="toggleTheme()" title="切换主题">🌙</button>
					<div class="container">
						<div class="header">
							<h1>🚀 ${FileName}</h1>
							<p>多格式订阅汇聚管理平台</p>
						</div>
						<div class="card">
							<div class="card-title">订阅地址</div>
							<button class="guest-toggle" onclick="toggleMainSubs()">查看订阅地址 ∨</button>
							<div id="mainSubsContent" style="display: none;">
								<div class="sub-item">
									<div class="qrcode-wrapper">
										<div id="qrcode_0"></div>
									</div>
									<div class="sub-info">
										<div class="sub-label">自适应订阅</div>
										<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?sub','qrcode_0')" class="sub-link">https://${url.hostname}/${mytoken}</a>
									</div>
								</div>
								<div class="sub-item">
									<div class="qrcode-wrapper">
										<div id="qrcode_1"></div>
									</div>
									<div class="sub-info">
										<div class="sub-label">Base64 订阅</div>
										<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?b64','qrcode_1')" class="sub-link">https://${url.hostname}/${mytoken}?b64</a>
									</div>
								</div>
								<div class="sub-item">
									<div class="qrcode-wrapper">
										<div id="qrcode_2"></div>
									</div>
									<div class="sub-info">
										<div class="sub-label">Clash 订阅</div>
										<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?clash','qrcode_2')" class="sub-link">https://${url.hostname}/${mytoken}?clash</a>
									</div>
								</div>
								<div class="sub-item">
									<div class="qrcode-wrapper">
										<div id="qrcode_3"></div>
									</div>
									<div class="sub-info">
										<div class="sub-label">Sing-box 订阅</div>
										<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?sb','qrcode_3')" class="sub-link">https://${url.hostname}/${mytoken}?sb</a>
									</div>
								</div>
								<div class="sub-item">
									<div class="qrcode-wrapper">
										<div id="qrcode_4"></div>
									</div>
									<div class="sub-info">
										<div class="sub-label">Surge 订阅</div>
										<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?surge','qrcode_4')" class="sub-link">https://${url.hostname}/${mytoken}?surge</a>
									</div>
								</div>
								<div class="sub-item">
									<div class="qrcode-wrapper">
										<div id="qrcode_5"></div>
									</div>
									<div class="sub-info">
										<div class="sub-label">Loon 订阅</div>
										<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?loon','qrcode_5')" class="sub-link">https://${url.hostname}/${mytoken}?loon</a>
									</div>
								</div>
							</div>
							<button class="guest-toggle" onclick="toggleNotice()" style="margin-top: 12px;">查看访客订阅 ∨</button>
						</div>
						
						<div id="noticeContent" style="display: none;">
							<div class="card">
								<div class="card-title">访客订阅</div>
								<p style="color: #6c757d; margin-bottom: 12px; font-size: 13px;">访客订阅只能使用订阅功能，无法查看配置页！</p>
								<div class="guest-token">GUEST TOKEN: ${guest}</div>
								<div class="sub-item">
									<div class="qrcode-wrapper">
										<div id="guest_0"></div>
									</div>
									<div class="sub-info">
										<div class="sub-label">自适应订阅</div>
										<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}','guest_0')" class="sub-link">https://${url.hostname}/sub?token=${guest}</a>
									</div>
								</div>
								<div class="sub-item">
									<div class="qrcode-wrapper">
										<div id="guest_1"></div>
									</div>
									<div class="sub-info">
										<div class="sub-label">Base64 订阅</div>
										<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&b64','guest_1')" class="sub-link">https://${url.hostname}/sub?token=${guest}&b64</a>
									</div>
								</div>
								<div class="sub-item">
									<div class="qrcode-wrapper">
										<div id="guest_2"></div>
									</div>
									<div class="sub-info">
										<div class="sub-label">Clash 订阅</div>
										<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&clash','guest_2')" class="sub-link">https://${url.hostname}/sub?token=${guest}&clash</a>
									</div>
								</div>
								<div class="sub-item">
									<div class="qrcode-wrapper">
										<div id="guest_3"></div>
									</div>
									<div class="sub-info">
										<div class="sub-label">Sing-box 订阅</div>
										<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&sb','guest_3')" class="sub-link">https://${url.hostname}/sub?token=${guest}&sb</a>
									</div>
								</div>
								<div class="sub-item">
									<div class="qrcode-wrapper">
										<div id="guest_4"></div>
									</div>
									<div class="sub-info">
										<div class="sub-label">Surge 订阅</div>
										<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&surge','guest_4')" class="sub-link">https://${url.hostname}/sub?token=${guest}&surge</a>
									</div>
								</div>
								<div class="sub-item">
									<div class="qrcode-wrapper">
										<div id="guest_5"></div>
									</div>
									<div class="sub-info">
										<div class="sub-label">Loon 订阅</div>
										<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&loon','guest_5')" class="sub-link">https://${url.hostname}/sub?token=${guest}&loon</a>
									</div>
								</div>
							</div>
						</div>
						
						<div class="card">
							<div class="card-title">订阅转换配置</div>
							<div class="config-info">
								<div class="config-item">
									<div class="config-label">SUBAPI（订阅转换后端）</div>
									<div class="config-value">${subProtocol}://${subConverter}</div>
								</div>
								<div class="config-item">
									<div class="config-label">SUBCONFIG（订阅转换配置文件）</div>
									<div class="config-value">${subConfig}</div>
								</div>
							</div>
						</div>
						
						<div class="card">
							<div class="card-title">${FileName} 汇聚订阅编辑</div>
							<div class="editor-container">
								${hasKV ? `
								<textarea class="editor" 
									placeholder="LINK 链接添加示例：
vless://246aa795-0637-4f4c-8f64-2c8fb24c1bad@40127.0.0.1:1234?encryption=none&security=tls&sni=TG.cmliussss.loseyourip.com&allowInsecure=1&type=ws&host=TG.cmliussss.loseyourip.com&path=%2F%3Fed%3D2560#CFnat
trojan://aa6ddd2f-d1cf-4a52-ba1b-2640c41a7856@40218.190.230.207:41288?security=tls&sni=hk12.bilibili.com&allowInsecure=1&type=tcp&headerType=none#HK
ss://Y2hhY2hhMjAtaWV0Zi1wb2x5MTMwNTpYbWhoZ2hjakpjaVp1YkVUZXpXZ0RyQjJWbFpUUm5TRzJwYnZKamFERTVWeWIyYjNCRmFUUm5ORlJ6VEdWVk1rOVdiRnBpUjJZMFZESlNSM1J4Y1RsblJYUmpaREprU21SaGRHTnZVMXBSZDJkNVYyRk9iMGR0Vm1kR2NFbHlaRWRhWnpaaE1XeG1hV2N6U2xSb1RtUkJjRUp3V0U1c1prcFNNbGROVXpWbVZWSnZUMHBIU1ZGRk1FZz08OD4.19.31.63:50841
SS


https://sub.xf.free.hr/auto"
									id="content">${content}</textarea>
								<div class="save-container">
									<button class="save-btn" onclick="saveContent(this)">💾 保存配置</button>
									<span class="save-status" id="saveStatus"></span>
								</div>
								` : '<p style="color: #fbbf24; padding: 16px; background: rgba(251, 191, 36, 0.1); border-radius: 12px; margin: 0; border: 1px solid rgba(251, 191, 36, 0.3);">⚠️ 请绑定 <strong>变量名称</strong> 为 <strong>KV</strong> 的 KV 命名空间</p>'}
							</div>
						</div>
						
						<footer>
							关注我 Telegram 获取更多节点！<br>
							<a href="https://t.me/CMLiussss" target="_blank">Telegram 交流群</a><br>
							<br>
							<a href="https://github.com/cmliu/CF-Workers-SUB" target="_blank">GitHub Star Star Star!!!</a>
							<div class="ua-info">UA: ${request.headers.get('User-Agent')}</div>
						</footer>
					</div>
					<script>
function copyToClipboard(text, qrcode) {
						navigator.clipboard.writeText(text).then(() => {
							alert('已复制到剪贴板');
						}).catch(err => {
							console.error('复制失败:', err);
						});
						const qrcodeDiv = document.getElementById(qrcode);
						qrcodeDiv.innerHTML = '';
						
						// 根据当前主题获取颜色
						const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
						const colorDark = isDark ? '#8b5cf6' : '#6366f1';
						const colorLight = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)';
						
						new QRCode(qrcodeDiv, {
							text: text,
							width: 100,
							height: 100,
							colorDark: colorDark,
							colorLight: colorLight,
							correctLevel: QRCode.CorrectLevel.Q,
							scale: 1
						});
					}
						
					if (document.querySelector('.editor')) {
						let timer;
						const textarea = document.getElementById('content');
						const originalContent = textarea.value;
		
						function goBack() {
							const currentUrl = window.location.href;
							const parentUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
							window.location.href = parentUrl;
						}
		
						function replaceFullwidthColon() {
							const text = textarea.value;
							textarea.value = text.replace(/：/g, ':');
						}
						
						function saveContent(button) {
							try {
								const updateButtonText = (step) => {
									button.textContent = \`保存中: \${step}\`;
								};
								// 检测是否为iOS设备
								const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
								
								// 仅在非iOS设备上执行replaceFullwidthColon
								if (!isIOS) {
									replaceFullwidthColon();
								}
								updateButtonText('开始保存');
								button.disabled = true;

								// 获取textarea内容和原始内容
								const textarea = document.getElementById('content');
								if (!textarea) {
									throw new Error('找不到文本编辑区域');
								}

								updateButtonText('获取内容');
								let newContent;
								let originalContent;
								try {
									newContent = textarea.value || '';
									originalContent = textarea.defaultValue || '';
								} catch (e) {
									console.error('获取内容错误:', e);
									throw new Error('无法获取编辑内容');
								}

								updateButtonText('准备状态更新函数');
								const updateStatus = (message, isError = false) => {
									const statusElem = document.getElementById('saveStatus');
									if (statusElem) {
										statusElem.textContent = message;
										statusElem.style.color = isError ? 'red' : '#666';
									}
								};

								updateButtonText('准备按钮重置函数');
								const resetButton = () => {
									button.textContent = '保存';
									button.disabled = false;
								};

								if (newContent !== originalContent) {
									updateButtonText('发送保存请求');
									fetch(window.location.href, {
										method: 'POST',
										body: newContent,
										headers: {
											'Content-Type': 'text/plain;charset=UTF-8'
										},
										cache: 'no-cache'
									})
									.then(response => {
										updateButtonText('检查响应状态');
										if (!response.ok) {
											throw new Error(\`HTTP error! status: \${response.status}\`);
										}
										updateButtonText('更新保存状态');
										const now = new Date().toLocaleString();
										document.title = \`编辑已保存 \${now}\`;
										updateStatus(\`已保存 \${now}\`);
									})
									.catch(error => {
										updateButtonText('处理错误');
										console.error('Save error:', error);
										updateStatus(\`保存失败: \${error.message}\`, true);
									})
									.finally(() => {
										resetButton();
									});
								} else {
									updateButtonText('检查内容变化');
									updateStatus('内容未变化');
									resetButton();
								}
							} catch (error) {
								console.error('保存过程出错:', error);
								button.textContent = '保存';
								button.disabled = false;
								const statusElem = document.getElementById('saveStatus');
								if (statusElem) {
									statusElem.textContent = \`错误: \${error.message}\`;
									statusElem.style.color = 'red';
								}
							}
						}
		
						textarea.addEventListener('blur', saveContent);
						textarea.addEventListener('input', () => {
							clearTimeout(timer);
							timer = setTimeout(saveContent, 5000);
						});
					}

					function toggleMainSubs() {
						const mainSubsContent = document.getElementById('mainSubsContent');
						const mainSubsButtons = document.querySelectorAll('.guest-toggle');
						const mainSubsButton = mainSubsButtons[0];
						if (mainSubsContent.style.display === 'none' || mainSubsContent.style.display === '') {
							mainSubsContent.style.display = 'block';
							mainSubsButton.textContent = '隐藏订阅地址 ∧';
						} else {
							mainSubsContent.style.display = 'none';
							mainSubsButton.textContent = '查看订阅地址 ∨';
						}
					}

					function toggleNotice() {
						const noticeContent = document.getElementById('noticeContent');
						const noticeToggleButtons = document.querySelectorAll('.guest-toggle');
						const noticeToggle = noticeToggleButtons[1];
						if (noticeContent.style.display === 'none' || noticeContent.style.display === '') {
							noticeContent.style.display = 'block';
							noticeToggle.textContent = '隐藏访客订阅 ∧';
						} else {
							noticeContent.style.display = 'none';
							noticeToggle.textContent = '查看访客订阅 ∨';
						}
					}
			
					// 初始化 display 属性和主题
					document.addEventListener('DOMContentLoaded', () => {
						document.getElementById('noticeContent').style.display = 'none';
						document.getElementById('mainSubsContent').style.display = 'none';
						
						// 初始化主题
						initTheme();
					});

					// 主题切换函数
					function toggleTheme() {
						const html = document.documentElement;
						const currentTheme = html.getAttribute('data-theme');
						const newTheme = currentTheme === 'light' ? 'dark' : 'light';
						html.setAttribute('data-theme', newTheme);
						updateThemeIcon(newTheme);
						localStorage.setItem('theme', newTheme);
					}

					// 更新主题图标
					function updateThemeIcon(theme) {
						const toggleBtn = document.querySelector('.theme-toggle');
						if (toggleBtn) {
							toggleBtn.textContent = theme === 'light' ? '🌙' : '☀️';
						}
					}

					// 初始化主题
					function initTheme() {
						const savedTheme = localStorage.getItem('theme');
						const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
						const theme = savedTheme || (prefersDark ? 'dark' : 'light');
						document.documentElement.setAttribute('data-theme', theme);
						updateThemeIcon(theme);
					}
					</script>
				</body>
			</html>
		`;

		return new Response(html, {
			headers: { "Content-Type": "text/html;charset=utf-8" }
		});
	} catch (error) {
		console.error('处理请求时发生错误:', error);
		return new Response("服务器错误: " + error.message, {
			status: 500,
			headers: { "Content-Type": "text/plain;charset=utf-8" }
		});
	}
}