const fs = require('fs');
const axios = require('axios');

const cssLink = 'https://fonts.googleapis.com/css?family=Roboto:400,400i,500&display=swap&subset=cyrillic,cyrillic-ext';
const outPath = './fonts/';
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0'
};
// const agent = new httpsProxyAgent('http://login:password@192.168.0.1:3128/');

fs.access(outPath, fs.constants.F_OK, (err: Error) => err && fs.mkdirSync(outPath));

const getFontsLinks = (cssLink: string): Promise<string[]> => {
    return new Promise((resolve, reject) => {
		axios({
            method: 'get',
            url: cssLink,
            responseType: 'text',
            headers,
            // httpsAgent: agent,
        })
        .then((response: any) => response.data)
        .then((text: string) => {
            fs.writeFileSync(`${outPath}/style.css`, text.replace(/https:\/\/fonts.gstatic.com\/s\/roboto\/v20\//ig, ''));
            const re = new RegExp(/url\((https:\/\/fonts\.[^)]+)\)/ig);
            const fontLinks: string[] = [];
            let ar: RegExpExecArray | null;
            while ((ar = re.exec(text)) !== null){
                fontLinks.push(ar[1]);
            }
            resolve(fontLinks);
        })
        .catch(console.error);
    })
}

const loadFont = (link: string) => {
    return new Promise((resolve, reject) => {
        const m = link.match(/\/([^/]+\.[^./]+)$/i);
        if (!m || m.length < 2){
            reject();
            return; // Сюда не дойдет, но иначе линтер ругается
        }
        const fileName = m[1];
        console.log(fileName);
        
        resolve()
        
        // const fileName = m[0];
        // console.log(fileName);
        
        // https://fonts.gstatic.com/s/roboto/v20/KFOkCnqEu92Fr1Mu51xEIzIFKw.woff2
        
        // axios({
        //     method:'get',
        //     url: link,
        //     responseType:'stream',
        //     headers,
        //     // httpsAgent: agent,
        // })
        // .then((response: any) => {
        //     response.data.pipe(
        //         fs.createWriteStream(fileName)
        //             .on('finish', () => {
        //                 resolve(`${fileName} loaded`);
        //             })
        //     )
        // })
        // .catch(console.error);
    })
}

const loadFonts = async (fontLinks: string[]) => {
    for (let index = 0; index < fontLinks.length; index++) {
        const link = fontLinks[index];
        // console.log(`${link} loading...`);
        await loadFont(link)
        // console.log(`${link} loaded`);
    }
}

getFontsLinks(cssLink)
    .then((fontLinks: string[]) => {
        loadFonts(fontLinks);
    })
    .catch(console.error)