const fs = require('fs');
const path = require('path');
const axios = require('axios');
const httpsProxyAgent = require('https-proxy-agent');

const data = {
	headers: {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0'
	},
	outPath: './fonts',
}

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
	// .alias('d', 'directory')
	// .nargs('d', 1)
	// .describe('d', 'Directory name in fonts folder where fonts will be loaded')
	.help('h')
	.alias('h', 'help')
	.argv;

const cssLink = argv.source;
const proxyAddress = argv.proxy;
const agent = proxyAddress ? new httpsProxyAgent(proxyAddress) : undefined;
// const outPath = path.join(data.outPath, argv.directory || '');
const outPath = data.outPath;

const removeOldFonts = (directory: string) => {
	fs.readdir(directory, (err: Error, files: string[]) => {
		if (err) throw err;
		for (const file of files) {
			fs.unlink(path.join(directory, file), (err: Error) => {
				if (err) throw err;
			});
		}
	});
}

const getFontsLinks = (cssLink: string): Promise<string[]> => {
    return new Promise((resolve, reject) => {
		axios({
            method: 'get',
            url: cssLink,
            responseType: 'text',
            headers: data.headers,
            httpsAgent: agent,
        })
        .then((response: any) => response.data)
        .then((text: string) => {
            fs.writeFileSync(path.join(outPath, 'style.css'), text.replace(/https:\/\/fonts.gstatic.com[^)]+\/([^/)]+)/ig, '$1'));
            const re = new RegExp(/url\((https:\/\/fonts\.[^)]+)\)/ig);
            const fontLinks: string[] = [];
            let ar: RegExpExecArray | null;
            while ((ar = re.exec(text)) !== null){
                fontLinks.push(ar[1]);
            }
            resolve(fontLinks);
        })
        // .catch(console.error);
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
        axios({
            method:'get',
            url: link,
            responseType:'stream',
            headers: data.headers,
            httpsAgent: agent,
        })
        .then((response: any) => {
            response.data.pipe(
                fs.createWriteStream(path.join(outPath, fileName))
                    .on('finish', () => {
                        resolve(`${fileName} loaded`);
                    })
            )
        })
        // .catch(console.error);
    })
}

const loadFonts = async (fontLinks: string[]) => {
    console.log(`Total fonts: ${fontLinks.length}`);
	
    for (let index = 0; index < fontLinks.length; index++) {
        const link = fontLinks[index];
        const result = await loadFont(link);
        console.log(result);
    }
    return 'All fonts loaded';
}

// Если каталога нет, то создаем его, иначе удаляем из него все файлы
fs.access(outPath, fs.constants.F_OK, (err: Error) => {
	if (err){
		fs.mkdir(outPath, (err: Error) => {
			if (err) throw err;
		});
	} else {
		removeOldFonts(outPath);
	}
});

getFontsLinks(cssLink)
    .then((fontLinks: string[]) => {
        return loadFonts(fontLinks);
    })
    .then(console.log)
    .catch(console.error)