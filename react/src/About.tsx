import { FC } from "react";
import ReactMarkdown from "react-markdown";
const about = `
## Turn Internet Computers Into Unstoppable Robots

DeTi is a decentralized scheduling and messaging service that lets you trigger your internet computer hosts
to run whenever you want. 

Schedule  DeTi to trigger a function on your canister:
* Every n seconds
* Every day at a certain time
* Every week on a certain day of the week at a time
* Every month on a certain day of the month 
* Every month on the last day of the month
* Schedule a single message to fire one time in the future. 

## DETI Token - 
We manage payment using our utility token, DETI, that are currently available pegged to ICP - 1 ICP buys one DETI

Sending a message to your canister burns 0.1 DETI. Checking to see if your message should run costs 0.0000001 DETI. 

If you run out of DETI, your messages will not be checked or fired. 

Now your canisters can never forget. 

Click anywhere to close. Click ${"`"}Connect to Plug${"`"} to start making your canisters unstoppable. 

We are very ratr

*Akshay and Ray*

`.trim();
const About: FC = () => {
  return (
    <article className="prose dark:prose-invert p-4 text-gray-900 dark:text-gray-100 bg-white dark:bg-black bg-opacity-80 m-4 rounded-lg max-h-full  overflow-scroll border-gray-300 shadow-md dark:border-gray-600 border-opacity-40 border-2">
      <ReactMarkdown>{about}</ReactMarkdown>
    </article>
  );
};
export default About;
