---
title: 리액트 렌더링 동작에 대한 심층 가이드
date: "2022-10-09T22:40:32.169Z"
description: This is a custom description for SEO and Open Graph purposes, rather than the default generated excerpt. Simply add a description field to the frontmatter.
---

> 개인 공부 겸 다음 원문을 번역한 글입니다 https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/

_리액트 렌더링에 대한 디테일, 그리고 컨텍스트와 React-Redux의 사용이 어떻게 렌더링에 영향을 미치는가_

나는 리액트가 언제, 왜, 어떻게 다시 컴포넌트를 렌더링하는지, 그리고 컨텍스트와 React-Redux가 그러한 재렌더링의 타이밍과 범위에 어떻게 영향을 끼치는지에 대한 많은 혼란을 보아 왔다. 여기에 대한 많은 설명들이 있어왔지만, 나는 사람들이 참고할 수 있도록 정리된 설명글이 필요하다고 생각했다. 여기에 있는 모든 정보는 이미 온라인에 있으며, 추후 섹션에서 링크를 걸어둘 다른 수많은 훌륭한 블로그 포스트와 아티클에도 설명되어 있다. 하지만 완벽한 이해를 위한 하나의 정리본을 사람들은 필요로 하는 것 같았고, 이 글이 그런 사람들에게 도움이 되기를 바란다.

> _Note: 리액트 18과 추후 업데이트들을 고려하여 2022년 10월에 업데이트 됨_

# 목차

- [렌더링이란 무엇인가?](/ts-react-rendering-behavior/#렌더링이란-무엇인가what-is-rendering)
  - [렌더링 과정 개요](/ts-react-rendering-behavior/#렌더링-과정-개요rendering-process-overview)
  - [Render 단계, Commit 단계](/ts-react-rendering-behavior/#render-단계-commit-단계render-and-commit-phases)
- [리액트는 어떻게 렌더링을 다루는가](/ts-react-rendering-behavior/#리액트는-어떻게-렌더링을-다루는가how-does-react-handle-renders)
  - [큐에 렌더 넣기(Queuing Renders)](/ts-react-rendering-behavior/#큐에-렌더-넣기queuing-renders)
  - [표준 렌더 동작(Standard Render Behavior)](/ts-react-rendering-behavior/#표준-렌더-동작standard-render-behavior)
  - [리액트 렌더링의 규칙](/ts-react-rendering-behavior/#리액트-렌더링의-규칙-rules-of-react-rendering)
  - [컴포넌트 메타데이터와 Fibers](/ts-react-rendering-behavior/#컴포넌트-메타데이터와-fibers-component-metadata-and-fibers)
  - key와 재조정(Reconciliation)
  - Batching과 Timing 렌더링
  - 비동기적 렌더링, 클로저, 그리고 상태 스냅샷(State Snapshots)
  - 엣지 케이스에서의 렌더링 동작
- 렌더링 퍼포먼스 향상시키기
  - 컴포넌트 렌더링 최적화 기술
  - 새로운 Prop 참조는 렌더링 최적화에 어떤 영향을 끼치는가
  - Prop 참조 최적화하기
  - 모든걸 메모이제이션해야 할까?
  - 불변성(Immutability)과 재렌더링
  - 리액트 컴포넌트 렌더링 성능 측정하기
- 컨텍스트와 렌더링 동작
  - 컨텍스트 기본 설명
  - 컨텍스트 값 업데이트하기`
  - 상태 업데이트, 컨텍스트, 그리고 재렌더링
  - 컨텍스트 업데이트와 렌더링 최적화
- React-Redux와 렌더링 동작
  - React-Redux 구독
  - `connect`와 `useSelector`의 차이
- React 성능 향상 계획
  - "React Forget" 메모이징 컴파일러
  - 컨텍스트 셀렉터
- 요약
- 결론
- 더 많은 정보

# 렌더링이란 무엇인가(What is "Rendering")?

렌더링이란 리액트가 컴포넌트에게 현재 prop과 state에 기반하여 어떻게 UI를 그려낼지 묻는 일련의 과정이다.

## 렌더링 과정 개요(Rendering Process Overview)

렌더링 과정에서, 리액트는 컴포넌트 트리의 루트에서부터 시작해 업데이트가 필요한 모든 컴포넌트를 찾기까지 아래로 계속 루프를 타며 내려간다. 업데이트가 필요한 각각의 컴포넌트에서, 리액트는 함수컴포넌트의 `FunctionalComponent(props)`, 클래스 컴포넌트의 `classComponentInstance.render()`를 호출할 것이다. 그리고 다음 단계를 위해 렌더 출력(Render Output)을 저장한다.
컴포넌트의 렌더 출력은 보통 JSX 문법으로 쓰여진다. 그리고 JS가 컴파일 및 배포 준비를 마치면 `React.createElement()` 호출로 변환된다. `createElement`는 리액트 *요소*를 반환하며, 이 *요소*는 UI 구조를 묘사하는 평범한 JS 객체다. 예를 들어:

```js
// JSX 문법:
return <MyComponent a={42} b="testing">Text here</MyComponent>

// 아래로 변환됨:
return React.createElement(MyComponent, {a: 42, b: "testing"}, "Text Here")

// 그리고 요소(Element) 객체가 된다:
{type: MyComponent, props: {a: 42, b: "testing"}, children: ["Text Here"]}

// 렌더링을 위해 리액트가 내부적으로 실제 호출하는 함수
let elements = MyComponent({...props, children})

// HTML처럼 작성된 "호스트 컴포넌트"는
return <button onClick={() => {}}>Click Me</button>
// 다음처럼 변하고
React.createElement("button", {onClick}, "Click Me")
// 마침내 이렇게 된다:
{type: "button", props: {onClick}, children: ["Click me"]}
```

전체 컴포넌트 트리에서 렌더 출력을 수집한 후에, 리액트는 ("Virtual DOM"으로 자주 언급되는) 새로운 오브젝트 트리를 비교하여, 최종 결과물을 만들어내기 위해 실제 DOM에 적용해야하는 모든 변화를 수집한다. 이런 비교(diffing) 및 계산 과정을 합쳐 "[재조정(reconciliation)](https://reactjs.org/docs/reconciliation.html)"이라고 부른다.
리액트는 단 한번의 동기 시퀀스에서, 계산된 모든 변화를 DOM에 적용한다.

> _Note: 리액트 팀은 최근 몇년 동안 "virtual DOM"이라는 용어의 사용을 지양하고 있다. [Dan Abramov가 말하길:](https://twitter.com/dan_abramov/status/1066328666341294080?lang=en)_
>
> _저는 "virtual DOM"이라는 용어가 사라졌으면 좋겠습니다. 이 용어는 2013년에는 그럴듯하게 들렸습니다. 안 그랬으면 사람들은 모든 렌더링때마다 리액트가 DOM 노드를 만들거라고 생각했을테니까요. 하지만 사람들은 더 이상 그렇게 생각하지 않습니다. "Virtual DOM"은 마치 어떤 DOM 이슈를 해결하기 위한 해결책처럼 들립니다. 하지만 그건 리액트가 아닙니다._
>
> _리액트는 UI를 값으로 표현하는 것입니다. 핵심 원리는 UI가 문자열이나 배열같은 값이라는 것이죠. 당신은 그것을 변수에 저장할 수도 있고, 자바스크립트 제어 흐름에 따라 그것을 넘겨받고 사용할 수 있습니다. 이런 풍부한 표현력이 포인트죠 - DOM에 어떤 변화를 적용하는 것을 피하기 위해 비교하는게 아니라요._
>
> _거기다 항상 DOM을 뜻하는 것도 아닙니다. 예를 들면 `<Message recipientId={10} />` 은 DOM이 아닙니다. 개념적으로 그것은 lazy 함수 호출을 뜻하니까요 : `Message.bind(null, { recipientId: 10})`._

## Render 단계, Commit 단계(Render and Commit Phases)

리액트 팀은 개념적으로 렌더링을 두 단계로 나눴다:

- Render 단계는 변화를 계산하고 컴포넌트를 렌더링하는 모든 작업을 포함한다.
- Commit 단계는 DOM에 그러한 변화들을 적용하는 과정이다.(_역자: 브라우저에 실제로 페인트된다는 뜻은 아니다_)

리액트가 Commit 단계에서 DOM을 업데이트하고 나면, 요청된 DOM 노드와 컴포넌트 인스턴스를 가리키도록 모든 참조를 업데이트한다. 그 후 동기적으로 클래스 라이프사이클 메소드인 `componentDidMount`와 `componentDidUpdate`,그리고 `useLayoutEffect` 훅을 실행한다.
리액트는 그 후 짧은 timeout을 두고 이 timeout이 끝나면, 모든 `useEffect` 훅을 실행한다. 이 단계는 "Passive Effects" 단계로도 알려져 있다.
리액트 18에서는 [`useTransition`](https://github.com/reactwg/react-18/discussions/64)같은 "Concurrent Rendering"이 추가되었는데, 이는 브라우저가 이벤트를 처리할 때 Render 단계의 작업을 일시 정지할 수 있게 해준다. 리액트는 그 작업을 재개하거나, 버리거나, 나중에 적절하게 재계산할 수 있다. 한번 Render pass가 완료되면 리액트는 단일 단계에서 Commit 단계를 동기적으로 실행할 것이다.
가장 중요한 부분은 "렌더링"이 "DOM 업데이트"와는 다르다는 것을 이해하는 것이다. 그리고 그 결과로 컴포넌트가 어떤 시각적 변화없이 렌더링될 수 있다는 것도. 리액트가 컴포넌트를 렌더링 할 때 :

- 컴포넌트는 지난번과 동일한 렌더 출력을 반환할 수 있다. 따라서 아무 변화도 필요하지 않다.
- Concurrent Rendering에서 리액트가 컴포넌트를 여러번 렌더링할 수 있지만 다른 업데이트로 인해 현재 수행 중인 작업이 무효화할 될 경우 렌더 출력을 버린다.

시각화를 돕기 위해, 아래 리액트 훅 flow 다이어그램을 보아라([source: Donovan West](https://github.com/donavon/hook-flow)):

![React Hook Flow Diagram](./hook-flow-west.jpg)

추가적인 시각화를 보고 싶다면, 다음을 보아라:

- [React hooks render/commit phase diagram](https://wavez.github.io/react-hooks-lifecycle/)
  React class lifecycle methods diagram
- [React class lifecycle methods diagram](https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/)

# 리액트는 어떻게 렌더링을 다루는가(How Does React Handle Renders)?

## 큐에 렌더 넣기(Queuing Renders)

최초 렌더가 완료된 후, 리액트로 하여금 리렌더링을 큐에 넣을 수 있는 여러 방법이 있다.

- 함수 컴포넌트:
  - `useState` setters
  - `useReducer` dispatches
- 클래스 컴포넌트:
  - `this.setState()`
  - `this.forceUpdate()`
- 그 외:
  - ReactDOM 최상위 레벨 메소드 `render(<App/>)` 재호출(이는 루트 컴포넌트에서 `forceUpdate()`를 호출하는 것과 동일함)
  - 새 `useSyncExternalStore` 훅으로부터 트리거된 업데이트들

함수 컴포넌트는 `forceUpdate` 메소드가 없음을 기억해라. 하지만 언제나 숫자를 증가시키는 `useReducer` 훅을 사용함으로써, 동일한 동작을 얻어낼 수 있다.

```js
const [, forceRender] = useReducer(c => c + 1, 0)
```

## 표준 렌더 동작(Standard Render Behavior)

다음을 기억하는 것은 아주 중요하다:
리액트의 기본 동작은 부모 컴포넌트가 렌더될 때 그 안에 있는 모든 자식 컴포넌트를 재귀적으로 렌더한다는 것!

예를 들어, `A > B > C > D` 라는 컴포넌트 트리가 있다고 하자. 그리고 그들은 이미 페이지에 보여지고 있다. 사용자가 `B` 안에 있는, 숫자를 증가시키는 버튼을 클릭했을 때 :

- `B` 안에 있는 `setState()`가 호출된다. 이는 B의 리렌더링을 큐에 넣는다.
- 리액트는 트리 최상위에서부터 렌더 패스(render pass)를 시작한다
- 리액트는 `A`에 업데이트 필요 표시가 없는 것을 보고 지나친다.
- 리액트는 `B`에 업데이트 필요 표시가 있는 것을 보고 렌더링한다. `B`는 지난번과 마찬가지로 `<C/>`를 리턴한다.
- `C`는 본래 업데이트 필요 표시가 없었다. 그러나 부모 `B`가 렌더되었으므로 리액트는 이제 아래로 내려가며 `C`를 렌더링한다. `C`는 `<D/>`를 리턴한다.
- `D` 또한 본래 업데이트 필요 표시가 없었지만, 부모 `C`가 렌더되었으므로 리액트는 아래로 내려가며 `D` 또한 렌더링한다.

이걸 다른 방식으로 말하자면:

한 컴포넌트를 렌더링한다는 것은, 기본적으로, 그 안에 있는 _모든_ 컴포넌트들도 렌더링하게 만든다!

또한, 다른 중요한 점이 있다:

보통의 렌더링에서, 리액트는 "prop이 바뀌었는지 아닌지" 신경쓰지 않는다 - 부모가 렌더되었으면 무조건적으로 자식 컴포넌트를 렌더링할 것이다!

이는 비록 앱의 동작을 대체하는 변화가 없더라도, 루트 `<App>` 컴포넌트에서 `setState()`가 호출되면 컴포넌트 트리 안에 있는 모든 컴포넌트를 리액트가 하나 하나 다 리렌더링할거란 뜻이다. 결국, 리액트 본래의 sales pitches 중 하나는 ["매 업데이트마다 전체 앱을 다시 그리는 것처럼 행동하는 것"](https://www.slideshare.net/floydophone/react-preso-v2)이다.

트리 안에 있는 대부분의 컴포넌트는 마지막과 정확히 동일한 렌더 출력을 반환할 것이다. 그러므로 리액트는 DOM에 아무런 변화도 적용하지 않는다. 그러나, 리액트는 여전히 그들 스스로를 렌더할지 컴포넌트에게 물어보고 렌더 출력을 비교하는 작업을 해야 한다. 둘 다 시간과 노력이 드는 일이다.

기억해라, 렌더링은 _나쁜_ 것이 아니다 - 그저 리액트가 DOM에 어떤 변화를 실제로 적용해야할 필요가 있는지 아닌지 알아내는 방법일 뿐이다.

## 리액트 렌더링의 규칙 (Rules of React Rendering)

리액트 렌더링의 기본적인 규칙 중 하나는 렌더링은 "순수(pure)"하며 어떤 사이드 이펙트도 없어야 한다는 것이다.

이건 꽤 까다롭고 혼란스러울 수 있다. 왜냐하면 많은 사이드 이펙트들은 불분명하게 일어나며, 어떤 깨짐(breaking)을 유발하지 않기 때문이다. 예를 들면, `console.log()`는 엄연히 말해서 사이드 이펙트지만 아무것도 고장내지 않는다. prop을 변형하는 것도 분명 사이드이펙트지만, 그렇다고 뭔가를 항상 고장내는건 아니다. 렌더링 도중에 AJAX를 호출하는 것 또한 명백히 사이드 이펙트이며 요청 타입에 따라서는 앱의 예기치 않은 동작을 초래할 수 있다.

Sebastian Markbage는 [The Rules of React](https://gist.github.com/sebmarkbage/75f0838967cd003cd7f9ab938eb1958f)라는 제목의 완벽한 문서를 썼는데, 거기에서 그는 `render`를 포함해 각 리액트 라이프사이클 메소드의 예상 동작, 그리고 어떤 종류의 작업들이 안전하게 순수(pure)하거나 위험한지를 정의했다. 그 문서 전체를 읽어볼 가치는 충분하지만, 요점을 정리하자면 이렇다:

- 렌더 로직(Render logic)은 다음을 금지한다:
  - 현존하는 변수와 객체의 변형
  - `Math.random()`이나 `Date.now()`같은 랜덤 값 생성
  - 네트워크 요청
  - 상태 업데이트를 큐에 넣는 행위
- 이런 경우에는 괜찮다:
  - 렌더링하는 동안 새롭게 생성된 객체의 변형
  - 에러 던지기
  - 캐시된 값처럼 아직 만들어지지 않은 "늦은 초기화(Lazy initialize)" 데이터

## 컴포넌트 메타데이터와 Fibers (Component Metadata and Fibers)

리액트는 어플리케이션에 현존하는 모든 컴포넌트 인스턴스를 추적하는 내부 데이터 구조를 저장하고 있다. 이 데이터 구조의 가장 중요한 부분은 "fiber"라는 객체로, 다음에 대한 메타데이터 필드를 포함한다:

- 컴포넌트 트리의 해당 지점에서 어떤 컴포넌트 타입이 렌더링되어야하는지
- 이 컴포넌트와 관련된 현재 prop과 state
- 부모, 형제 그리고 자식 컴포넌트에 대한 포인터
- 리액트가 렌더링 프로세스(rendering process)를 추적하기 위해 사용하는 내부 메타데이터

리액트 버전이나 기능을 묘사할 때 쓰이는 [React Fiber](https://www.youtube.com/watch?v=ZCuYPiUIONs)를 본 적이 있다면, 리액트가 "fiber" 객체라는 핵심 데이터 구조를 이용해 어떻게 내부 렌더링 로직을 재작성했는지 잘 알 것이다. 이는 리액트 16.0에 릴리즈되었기 때문에, 이 이후 버전의 리액트는 모두 이 접근법을 사용한다.

`Fiber` 타입의 간결화 버전은 다음과 같다:

```js
export type Fiber = {
  // fiber의 타입을 특정짓기 위한 태그
  tag: WorkTag,

  // 자기 자식의 고유한 식별자(Unique identifier of this child)
  key: null | string,

  // 이 fiber와 연관된 resolved function / 클래스
  type: any,

  // 단방향 연결리스트 트리 구조 (Singly Linked List Tree Structure)
  child: Fiber | null,
  sibling: Fiber | null,
  index: number,

  // 입력은 이 fiber에 들어오는 데이터다(argument / props)
  pendingProps: any,
  memoizedProps: any, // 출력을 생성하는데에 쓰이는 prop

  // 상태 업데이트 및 콜백의 대기열
  updateQueue: Array<State | StateUpdaters>,

  // 출력을 생성하기 위해 사용되는 상태
  memoizedState: any,

  // 이 fiber에 대한 의존성들 (컨텍스트, 이벤트)
  dependencies: Dependencies | null,
}
```

[(여기서 리액트 18의 `Fiber` 전체 타입 정의를 볼 수 있다)](https://github.com/facebook/react/blob/v18.0.0/packages/react-reconciler/src/ReactInternalTypes.js#L64-L193)

렌더링 패스(rendering pass)가 일어나는 동안, 리액트는 fiber 객체 트리를 반복해 돌면서 새로운 렌더링 결과를 계산할 때마다 업데이트된 트리를 만든다.

이 "fiber" 객체들은 _실제_ 컴포넌트 prop과 state의 값을 저장한다는 것을 기억하라. 컴포넌트에서 `props`나 `state`를 쓸 때, 리액트는 fiber객체에 저장된 값에 대한 액세스를 실제로 주는 것이다. 사실 클래스 컴포넌트에서는 명시적으로 [리액트가 컴포넌트를 렌더링하기 직전에 `componentInstance.props = newProps`의 형태로 복사한다](https://github.com/facebook/react/blob/v18.0.0/packages/react-reconciler/src/ReactFiberClassComponent.new.js#L1083-L1087). 따라서 `this.props`는 존재하긴 하지만 그저 리액트가 내부 데이터 구조로부터 참조(reference)를 복사했기 때문에 존재하는 것이다. 그 관점으로 보면, 컴포넌트는 리액트의 fiber 객체를 감싸는 일종의 표면이라고 할 수 있다.

마찬가지로 리액트 훅 또한 [리액트가 컴포넌트의 모든 훅을 해당 컴포넌트의 fiber 객체에 붙은 연결 리스트(linked list)로 저장](https://www.swyx.io/hooks/)하기 때문에 동작한다. 리액트가 함수 컴포넌트를 렌더할 때 리액트는 fiber로부터 훅 설명 연결 리스트(linked list of hook description entries)를 가져오고, 훅이 호출될 때마다 리액트는 [훅 설명 객체(hook description object)에 저장된 올바른 값을 리턴한다.(`useReducer`에 쓰이는 `state`나 `dispatch` 값처럼)](https://github.com/facebook/react/blob/v18.0.0/packages/react-reconciler/src/ReactFiberHooks.new.js#L908)

부모 컴포넌트가 자식 컴포넌트를 맨 처음 렌더할 때, 리액트는 컴포넌트의 인스턴스를 추적하기 위해 fiber 객체를 만든다. 클래스 컴포넌트의 경우에는, [문자 그대로 `const instance = new YourComponentType(props)`를 호출](https://github.com/facebook/react/blob/v18.0.0/packages/react-reconciler/src/ReactFiberClassComponent.new.js#L656)하고 fiber 객체에 실제 컴포넌트 인스턴스를 저장한다. 함수 컴포넌트의 경우 [리액트는 함수 `YoureComponentTypes(props)`를 호출한다](https://github.com/facebook/react/blob/v18.0.0/packages/react-reconciler/src/ReactFiberHooks.new.js#L428)
