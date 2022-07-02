/**
 * 用 JavaScript 重写代码
 */

// i 志愿拦截跨域请求，只能自己搭建中转后端

const backend_url = "https://119.91.143.55:10242/";

// 从服务器后端获取志愿信息
const getdata = async(index, type) => {
    // 组合请求 URL 
    var reqUrl = backend_url + index + "-" + type + ".json";
    // 发送请求
    var req = await fetch(reqUrl);
    var res = await req.text();
    // 对返回的信息进行解析
    var content = JSON.parse(await res);
    // console.log(content);
    return content;
}

// 志愿 ID 对应
const labelData = {
    0: {
        id: 60,
        text: "青少年服务"
    },
    1: {
        id: 52,
        text: "文明实践"
    },
    2: {
        id: 63,
        text: "公共文明"
    },
    3: {
        id: 65,
        text: "环境保护"
    },
    4: {
        id: 66,
        text: "康乐文化"
    },
    5: {
        id: 67,
        text: "便民服务"
    },
    6: {
        id: 69,
        text: "志愿防疫"
    }, 
}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

// 主入口：用户点击查询
const loadData = async () => {
    let vl = [];
    var rq = 0;
    // 从页面中获取信息
    var length = document.getElementById("length").value;
    let loadel = document.getElementById("loading");
    let loadtxt = document.getElementById("loading-text");
    let searchArea = document.getElementById("searchArea").value.split(" ");
    let banWord = document.getElementById("banWord").value.split(" ");
    localStorage.setItem("DataLength", document.getElementById("length").value);
    localStorage.setItem("searchArea", document.getElementById("searchArea").value);
    localStorage.setItem("banWord", document.getElementById("banWord").value);
    localStorage.setItem("searchCity", document.getElementById("searchCity").value);
    document.getElementById("data-list").innerHTML = "";
    // 检查用户选项
    for (let i = 0; i <= 6; i++) {
        if (document.getElementById("type"+i).checked == true) {
            vl.push(labelData[i]);
        }
    }
    // 展示加载进度条
    loadel.style.display = "block";
    for (let i = 0; i < vl.length; i++) {
        // 循环（志愿类型）
        for (let o = 0; o < Number(length); o++) {
            rq++;
            if (rq % 10 == 0) {
                // 每 10 次停下来 800ms，防止服务器直接崩掉
                console.info("Waiting...");
                await sleep(800);
            }
            // 循环（页数）
            loadtxt.innerText = "正在查询："+ vl[i].text + " (" + (o+1) + "/" + length + ") ";
            let edata = await getdata(o+1,vl[i].id);
            // 再对返回的内容循环输出
            for (let j = 0; j < edata.data.records.length; j++) {
                let each = edata.data.records[j];
                if (each.missionType == vl[i].id && each.city == document.getElementById("searchCity").value) {
                    var isArea = false;
                    var isOK = true;
                    for (let u = 0; u < searchArea.length; u++) {
                        if (searchArea[u] == each.area) isArea = true;
                    }
                    for (let v = 0; v < banWord.length; v++) {
                        if (each.subject.indexOf(banWord[v]) > -1 || each.summary.indexOf(banWord[v]) > -1 || each.remark.indexOf(banWord[v]) > -1) {
                            isOK = false;
                        }
                    }
                    if (isArea && isOK) {
                        let ele = document.createElement("li");
                        ele.classList = "mdui-list-item mdui-ripple";
                        ele.innerHTML = `
                        <div class="mdui-list-item-content" onclick="jump(${each.missionId});">
                            <div class="mdui-list-item-title mdui-list-item-two-line">${each.subject}</div>
                            <div class="mdui-list-item-text">
                                ${each.summary} <b>[${each.remark}]</b>
                                <br>截止日期：${each.endDate}, 地址：${each.city}${each.area}${each.address}
                            </div>
                        </div>`;
                        document.getElementById("data-list").appendChild(ele);
                    }
                }
            }
        }
    }
    loadtxt.innerText = "查询完毕";
    loadel.style.display = "none";
}

const jump = (id) => {
    window.open("https://gz.izyz.org/mission/detail.do?missionId="+id);
}


if (localStorage.getItem("DataLength") && localStorage.getItem("searchArea") && localStorage.getItem("banWord") && localStorage.getItem("searchCity")) {
    document.getElementById("length").value = localStorage.getItem("DataLength");
    document.getElementById("searchArea").value = localStorage.getItem("searchArea");
    document.getElementById("banWord").value = localStorage.getItem("banWord");
    document.getElementById("searchCity").value = localStorage.getItem("searchCity");
}
