---
title: "isNaN( )과 Number.isNaN( )의 차이점"
date: "2023-01-19T21:55:00"
description: "전역 공간에서 쓰는 isNaN과 Number.isNaN의 차이점은 파라미터의 숫자형 변환 유무다. isNaN은 전달받은 파라미터를 숫자형으로 변환 후 NaN 여부를 판별하지만 Number.isNaN은 별도의 변환없이 받은 파라미터 그대로 NaN여부를 판단한다. 숫자형 변환시 예기치 않은 결과가 나올 수 있으므로 isNaN을 쓸 때는 항상 주의해서 써야한다."
---

전역 공간에서 쓰는 isNaN과 Number.isNaN의 가장 큰 차이점은 파라미터의 숫자형 변환 유무다. 전역에서 쓰이는 `isNaN()`은 전달받은 파라미터를 숫자형으로 변환한 후 NaN 여부를 살피고, `js±Number.isNaN()`은 별도 변환없이 파라미터 그대로 NaN 여부를 판단한다.
따라서 아래와 같은 결과가 나오게 된다.

```js
isNaN("abc") // true;

Number.isNaN("abc") // false
```

전역 `js±isNaN(param)` 은 결과적으로 `js±isNaN(Number(param))` 과 동일하므로 숫자형으로 변환된 파라미터의 NaN 여부를 판단할 때 쓰고, `js±Number.isNaN()` 은 파라미터가 정확히 NaN인지 아닌지 알고 싶을 때 쓴다.

주의해야 할 점은, 숫자형 변환이 때때로 의외의 결과를 낳는다는 것이다. 숫자가 아닌 일부 값들은 변환을 거치면서 숫자가 될 수 있다. 예를 들어 `[]` , `''` , `null` 과 같은 값들은 0이 되고, boolean형 값들은 0 혹은 1로 바뀌기 때문에 isNaN()의 결과는 false가 된다. 따라서 `isNaN()` 을 쓸 때는 모든 경우의 수를 곰곰이 따져볼 필요가 있다.

아래에 몇가지 예시를 추가적으로 더 정리하면서 글을 마친다. 숫자형으로 변환할 때 null은 0이 되고 undefined는 NaN이 된다는 점이 꽤 흥미롭다.

| param     | isNaN() | Number.isNaN |
| :-------- | :------ | :----------- |
| NaN       | true    | true         |
| 123       | false   | false        |
| 'abc'     | true    | false        |
| true      | false   | false        |
| null      | false   | false        |
| undefined | true    | false        |
| []        | true    | false        |
| {}        | true    | false        |
