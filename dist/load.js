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
const path = require('path');
const axios = require('axios');
const httpsProxyAgent = require('https-proxy-agent');
const data = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0'
    },
    outPath: './fonts',
};
const argv = require('yargs')
    .usage('Usage: $0 -s [str] -p [str]')
    .demandOption(['s'])
    .alias('s', 'source')
    .nargs('s', 1)
    .string((['s', 'p']))
    .describe('s', 'Link to Goggle Fonts css file')
    .alias('p', 'proxy')
    .nargs('p', 1)
    .describe('p', 'Proxy configuration in format http://login:password@address:port/')
    .help('h')
    .alias('h', 'help')
    .argv;
const cssLink = argv.source;
const proxyAddress = argv.proxy;
const agent = proxyAddress ? new httpsProxyAgent(proxyAddress) : undefined;
const outPath = data.outPath;
const removeOldFonts = (directory) => {
    fs.readdir(directory, (err, files) => {
        if (err)
            throw err;
        for (const file of files) {
            fs.unlink(path.join(directory, file), (err) => {
                if (err)
                    throw err;
            });
        }
    });
};
const getFontsLinks = (cssLink) => {
    return new Promise((resolve, reject) => {
        axios({
            method: 'get',
            url: cssLink,
            responseType: 'text',
            headers: data.headers,
            httpsAgent: agent,
        })
            .then((response) => response.data)
            .then((text) => {
            fs.writeFileSync(path.join(outPath, 'style.css'), text.replace(/https:\/\/fonts.gstatic.com[^)]+\/([^/)]+)/ig, '$1'));
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
            httpsAgent: agent,
        })
            .then((response) => {
            response.data.pipe(fs.createWriteStream(path.join(outPath, fileName))
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
fs.access(outPath, fs.constants.F_OK, (err) => {
    if (err) {
        fs.mkdir(outPath, (err) => {
            if (err)
                throw err;
        });
    }
    else {
        removeOldFonts(outPath);
    }
});
getFontsLinks(cssLink)
    .then((fontLinks) => {
    return loadFonts(fontLinks);
})
    .then(console.log)
    .catch(console.error);
