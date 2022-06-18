import { FC } from "react";
import ReactMarkdown from "react-markdown";
const About: FC = () => {
  return (
    <article className="prose dark:prose-invert p-4 bg-black bg-opacity-80 m-4 rounded-lg">
      <ReactMarkdown>
        {`# hello there
This is ray saying hello and wondering whatmight be going on
and this is another color`}
      </ReactMarkdown>
    </article>
  );
};
export default About;
