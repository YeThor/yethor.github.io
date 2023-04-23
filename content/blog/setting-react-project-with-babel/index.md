---
title: "직접 해보는 React 개발환경 세팅 (with TypeScript, Webpack, Babel) "
date: "2023-04-22T21:55:00"
description: "이 글은 CRA나 다른 초기화 툴의 도움없이 직접 React 프로젝트 개발환경을 세팅하는 과정을 설명한다. 최종 목표는 TypeScript를 사용할 수 있는 React 개발 환경을 세팅하는 것이며, 번들링은 Webpack으로 그리고 호환성 지원은 Babel로, 그리고 마지막으로 코드 스타일링은 Prettier와 ESLint를 통해 제어하는 것이다."
tags: ["TypeScript", "React", "Babel", "Webpack"]
---

## 소개

이 글은 CRA나 다른 초기화 툴의 도움없이 직접 React 프로젝트 개발환경을 세팅하는 과정을 설명한다. 최종 목표는 TypeScript를 사용할 수 있는 React 개발 환경을 세팅하는 것이며, 번들링은 Webpack으로 그리고 호환성 지원은 Babel로, 그리고 마지막으로 코드 스타일링은 Prettier와 ESLint를 통해 제어하는 것이다. 자세한 코드는 내 개인 [Github 레포](https://github.com/YeThor/template-typescript-react-with-babel)에 정리해두었다. 어떤걸 설치하고 어떤걸 적으라는 단순한 설명보다는 **"왜"** 이걸 설치하고 **"왜"** 저렇게 세팅하는지에 대한 전체적인 흐름도 함께 설명할 생각이다.

## npm 시작하기

```bash
npm init
```

프로젝트 폴더를 만들고 터미널에 `npm init`을 입력하여 기본적인 프로젝트 설명을 추가한다. 이 과정에서 `package.json`이 추가될 것이며 이제 이 파일을 통해 npm 모듈을 관리할 수 있게 된다.

번외로, 여기서 git을 연결하는 과정은 생략한다. 먼저 프로젝트를 만들고 레포에 한번에 push하든, 아니면 먼저 레포를 만들고 `git clone` 을 통해 작업을 시작하든 아무 상관없지만 diff 추적이 불필요한 파일들은 `.gitignore` 추가해두도록 하자.

## 어떻게 번들링할 것인가? Webpack

아래와 같이 Webpack 관련 모듈을 추가해준다.

```bash
npm install -D webpack webpack-cli webpack-dev-server
```

- webpack은 의존성 그래프를 이용해 필요한 모든 코드를 하나 혹은 n개의 파일로 번들링해주는 정적 모듈 번들러다.
- webpack-cli는 CLI에서 Webpack을 다룰 수 있도록 해주는 커맨드의 모음이다.
  - webpack-cli가 설치되면 CLI에서 `webpack serve`나 `webpack build` 같은 커맨드를 사용해 Webpack 관련 작업을 수행하거나 설정값을 바꿀 수 있게 된다.
- webpack-dev-server는 번들링한 결과물을 확인할 수 있는 개발 서버를 제공해준다. HMR(Hot Module Reloading)을 지원하며, 내부적으로 webpack-dev-middleware를 사용하기 때문에 파일이 직접 디스크에 쓰이는게 아니라 메모리 상에서 관리된다. 그 때문에 `webpack serve`를 해보면 번들링된 결과물 파일이 디스크 상에 추가되지 않았는데도 개발 서버에서 잘 돌아가는 모습을 볼 수 있다. webpack-dev-server는 Webpack 설정파일(webpack.config.js)의 `devServer` 옵션을 따른다.

그 다음 Webpack 설정파일을 root 레벨에 추가한다.

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

이제 npm 커맨드를 추가하고 Webpack이 제대로 동작하는지 확인하기 위한 테스트용 파일을 추가한다

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

이제 `npm run start`를 입력하면 index.js가 Webpack에 의해 bundle.js로 번들링되어 콘솔창에 hello world가 찍히는 걸 확인할 수 있을 것이다.

## React 추가하기

이제 Webpack 설정이 끝났으니 바닐라 JavaScript가 아닌 React를 얹어줄 시간이다. react와 react-dom 모듈을 추가해준다

```bash
npm install react react-dom
```

- react는 React를 사용하기 위한 코어 모듈이다. React를 통해 컴포넌트 단위로 UI를 구성할 수 있고 Fiber, Reconciliation 같은 내부 로직을 통해 렌더링 비용을 최적화할 수 있다
- react-dom은 이 React를 **브라우저에서** 사용할 수 있게 해주는 교두보 역할을 한다. DOM 요소에 접근해 React 요소를 마운팅하는 등의 관련 작업을 수행할 수 있게 된다. React 네이티브처럼 모바일 앱을 대상으로 React를 작성할 때는 react-dom을 쓰지 않고 각 환경(ios, android)에 맞는 브릿지를 쓴다.

이제 바로 React를 쓸 수 있을까? 정답은 *아니오* 다. Webpack은 기본적으로 `.js`만 인식할 수 있기 때문에, 다른 타입의 파일을 인식하게 하려면 로더를 설정해주어야 한다. React는 `.jsx` 확장자를 가지기 때문에 Babel 로더를 적용하여 Webpack이 해당 파일을 다룰 수 있게끔 해야 한다.

그를 위해 다음 Babel 관련 모듈을 추가하자.

```bash
npm install -D @babel/core babel-loader @babel/preset-react
```

- @babel/core는 Babel의 코어 라이브러리다. ES5 문법만 지원하는 구형 브라우저(IE)에서도 ES6 이상의 최신 문법을 사용할 수 있도록 코드를 변환해주는 트랜스파일러의 역할을 한다(종종 컴파일러로 표현되기도 한다). Babel같은 트랜스파일러 없이 화살표 함수를 사용한다면, 크롬같은 모던 브라우저에서는 문제없이 화면이 보일지 몰라도 IE 10에서는 화면이 하얗게 보이는 백화현상을 마주하게 될 것이다. 22년 6월에 IE 지원 공식종료 소식이 떴지만 아직 우리나라 IT업계에서는 매출액 등의 이유로 여전히 구형 브라우저를 지원해줘야하는 경우가 많다.
- babel-loader는 Webpack에서 Babel을 사용하고 싶을때 적용하는 로더이다. 쉽게 풀어서 말하자면 Webpack이 entry 파일에서부터 하나하나 import문을 따라가면서 모듈을 번들링하다가 타겟 파일을 마주하면 Babel 관련 작업(ex. 코드 변환)을 먼저 수행한 후 모듈에 추가하는 것이다.
- @babel/preset-react는 React와 Babel을 함께 사용하기 위한 프리셋으로, 다음 플러그인들이 포함되어있다.
  - @babel/plugin-syntax-jsx은 Babel이 JSX 문법을 파싱할 수 있게 한다. 다만 그 유무를 정해줄 뿐, 구체적인 코드 변환은 @babel/plugin-transform-react-jsx의 몫이다
  - @babel/plugin-transform-react-jsx는 JSX 문법을 어떻게 변환할지를 구체적으로 결정한다. 방법에 따라 `js≤≥jsxs`나 `js≤≥React.createElement(...)` 등으로 코드가 변환될 것이다
  - @babel/plugin-transform-display-name은 `js≤≥React.createClass`가 호출됐을 때 `displayName` 프로퍼티를 추가해준다
    - ```javascript
      var bar = createReactClass({
        displayName: "bar",
      });
      ```

우리의 목표는 이 모듈들을 사용하여 React를 구형 브라우저에서도 사용 가능한 JavaScript 코드로 변환하고, 이를 Webpack 모듈에 추가하는 것이다. 다음처럼 설정 파일을 수정해주도록 하자

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

node_modules 폴더를 제외하고, Webpack 번들링 과정에서 js, ts, jsx, tsx파일에 대해 Babel 로더를 적용한다. 또한 중복된 이름을 가진 파일이 존재하면 jsx -> js 순으로 살펴보도록 한다.

그 다음 Babel 설정파일(babel.config.json)을 root 디렉토리에 추가한다.

```json
{
  "presets": ["@babel/preset-react"]
}
```


간혹 React 라이브러리의 크기 때문인지 Webpack에서 번들파일이 너무 크다는 경고와 함께 화면을 표시해주지 않을 때가 있다. 번들파일의 용량을 줄이고 최적화하는 것은 이 글의 주제를 벗어나는 범위이므로, 일단 Webpack 설정에 다음 값을 추가해 개발 환경에서는 보이지 않게끔 해둔다.

```javascript {diff}
// webpack.config.js
module.exports = {
  ...
+  performance: {
+    hints: process.env.NODE_ENV === "production" ? "warning" : false,
+  },
};
```

이제 제대로 React가 개발환경에서 돌아가는지 살펴보기 위해 다음 파일을 추가하고 `npm run start`를 돌려보면 정상적으로 화면이 표시될 것이다.

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

## 코드 변환은 Babel의 몫으로 

앞서 React를 세팅하면서 Babel 모듈과 설정 파일을 추가했었다. 하지만 우리가 한 것은 단순히 React JSX 문법을 JavaScript 코드로 변환한 것 뿐이다. 소스 코드에서 사용한 ES6 이상의 최신 JavaScript 문법을 구형 브라우저에서도 구동되게끔 하려면 다음과 같은 작업이 필요하다.

- ES6 이상의 문법을 ES5 이하의 문법으로 변환
  - 최신 문법이 오래된 문법으로 대체된다. 예를 들어 화살표 함수의 경우에는 다음처럼 코드가 변환될 것이다.
  - ```javascript
    // ES6
    const foo = () => console.log('hello world');

    // ES5 
    function foo() {
      console.log('hello world');
    }
    ```
- ES6 이상에서 새롭게 추가된 스펙에 대한 폴리필  
  - ES6이상에서 완전히 새롭게 추가된 스펙이라면 어떨까? 다시 말해 ES5에서는 전혀 존재하지 않았던 스펙이라면, 위의 경우와 달리 ES6 스펙을 ES5 문법으로 온전히 재창조(recreate)해야할 것이다. 이것을 폴리필(polyfill)이라고 부른다. 
  - `Promise`, `js≤≥Array.prototype.find` 등이 대표적인 예시.

위 목적을 달성하는 데에는 크게 두가지 방법이 있다. 하나는 TypeScript에게 코드 변환을 맡기는 것(`tsc`), 다른 하나는 Babel에게 코드 변환을 맡기는 것이다. 

`tsc`를 사용하면 컴파일 과정에서 타입 체크를 엄격하게 수행할 수 있다. 소스 코드 어디선가 타입 에러가 있다면, 코드는 컴파일되지 않을 것이고 개발자는 잠재적인 에러를 잡아낼 수 있을 것이다. 하지만 그 외의 것들, 예를 들면 폴리필 추가나 라이브 리로딩같은 기능을 사용하는게 불편하다(라이브 리로딩을 공식지원하지는 않지만 tricky하게 설정을 바꿔서 억지로 쓸 수는 있다). Babel은 이와 정반대의 장단점을 가진다. 원래 Babel이 호환성 지원을 위한 진영인만큼, 관련 기능과 플러그인들이 잘 구현되어있어 편하게 폴리필을 추가하고 보다 유연하게 코드를 변환할 수 있다. 다만 컴파일 과정에서 타입 체크는 수행하지 않는다. 

이 아티클에서는 Babel을 사용한다. 그 이유는 Babel이 버전7 이후부터 TypeScript를 잘 지원하고 있을 뿐만 아니라, 관심사를 기준으로 봤을 때 TypeScript는 타입 체크, Babel은 코드 호환성 유지에 제 1목적을 두고 있기 때문이다. [TypeScript 10주년 회고글](https://devblogs.microsoft.com/typescript/ten-years-of-typescript/)에서도 `"TypeScript는 타입에 집중하고, 그 외의 기능은 웹 개발 생태계에게 맡긴다"`는 논지의 글을 볼 수 있다. 

> Another successful principle is that **TypeScript hasn’t tried to be every tool in the toolbox.** One of our non goals is to not "provide an end-to-end build pipeline. Instead, make the system extensible so that external tools can use the compiler for more complex build workflows." - Ten Years of TypeScript, by Daniel Rosenwasser

그렇다고 tsc를 아예 배제하자는 것은 아니다. 이 프로젝트 세팅에서 코드 변환은 Babel에게 맡기겠지만, 그 전에 `tsc`로 하여금 타입 체크를 수행시키는 전과정을 추가시켜 잠재적인 에러를 잡아낼 것이다.

일단은 다시 본론으로 돌아가서, 구형 브라우저 지원을 위한 관련 모듈을 설치하자.

```bash
npm install -D @babel/preset-env core-js
```

- core-js는 최신 ECMAScript 문법에 대한 폴리필을 포함하고 있는 라이브러리로, 필요한 폴리필만 추가하거나 전역 네임스페이스 오염없이 폴리필을 가져올 수 있는 라이브러리다. 
- @babel/preset-env는 최신 JavaScript 문법을 구형 브라우저에서도 동작하도록 변환시켜주는 프리셋이다. `useBuiltIns` 옵션을 `entry`나 `usage`로 설정하면 core-js 모듈에 대한 직접 참조를 추가하기 때문에 core-js의 폴리필을 사용할 수 있게 된다. `corejs` 옵션을 설정하면 어떤 버전의 core-js 모듈을 사용할지 설정할 수 있다.
  - @babel/polyfill은 7.4.0 이후로 deprecated되었으므로 위 방식으로 폴리필을 추가하는 것을 추천한다.

다음처럼 Babel 설정 파일을 수정해주자.

```json {diff}
{
-  "presets": ["@babel/preset-react"]
+  "presets": [
+    [
+      "@babel/preset-env",
+      {
+        "useBuiltIns": "usage", 
+        "corejs": 3
+      }
+    ],
+    "@babel/preset-react"
+  ]
}
```

Babel의 preset 옵션은 배열 역순으로 적용된다. 즉, @babel/preset-react가 먼저 적용되어 React가 JavaScript로 변환되고, 변환된 JavaScript를 @babl/preset-env가 구형 브라우저에서 동작하는 JavaScript 코드로 변환한다. 폴리필이 필요한 경우 소스 코드에 사용된("usage") 부분만 core-js 버전 3에서 가져오며, 타겟 환경은 `.browserlistrc` 파일이나 `targets` 옵션으로 구체화시킬 수 있다.

```
// .browserlistrc
> 0.25%
not dead
```

`debug: true` 옵션을 추가하면 빌드된 코드가 어느 브라우저까지 지원하는지 콘솔에서 확인할 수 있다.
```
{
    "chrome": "49",
    "edge": "17",
    "firefox": "68",
    "ie": "11",
    "ios": "11.3",
    "safari": "5.1",
    "samsung": "9.2"
}
```

## TypeScript 추가하기 

이제 React를 JavaScript로 변환하고, JavaScript 코드를 구형 브라우저에서도 동작하는 호환성 높은 JavaScript 코드로 변환하고, 필요한 모든 파일을 모듈로 번들링하는 과정을 마쳤다. 이제 TypeScript를 추가해 타입 체크 기능을 추가하고, Babel로 컴파일하기 전에 타입 체크를 먼저 수행하여 에러를 잡아내는 작업을 추가할 것이다.

```bash
npm install -D typescript @babel/preset-typescript @types/react @types/react-dom
```

- typescript는 JavaScript의 슈퍼셋에 해당하는 언어로, 동적 타입 언어인 JavaScript에 정적 타입 체크 시스템을 추가해 코드를 더 안정적으로 작성할 수 있게 해준다. 뿐만 아니라 IDE에서 자동완성 기능을 훌륭하게 지원하므로, 코드를 유지보수하기가 훨씬 더 좋아진다. TypeScript를 정말 "잘" 써보고 싶다면, Dan Vanderkam이 집필한 "Effective TypeScript" 책을 추천한다.
- @types/react와 @types/react-dom은 말그대로 react와 react-dom을 위한 타입 선언이다. 라이브러리와 타입은 xxx와 @types/xxx로 분리되어있는 경우가 많은데, 이러한 방식의 타입 선언은 DefinitelyTyped 커뮤니티 프로젝트에서 활발하게 이루어지고 있다.
- @babel/preset-typescript는 @babel/plugin-transform-typescript 플러그인을 포함하고 있는 프리셋이다. @babel/plugin-transform-typescript 플러그인은 TypeScript 코드를 변환하는데, TypeScript only에 해당하는 문법만 변환한다. 예를 들어 타입 선언은 JavaScript에서 지원되지 않고 TypeScript에서는 지원되기 때문에 해당 플러그인이 이 코드를 변환하지만(이 경우엔 컴파일 과정에서 타입 선언이 제거된다), 옵셔널 체이닝`js≤≥(obj?.a?.b)`처럼 TypeScript와 JavaScript 양쪽에서 지원하는 코드는 건들지 않는다. 이렇게 JavaScript에서도 지원하는 문법에 대한 변환은 @babel/preset-env 같은 JavaScript 트랜스파일 플러그인의 몫으로 남겨둘 뿐이다.

필요한 모듈을 설치했으니 이제 설정 파일을 수정하자.

```json {diff}
// babel.config.json
{
  "presets": [
+    "@babel/preset-typescript",
    [
      "@babel/preset-env",
      ...
    ]
  ]
}
```

```javascript {diff}
// webpack.config.js

module.exports = {
  ...,
-  entry: "./src/index.js",
+  entry: "./src/index.tsx",
   module: {
    rules: [
      {
-        test: /\.(js|jsx)$/,
+        test: /\.(js|ts)x?$/,
         exclude: /node_modules/,
         use: {
          loader: "babel-loader"
         },
      }
    ]
   },
   resolve: {
-    extensions: [".jsx", ".js"],
+    extensions: [".tsx", ".ts", ".jsx", ".js"],
   }
}
```

Babel 설정의 preset 옵션은 역순으로 적용된다는 것을 기억하자. @babel/preset-env가 코드 변환을 마치고 나면 변환되지 못한채 남아있는 TypeScript only 문법을 마지막에 @babel/preset-typescript가 처리한다. 
Webpack은 js, jsx 뿐만 아니라 ts, tsx도 다룰 수 있게 되었으며, 타입 오류를 제거하기 위해 index.js를 index.tsx로 바꿀 것이다. App.jsx도 App.tsx로 바꿔주자. 

```tsx
// src/index.tsx

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const rootElement = document.getElementById("app");

if (rootElement) { // to resolve null check error
  createRoot(rootElement).render(<App />);
}
```


## 컴파일 전처리 과정에 타입체크 추가하기 

package.json의 npm 커맨드를 다음처럼 수정해 타입체크 과정을 추가한다.

```json {diff}
// package.json

{
  ...
  "scripts": {
-    "start": "webpack serve",
-    "build": "webpack --mode production --progress",
+    "start": "npm run tscheck && webpack serve",
+    "build": "npm run tscheck && webpack --mode production --progress",
+    "tscheck": "tsc",
     ...
  }
  ...
}
```

`tsc`는 tsconfig.json에 정의된 설정을 따르기 때문에 tsconfig.json 파일을 새로 추가한다. 참고로 Babel이 TypeScript를 변환할 때는 tsconfig.json을 거들떠도 보지 않기 때문에 우리가 정의할 tsconfig.json은 오직 타입체크만을 위한 설정값으로 구성될 것이다. TypeScript 코드 변환시 Babel에서도 tsconfig.json과 동일하게 구현하고 싶다면 [@babel/plugin-transform-typescript 플러그인 공식문서](https://babeljs.io/docs/babel-plugin-transform-typescript#typescript-compiler-options)를 참고하자.  

```json
// tsconfig.json

{
  /* only used for type checking because Babel transforms typescript instead of tsc in this project */
  "compilerOptions": {
    "target": "ESNext",
    "jsx": "react",
    "noEmit": true,
    "sourceMap": true,

    /* Strict Type-Checking Options */
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,

    /* Module Resolution Options */
    "moduleResolution": "node",
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true
  },
  "include": ["src"]
}
```

테스트를 위해 src/App.tsx 파일을 아래처럼 바꾸고 `npm run tsc`를 수행하면 noImplicitAny 관련 에러와 함께 컴파일 실패 메세지가 찍히는걸 볼 수 있다.

```tsx
// src/App.tsx
import React from "react";

const App = () => <h1>Hello world</h1>;

// this function will emit type error (noImplicitAny)
function fn(s) {
  console.log(s);
}
```

## ESLint와 Prettier로 일관된 코드 작성하기 

이제 기본적인 개발환경 세팅은 끝났고, ESLint와 Prettier를 이용해 문법 상의 오류를 방지하고 코드 스타일을 일관성있게 유지할 것이다. 둘의 목적은 명확히 다르다. ESLint는 const 변수에 값을 재할당한다던가 하는 문법 에러를 사전에 방지하여 보다 단단한 코드를 작성하고 가독성을 높이는 것이 목적이다. Prettier는 따옴표나 들여쓰기 칸 수 처럼 코드 동작에 영향을 미치진 않지만 사람마다 코드 스타일이 제각각일 수 있는 부분을 일관성있는 하나의 스타일로 통일할 수 있도록 도와준다. 이 부분은 특히 팀 단위에서 함께 협업할 때 큰 도움이 된다. 예를 들어 사람마다 라인 들여쓰기 칸 수가 다르다면, Pull Request의 변경 내역을 볼 때 작업 범위와는 전혀 관련없는 들여쓰기 수정까지 포함되어 변경 내역이 지저분해질 것이다.

먼저 ESLint를 세팅해보자. 다음 모듈을 추가한다.

```bash
npm install -D eslint eslint-config-react-app
```

- eslint는 문법 오류를 방지하기 위한 JavaScript 린트 툴이다.
- eslint-config-react-app은 CRA(create react app)에서 쓰는 ESLint 설정이다. 원래는 AirBnB에서 사용하던 ESLint 설정이 많이 쓰였으나, TypeScript 미지원 이슈로 2022년 8월경 eslint-config에서 [제거되었다.](https://github.com/eslint/create-config/releases/tag/v0.3.1) eslint-config-react-app 안에는 React와 TypeScript를 사용할 때 유용한 플러그인들이 이미 설치되어있으므로 .eslintrc.json에 설정만 잘 해주면 된다.

ESLint 설정 파일(.eslintrc.json)을 추가한다.

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "react-app"
  ]
}
```

이제 Prettier 관련 모듈을 추가하자.

```bash
npm install -D prettier eslint-config-prettier
```

- prettier는 코드 스타일을 일관성있게 유지할 수 있도록 도와준다. 
- eslint-config-prettier는 prettier와 컨플릭트가 일어날 수 있는 모든 ESLint 룰을 끈다. 따라서 ESLint와 Prettier가 서로 충돌할 일이 없어진다.

이제 Prettier 설정 파일을 추가하고 본인이 원하는 스타일 룰을 정의하면 된다.

```json
// .prettierrc.json
{
  "tabWidth": 2,
  "singleQuote": false
}
```

ESLint 설정 파일에도 Prettier와 규칙이 충돌할 일이 없도록 eslint-config-prettier를 추가한다.

```json {diff}
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "react-app",
+     "prettier"
  ]
}
```

Visual Studio Code에서 파일을 저장할 때마다 자동으로 포매팅이 돌게 하고 싶다면 익스텐션 탭에서 ESLint와 Prettier를 설치한 후 Visual Studio Code 설정을 아래처럼 수정해주면 된다.

```json
// .vscode/settings.json 수정 혹은 Cmd+Shift+P로 팔레트를 열어 설정을 변경할 수 있다
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true // ESLint auto format on save
  },
  "editor.formatOnSave": true, // Prettier auto format on save
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

## 마치며

이걸로 프로젝트 세팅이 끝났다. CRA같은 초기화 툴을 이용해 개발환경을 세팅하는 것이 개발 공수면으로는 굉장히 효율적인 방법이지만, 프로젝트 규모나 성격에 따라서는 이렇게 직접 개발 환경 흐름을 파악해가며 일일이 환경을 세팅하는 일도 종종 하게 된다. Webpack이 아니라 esbuild를 쓸 수도 있고, React가 아니라 Vue를 쓸 수도 있고, ES5 코드를 변환할 때 Babel이 아닌 tsc를 사용할 수도 있다. 언제든 합리적인 판단하에 적합한 개발 환경으로 프로젝트를 세팅하도록 하자.  