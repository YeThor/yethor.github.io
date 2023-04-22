---
title: "직접 해보는 리액트 개발환경 세팅 (with TypeScript, Webpack, Babel) "
date: "2023-04-22T21:55:00"
description: "직접 모듈을 설치해가며 타입스크립트 기반의 리액트 프로젝트 개발 환경을 세팅해보자  "
tags: ["TypeScript", "React"]
---

## 소개

이 글은 CRA나 다른 초기화 툴의 도움없이 직접 리액트 프로젝트 개발환경을 세팅하는 과정을 설명한다. 최종 목표는 타입스크립트를 사용할 수 있는 리액트 개발 환경을 세팅하는 것이며, 번들링은 웹팩으로 그리고 호환성 지원은 바벨로, 그리고 마지막으로 코드 스타일링은 프리티어와 ESLint를 통해 제어하는 것이다. 자세한 코드는 내 개인 [Github 레포](https://github.com/YeThor/template-typescript-react-with-babel)에 정리해두었다. 어떤걸 설치하고 어떤걸 적으라는 단순한 설명보다는 **"왜"** 이걸 설치하고 **"왜"** 저렇게 세팅하는지에 대한 전체적인 흐름도 함께 설명할 생각이다.

## npm 시작하기

```bash
npm init
```

프로젝트 폴더를 만들고 터미널에 `npm init`을 입력하여 기본적인 프로젝트 설명을 추가한다. 이 과정에서 `package.json`이 추가될 것이며 이제 이 파일을 통해 npm 모듈을 관리할 수 있게 된다.

번외로, 여기서 git을 연결하는 과정은 생략한다. 먼저 프로젝트를 만들고 레포에 한번에 push하든, 아니면 먼저 레포를 만들고 `git clone` 을 통해 작업을 시작하든 아무 상관없지만 diff 추적이 불필요한 파일들은 `.gitignore` 추가해두도록 하자.

## 어떻게 번들링할 것인가? Webpack

아래와 같이 웹팩 관련 모듈을 추가해준다.

```bash
npm install -D webpack webpack-cli webpack-dev-server
```

- webpack은 의존성 그래프를 이용해 필요한 모든 코드를 하나 혹은 n개의 파일로 번들링해주는 정적 모듈 번들러다.
- webpack-cli는 CLI에서 웹팩을 다룰 수 있도록 해주는 커맨드의 모음이다.
  - webpack-cli가 설치되면 CLI에서 `webpack serve`나 `webpack build` 같은 커맨드를 사용해 웹팩 관련 작업을 수행하거나 설정값을 바꿀 수 있게 된다.
- webpack-dev-server는 번들링한 결과물을 확인할 수 있는 개발 서버를 제공해준다. HMR(Hot Module Reloading)을 지원하며, 내부적으로 webpack-dev-middleware를 사용하기 때문에 파일이 직접 디스크에 쓰이는게 아니라 메모리 상에서 관리된다. 그 때문에 `webpack serve`를 해보면 번들링된 결과물 파일이 디스크 상에 추가되지 않았는데도 개발 서버에서 잘 돌아가는 모습을 볼 수 있다. webpack-dev-server는 웹팩 설정파일(webpack.config.js)의 `devServer` 옵션을 따른다.

그 다음 웹팩 설정파일을 root 레벨에 추가한다.

```javascript
// webpack.config.js
const path = require("path");

module.exports = {
  mode: "production",
  // webpack starts building the dependecy graph from here..
  entry: "./src/index.js",
  // the bundled files come here.
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "bundle.js",
  },
  // webpack-dev-server module picks up these options
  devServer: {
    // static files gonna be served from here. Default is 'public' directory
    static: {
      directory: path.resolve(__dirname, "./dist"),
    },
  },
};
```

이제 npm 커맨드를 추가하고 웹팩이 제대로 동작하는지 확인하기 위한 테스트용 파일을 추가한다

```json {diff}
// package.json
{
  ...,
   "scripts": {
+    "start": "webpack serve",
+    "build": "webpack --mode production --progress",
    ...
  },
}
```

```html
<!-- dist/index.html -->
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <title>Title</title>
  </head>
  <body>
    <script src="./bundle.js"></script>
  </body>
</html>
```

```javascript
// src/index.js
console.log("hello world");
```

이제 `npm run start`를 입력하면 index.js가 웹팩에 의해 bundle.js로 번들링되어 콘솔창에 hello world가 찍히는 걸 확인할 수 있을 것이다.

## React 추가하기

이제 웹팩 설정이 끝났으니 바닐라 자바스크립트가 아닌 React를 얹어줄 시간이다. react와 react-dom 모듈을 추가해준다

```bash
npm install react react-dom
```

- react는 리액트를 사용하기 위한 코어 모듈이다. 리액트를 통해 컴포넌트 단위로 UI를 구성할 수 있고 Fiber, Reconciliation 같은 내부 로직을 통해 렌더링 비용을 최적화할 수 있다
- react-dom은 이 리액트를 **브라우저에서** 사용할 수 있게 해주는 교두보 역할을 한다. DOM 요소에 접근해 리액트 요소를 마운팅하는 등의 관련 작업을 수행할 수 있게 된다. 리액트 네이티브처럼 모바일 앱을 대상으로 리액트를 작성할 때는 react-dom을 쓰지 않고 각 환경(ios, android)에 맞는 브릿지를 쓴다.

이제 바로 React를 쓸 수 있을까? 정답은 *아니오* 다. 웹팩은 기본적으로 `.js`만 인식할 수 있기 때문에, 다른 타입의 파일을 인식하게 하려면 로더를 설정해주어야 한다. 리액트는 `.jsx` 확장자를 가지기 때문에 바벨 로더를 적용하여 웹팩이 해당 파일을 다룰 수 있게끔 해야 한다.

그를 위해 다음 Babel 관련 모듈을 추가하자.

```bash
npm install -D @babel/core babel-loader @babel/preset-react
```

- @babel/core는 바벨의 코어 라이브러리다. ES5 문법만 지원하는 구형 브라우저(IE)에서도 ES6 이상의 최신 문법을 사용할 수 있도록 코드를 변환해주는 트랜스파일러의 역할을 한다(종종 컴파일러로 표현되기도 한다). 바벨같은 트랜스파일러 없이 화살표 함수를 사용한다면, 크롬같은 모던 브라우저에서는 문제없이 화면이 보일지 몰라도 IE 10에서는 화면이 하얗게 보이는 백화현상을 마주하게 될 것이다. 22년 6월에 IE 지원 공식종료 소식이 떴지만 아직 우리나라 IT업계에서는 매출액 등의 이유로 여전히 구형 브라우저를 지원해줘야하는 경우가 많다.
- babel-loader는 웹팩에서 바벨을 사용하고 싶을때 적용하는 로더이다. 쉽게 풀어서 말하자면 웹팩이 entry 파일에서부터 하나하나 import문을 따라가면서 모듈을 번들링하다가 타겟 파일을 마주하면 바벨 관련 작업(ex. 코드 변환)을 먼저 수행한 후 모듈에 추가하는 것이다.
- @babel/preset-react는 리액트와 바벨을 함께 사용하기 위한 프리셋으로, 다음 플러그인들이 포함되어있다.
  - @babel/plugin-syntax-jsx은 Babel이 JSX 문법을 파싱할 수 있게 한다. 다만 그 유무를 정해줄 뿐, 구체적인 코드 변환은 @babel/plugin-transform-react-jsx의 몫이다
  - @babel/plugin-transform-react-jsx는 JSX 문법을 어떻게 변환할지를 구체적으로 결정한다. 방법에 따라 `js≤≥jsxs`나 `js≤≥React.createElement(...)` 등으로 코드가 변환될 것이다
  - @babel/plugin-transform-display-name은 `js≤≥React.createClass`가 호출됐을 때 `displayName` 프로퍼티를 추가해준다
    - ```javascript
      var bar = createReactClass({
        displayName: "bar",
      });
      ```

우리의 목표는 이 모듈들을 사용하여 리액트를 구형 브라우저에서도 사용 가능한 자바스크립트 코드로 변환하고, 이를 웹팩 모듈에 추가하는 것이다. 다음처럼 설정 파일을 수정해주도록 하자

```javascript {diff}
// webpack.config.js
const path = require("path");

module.exports = {
  ...,
+  module: {
+    // the way how to webpack handles files
+    rules: [
+      {
+        test: /\.(js|ts)x?$/,
+        exclude: /node_modules/,
+        use: {
+          loader: "babel-loader",
+        },
+      },
+    ],
+  },
+  // how to resolve extensions in order. if the files have same name, webpack will resolve the file in order below
+  resolve: {
+    extensions: [".jsx", ".js"],
+  },
  ...
};
```

node_modules 폴더를 제외하고, 웹팩 번들링 과정에서 js, ts, jsx, tsx파일에 대해 바벨 로더를 적용한다. 또한 중복된 이름을 가진 파일이 존재하면 jsx -> js 순으로 살펴보도록 한다.

그 다음 바벨 설정파일(babel.config.json)을 root 디렉토리에 추가한다.

```json
{
  "presets": ["@babel/preset-react"]
}
```


간혹 React 라이브러리의 크기 때문인지 웹팩에서 번들파일이 너무 크다는 경고와 함께 화면을 표시해주지 않을 때가 있다. 번들파일의 용량을 줄이고 최적화하는 것은 이 글의 주제를 벗어나는 범위이므로, 일단 웹팩 설정에 다음 값을 추가해 개발 환경에서는 보이지 않게끔 해둔다.

```javascript {diff}
// webpack.config.js
module.exports = {
  ...
+  performance: {
+    hints: process.env.NODE_ENV === "production" ? "warning" : false,
+  },
};
```

이제 제대로 리액트가 개발환경에서 돌아가는지 살펴보기 위해 다음 파일을 추가하고 `npm run start`를 돌려보면 정상적으로 화면이 표시될 것이다.

```html {diff}
<!-- dist/index.html -->
<!DOCTYPE html>
<html>
  ...
  <body>
    <div id="app"></div>
+   <script src="./bundle.js"></script>
  </body>
</html>
```

```jsx 
// src/App.jsx
import React from "react";

const App = () => <h1>Hello world</h1>;

export default App;
```

```javascript {diff}
// src/index.js
- console.log("heelo world");
+ import React from "react";
+ import { createRoot } from "react-dom/client";
+ import App from "./App";

+ createRoot(document.getElementById("app")).render(<App />);
```
