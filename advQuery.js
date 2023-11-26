// 针对每周阅读摘选设计的查询方案

const fs = require("fs");
const path = require('path');

// 文件夹读取函数-core
function dirRead(direction) {
    return new Promise((resolve, reject) => {
        fs.readdir(direction, (err, files) => {
            if (err) {
                reject(console.error('读取目录时发生错误：', err));
            };
            resolve(files);
        })
    })
}

// 文件夹读取函数-full
async function searchFile(direction = "./_posts") {
    let target = [];
    let files = await dirRead(direction);
    files.forEach(file => {
        if (path.extname(file) === '.md') {
            target.push(file)
        }
    })
    target = JSON.stringify(target);
    return target;
}

// Log存储函数
function writeLog(target, path = './standalone/hub/hub.md') {
    let preface =
`---
    permalink: /z2_topical_hub/hub
    hide-in-nav: true
    layout: none
---
# <center center > <font color="#3879B1">专栏丨Topic Hub</font></center >\n`;
    target = preface + target;
    fs.writeFile(path, target, (err) => {
        if (err) {
            console.log(err);
            throw err;
        }
    })
}


// 读取函数
function Read(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf-8', (err, data) => {
            if (err) {
                reject(console.log(err))
            }
            resolve(data)
        })
    })
}

// Log读取函数
async function readLog(path = './_includes/hub.txt') {
    let data = await Read(path);
    return data;
}

// 读取文件
async function readmd(path) {
    let content = await Read(path);
    const pattern = /\d{4}-\d{1,2}-\d{1,2}-week.md/;
    if (pattern.test(path)) {
        return [content, 1, path];
    } else {
        return [content, 2, path];
    }
}

// 文件处理
function extract(md, type, domain, path, table) {
    // tagFilter函数
    if (type === 1){
        const pattern = /[^#]## \[?([^\]\[\r\n]*)/g;
        match = md.matchAll(pattern);
        for (let i of match) {
            link = output(domain, path, i[1], 1);
            // console.log(path);
            // console.log(link);
            // console.log(i[1])
            table.push(link)
        };
    } else if (type === 2){
        const pattern = /title: *"([^"]*)/;
        match = md.match(pattern);
        link = output(domain, path, match[1], 2);
        // console.log(link);
        table.push(link)
    } else {
        console.log('type error');
    }
    // console.log(table);
    return table;
}

// output
function output(domain, path, subtitle, type) {
    const pattern = /(\d{4})-(\d{1,2})-(\d{1,2})-([^.]*)/;
    let match = path.match(pattern);
    let url_path = match[1] + "/" + match[2] + "/" + match[3] + "/" + match[4] + "/";
    if (type === 1) {
        const pattern2 = /[\u4e00-\u9fa5 A-Za-z0-9-]*/g;
        url_subtitle = subtitle.match(pattern2).join('').trim().replace(/ /g, '-').toLowerCase();
        url_subtitle = "#" + url_subtitle;
        readSymbol = '【阅】';
    } else {
        readSymbol = "";
        url_subtitle = '';
    }
    let str = `[${readSymbol+subtitle}](${domain + "/" + url_path + url_subtitle})`;
    // let str = `<a href= ${domain + "/" + url_path + url_subtitle}>::marker ${subtitle}</a>`;
    return str
}
// splitLog
function splitLog(data, domain, table) {
    const basepath = './_posts/';
    data = JSON.parse(data);
    // data.forEach(md => {
    //     readmd(path.join(basepath, md)).then((md) => extract(md[0], md[1], domain, md[2], table));
    // })
    const promises = data.map(async md => {
        const mypath = path.join(basepath, md);
        const md_1 = await readmd(mypath);
        return extract(md_1[0], md_1[1], domain, md_1[2], table);
    });
    Promise.all(promises).then(tables => {
        let table = tables[0];
        let toc = "";
        const head = "\n- ";
        for (let i = 0; i < table.length; i++) {
            toc += head + table[i];
        }
        return toc;
    }).then(toc => {
        writeLog(toc);
    });
}

// 查+写
// searchFile().then(files => writeLog(files));

// 读+处理
// readLog().then(mylog => splitLog(mylog)).catch(err => console.error(err));

// 查+处理+写
let table = [];
domain = "https://www.caozihang.com";
searchFile().then(mylog => splitLog(mylog, domain, table)).catch(err => console.error(err));
