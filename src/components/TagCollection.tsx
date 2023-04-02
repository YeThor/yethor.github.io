import React from "react";
import { Link } from "gatsby";

const TagCollection = ({ tags }) => {
  return (
    <div>
      {tags.map(tag => (
        <Link to={`/tags/${tag.toLowerCase()}`} className="tag">
          <span>{tag}</span>
        </Link>
      ))}
    </div>
  );
};

export default TagCollection;
