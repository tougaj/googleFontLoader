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
const data = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0'
    },
    outPath: './fonts/',
};
const argv = require('yargs')
    .usage('Usage: $0 -s [str]')
    .demandOption(['s'])
    .alias('s', 'source')
    .nargs('s', 1)
    .string((['s']))
    .describe('s', 'Link to Goggle Fonts css file')
    .help('h')
    .alias('h', 'help')
    .argv;
const cssLink = argv.source;
fs.access(data.outPath, fs.constants.F_OK, (err) => err && fs.mkdirSync(data.outPath));
const getFontsLinks = (cssLink) => {
    return new Promise((resolve, reject) => {
        axios({
            method: 'get',
            url: cssLink,
            responseType: 'text',
            headers: data.headers,
        })
            .then((response) => response.data)
            .then((text) => {
            fs.writeFileSync(`${data.outPath}/style.css`, text.replace(/https:\/\/fonts.gstatic.com\/s\/roboto\/v20\//ig, ''));
            const re = new RegExp(/url\((https:\/\/fonts\.[^)]+)\)/ig);
            const fontLinks = [];
            let ar;
            while ((ar = re.exec(text)) !== null) {
                fontLinks.push(ar[1]);
            }
            resolve(fontLinks);
        });
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
        axios({
            method: 'get',
            url: link,
            responseType: 'stream',
            headers: data.headers,
        })
            .then((response) => {
            response.data.pipe(fs.createWriteStream(`${data.outPath}${fileName}`)
                .on('finish', () => {
                resolve(`${fileName} loaded`);
            }));
        });
    });
};
const loadFonts = (fontLinks) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Total fonts: ${fontLinks.length}`);
    for (let index = 0; index < fontLinks.length; index++) {
        const link = fontLinks[index];
        const result = yield loadFont(link);
        console.log(result);
    }
    return 'All fonts loaded';
});
getFontsLinks(cssLink)
    .then((fontLinks) => {
    return loadFonts(fontLinks);
})
    .then(console.log)
    .catch(console.error);
