"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const fs = require('fs');
const axios = require('axios');
const cssLink = 'https://fonts.googleapis.com/css?family=Roboto:400,400i,500&display=swap&subset=cyrillic,cyrillic-ext';
const outPath = './fonts/';
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0'
};
const getFontsLinks = (cssLink) => {
    return new Promise((resolve, reject) => {
        axios({
            method: 'get',
            url: cssLink,
            responseType: 'text',
            headers,
        })
            .then((response) => response.data)
            .then((text) => {
            fs.writeFileSync(`${outPath}/style.css`, text.replace(/https:\/\/fonts.gstatic.com\/s\/roboto\/v20\//ig, ''));
            const re = new RegExp(/url\((https:\/\/fonts\.[^)]+)\)/ig);
            const fontLinks = [];
            let ar;
            while ((ar = re.exec(text)) !== null) {
                fontLinks.push(ar[1]);
            }
            resolve(fontLinks);
        })
            .catch(console.error);
    });
};
const loadFont = (link) => {
    return new Promise((resolve, reject) => {
        const m = link.match(/\/([^/]+\.[^./]+)$/i);
        if (!m || m.length < 2) {
            reject();
            return;
        }
        const fileName = m[1];
        console.log(fileName);
        resolve();
    });
};
const loadFonts = (fontLinks) => __awaiter(void 0, void 0, void 0, function* () {
    for (let index = 0; index < fontLinks.length; index++) {
        const link = fontLinks[index];
        yield loadFont(link);
    }
});
getFontsLinks(cssLink)
    .then((fontLinks) => {
    loadFonts(fontLinks);
})
    .catch(console.error);
