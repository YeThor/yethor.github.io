> 개인 공부 겸 다음 원문을 번역한 글입니다 https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/


# 리액트 렌더링 동작에 대한 심층 가이드 

*리액트 렌더링에 대한 디테일, 그리고 컨텍스트와 React-Redux의 사용이 어떻게 렌더링에 영향을 미치는가*

저는 리액트가 언제, 왜, 어떻게 다시 컴포넌트를 렌더링하는지, 그리고 컨텍스트와 React-Redux가 그러한 재렌더링의 타이밍과 범위에 어떻게 영향을 끼치는지에 대한 많은 혼란을 보아 왔습니다. 여기에 대한 많은 설명들이 수십 번 있어왔지만, 저는 사람들이 참고할 수 있도록 정리된 설명글이 필요하다고 생각했습니다. 여기에 있는 모든 정보는 이미 온라인에 올라와있으며, 추후 섹션에서 링크를 걸어둘 다른 수많은 훌륭한 블로그 포스트와 아티클에 설명되어 있습니다. 하지만 사람들은 완벽한 이해를 위해 그런 조각들을 함께 모아놓고 싶어하는 것처럼 보였습니다. 따라서 저는 이 글이 그런 사람들에게 도움이 되었으면 합니다.

> *Note: 리액트 18과 추후 업데이트들을 고려하여 2022년 10월에 업데이트 됨*

## 목차

- 렌더링이란 무엇인가?
  - 렌더링 과정 개요
  - Render 단계, Commit 단계 
- 리액트는 어떻게 렌더링을 다루는가
  - 렌더 쌓아두기(Queuing)
  - 표준 렌더 동작 
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

> *Note: 리액트 팀은 최근 몇년 동안 "virtual DOM"이라는 용어를 잘 쓰지 않는다. [Dan Abramov가 말하길:](https://twitter.com/dan_abramov/status/1066328666341294080?lang=en)*
>
>
> *저는 "virtual DOM"이라는 용어가 사라졌으면 좋겠습니다. 이 용어는 2013년에는 그럴듯하게 들렸습니다. 안 그랬으면 사람들은 모든 렌더링때마다 리액트가 DOM 노드를 만들거라고 생각했을테니까요. 하지만 사람들은 더 이상 그렇게 생각하지 않습니다. "Virtual DOM"은 마치 어떤 DOM 이슈를 해결하기 위한 해결책처럼 들립니다. 하지만 그건 리액트가 아닙니다.*
>
> *리액트는 UI를 value화하는 것입니다. 핵심 원리는 UI가 문자열이나 배열같은 값이라는 것이죠. 당신은 그것을 변수에 저장할 수도 있고, 자바스크립트 제어 흐름에 따라 그것을 넘겨받고 사용할 수 있습니다. 이런 풍부한 표현력이 포인트죠 - DOM에 어떤 변화를 적용하는 것을 피하기 위해 비교하는게 아니라요.* 
>
> *거기다 항상 DOM을 뜻하는 것도 아닙니다. 예를 들면 `<Message recipientId={10} />` 은 DOM이 아니잖아요. 개념적으로 그것은 lazy 함수 호출을 의미합니다: `Message.bind(null, { recipientId: 10})`.*


