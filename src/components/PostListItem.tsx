import { Link } from "gatsby";
import React from "react";

type Props = {
  post: any; //@TODO: 추후 타입 정의
};

const PostListItem = ({ post }: Props) => {
  return (
    <li>
      <article
        className="post-list-item"
        itemScope
        itemType="http://schema.org/Article"
      >
        <header>
          <h2>
            <Link to={post.fields.slug} itemProp="url">
              <span itemProp="headline">{post.frontmatter.title}</span>
            </Link>
          </h2>
          <small className="date">{post.frontmatter.date}</small>
        </header>
        <section>
          <p
            dangerouslySetInnerHTML={{
              __html: post.frontmatter.description || post.excerpt,
            }}
            itemProp="description"
          />
        </section>
      </article>
    </li>
  );
};

export default PostListItem;
