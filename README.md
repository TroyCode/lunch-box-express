簡易訂便當系統，需要 [Node.js v6](https://nodejs.org/en/download/package-manager/) 以上及 MySQL

## Getting start

複製專案到本機

``` shell
git clone https://github.com/TroyCode/lunch-box-express.git
cd lunch-box-express
```

複製 config-example

```
cp config-example config
```

編輯 config，將引號內換成自己的資料庫設置

```
export db_host='DB location'
export db_user='DB username'
export db_password='DB password'
export db_name='Schema name'
```

初始化資料庫

```
npm run create-table
```

編輯好之後執行

```
source config
```

npm 安裝相關套件

```
npm install
```

執行專案

```
node index.js
```

之後就可以在瀏覽器開啟 [http://localhost:8888](http://localhost:8888) 就成功囉！
