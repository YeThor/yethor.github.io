import React from "react";
import { useStaticQuery, graphql } from "gatsby";

const TagCollection = ({ tags }) => {
  return (
    <div>
      {tags.map(tag => (
        <a className="tag">
          <span>{tag}</span>
        </a>
      ))}
    </div>
  );
};

export default TagCollection;
