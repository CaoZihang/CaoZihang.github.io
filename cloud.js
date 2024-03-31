// 云服务器使用云服务器图床

const fs = require("fs");
const path = require('path');

// 涉及的文件夹路径
const dirs_use = ["./_posts", "./_includes/about", "./_includes/project",
"./_includes/topical", "./_includes/workflow"];

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
async function searchFile(dirs = dirs_use) {
    let target = [];
    for (let i = 0; i < dirs.length; i++) {
        let files = await dirRead(dirs[i]);
        files.forEach(file => {
            if (path.extname(file) === '.md') {
                target.push(dirs[i]+"/"+file)
            }
        })
    }
    target = JSON.stringify(target);
    return target;
}

// searchFile(dirs = dirs_use).then(data => {
//     console.log(data);
// })


//  ----------------------------------------


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

// 处理文件
async function dealmd(path) {
    let content = await Read(path);

    const pattern = /https:\/\/img.caozihang.com\/img\//g;
    content = content.replace(pattern, 'http://cnimg.caozihang.com/');
    fs.writeFile(path, content, (err) => {
        if (err) {
            console.log(err);
            throw err;
        }
    })
}

// dealmd("./_posts/2023-02-15-week.md").then(() => {
//     console.log("处理完成");
// })


//  ----------------------------------------


// 链接函数
function agency(data) {
    data = JSON.parse(data);
    const Promises = data.map(async md => {
        await dealmd(md);
    });
    Promise.all(Promises).then(() => {
        console.log("处理完成");
    });
}

searchFile(dirs_use).then(data => {
    agency(data);
})