import * as React from "react";
import { graphql, PageProps } from "gatsby";
import { Layout, SEO } from "../components";

type DataType = {
  site: {
    siteMetadata: {
      title: string;
    };
  };
};

const NotFoundPage = ({ data, location }: PageProps<DataType>) => {
  const siteTitle = data.site.siteMetadata.title;

  return (
    <Layout location={location} title={siteTitle}>
      <h1>404: Not Found</h1>
      <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
    </Layout>
  );
};

export const Head = () => <SEO title="404: Not Found" />;

export default NotFoundPage;

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`;
