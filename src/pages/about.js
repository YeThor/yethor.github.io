import { Link } from "gatsby"
import * as React from "react"

const AboutPage = () => {
  return (
    <main>
      <h1>About Me</h1>
      <Link to="/">Back to Home</Link>
      <p>Hi there!</p>
    </main>
  )
}

export const Head = () => <title>About Yesol</title>

export default AboutPage
