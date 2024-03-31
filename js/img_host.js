// 修改云服务中博客镜像的图床为云服务器图床镜像
window.onload = function() {
    // console.log("[[[[[[[[");
    let domain = window.location.hostname;
    // console.log(domain);
    if (domain != "www.caozihang.com") {
        let imgs = document.querySelectorAll('img');
        const regex = /https:\/\/img.caozihang.com\/img\//;
        const replacement = "http://cnimg.caozihang.com/";

        // console.log(imgs);
        for (let i = 0; i < imgs.length; i++) {
            console.log(imgs[i].src);
            if (regex.test(imgs[i].src)) {
                imgs[i].src = imgs[i].src.replace(regex, replacement);
            }
        }
    }
}
