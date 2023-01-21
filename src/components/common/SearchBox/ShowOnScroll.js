import { useState, useEffect } from "react";

const ShowOnScroll = (pageOffset) => {
  const [hidden, setHidden] = useState(false);

  const handleScroll = () => {
    const top = window.pageYOffset;
    setHidden(top > pageOffset);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return hidden;
};

export default ShowOnScroll;
