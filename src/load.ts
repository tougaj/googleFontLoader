const fs = require("fs");
const path = require("path");
const axios = require("axios");
const httpsProxyAgent = require("https-proxy-agent");

// const data = {
// 	headers: {
// 		"User-Agent":
// 			// "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:75.0) Gecko/20100101 Firefox/75.0" // Firefox
// 			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36" // Chrome
// 		// "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0; WOW64; Trident/4.0; SLCC1; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; .NET4.0C; .NET4.0E))" // IE8
// 		// "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; KTXN)" // IE9
// 	},
// 	outPath: "./fonts"
// };

const argv = require("yargs")
	.usage("Usage: node .\\dist\\$0 -s [str] -p [str] -a[str]")
	.demandOption(["s"])
	.alias("s", "source")
	.nargs("s", 1)
	.string(["s", "p", "a"])
	.describe("s", "Link to Goggle Fonts css file")
	.alias("p", "proxy")
	.nargs("p", 1)
	.describe(
		"p",
		"Proxy configuration in format http://login:password@address:port/"
	)
	.alias("a", "user-agent")
	.nargs("a", 1)
	.describe("a", "User agent")
	// .alias('d', 'directory')
	// .nargs('d', 1)
	// .describe('d', 'Directory name in fonts folder where fonts will be loaded')
	.help("h")
	.alias("h", "help").argv;

const cssLink = argv.source;
const proxyAddress = argv.proxy;
const proxyAgent = proxyAddress ? new httpsProxyAgent(proxyAddress) : undefined;
// const outPath = path.join(data.outPath, argv.directory || '');
const _userAgent = argv.userAgent;

const data = {
	headers: {
		"User-Agent": _userAgent
			? _userAgent
			: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36" // Chrome
		// "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:75.0) Gecko/20100101 Firefox/75.0" // Firefox
		// "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0; WOW64; Trident/4.0; SLCC1; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; .NET4.0C; .NET4.0E))" // IE8
		// "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; KTXN)" // IE9
	},
	outPath: "./fonts"
};
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
};

const getFontsLinks = (cssLink: string): Promise<string[]> => {
	return new Promise((resolve, reject) => {
		axios({
			method: "get",
			url: cssLink,
			responseType: "text",
			headers: data.headers,
			httpsAgent: proxyAgent
		})
			.then((response: any) => response.data)
			.then((text: string) => {
				fs.writeFileSync(
					path.join(outPath, "style.css"),
					text.replace(/https:\/\/fonts.gstatic.com[^)]+\/([^/)]+)/gi, "$1")
				);
				const re = new RegExp(/url\((https:\/\/fonts\.[^)]+)\)/gi);
				const fontLinks: string[] = [];
				let ar: RegExpExecArray | null;
				while ((ar = re.exec(text)) !== null) {
					fontLinks.push(ar[1]);
				}
				resolve(fontLinks);
			});
		// .catch(console.error);
	});
};

const loadFont = (link: string) => {
	return new Promise((resolve, reject) => {
		const m = link.match(/\/([^/]+\.[^./]+)$/i);
		if (!m || m.length < 2) {
			reject();
			return; // Сюда не дойдет, но иначе линтер ругается
		}
		const fileName = m[1];
		axios({
			method: "get",
			url: link,
			responseType: "stream",
			headers: data.headers,
			httpsAgent: proxyAgent
		}).then((response: any) => {
			response.data.pipe(
				fs.createWriteStream(path.join(outPath, fileName)).on("finish", () => {
					resolve(`${fileName} loaded`);
				})
			);
		});
		// .catch(console.error);
	});
};

const loadFonts = async (fontLinks: string[]) => {
	console.log(`Total fonts: ${fontLinks.length}`);

	for (let index = 0; index < fontLinks.length; index++) {
		const link = fontLinks[index];
		const result = await loadFont(link);
		console.log(result);
	}
	return "All fonts loaded";
};

// Если каталога нет, то создаем его, иначе удаляем из него все файлы
fs.access(outPath, fs.constants.F_OK, (err: Error) => {
	if (err) {
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
	.catch(console.error);
