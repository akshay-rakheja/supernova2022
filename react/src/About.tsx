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

*Akshay and Ray*

`.trim();
const About: FC = () => {
  console.log("I will show the thing now");
  return (
    <article className="prose dark:prose-invert p-4 bg-black bg-opacity-80 m-4 rounded-lg max-h-80 overflow-scroll">
      <ReactMarkdown>{about}</ReactMarkdown>
    </article>
  );
};
export default About;
