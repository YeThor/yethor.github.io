import React from "react";
import { Link } from "gatsby";
import _ from "lodash";

const TagCollection = ({ tags }) => {
  return (
    <div>
      {tags.map(tag => (
        <Link to={`/tags/${_.kebabCase(tag)}`} className="tag">
          <span>{tag}</span>
        </Link>
      ))}
    </div>
  );
};

export default TagCollection;
