# googleFontLoader

Скрипт выполняет загрузку шрифтов Google, предоставляемых сервисом [Google Fonts](https://fonts.google.com), для использования офлайн.

Порядок использования:

```text
Usage: node .\dist\load.js -s [str] -p [str] -a[str]

Options:
  --version         Show version number                                [boolean]
  -s, --source      Link to Goggle Fonts css file            [string] [required]
  -p, --proxy       Proxy configuration in format
                    http://login:password@address:port/                 [string]
  -a, --user-agent  User agent                                          [string]
  -h, --help        Show help                                          [boolean]
```

Например:

```text
node .\dist\load.js -s "https://fonts.googleapis.com/css?family=Roboto:400,400i,500&display=swap&subset=cyrillic,cyrillic-ext" -a "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; KTXN)"
```

В результате выполнения данного скрипта шрифты и файл стилей для их подключения будут загружены в каталог **fonts**.
