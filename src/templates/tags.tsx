import React from "react";

import { Link, graphql, PageProps } from "gatsby";
import PostListItem from "../components/PostListItem";
import { Layout } from "../components";

type DataType = {
  site: {
    siteMetadata: {
      title: string;
    };
  };
  allMarkdownRemark: {
    totalCount: number;
    nodes: {
      fields: {
        slug: string;
      };
      frontmatter: {
        title: string;
        description: string;
        date: string;
      };
    }[];
  };
};

type PageContextType = {
  tag: string;
};

const Tags = ({
  pageContext,
  data,
  location,
}: PageProps<DataType, PageContextType>) => {
  const { tag } = pageContext;
  const { totalCount, nodes: posts } = data.allMarkdownRemark;

  const tagHeader = `${totalCount} post${
    totalCount === 1 ? "" : `s`
  } tagged with "${tag}"`;

  return (
    <Layout location={location} title={data.site.siteMetadata.title}>
      <h1>{tagHeader}</h1>
      <ol style={{ listStyle: "none" }}>
        {posts.map(post => (
          <PostListItem post={post} key={post.fields.slug} />
        ))}
      </ol>
      <Link to="/tags">All tags</Link>
    </Layout>
  );
};

export default Tags;

export const pageQuery = graphql`
  query ($tag: String) {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      limit: 2000
      sort: { frontmatter: { date: DESC } }
      filter: { frontmatter: { tags: { in: [$tag] } } }
    ) {
      totalCount
      nodes {
        fields {
          slug
        }
        frontmatter {
          title
          description
          date(formatString: "MMMM DD, YYYY")
        }
      }
    }
  }
`;
