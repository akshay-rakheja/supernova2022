import { FC } from "react";
import ReactMarkdown from "react-markdown";
const about = `
## Turn Internet Computers Into Internet Robots

This is ray saying hello and wondering what
might be going on and this is another color
`.trim();
const About: FC = () => {
  console.log("I will show the thing now");
  return (
    <article className="prose dark:prose-invert p-4 bg-black bg-opacity-80 m-4 rounded-lg">
      <ReactMarkdown>{about}</ReactMarkdown>
    </article>
  );
};
export default About;
