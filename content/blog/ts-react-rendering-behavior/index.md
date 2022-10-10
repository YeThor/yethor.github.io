---
title: 리액트 렌더링 동작에 대한 심층 가이드
date: "2022-10-09T22:40:32.169Z"
description: This is a custom description for SEO and Open Graph purposes, rather than the default generated excerpt. Simply add a description field to the frontmatter.
---

> 개인 공부 겸 다음 원문을 번역한 글입니다 https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/

# 리액트 렌더링 동작에 대한 심층 가이드

_리액트 렌더링에 대한 디테일, 그리고 컨텍스트와 React-Redux의 사용이 어떻게 렌더링에 영향을 미치는가_

저는 리액트가 언제, 왜, 어떻게 다시 컴포넌트를 렌더링하는지, 그리고 컨텍스트와 React-Redux가 그러한 재렌더링의 타이밍과 범위에 어떻게 영향을 끼치는지에 대한 많은 혼란을 보아 왔습니다. 여기에 대한 많은 설명들이 수십 번 있어왔지만, 저는 사람들이 참고할 수 있도록 정리된 설명글이 필요하다고 생각했습니다. 여기에 있는 모든 정보는 이미 온라인에 올라와있으며, 추후 섹션에서 링크를 걸어둘 다른 수많은 훌륭한 블로그 포스트와 아티클에 설명되어 있습니다. 하지만 사람들은 완벽한 이해를 위해 그런 조각들을 함께 모아놓고 싶어하는 것처럼 보였습니다. 따라서 저는 이 글이 그런 사람들에게 도움이 되었으면 합니다.

> _Note: 리액트 18과 추후 업데이트들을 고려하여 2022년 10월에 업데이트 됨_

## 목차

- 렌더링이란 무엇인가?
  - 렌더링 과정 개요
  - Render 단계, Commit 단계
- 리액트는 어떻게 렌더링을 다루는가
  - 큐에 렌더 넣기(Queuing Renders)
  - 표준 렌더 동작(Standard Render Behavior)
  - 리액트 렌더링의 규칙
  - Metadata 컴포넌트와 Fibers
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

## 렌더링이란 무엇인가(What is "Rendering")?

렌더링이란 리액트가 컴포넌트에게 현재 prop과 state에 기반하여 어떻게 UI를 그려낼지 묻는 일련의 과정이다.

### 렌더링 과정 개요(Rendering Process Overview)

렌더링 과정에서, 리액트는 컴포넌트 트리의 루트에서부터 시작해 업데이트가 필요한 모든 컴포넌트를 찾기까지 아래로 계속 루프를 타며 내려간다. 업데이트가 필요한 각각의 컴포넌트에서, 리액트는 `FunctionalComponent(props)`(함수 컴포넌트 대상)나 `classComponentInstance.render()`(클래스 컴포넌트 대상)을 호출할 것이다. 그리고 다음 단계를 위해 렌더 출력(Render Output)을 저장한다.
컴포넌트의 렌더 출력은 보통 JSX 문법으로 쓰여진다. 그리고 JS가 컴파일되고 배포를 위한 준비를 마치면, `React.createElement()` 호출로 변환된다. `createElement`는 리액트 *요소*를 반환하며, 이 요소는 UI의 구조를 묘사하기 위한 평범한 JS 객체이다. 예를 들어:

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

전체 컴포넌트 트리에서 렌더 출력을 수집한 후에, 리액트는 ("Virtual DOM"으로 자주 언급되는) 새로운 오브젝트 트리를 diff하여, 최종 결과물을 만들어내기 위해 실제 DOM에 적용해야하는 모든 변화를 수집한다. 이런 비교(diffing)와 계산 과정을 합쳐 "[재조정(reconciliation)](https://reactjs.org/docs/reconciliation.html)"이라고 부른다.
리액트는 단 한번의 동기 시퀀스에서, 계산된 모든 변화를 DOM에 적용한다.

> _Note: 리액트 팀은 최근 몇년 동안 "virtual DOM"이라는 용어를 잘 쓰지 않는다. [Dan Abramov가 말하길:](https://twitter.com/dan_abramov/status/1066328666341294080?lang=en)_
>
> _저는 "virtual DOM"이라는 용어가 사라졌으면 좋겠습니다. 이 용어는 2013년에는 그럴듯하게 들렸습니다. 안 그랬으면 사람들은 모든 렌더링때마다 리액트가 DOM 노드를 만들거라고 생각했을테니까요. 하지만 사람들은 더 이상 그렇게 생각하지 않습니다. "Virtual DOM"은 마치 어떤 DOM 이슈를 해결하기 위한 해결책처럼 들립니다. 하지만 그건 리액트가 아닙니다._
>
> _리액트는 UI를 value화하는 것입니다. 핵심 원리는 UI가 문자열이나 배열같은 값이라는 것이죠. 당신은 그것을 변수에 저장할 수도 있고, 자바스크립트 제어 흐름에 따라 그것을 넘겨받고 사용할 수 있습니다. 이런 풍부한 표현력이 포인트죠 - DOM에 어떤 변화를 적용하는 것을 피하기 위해 비교하는게 아니라요._
>
> _거기다 항상 DOM을 뜻하는 것도 아닙니다. 예를 들면 `<Message recipientId={10} />` 은 DOM이 아니잖아요. 개념적으로 그것은 lazy 함수 호출을 의미합니다: `Message.bind(null, { recipientId: 10})`._

### Render 단계, Commit 단계(Render and Commit Phases)

리액트 팀은 개념적으로 렌더링을 두 단계로 나눴다:

- Render 단계는 변화를 계산하고 컴포넌트를 렌더링하는 모든 작업을 포함한다.
- Commit 단계는 DOM에 그러한 변화들을 실제로 적용하는 과정이다.

리액트가 Commit 단계에서 DOM을 업데이트하고 나면, 요청된 DOM 노드와 컴포넌트 인스턴스를 가리키도록 모든 참조를 업데이트한다. 그 후 동기적으로 클래스 라이프사이클 메소드인 `componentDidMount`와 `componentDidUpdate`,그리고 `useLayoutEffect` 훅을 실행한다.
리액트는 그 후 짧은 timeout을 두고 이 timeout이 끝나면, 모든 `useEffect` 훅을 실행한다. 이 단계는 "Passive Effects" 단계로도 알려져 있다.
리액트 18에서는 [`useTransition`](https://github.com/reactwg/react-18/discussions/64)같은 "Concurrent Rendering"이 추가되었는데, 이는 브라우저가 이벤트를 처리할 때 Render 단계의 작업을 일시 정지할 수 있게 해준다. 리액트는 그 작업을 재개하거나, 버리거나, 나중에 적절하게 재계산할 수 있다. 한번 Render pass가 완료된 후에도 React는 한 단계에서 Commit 단계를 동기적으로 실행할 것이다.
가장 중요한 부분은 "렌더링"이 "DOM 업데이트"와는 다르다는 것을 이해하는 것이다. 그리고 그 결과로 컴포넌트가 어떤 시각적 변화없이 렌더링될 수 있다는 것도. 리액트는 다음의 경우에 컴포넌트를 렌더링한다:

- 컴포넌트는 지난번과 동일한 렌더 출력을 반환할 수 있다. 따라서 아무 변화도 필요하지 않다.
- Concurrent Rendering에서 리액트는 컴포넌트를 여러번 업데이트하고 끝낼지도 모른다. 하지만 만약 다른 업데이트가 현재 완료된 작업을 무효화할 때마다 렌더 출력을 버린다.

시각화를 돕기 위해, 아래 리액트 훅 flow 다이어그램을 보아라([source: Donovan West](https://github.com/donavon/hook-flow)):

![React Hook Flow Diagram](hook-flow-west.png)

추가적인 시각화를 보고 싶다면, 다음을 보아라:

- [React hooks render/commit phase diagram](https://wavez.github.io/react-hooks-lifecycle/)
  React class lifecycle methods diagram
- [React class lifecycle methods diagram](https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/)

## 리액트는 어떻게 렌더링을 다루는가(How Does React Handle Renders)?

### 큐에 렌더 넣기(Queuing Renders)

최초 렌더가 완료된 후, 리액트로 하여금 리렌더를 큐에 넣을 수 있는 여러 방법이 있다.

- 함수 컴포넌트:
  - `useState` setters
  - `useReducer` dispatches
- 클래스 컴포넌트:
  - `this.setState()`
  - `this.forceUpdate()`
- 그 외:
  - ReactDOM 최상위 레벨 메소드 `render(<App/>)` 재호출(이는 루트 컴포넌트에서 `forceUpdate()`를 호출하는 것과 동일하다)
  - 새 `useSyncExternalStore` 훅으로부터 트리거된 업데이트들

함수 컴포넌트는 `forceUpdate` 메소드가 없음을 기억해라. 하지만 언제나 카운터를 증가시키는 `useReducer` 훅을 사용함으로써, 동일한 동작을 얻어낼 수 있다.

```js
const [, forceRender] = useReducer(c => c + 1, 0)
```

### 표준 렌더 동작(Standard Render Behavior)

다음을 기억하는 것은 아주 중요하다:
리액트의 기본 동작은 부모 컴포넌트가 렌더될 때 그 안에 있는 모든 자식 컴포넌트를 재귀적으로 렌더하는 것이다!

예를 들어, `A > B > C > D` 라는 컴포넌트 트리가 있다고 해보자. 그리고 우리는 이미 그들을 페이지에 보여주고 있다. 사용자가 `B` 안에 있는, 카운터를 증가시키는 버튼을 클릭한다:

- 우리는 `B` 안에 있는 `setState()`를 호출한다. 이는 B의 리렌더를 큐에 넣는다.
- 리액트는 트리 최상위에서부터 렌더 패스(render pass)를 시작한다
- 리액트는 `A`에 업데이트가 필요하다고 표시되어있지 않은 것을 본다. 그리고 지나친다.
- 리액트는 `B`에 업데이트가 필요하다고 표시되어있는 것을 보고 렌더링한다. `B`는 지난번과 마찬가지로 `<C/>`를 리턴한다.
- `C`는 본래 업데이트가 필요하다고 표시되어 있지 않았다. 그러나, 부모 `B`가 렌더되었으므로 리액트는 이제 아래로 내려가며 `C` 또한 렌더링한다. `C`ㄴ는 다시 `<D/>`를 리턴한다.
- `D` 또한 렌더링이 필요하다고 표시되어있지 않았으나, 부모 `C`가 렌더되었으므로 리액트는 아래로 내려가며 `D` 또한 렌더링한다.

이걸 다른 방식으로 말하자면:
한 컴포넌트를 렌더링한다는 것은, 기본적으로, 그 안에 있는 _모든_ 컴포넌트들도 렌더링하게 만든다!
또한, 다른 중요한 점이 있다:
보통의 렌더링에서, 리액트는 "prop이 바뀌었는지 아닌지" 신경쓰지 않는다 - 부모가 렌더되었으면 무조건적으로 자식 컴포넌트를 렌더링할 것이다!
이는 당신의 루트 `<App>` 컴포넌트에서 `setState()`를 호출하는 것이, 비록 앱의 동작을 대체하는 변화가 없더라도, 컴포넌트 트리 안에 있는 모든 컴포넌트를 리액트가 하나 하나 다 리렌더할거란 뜻이다. 결국, 리액트 본래의 sales pitches 중 하나는 ["매 업데이트마다 전체 앱을 다시 그리는 것처럼 행동하라"](https://www.slideshare.net/floydophone/react-preso-v2)이다.
