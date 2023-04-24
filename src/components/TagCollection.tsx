import React from "react";
import { Link } from "gatsby";

const TagCollection = ({ tags }) => {
  return (
    <div>
      <i className="tag-icon" />
      {tags.map(tag => (
        <Link to={`/tags/${tag.toLowerCase()}`} className="tag" key={tag}>
          <span>{tag}</span>
        </Link>
      ))}
    </div>
  );
};

export default TagCollection;
