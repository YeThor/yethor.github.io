---
title: "importmap으로 외부 모듈 정의하기"
date: "2023-04-02T12:13:00"
description: "모듈화되지 않은 자바스크립트 프로젝트 환경에서 importmap은 외부 라이브러리를 모듈로 정의할 수 있는 훌륭한 대안 중 하나다"
tags: ["JavaScript", "HTML"]
---

프론트엔드 기술이 발달하고 웹페이지가 좀 더 고도화되면서 소수의 번들 js 안에서 외부 라이브러리를 불러와 작업하는 방식이 보편화되었지만, 여전히 많은 상용 코드에서는 여러가지 이유로 다음처럼 cdn에서 라이브러리를 스크립트로 따로 불러온 다음 전역 변수를 사용하는 방식을 볼 수 있다.

```html
<script src="https://cdn.jsdelivr.net/npm/some-module@1.0.0/some-module.min.js"></script>

<script>
  try {
    if (some) { // some-module 안에 정의된 함수
      some(...);
    }
  }
</script>
```

이런 방식의 코드는 불러오는 라이브러리가 많아질수록 어디에서 불러온 함수인지 명확하게 보이지 않아 디버깅이나 코드 흐름을 추적하기 어려워진다는 단점이 있다.

이를 개선할 수 있는 좋은 방안 중의 하나가 바로 `importmap`이다.

`importmap`은 개발자가 직접 스크립트 url과 모듈 이름을 매칭시켜 보다 명시적인 코드를 작성할 수 있게 도와준다.

```html
<script type="importmap">
  {
    "imports": {
      "some-module": "https://cdn.jsdelivr.net/npm/some-module@1.0.0/some-module.min.js"
    }
  }
</script>

<script type="module">
  import some from 'some-module';

  some(...)
</script>
```

이 방식은 라이브러리 내부적으로 여러 메소드를 정의할 경우에 더 명확하게 다가온다.

```html
<script type="module">
  import {a,b,c,d,e} from 'some-module';

  a(...); // 이제 a가 어느 외부 모듈에서 온 함수인지 한눈에 파악할 수 있다
</script>
```

`importmap`으로 정의한 모듈은 `html≤≥<script type="module">`로 정의된 스크립트에서만 사용할 수 있다는 것을 숙지하도록 하자.

지원되는 브라우저는 엣지, 크롬, 파이어폭스 등이며 IE와 사파리에서는 아직 사용할 수 없다. IE는 MS의 지원 종료와 함께 브라우저 지원 범위에서 은근슬쩍 빠지고 있는 추세이기 때문에 (글로벌 기준. 한국은 아직 갈 길이 멀어보인다...) 이후 지원 가능성은 희박해보이지만, 사파리는 최신 버전 릴리즈와 함께 관련 이야기들이 조금씩 보이고 있어서 추후 지원 가능성이 높지 않을까 생각한다. 그렇게 되면 모바일 웹 환경에서는 `importmap`을 도입해볼만하지 않을까.
