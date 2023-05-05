import * as React from "react";
import { useStaticQuery, graphql } from "gatsby";
import { StaticImage } from "gatsby-plugin-image";

type Props = {
  timeToRead: number;
  date: string;
};

const Author = ({ timeToRead, date }: Props) => {
  const data = useStaticQuery(graphql`
    query AuthorQuery {
      site {
        siteMetadata {
          author {
            name
          }
        }
      }
    }
  `);

  const author = data.site.siteMetadata?.author;

  return (
    <div className="author">
      <StaticImage
        className="author-avatar"
        layout="fixed"
        formats={["auto", "webp", "avif"]}
        src="../images/profile-pic.jpeg"
        width={50}
        height={50}
        quality={95}
        alt="Profile picture"
      />
      <div>
        <p>
          <span className="material-icons">person</span>
          <span>{author.name}</span>
        </p>
        <div>
          <span className="material-icons">access_time</span>
          <span>{timeToRead} min </span>
          <span className="dividing-point">·</span>
          <span className="material-icons">calendar_month</span>
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
};

export default Author;
